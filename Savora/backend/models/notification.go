package models

import "time"

type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UmkmID    uint      `gorm:"not null" json:"umkm_id"`
	Title     string    `gorm:"not null" json:"title"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
