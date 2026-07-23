package services

import (
	"github.com/savora/backend/models"
	"gorm.io/gorm"
)

// PaymentService adalah interface untuk payment gateway
type PaymentService interface {
	// CreateInvoice membuat invoice pembayaran dan menyimpan record Payment
	CreateInvoice(tx *gorm.DB, order models.Order) (*models.Payment, error)
	
	// HandleWebhook memproses callback dari payment gateway
	HandleWebhook(db *gorm.DB, payload map[string]interface{}, callbackToken string) error
	
	// CheckPaymentStatus mengecek status pembayaran manual (fallback)
	CheckPaymentStatus(db *gorm.DB, paymentID uint) error
}
