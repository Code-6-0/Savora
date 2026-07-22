package models

import "time"

type WasteLog struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	UmkmID          uint       `gorm:"not null" json:"umkm_id"`
	FoodName        string     `gorm:"not null" json:"food_name"`
	Category        string     `gorm:"not null" json:"category"`
	EstimatedWeight float64    `gorm:"not null" json:"estimated_weight"` // in kg or grams
	Reason          string     `gorm:"type:text" json:"reason"`
	PhotoURL        string     `json:"photo_url"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}
