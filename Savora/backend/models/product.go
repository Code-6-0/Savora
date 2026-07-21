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
	Stock              int        `json:"stock"`
	WeightPerPortion   float64    `json:"weight_per_portion"`
	PickupAddress      string     `json:"pickup_address"`
	FoodTrustStatus    string     `json:"food_trust_status"`
	ProductionTime     *time.Time `json:"production_time"`
	ExpiresAt          *time.Time `json:"expires_at"`
	PackagingCondition string     `json:"packaging_condition"`
	StorageMethod      string     `json:"storage_method"`
	Status             string     `json:"status"` // Active, Draft, etc.
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}
