package models

import (
	"time"
)

type Review struct {
	ID            uint            `gorm:"primaryKey" json:"id"`
	OrderID       uint            `json:"order_id" gorm:"uniqueIndex"` // 1 review per order
	ReviewerID    uint            `json:"reviewer_id"`                  // customer pemilik order
	TargetID      uint            `json:"target_id"`                    // umkm_id
	Rating        int             `json:"rating"`                       // 1-5 wajib
	Comment       string          `json:"comment,omitempty"`            // opsional
	Keywords      string          `json:"keywords,omitempty" gorm:"type:text"` // denormalisasi snapshot mentah
	CreatedAt     time.Time       `json:"created_at"`
	ReviewKeywords []ReviewKeyword `json:"review_keywords,omitempty" gorm:"foreignKey:ReviewID"`
}

type ReviewKeyword struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ReviewID  uint      `json:"review_id" gorm:"index"`
	Keyword   string    `json:"keyword"`
	Level     string    `json:"level"` // AMAN, WARNING, GAWAT
	CreatedAt time.Time `json:"created_at"`
}

type KeywordScore struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	UmkmID           uint      `json:"umkm_id" gorm:"uniqueIndex"`
	TotalAman        int       `json:"total_aman"`        // count keyword AMAN
	TotalWarning     int       `json:"total_warning"`     // count keyword WARNING
	TotalGawat       int       `json:"total_gawat"`       // count keyword GAWAT
	SafetyLevel      string    `json:"safety_level"`      // AMAN, WARNING, GAWAT (agregat final)
	UpdatedAt        time.Time `json:"updated_at"`        // rolling window 30 hari

	// Relations
	Umkm UMKMProfile `json:"umkm,omitempty" gorm:"foreignKey:UmkmID"`
}
