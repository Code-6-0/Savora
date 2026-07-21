package models

import (
	"time"
)

type Order struct {
	ID           uint        `gorm:"primaryKey" json:"id"`
	UmkmID       uint        `json:"umkm_id"`
	CustomerName string      `json:"customer_name"`
	TotalAmount  float64     `json:"total_amount"`
	Status       string      `json:"status"` // Menunggu, Diproses, Siap Diambil, Selesai, Dibatalkan
	PickupTime   string      `json:"pickup_time"`
	OrderItems   []OrderItem `json:"order_items" gorm:"foreignKey:OrderID"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

type OrderItem struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	OrderID   uint    `json:"order_id"`
	ProductID uint    `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
	Product   Product `json:"product" gorm:"foreignKey:ProductID"`
}

