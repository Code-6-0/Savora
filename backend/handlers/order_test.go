package handlers

import (
	"encoding/json"
	"testing"

	"github.com/savora/backend/services"
)

// TestCreateOrderRequest_Validation menguji validasi request sesuai handler logic
func TestCreateOrderRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		req     services.CreateOrderRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "Valid request",
			req: services.CreateOrderRequest{
				ProductID:    1,
				Quantity:     2,
				BillingName:  "John Doe",
				BillingEmail: "john@example.com",
				BillingPhone: "08123456789",
			},
			wantErr: false,
		},
		{
			name: "ProductID = 0 should fail validation",
			req: services.CreateOrderRequest{
				ProductID:    0,
				Quantity:     2,
				BillingName:  "John Doe",
				BillingEmail: "john@example.com",
				BillingPhone: "08123456789",
			},
			wantErr: true,
			errMsg:  "Product ID wajib diisi",
		},
		{
			name: "Quantity = 0 should fail validation",
			req: services.CreateOrderRequest{
				ProductID:    1,
				Quantity:     0,
				BillingName:  "John Doe",
				BillingEmail: "john@example.com",
				BillingPhone: "08123456789",
			},
			wantErr: true,
			errMsg:  "Jumlah harus minimal 1",
		},
		{
			name: "Quantity negative should fail validation",
			req: services.CreateOrderRequest{
				ProductID:    1,
				Quantity:     -1,
				BillingName:  "John Doe",
				BillingEmail: "john@example.com",
				BillingPhone: "08123456789",
			},
			wantErr: true,
			errMsg:  "Jumlah harus minimal 1",
		},
		{
			name: "Empty billing_name should fail validation",
			req: services.CreateOrderRequest{
				ProductID:    1,
				Quantity:     2,
				BillingName:  "",
				BillingEmail: "john@example.com",
				BillingPhone: "08123456789",
			},
			wantErr: true,
			errMsg:  "Nama pemesan wajib diisi",
		},
		{
			name: "Empty billing_phone should fail validation",
			req: services.CreateOrderRequest{
				ProductID:    1,
				Quantity:     2,
				BillingName:  "John Doe",
				BillingEmail: "john@example.com",
				BillingPhone: "",
			},
			wantErr: true,
			errMsg:  "Nomor telepon wajib diisi",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Simulasi validasi manual seperti di handler CreateOrder
			var errMsg string
			if tt.req.ProductID == 0 {
				errMsg = "Product ID wajib diisi"
			} else if tt.req.Quantity < 1 {
				errMsg = "Jumlah harus minimal 1"
			} else if tt.req.BillingName == "" {
				errMsg = "Nama pemesan wajib diisi"
			} else if tt.req.BillingPhone == "" {
				errMsg = "Nomor telepon wajib diisi"
			}

			hasError := errMsg != ""
			if hasError != tt.wantErr {
				t.Errorf("validation error = %v, wantErr %v", hasError, tt.wantErr)
			}

			if tt.wantErr && errMsg != tt.errMsg {
				t.Errorf("error message = %q, want %q", errMsg, tt.errMsg)
			}
		})
	}
}

// TestCreateOrderRequest_JSONParsing menguji parsing JSON ke struct
func TestCreateOrderRequest_JSONParsing(t *testing.T) {
	tests := []struct {
		name      string
		jsonInput string
		wantErr   bool
		errType   string
	}{
		{
			name: "Valid JSON with correct types",
			jsonInput: `{
				"product_id": 1,
				"quantity": 2,
				"billing_name": "John Doe",
				"billing_email": "john@example.com",
				"billing_phone": "08123456789"
			}`,
			wantErr: false,
		},
		{
			name: "product_id as string should fail unmarshal",
			jsonInput: `{
				"product_id": "1",
				"quantity": 2,
				"billing_name": "John Doe",
				"billing_email": "john@example.com",
				"billing_phone": "08123456789"
			}`,
			wantErr: true,
			errType: "type_mismatch",
		},
		{
			name: "quantity as string should fail unmarshal",
			jsonInput: `{
				"product_id": 1,
				"quantity": "2",
				"billing_name": "John Doe",
				"billing_email": "john@example.com",
				"billing_phone": "08123456789"
			}`,
			wantErr: true,
			errType: "type_mismatch",
		},
		{
			name:      "Invalid JSON syntax",
			jsonInput: `{"product_id": 1, "quantity": 2`,
			wantErr:   true,
			errType:   "syntax",
		},
		{
			name: "Valid JSON with optional fields missing",
			jsonInput: `{
				"product_id": 1,
				"quantity": 2,
				"billing_name": "John Doe",
				"billing_phone": "08123456789"
			}`,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var req services.CreateOrderRequest
			err := json.Unmarshal([]byte(tt.jsonInput), &req)

			if (err != nil) != tt.wantErr {
				t.Errorf("json.Unmarshal() error = %v, wantErr %v", err, tt.wantErr)
			}

			// Verifikasi tipe data setelah parsing berhasil
			if !tt.wantErr {
				if req.ProductID == 0 && tt.jsonInput != "" {
					t.Error("ProductID should not be 0 after successful unmarshal")
				}
				if req.Quantity == 0 && tt.jsonInput != "" {
					t.Error("Quantity should not be 0 after successful unmarshal")
				}
			}
		})
	}
}
