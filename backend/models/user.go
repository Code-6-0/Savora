package models

import (
	"time"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email" gorm:"uniqueIndex"`
	Password  string    `json:"-"` // hash
	Role      string    `json:"role"` // CUSTOMER, UMKM, ADMIN, MITRA_DONASI
	Status    string    `json:"status"` // ACTIVE, SUSPENDED, PENDING
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Profile relations
	CustomerProfile      *CustomerProfile      `json:"customer_profile,omitempty" gorm:"foreignKey:UserID"`
	UmkmProfile          *UmkmProfile          `json:"umkm_profile,omitempty" gorm:"foreignKey:UserID"`
	MitraDonasiProfile   *MitraDonasiProfile   `json:"mitra_donasi_profile,omitempty" gorm:"foreignKey:UserID"`
}

type CustomerProfile struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id" gorm:"uniqueIndex"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
	Avatar    string    `json:"avatar,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type UmkmProfile struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	UserID             uint      `json:"user_id" gorm:"uniqueIndex"`
	BusinessName       string    `json:"business_name"`
	Address            string    `json:"address"`
	GeoLocation        string    `json:"geo_location,omitempty"`
	VerificationStatus string    `json:"verification_status"` // PENDING, APPROVED, REJECTED
	Rating             float64   `json:"rating"`              // average rating 1-5
	KeywordSafetyLevel string    `json:"keyword_safety_level"` // AMAN, WARNING, GAWAT
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	// Relations
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}
