package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserStatus enum values (dari Alia - auth module)
const (
	StatusActive    = "ACTIVE"
	StatusSuspended = "SUSPENDED"
	StatusPending   = "PENDING"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:255;not null" json:"name"`
	Email     string    `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"size:255;not null" json:"-"` // hash - TODO(team): usul rename ke PasswordHash, perlu koordinasi
	Role      string    `gorm:"size:50;not null" json:"role"` // CUSTOMER, UMKM, ADMIN, MITRA_DONASI
	Status    string    `gorm:"size:50;default:ACTIVE" json:"status"` // ACTIVE, SUSPENDED, PENDING
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Profile relations (dari main - existing code anggota lain)
	CustomerProfile    *CustomerProfile    `json:"customer_profile,omitempty" gorm:"foreignKey:UserID"`
	UmkmProfile        *UmkmProfile        `json:"umkm_profile,omitempty" gorm:"foreignKey:UserID"`
	MitraDonasiProfile *MitraDonasiProfile `json:"mitra_donasi_profile,omitempty" gorm:"foreignKey:UserID"`
}

type CustomerProfile struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	Phone     string    `gorm:"size:20" json:"phone"`
	Address   string    `gorm:"type:text" json:"address"`
	Avatar    string    `gorm:"size:255" json:"avatar,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type UmkmProfile struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	UserID             uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	BusinessName       string    `gorm:"size:255;not null" json:"business_name"`
	Address            string    `gorm:"type:text" json:"address"`
	GeoLocation        string    `gorm:"size:255" json:"geo_location,omitempty"`
	VerificationStatus string    `gorm:"size:50;default:PENDING" json:"verification_status"` // PENDING, APPROVED, REJECTED
	Rating             float64   `gorm:"default:0" json:"rating"`                           // average rating 1-5
	KeywordSafetyLevel string    `gorm:"size:50;default:AMAN" json:"keyword_safety_level"`  // AMAN, WARNING, GAWAT
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	// Relations
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// SetPassword hashes and sets user password (dari Alia - auth module)
// Uses field Password (not PasswordHash) for compatibility with existing code
func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

// CheckPassword verifies if provided password matches stored hash (dari Alia - auth module)
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// BeforeCreate hook to set default status (dari Alia - auth module)
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Status == "" {
		u.Status = StatusActive
	}
	return nil
}

// TableName specifies custom table name for User (dari Alia - auth module)
func (User) TableName() string {
	return "users"
}

// TableName specifies custom table name for CustomerProfile (dari Alia - auth module)
func (CustomerProfile) TableName() string {
	return "customer_profiles"
}

// TableName specifies custom table name for UmkmProfile (untuk konsistensi)
func (UmkmProfile) TableName() string {
	return "umkm_profiles"
}
