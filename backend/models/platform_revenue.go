package models

import (
	"time"
)

// RevenueSource enum values
const (
	RevenueSourceOrder         = "ORDER"
	RevenueSourceAdvertisement = "ADVERTISEMENT"
)

// PlatformRevenue represents platform revenue tracking (PRD Section 18)
type PlatformRevenue struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	SourceType       string    `gorm:"size:50;not null;index" json:"source_type"` // ORDER or ADVERTISEMENT
	SourceID         uint      `gorm:"not null;index" json:"source_id"` // FK ke orders atau advertisements
	Amount           float64   `gorm:"type:decimal(10,2);not null" json:"amount"` // Subtotal transaksi
	ServiceFeeAmount float64   `gorm:"type:decimal(10,2);not null" json:"service_fee_amount"` // 5% dari amount
	Description      string    `gorm:"type:text" json:"description"`
	CreatedAt        time.Time `gorm:"index" json:"created_at"`
}

// TableName specifies custom table name
func (PlatformRevenue) TableName() string {
	return "platform_revenue"
}
