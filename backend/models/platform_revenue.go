package models

import (
	"time"
)

type PlatformRevenue struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	SourceType       string    `json:"source_type"`   // "order", "ad"
	SourceID         uint      `json:"source_id"`     // order_id or ad_id
	Amount           float64   `json:"amount"`        // subtotal (order) or price (ad)
	ServiceFeeAmount float64   `json:"service_fee_amount"` // 5% × amount
	Description      string    `json:"description,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
}
