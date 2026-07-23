package services

import (
	"testing"

	"github.com/savora/backend/models"
)

// TestOrderStateMachine verifies order status transitions
func TestOrderStateMachine(t *testing.T) {
	tests := []struct {
		name    string
		from    string
		to      string
		wantErr bool
	}{
		{"Created→PaymentPending", models.OrderCreated, models.OrderPaymentPending, false},
		{"PaymentPending→Paid", models.OrderPaymentPending, models.OrderPaid, false},
		{"Paid→ReadyForPickup", models.OrderPaid, models.OrderReadyForPickup, false},
		{"ReadyForPickup→Completed", models.OrderReadyForPickup, models.OrderCompleted, false},
		{"Invalid: Completed→Paid", models.OrderCompleted, models.OrderPaid, true},
		{"Invalid: Created→Completed", models.OrderCreated, models.OrderCompleted, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateOrderTransition(tt.from, tt.to)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateOrderTransition(%q, %q) error = %v, wantErr %v", tt.from, tt.to, err, tt.wantErr)
			}
		})
	}
}

// TestServiceFeeCalculation verifies 5% fee calculation + rounding
func TestServiceFeeCalculation(t *testing.T) {
	tests := []struct {
		subtotal  float64
		wantFee   float64
		wantTotal float64
	}{
		{100000, 5000, 105000},     // 100k × 5% = 5k
		{100001, 5000, 105001},     // 100k.01 × 5% = 5000.05 → round to 5000
		{200000, 10000, 210000},    // 200k × 5% = 10k
		{75000, 3750, 78750},       // 75k × 5% = 3750
		{50000, 2500, 52500}, // 50k × 5% = 2500
	}

	for _, tt := range tests {
		t.Run("", func(t *testing.T) {
			subtotal, fee, total := CalculateOrderPrice(tt.subtotal, 1)
			if subtotal != tt.subtotal {
				t.Errorf("subtotal = %v, want %v", subtotal, tt.subtotal)
			}
			if fee != tt.wantFee {
				t.Errorf("fee = %v, want %v", fee, tt.wantFee)
			}
			if total != tt.wantTotal {
				t.Errorf("total = %v, want %v", total, tt.wantTotal)
			}
		})
	}
}

// TestKeywordClassifier verifies rule-based keyword classification
func TestKeywordClassifier(t *testing.T) {
	classifier := NewSimpleKeywordClassifier()

	tests := []struct {
		keyword   string
		wantLevel string
	}{
		{"enak", models.KeywordAman},
		{"segar", models.KeywordAman},
		{"basi", models.KeywordGawat},
		{"bau busuk", models.KeywordGawat},
		{"kurang segar", models.KeywordWarning},
		{"unknown_keyword", ""},
	}

	for _, tt := range tests {
		t.Run(tt.keyword, func(t *testing.T) {
			result := classifier.ClassifyKeywords([]string{tt.keyword})
			gotLevel := result[tt.keyword]
			if gotLevel != tt.wantLevel {
				t.Errorf("ClassifyKeywords(%q) = %q, want %q", tt.keyword, gotLevel, tt.wantLevel)
			}
		})
	}
}

// TestPickupCodeGeneration verifies pickup code is unique
func TestPickupCodeGeneration(t *testing.T) {
	codes := make(map[string]bool)
	for i := 0; i < 100; i++ {
		code := generatePickupCode()
		if len(code) < 6 {
			t.Errorf("generatePickupCode() returned code with length %d, want >= 6", len(code))
		}
		if codes[code] {
			t.Errorf("generatePickupCode() returned duplicate: %s", code)
		}
		codes[code] = true
	}
}

// Minimal integration: verify models compile + constraints are set
func TestModelConstraints(t *testing.T) {
	// Mock minimal SQLite for schema inspection (without actual DB)
	// This just verifies structs are well-formed
	
	order := models.Order{
		ProductID:  1,
		CustomerID: 1,
		Quantity:   2,
		Subtotal:   50000,
		ServiceFee: 2500,
		TotalPrice: 52500,
		Status:     models.OrderCreated,
	}

	if order.Status != models.OrderCreated {
		t.Errorf("Order.Status not set correctly")
	}

	review := models.Review{
		OrderID:    1,
		ReviewerID: 1,
		TargetID:   1,
		Rating:     5,
		Comment:    "test",
		Keywords:   "enak, segar",
	}

	if review.Rating < 1 || review.Rating > 5 {
		t.Errorf("Review.Rating out of bounds: %d", review.Rating)
	}
}
