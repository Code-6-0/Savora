package models

import (
	"time"
)

type UMKMProfile struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	UserID             uint      `json:"user_id"`
	BusinessName       string    `json:"business_name"`
	Address            string    `json:"address"`
	GeoLocation        string    `json:"geo_location"`
	VerificationStatus string    `json:"verification_status"`
	Rating             float64   `json:"rating"`
	KeywordSafetyLevel string    `json:"keyword_safety_level"` // AMAN, WARNING, GAWAT (PRD 12.7)
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}
