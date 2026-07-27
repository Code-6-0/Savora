package services

import (
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/savora/backend/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// CalculateServiceFee menghitung service fee 5% dengan pembulatan half-up
func CalculateServiceFee(subtotal float64) float64 {
	fee := subtotal * 0.05
	return math.Round(fee) // pembulatan ke rupiah terdekat
}

// CalculateOrderPrice menghitung breakdown harga order
func CalculateOrderPrice(rescuePrice float64, quantity int) (subtotal, serviceFee, total float64) {
	subtotal = rescuePrice * float64(quantity)
	serviceFee = CalculateServiceFee(subtotal)
	total = subtotal + serviceFee
	return
}

// ValidateOrderTransition memvalidasi transisi status order
func ValidateOrderTransition(from, to string) error {
	validTransitions := map[string][]string{
		models.OrderCreated:        {models.OrderPaymentPending, models.OrderCancelled},
		models.OrderPaymentPending: {models.OrderPaid, models.OrderPaymentFailed, models.OrderExpired, models.OrderHelpRequested},
		models.OrderPaid:           {models.OrderReadyForPickup, models.OrderNoShow, models.OrderHelpRequested},
		models.OrderReadyForPickup: {models.OrderCompleted, models.OrderNoShow, models.OrderHelpRequested},
	}

	allowed, exists := validTransitions[from]
	if !exists {
		return fmt.Errorf("no valid transitions from status %s", from)
	}

	for _, validTo := range allowed {
		if to == validTo {
			return nil
		}
	}

	return fmt.Errorf("invalid transition from %s to %s", from, to)
}

// TransitionOrderStatus mengubah status order dengan validasi
func TransitionOrderStatus(db *gorm.DB, orderID uint, newStatus string) error {
	var order models.Order
	if err := db.First(&order, orderID).Error; err != nil {
		return err
	}

	if err := ValidateOrderTransition(order.Status, newStatus); err != nil {
		return err
	}

	return db.Model(&order).Update("status", newStatus).Error
}

// CreateOrderRequest adalah payload request checkout
type CreateOrderRequest struct {
	ProductID uint   `json:"product_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
	BillingName    string `json:"billing_name" binding:"required"`
	BillingEmail   string `json:"billing_email" binding:"required,email"`
	BillingPhone   string `json:"billing_phone" binding:"required"`
	CustomerNote   string `json:"customer_note"`
}

// CreateOrderResponse adalah response setelah order dibuat
type CreateOrderResponse struct {
	OrderID        uint      `json:"order_id"`
	Status         string    `json:"status"`
	Subtotal       float64   `json:"subtotal"`
	ServiceFee     float64   `json:"service_fee"`
	TotalPrice     float64   `json:"total_price"`
	InvoiceURL     string    `json:"invoice_url"`
	ReservedUntil  time.Time `json:"reserved_until"`
}

// CreateOrder membuat order baru dengan reservasi stok dan integrasi payment
func CreateOrder(db *gorm.DB, customerID uint, req CreateOrderRequest, paymentService PaymentService) (*CreateOrderResponse, error) {
	var response CreateOrderResponse

	// Mulai transaksi database
	err := db.Transaction(func(tx *gorm.DB) error {
		// 1. Lock row produk dan validasi
		var product models.Product
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, req.ProductID).Error; err != nil {
			return errors.New("produk tidak ditemukan")
		}

		// Validasi status produk
		if product.Status != "Aktif" {
			return errors.New("produk tidak aktif")
		}

		if product.ExpiresAt != nil && product.ExpiresAt.Before(time.Now()) {
			return errors.New("produk sudah expired")
		}

		if product.Stock < req.Quantity {
			return errors.New("stok tidak mencukupi")
		}

		// Validasi food trust status (guardrail 13.3)
		if product.FoodTrustStatus == "Tidak Disarankan Dijual" || product.FoodTrustStatus == "Tidak Layak Konsumsi" {
			return errors.New("produk tidak layak dijual")
		}

		// 2. Hitung harga server-side
		subtotal, serviceFee, totalPrice := CalculateOrderPrice(product.RescuePrice, req.Quantity)

		// Validasi harga minimum (guardrail REVISI #34)
		if product.RescuePrice < product.MinPrice {
			return errors.New("harga rescue di bawah harga minimum")
		}

		// 3. Kurangi stok (reservasi)
		if err := tx.Model(&product).Update("stock", product.Stock-req.Quantity).Error; err != nil {
			return err
		}

		// 4. Buat order dengan status Created
		reservedUntil := time.Now().Add(15 * time.Minute)
		order := models.Order{
			ProductID:      req.ProductID,
			CustomerID:     customerID,
			Quantity:       req.Quantity,
			Subtotal:       subtotal,
			ServiceFee:     serviceFee,
			TotalPrice:     totalPrice,
			PaymentMethod:  models.PaymentMethodXenditSandbox,
			PaymentStatus:  models.PaymentUnpaid,
			Status:         models.OrderCreated,
			ReservedUntil:  reservedUntil,
		}

		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		// 5. Panggil payment service untuk buat invoice Xendit
		payment, err := paymentService.CreateInvoice(tx, order)
		if err != nil {
			// Rollback akan otomatis handle pengembalian stok
			return fmt.Errorf("payment_init_failed: %v", err)
		}

		// 6. Transisi order ke Payment Pending (REVISI #29)
		if err := tx.Model(&order).Updates(map[string]interface{}{
			"status":         models.OrderPaymentPending,
			"payment_status": models.PaymentPending,
		}).Error; err != nil {
			return err
		}

		// Set response
		response = CreateOrderResponse{
			OrderID:        order.ID,
			Status:         order.Status,
			Subtotal:       order.Subtotal,
			ServiceFee:     order.ServiceFee,
			TotalPrice:     order.TotalPrice,
			InvoiceURL:     payment.PaymentURL,
			ReservedUntil:  order.ReservedUntil,
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &response, nil
}

// ReleaseReservedStock mengembalikan stok yang di-reserve
func ReleaseReservedStock(db *gorm.DB, orderID uint) error {
	var order models.Order
	if err := db.Preload("Product").First(&order, orderID).Error; err != nil {
		return err
	}

	// Kembalikan stok
	return db.Model(&models.Product{}).
		Where("id = ?", order.ProductID).
		UpdateColumn("stock", gorm.Expr("stock + ?", order.Quantity)).
		Error
}
