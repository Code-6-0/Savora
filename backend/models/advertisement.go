package models

import (
	"time"
)

// Advertisement — iklan yang dipasang UMKM untuk salah satu produknya.
//
// Model bisnis: paket iklan berdurasi tetap (lihat services/ads.go). UMKM
// memilih satu paket, sistem mengisi Price, DurationDays, dan EndAt. Status
// bergerak Draft -> Aktif -> Kadaluarsa (kadaluarsa dihitung dari EndAt).
type Advertisement struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	UmkmID       uint       `json:"umkm_id"`
	ProductID    uint       `json:"product_id"`
	PackageID    string     `json:"package_id"` // kilat, populer, sorotan
	Headline     string     `json:"headline"`
	CTA          string     `json:"cta"`
	Status       string     `json:"status"` // Draft, Aktif, Kadaluarsa
	Price        float64    `json:"price"`
	DurationDays int        `json:"duration_days"`
	StartAt      *time.Time `json:"start_at"`
	EndAt        *time.Time `json:"end_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
