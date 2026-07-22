package models

import (
	"time"
)

type Product struct {
	ID                 uint       `gorm:"primaryKey" json:"id"`
	UmkmID             uint       `json:"umkm_id"`
	Name               string     `json:"name"`
	Category           string     `json:"category"`
	Description        string     `json:"description"`
	PhotoURL           string     `json:"photo_url"`
	OriginalPrice      float64    `json:"original_price"`
	RescuePrice        float64    `json:"rescue_price"`
	MinPrice           float64    `json:"min_price"`           // guardrail harga minimum (REVISI #34)
	Stock              int        `json:"stock"`
	WeightPerPortion   float64    `json:"weight_per_portion"`
	PickupAddress      string     `json:"pickup_address"`
	FoodTrustStatus    string     `json:"food_trust_status"`   // Fresh, Layak Dijual, Segera Dijual, dll
	FoodScore          int        `json:"food_score"`          // 0-100, decay seiring waktu
	ProductionTime     *time.Time `json:"production_time"`
	ExpiresAt          *time.Time `json:"expires_at"`
	PackagingCondition string     `json:"packaging_condition"` // Baik, Standar, Rusak
	StorageMethod      string     `json:"storage_method"`      // Sesuai, Tidak Sesuai
	Status             string     `json:"status"`              // Active, Draft, Expired
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}
