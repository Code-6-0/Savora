package models

import (
	"time"
)

// AdStatus enum values
const (
	AdStatusPending  = "PENDING"
	AdStatusApproved = "APPROVED"
	AdStatusRejected = "REJECTED"
	AdStatusActive   = "ACTIVE"
	AdStatusExpired  = "EXPIRED"
)

// AdvertiserType enum values
const (
	AdvertiserTypeUMKM     = "UMKM"
	AdvertiserTypeExternal = "EXTERNAL"
)

// Advertisement represents advertisement submission (PRD Section 18)
type Advertisement struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	AdvertiserID   uint       `gorm:"not null" json:"advertiser_id"` // FK ke users
	AdvertiserType string     `gorm:"size:50;not null" json:"advertiser_type"` // UMKM or EXTERNAL
	Title          string     `gorm:"size:255;not null" json:"title"`
	ImageURL       string     `gorm:"size:500" json:"image_url"`
	TargetURL      string     `gorm:"size:500" json:"target_url"` // Link redirect
	DurationDays   int        `gorm:"not null" json:"duration_days"` // Durasi iklan dalam hari
	Price          float64    `gorm:"type:decimal(10,2);not null" json:"price"` // Harga sebelum service fee
	ServiceFee     float64    `gorm:"type:decimal(10,2);not null" json:"service_fee"` // 5% dari price
	Status         string     `gorm:"size:50;default:PENDING" json:"status"` // PENDING, APPROVED, REJECTED, ACTIVE, EXPIRED
	ApprovedBy     *uint      `json:"approved_by"` // FK ke users (admin)
	ApprovedAt     *time.Time `json:"approved_at"`
	StartsAt       *time.Time `json:"starts_at"` // Mulai tayang (saat APPROVED)
	ExpiresAt      *time.Time `json:"expires_at"` // Selesai tayang (starts_at + duration_days)
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	// Relations
	Advertiser User  `gorm:"foreignKey:AdvertiserID" json:"advertiser,omitempty"`
	Approver   *User `gorm:"foreignKey:ApprovedBy" json:"approver,omitempty"`
}

// AdMetrics represents daily ad performance metrics (PRD Section 18)
type AdMetrics struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	AdID        uint      `gorm:"not null;index" json:"ad_id"` // FK ke advertisements
	Impressions int       `gorm:"default:0" json:"impressions"` // Jumlah tayangan
	Clicks      int       `gorm:"default:0" json:"clicks"` // Jumlah klik
	CTR         float64   `gorm:"type:decimal(5,2);default:0" json:"ctr"` // Click-through rate (%)
	Date        time.Time `gorm:"type:date;not null;index" json:"date"` // Tanggal metrik
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relation
	Advertisement Advertisement `gorm:"foreignKey:AdID" json:"advertisement,omitempty"`
}

// TableName specifies custom table name for Advertisement
func (Advertisement) TableName() string {
	return "advertisements"
}

// TableName specifies custom table name for AdMetrics
func (AdMetrics) TableName() string {
	return "ad_metrics"
}

// CalculateCTR calculates and updates the CTR field
func (am *AdMetrics) CalculateCTR() {
	if am.Impressions > 0 {
		am.CTR = (float64(am.Clicks) / float64(am.Impressions)) * 100
	} else {
		am.CTR = 0
	}
}
