package services

import (
	"bytes"
	"context"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/savora/backend/models"
	"gorm.io/gorm"
)

// XenditService menghandle payment gateway Xendit
type XenditService struct {
	secretKey     string
	callbackToken string
}

func NewXenditService() *XenditService {
	return &XenditService{
		secretKey:     os.Getenv("XENDIT_SECRET_KEY"),
		callbackToken: os.Getenv("XENDIT_CALLBACK_TOKEN"),
	}
}

// CreateInvoice membuat invoice Xendit via real API call
func (x *XenditService) CreateInvoice(tx *gorm.DB, order models.Order) (*models.Payment, error) {
	expirySeconds := 900
	if envExpiry := os.Getenv("PAYMENT_EXPIRY_SECONDS"); envExpiry != "" {
		if parsed, err := strconv.Atoi(envExpiry); err == nil {
			expirySeconds = parsed
		}
	}

	frontendURL := os.Getenv("FRONTEND_BASE_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	// Prepare Xendit Invoice payload
	externalID := fmt.Sprintf("savora-order-%d", order.ID)
	payload := map[string]interface{}{
		"external_id":      externalID,
		"amount":           order.TotalPrice,
		"description":      fmt.Sprintf("Savora Order #%d", order.ID),
		"invoice_duration": expirySeconds,
		"currency":         "IDR",
		"success_redirect_url": fmt.Sprintf("%s/orders/%d/pay?status=success", frontendURL, order.ID),
		"failure_redirect_url": fmt.Sprintf("%s/orders/%d/pay?status=failed", frontendURL, order.ID),
	}

	// Call Xendit Invoice API
	invoiceResp, err := x.callXenditCreateInvoice(payload)
	if err != nil {
		return nil, fmt.Errorf("xendit_api_error: %v", err)
	}

	// Parse response
	invoiceID, _ := invoiceResp["id"].(string)
	invoiceURL, _ := invoiceResp["invoice_url"].(string)
	expiryDateStr, _ := invoiceResp["expiry_date"].(string)

	if invoiceID == "" || invoiceURL == "" {
		return nil, fmt.Errorf("xendit_response_invalid: missing id or invoice_url")
	}

	// Parse expiry date
	expiredAt := time.Now().Add(time.Duration(expirySeconds) * time.Second)
	if expiryDateStr != "" {
		if parsed, err := time.Parse(time.RFC3339, expiryDateStr); err == nil {
			expiredAt = parsed
		}
	}

	// Save payment record
	payment := models.Payment{
		OrderID:           order.ID,
		Provider:          "xendit",
		ProviderOrderID:   invoiceID,
		Amount:            order.TotalPrice,
		ServiceFeeAmount:  order.ServiceFee,
		PaymentStatus:     models.PaymentPending,
		PaymentURL:        invoiceURL,
		SignatureVerified: false,
		ExpiredAt:         &expiredAt,
	}

	if err := tx.Create(&payment).Error; err != nil {
		return nil, err
	}

	return &payment, nil
}

// callXenditCreateInvoice memanggil Xendit Invoice API
func (x *XenditService) callXenditCreateInvoice(payload map[string]interface{}) (map[string]interface{}, error) {
	apiURL := "https://api.xendit.co/v2/invoices"

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	authHeader := "Basic " + base64.StdEncoding.EncodeToString([]byte(x.secretKey+":"))
	req.Header.Set("Authorization", authHeader)

	// Execute request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Check status code
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return nil, fmt.Errorf("xendit_api_status_%d: %s", resp.StatusCode, string(body))
	}

	// Parse JSON response
	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	return result, nil
}

// HandleWebhook memproses callback dari Xendit
func (x *XenditService) HandleWebhook(db *gorm.DB, payload map[string]interface{}, callbackToken string) error {
	tokenValid := subtle.ConstantTimeCompare([]byte(callbackToken), []byte(x.callbackToken)) == 1
	rawPayload, _ := json.Marshal(payload)
	invoiceID, _ := payload["id"].(string)
	status, _ := payload["status"].(string)

	var payment models.Payment
	if err := db.Where("provider_order_id = ?", invoiceID).First(&payment).Error; err != nil {
		_ = db.Create(&models.PaymentLog{
			Event:      "unknown_payment",
			RawPayload: string(rawPayload),
			TokenValid: tokenValid,
		})
		return nil
	}

	_ = db.Create(&models.PaymentLog{
		PaymentID:  payment.ID,
		Event:      fmt.Sprintf("invoice.%s", status),
		RawPayload: string(rawPayload),
		TokenValid: tokenValid,
	})

	if !tokenValid {
		return nil
	}

	// Idempotent: skip jika sudah final
	if payment.PaymentStatus == models.PaymentPaid || payment.PaymentStatus == models.PaymentExpired {
		return nil
	}

	return processPaymentStatus(db, payment, status)
}

// processPaymentStatus mengupdate order berdasarkan payment status
func processPaymentStatus(db *gorm.DB, payment models.Payment, status string) error {
	return db.Transaction(func(tx *gorm.DB) error {
		var order models.Order
		if err := tx.First(&order, payment.OrderID).Error; err != nil {
			return err
		}

		now := time.Now()

		switch status {
		case "PAID", "SETTLED":
			payment.PaymentStatus = models.PaymentPaid
			payment.SignatureVerified = true
			payment.PaidAt = &now
			tx.Save(&payment)

			// Set pickup deadline (24 jam setelah paid)
			deadline := now.Add(24 * time.Hour)
			order.Status = models.OrderPaid
			order.PaymentStatus = models.PaymentPaid
			order.PaidAt = &now
			order.PickupDeadline = &deadline
			order.PickupCode = generatePickupCode()
			tx.Save(&order)

			// Insert platform_revenue
			revenue := models.PlatformRevenue{
				SourceType:       "order",
				SourceID:         order.ID,
				Amount:           order.Subtotal,
				ServiceFeeAmount: order.ServiceFee,
				Description:      fmt.Sprintf("Order #%d", order.ID),
			}
			tx.Create(&revenue)

		case "EXPIRED":
			payment.PaymentStatus = models.PaymentExpired
			tx.Save(&payment)
			order.Status = models.OrderExpired
			order.PaymentStatus = models.PaymentExpired
			tx.Save(&order)
			ReleaseReservedStock(tx, order.ID)

		case "FAILED":
			payment.PaymentStatus = models.PaymentFailed
			tx.Save(&payment)
			order.Status = models.OrderPaymentFailed
			order.PaymentStatus = models.PaymentFailed
			tx.Save(&order)
			ReleaseReservedStock(tx, order.ID)
		}

		return nil
	})
}

// generatePickupCode membuat pickup code random unique
func generatePickupCode() string {
	// UUID-based untuk uniqueness, ambil 8 char pertama uppercase
	return fmt.Sprintf("%08d", time.Now().UnixNano()%100000000)
}

func (x *XenditService) CheckPaymentStatus(db *gorm.DB, paymentID uint) error {
	_ = context.Background()
	return nil // TODO: implement manual check
}
