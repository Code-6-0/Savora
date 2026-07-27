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
	Category           string     `gorm:"size:50" json:"category"`      // donasi, bank_sampah, daur_ulang, kompos, maggot_bsf, pengangkutan_sampah, waste_management

	// Dokumen Legalitas Yayasan (wajib)
	NomorAktaPendirian    string `gorm:"size:100" json:"nomor_akta_pendirian"`     // Nomor akta pendirian yayasan
	AktaPendirianURL      string `gorm:"size:500" json:"akta_pendirian_url"`       // URL dokumen akta pendirian
	NomorSKKemenkumham    string `gorm:"size:100" json:"nomor_sk_kemenkumham"`     // Nomor SK pengesahan badan hukum
	SKKemenkumhamURL      string `gorm:"size:500" json:"sk_kemenkumham_url"`       // URL dokumen SK Kemenkumham
	NPWPYayasan           string `gorm:"size:50" json:"npwp_yayasan"`              // Nomor NPWP atas nama yayasan
	NPWPYayasanURL        string `gorm:"size:500" json:"npwp_yayasan_url"`         // URL foto/scan NPWP yayasan
	KTPPenanggungJawabURL string `gorm:"size:500" json:"ktp_penanggung_jawab_url"` // URL foto KTP penanggung jawab
	SelfieKTPURL          string `gorm:"size:500" json:"selfie_ktp_url"`           // URL foto selfie dengan KTP (standar verifikasi platform donasi)

	// Dokumen Tambahan (opsional)
	FotoFasilitasURL  string `gorm:"size:500" json:"foto_fasilitas_url"`  // URL foto kegiatan/fasilitas yayasan (opsional)
	NIBUrl            string `gorm:"size:500" json:"nib_url"`             // URL NIB (Nomor Induk Berusaha) - opsional
	TandaDaftarLKSURL string `gorm:"size:500" json:"tanda_daftar_lks_url"` // URL Tanda Daftar LKS (Lembaga Kesejahteraan Sosial) - opsional

	AdminNote          string     `gorm:"type:text" json:"admin_note"`                        // Catatan dari admin saat verifikasi
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

// DonationOffer represents a food donation offer from UMKM/Customer to Mitra Donasi
// PRD REVISI #40: surplus events (katering/hajatan) — customers can donate WITHOUT becoming UMKM
type DonationOffer struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	DonorID         uint       `gorm:"not null" json:"donor_id"`           // User ID of donor (UMKM or Customer)
	MitraID         *uint      `json:"mitra_id"`                           // Mitra who accepted (null if pending)
	Title           string     `gorm:"size:255;not null" json:"title"`     // Judul penawaran
	Description     string     `gorm:"type:text" json:"description"`       // Deskripsi makanan
	FoodType        string     `gorm:"size:100" json:"food_type"`          // surplus_event, leftover, etc.
	Category        string     `gorm:"size:50" json:"category"`            // Matches mitra category
	Quantity        int        `gorm:"default:1" json:"quantity"`          // Jumlah porsi
	WeightKg        float64    `gorm:"default:0" json:"weight_kg"`         // Berat dalam kg
	AvailableFrom   time.Time  `json:"available_from"`                     // Waktu mulai tersedia
	AvailableUntil  time.Time  `json:"available_until"`                    // Batas waktu pengambilan
	PickupAddress   string     `gorm:"type:text" json:"pickup_address"`    // Alamat pengambilan
	Status          string     `gorm:"size:50;default:PENDING" json:"status"` // PENDING, ACCEPTED, REJECTED, COMPLETED, EXPIRED, CANCELLED
	Notes           string     `gorm:"type:text" json:"notes"`             // Catatan dari mitra
	RejectionReason string     `gorm:"type:text" json:"rejection_reason"`  // Alasan penolakan
	AcceptedAt      *time.Time `json:"accepted_at"`
	CompletedAt     *time.Time `json:"completed_at"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`

	// Relations
	Donor User               `gorm:"foreignKey:DonorID" json:"donor,omitempty"`
	Mitra *MitraDonasiProfile `gorm:"foreignKey:MitraID" json:"mitra,omitempty"`
}

// TableName specifies custom table name
func (DonationOffer) TableName() string {
	return "donation_offers"
}

// DonationHistory represents completed donation pickup records
type DonationHistory struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	OfferID       uint      `gorm:"not null" json:"offer_id"`
	MitraID       uint      `gorm:"not null" json:"mitra_id"`
	DonorID       uint      `gorm:"not null" json:"donor_id"`
	PortionsSaved int       `gorm:"default:0" json:"portions_saved"` // Jumlah porsi yang diselamatkan
	WeightKg      float64   `gorm:"default:0" json:"weight_kg"`      // Berat dalam kg
	PickupDate    time.Time `json:"pickup_date"`
	Notes         string    `gorm:"type:text" json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relations
	Offer DonationOffer      `gorm:"foreignKey:OfferID" json:"offer,omitempty"`
	Mitra MitraDonasiProfile `gorm:"foreignKey:MitraID" json:"mitra,omitempty"`
	Donor User               `gorm:"foreignKey:DonorID" json:"donor,omitempty"`
}

// TableName specifies custom table name
func (DonationHistory) TableName() string {
	return "donation_history"
}
