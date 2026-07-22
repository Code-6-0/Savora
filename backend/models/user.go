package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserRole enum values
const (
	RoleCustomer     = "CUSTOMER"
	RoleUMKM         = "UMKM"
	RoleAdmin        = "ADMIN"
	RoleMitraDonasi  = "MITRA_DONASI"
)

// UserStatus enum values
const (
	StatusActive    = "ACTIVE"
	StatusSuspended = "SUSPENDED"
	StatusPending   = "PENDING"
)

// User represents authenticated user in the system
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"size:255;not null" json:"name"`
	Email        string    `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"` // Never expose in JSON
	Role         string    `gorm:"size:50;not null" json:"role"` // CUSTOMER, UMKM, ADMIN, MITRA_DONASI
	Status       string    `gorm:"size:50;default:ACTIVE" json:"status"` // ACTIVE, SUSPENDED, PENDING
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CustomerProfile represents customer-specific profile data
type CustomerProfile struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	Phone     string    `gorm:"size:20" json:"phone"`
	Address   string    `gorm:"type:text" json:"address"`
	Avatar    string    `gorm:"size:255" json:"avatar"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relation
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// SetPassword hashes and sets user password
func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hashedPassword)
	return nil
}

// CheckPassword verifies if provided password matches stored hash
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}

// BeforeCreate hook to set default status
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Status == "" {
		u.Status = StatusActive
	}
	return nil
}

// TableName specifies custom table name for User
func (User) TableName() string {
	return "users"
}

// TableName specifies custom table name for CustomerProfile
func (CustomerProfile) TableName() string {
	return "customer_profiles"
}
