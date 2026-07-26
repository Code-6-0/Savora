package models

import (
	"time"
)

// MitraPengolahApplication represents mitra pengolah application
// Berbeda dari mitra donasi yang langsung jadi profile, ini adalah application/pendaftaran
type MitraPengolahApplication struct {
	ID                     uint       `gorm:"primaryKey" json:"id"`
	UserID                 uint       `gorm:"not null;uniqueIndex" json:"user_id"`
	NamaOrganisasi         string     `gorm:"size:255;not null" json:"nama_organisasi"`
	Kategori               string     `gorm:"size:100;not null" json:"kategori"` // organisasi_donasi, budidaya_maggot, kompos, pengolahan_organik, pakan_ternak, bank_sampah
	AlamatLokasi           string     `gorm:"type:text;not null" json:"alamat_lokasi"`
	KapasitasPengolahan    string     `gorm:"size:255;not null" json:"kapasitas_pengolahan"` // e.g. "50 kg/hari"
	NamaPenanggungJawab    string     `gorm:"size:255;not null" json:"nama_penanggung_jawab"`
	KontakTelepon          string     `gorm:"size:20;not null" json:"kontak_telepon"`
	KontakEmail            string     `gorm:"size:255;not null" json:"kontak_email"`
	JadwalPickup           string     `gorm:"size:255;not null" json:"jadwal_pickup"` // e.g. "Senin-Jumat 08:00-16:00"
	DokumenLegalitasURL    string     `gorm:"size:500" json:"dokumen_legalitas_url"`  // nullable
	FotoFasilitasURL       string     `gorm:"size:500" json:"foto_fasilitas_url"`     // nullable
	DeskripsiSingkat       string     `gorm:"type:text;not null" json:"deskripsi_singkat"`
	VerificationStatus     string     `gorm:"size:50;default:PENDING" json:"verification_status"` // PENDING, APPROVED, REJECTED
	RejectionReason        string     `gorm:"type:text" json:"rejection_reason"`                  // nullable, alasan reject
	VerifiedAt             *time.Time `json:"verified_at"`
	CreatedAt              time.Time  `json:"created_at"`
	UpdatedAt              time.Time  `json:"updated_at"`

	// Relation
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName specifies custom table name
func (MitraPengolahApplication) TableName() string {
	return "mitra_pengolah_applications"
}

// ValidKategori adalah daftar kategori yang valid
var ValidKategori = []string{
	"organisasi_donasi",
	"budidaya_maggot",
	"kompos",
	"pengolahan_organik",
	"pakan_ternak",
	"bank_sampah",
}

// IsValidKategori checks if kategori is valid
func IsValidKategori(kategori string) bool {
	for _, k := range ValidKategori {
		if k == kategori {
			return true
		}
	}
	return false
}
