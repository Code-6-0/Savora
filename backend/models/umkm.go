package models

import (
	"time"
)

// UMKMProfile represents UMKM registration/profile
// Pendaftaran UMKM sebagai penjual di platform Savora
type UMKMProfile struct {
	ID                   uint       `gorm:"primaryKey" json:"id"`
	UserID               uint       `gorm:"not null;uniqueIndex" json:"user_id"`
	NamaBisnis           string     `gorm:"size:255;not null" json:"nama_bisnis"`
	JenisBisnis          string     `gorm:"size:100;not null" json:"jenis_bisnis"` // restoran, cafe, bakery, hotel, katering, lainnya
	AlamatOperasional    string     `gorm:"type:text;not null" json:"alamat_operasional"`
	KontakTelepon        string     `gorm:"size:20;not null" json:"kontak_telepon"`
	EstimasiVolumeSampah string     `gorm:"size:255;not null" json:"estimasi_volume_sampah"` // e.g. "50 kg/hari"
	JamOperasional       string     `gorm:"size:255;not null" json:"jam_operasional"`         // e.g. "08:00-22:00"
	DokumenURL           string     `gorm:"size:500" json:"dokumen_url"`                      // nullable
	VerificationStatus   string     `gorm:"size:50;default:PENDING" json:"verification_status"` // PENDING, APPROVED, REJECTED
	RejectionReason      string     `gorm:"type:text" json:"rejection_reason"`                // nullable, alasan reject
	VerifiedAt           *time.Time `json:"verified_at"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`

	// Relation
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName specifies custom table name
func (UMKMProfile) TableName() string {
	return "umkm_profiles"
}

// ValidJenisBisnis adalah daftar jenis bisnis yang valid
var ValidJenisBisnis = []string{
	"restoran",
	"cafe",
	"bakery",
	"hotel",
	"katering",
	"lainnya",
}

// IsValidJenisBisnis checks if jenis bisnis is valid
func IsValidJenisBisnis(jenisBisnis string) bool {
	for _, j := range ValidJenisBisnis {
		if j == jenisBisnis {
			return true
		}
	}
	return false
}
