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
	DocumentURL        string     `gorm:"size:500" json:"document_url"` // URL dokumen legalitas (deprecated, use specific fields below)

	// Dokumen Legalitas Yayasan (wajib)
	NomorAktaPendirian      string `gorm:"size:100" json:"nomor_akta_pendirian"`       // Nomor akta pendirian yayasan
	AktaPendirianURL        string `gorm:"size:500" json:"akta_pendirian_url"`         // URL dokumen akta pendirian
	NomorSKKemenkumham      string `gorm:"size:100" json:"nomor_sk_kemenkumham"`       // Nomor SK pengesahan badan hukum
	SKKemenkumhamURL        string `gorm:"size:500" json:"sk_kemenkumham_url"`         // URL dokumen SK Kemenkumham
	NPWPYayasan             string `gorm:"size:50" json:"npwp_yayasan"`                // Nomor NPWP atas nama yayasan
	NPWPYayasanURL          string `gorm:"size:500" json:"npwp_yayasan_url"`           // URL foto/scan NPWP yayasan
	KTPPenanggungJawabURL   string `gorm:"size:500" json:"ktp_penanggung_jawab_url"`   // URL foto KTP penanggung jawab
	SelfieKTPURL            string `gorm:"size:500" json:"selfie_ktp_url"`             // URL foto selfie dengan KTP (standar verifikasi platform donasi)

	// Dokumen Tambahan (opsional)
	FotoFasilitasURL   string `gorm:"size:500" json:"foto_fasilitas_url"`    // URL foto kegiatan/fasilitas yayasan (opsional)
	NIBUrl             string `gorm:"size:500" json:"nib_url"`               // URL NIB (Nomor Induk Berusaha) - opsional
	TandaDaftarLKSURL  string `gorm:"size:500" json:"tanda_daftar_lks_url"`  // URL Tanda Daftar LKS (Lembaga Kesejahteraan Sosial) - opsional

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
