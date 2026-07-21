package models

import (
	"time"
)

type Review struct {
	ID           uint            `gorm:"primaryKey" json:"id"`
	OrderID      uint            `json:"order_id"`
	ReviewerID   uint            `json:"reviewer_id"`
	TargetID     uint            `json:"target_id"` // This is the UmkmID
	CustomerName string          `json:"customer_name"`
	Rating       int             `json:"rating"` // 1-5
	Comment      string          `json:"comment"`
	Keywords     string          `json:"keywords"` // Denormalized string snapshot of keywords
	CreatedAt    time.Time       `json:"created_at"`
	ReviewKeywords []ReviewKeyword `json:"review_keywords" gorm:"foreignKey:ReviewID"`
}

type ReviewKeyword struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ReviewID  uint      `json:"review_id"`
	Keyword   string    `json:"keyword"`
	Level     string    `json:"level"` // Aman, Warning, Gawat
	CreatedAt time.Time `json:"created_at"`
}
