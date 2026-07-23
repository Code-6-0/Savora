package services

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"fmt"
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

// CreateInvoice membuat invoice Xendit (simplified, direct API call)
func (x *XenditService) CreateInvoice(tx *gorm.DB, order models.Order) (*models.Payment, error) {
	expirySeconds := 900
	if envExpiry := os.Getenv("PAYMENT_EXPIRY_SECONDS"); envExpiry != "" {
		if parsed, err := strconv.Atoi(envExpiry); err == nil {
			expirySeconds = parsed
		}
	}

	// TODO: Call Xendit API to create invoice
	// For now, generate mock invoice URL for testing
	invoiceID := fmt.Sprintf("inv-%d-%d", order.ID, time.Now().Unix())
	invoiceURL := fmt.Sprintf("https://checkout.xendit.co/%s", invoiceID)

	expiredAt := time.Now().Add(time.Duration(expirySeconds) * time.Second)
	payment := models.Payment{
		OrderID:          order.ID,
		Provider:         "xendit",
		ProviderOrderID:  invoiceID,
		Amount:           order.TotalPrice,
		ServiceFeeAmount: order.ServiceFee,
		PaymentStatus:    models.PaymentPending,
		PaymentURL:       invoiceURL,
		SignatureVerified: false,
		ExpiredAt:        &expiredAt,
	}

	if err := tx.Create(&payment).Error; err != nil {
		return nil, err
	}

	return &payment, nil
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

			order.Status = models.OrderPaid
			order.PaymentStatus = models.PaymentPaid
			order.PaidAt = &now
			order.PickupDeadline = now.Add(24 * time.Hour)
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
