package models

import (
	"time"
)

type Order struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ProductID      uint      `json:"product_id" gorm:"index:idx_orders_product_status"`
	CustomerID     uint      `json:"customer_id" gorm:"index:idx_orders_customer_status"`
	Quantity       int       `json:"quantity"`          // jumlah item
	Subtotal       float64   `json:"subtotal"`          // rescue_price × quantity
	ServiceFee     float64   `json:"service_fee"`       // 5% × subtotal
	TotalPrice     float64   `json:"total_price"`       // subtotal + service_fee
	PaymentMethod  string    `json:"payment_method"`    // XENDIT_SANDBOX
	PaymentStatus  string    `json:"payment_status"`    // UNPAID, PENDING, PAID, FAILED, EXPIRED
	PickupCode     string     `json:"pickup_code,omitempty" gorm:"uniqueIndex;size:10;default:null"`
	ReservedUntil  time.Time  `json:"reserved_until"`    // batas waktu bayar
	PickupDeadline *time.Time `json:"pickup_deadline,omitempty"` // batas ambil setelah Paid
	Status         string     `json:"status" gorm:"index:idx_orders_customer_status;index:idx_orders_product_status"` // CREATED, PAYMENT_PENDING, PAID, PAYMENT_FAILED, READY_FOR_PICKUP, COMPLETED, NO_SHOW, CANCELLED, EXPIRED, HELP_REQUESTED
	CancelReason   string     `json:"cancel_reason,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	PaidAt         *time.Time `json:"paid_at,omitempty"`
	CompletedAt    *time.Time `json:"completed_at,omitempty"`

	// Relations
	Product  Product  `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	Customer User     `json:"customer,omitempty" gorm:"foreignKey:CustomerID"`
	Payment  *Payment `json:"payment,omitempty" gorm:"foreignKey:OrderID"`
}

type Payment struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	OrderID            uint      `json:"order_id" gorm:"uniqueIndex"`
	Provider           string    `json:"provider"`               // "xendit"
	ProviderOrderID    string    `json:"provider_order_id"`      // invoice_id Xendit
	Amount             float64   `json:"amount"`                 // total_price
	ServiceFeeAmount   float64   `json:"service_fee_amount"`     // service_fee
	PaymentStatus      string    `json:"payment_status"`         // UNPAID, PENDING, PAID, FAILED, EXPIRED
	PaymentURL         string    `json:"payment_url,omitempty"`  // invoice_url
	SignatureVerified  bool      `json:"signature_verified"`     // token callback valid
	PaidAt             *time.Time `json:"paid_at,omitempty"`
	ExpiredAt          *time.Time `json:"expired_at,omitempty"`
	CreatedAt          time.Time `json:"created_at"`

	// Relations
	Order Order `json:"order,omitempty" gorm:"foreignKey:OrderID"`
}

type PaymentLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	PaymentID  uint      `json:"payment_id"`
	Event      string    `json:"event"`        // invoice.paid, invoice.expired
	RawPayload string    `json:"raw_payload" gorm:"type:text"`
	TokenValid bool      `json:"token_valid"`  // token callback valid
	CreatedAt  time.Time `json:"created_at"`

	// Relations
	Payment Payment `json:"payment,omitempty" gorm:"foreignKey:PaymentID"`
}
