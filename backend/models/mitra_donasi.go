package models

import (
	"time"
)

// MitraDonasiProfile represents mitra donasi profile (PRD Section 18)
type MitraDonasiProfile struct {
	ID                 uint       `gorm:"primaryKey" json:"id"`
	UserID             uint       `gorm:"not null;uniqueIndex" json:"user_id"`
	OrgName            string     `gorm:"size:255;not null" json:"org_name"`
	Phone              string     `gorm:"size:20" json:"phone"`
	Address            string     `gorm:"type:text" json:"address"`
	Description        string     `gorm:"type:text" json:"description"`
	DocumentURL        string     `gorm:"size:500" json:"document_url"` // URL dokumen legalitas
	VerificationStatus string     `gorm:"size:50;default:PENDING" json:"verification_status"` // PENDING, APPROVED, REJECTED
	VerifiedAt         *time.Time `json:"verified_at"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`

	// Relation
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName specifies custom table name
func (MitraDonasiProfile) TableName() string {
	return "mitra_donasi_profiles"
}
