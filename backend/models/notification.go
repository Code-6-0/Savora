package models

import "time"

// Notification - notifikasi in-app sederhana untuk status order & pembayaran
type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	UserRole  string    `gorm:"type:varchar(20);not null" json:"user_role"` // customer / umkm / admin
	Title     string    `gorm:"not null" json:"title"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName - override tabel jika perlu
func (Notification) TableName() string {
	return "notifications"
}
