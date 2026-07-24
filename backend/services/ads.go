//go:build iklan_soon

// TODO(iklan-soon): dinonaktifkan sementara, menunggu penyesuaian ke model Advertisement PRD — koordinasi PIC iklan

package services

import (
	"errors"
	"time"

	"github.com/savora/backend/models"
)

// AdPackage — paket iklan berdurasi tetap yang bisa dibeli UMKM.
type AdPackage struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	DurationDays int     `json:"duration_days"`
	Price        float64 `json:"price"`
	Description  string  `json:"description"`
}

// Status iklan.
const (
	AdStatusDraft   = "Draft"
	AdStatusActive  = "Aktif"
	AdStatusExpired = "Kadaluarsa"
)

// adPackages — katalog paket iklan. Durasi tetap, harga per paket.
var adPackages = []AdPackage{
	{ID: "kilat", Name: "Kilat", DurationDays: 3, Price: 15000, Description: "Tayang 3 hari, cocok untuk flash sale rescue deal."},
	{ID: "populer", Name: "Populer", DurationDays: 7, Price: 35000, Description: "Tayang 7 hari, paling banyak dipilih UMKM."},
	{ID: "sorotan", Name: "Sorotan", DurationDays: 30, Price: 99000, Description: "Tayang 30 hari, sorotan penuh sebulan."},
}

var (
	ErrPackageNotFound = errors.New("paket iklan tidak ditemukan")
	ErrProductRequired = errors.New("product_id wajib diisi")
	ErrUmkmRequired    = errors.New("umkm_id wajib diisi")
)

// AdPackages mengembalikan salinan katalog paket iklan.
func AdPackages() []AdPackage {
	out := make([]AdPackage, len(adPackages))
	copy(out, adPackages)
	return out
}

// FindPackage mencari paket iklan berdasarkan id.
func FindPackage(id string) (AdPackage, bool) {
	for _, p := range adPackages {
		if p.ID == id {
			return p, true
		}
	}
	return AdPackage{}, false
}

// NewAdvertisement membuat iklan Draft dari input UMKM. Harga dan durasi
// diambil dari paket (tidak dipercaya dari input untuk mencegah manipulasi).
// StartAt/EndAt belum diisi hingga iklan diaktifkan.
func NewAdvertisement(umkmID, productID uint, packageID, headline, cta string) (models.Advertisement, error) {
	if umkmID == 0 {
		return models.Advertisement{}, ErrUmkmRequired
	}
	if productID == 0 {
		return models.Advertisement{}, ErrProductRequired
	}
	pkg, ok := FindPackage(packageID)
	if !ok {
		return models.Advertisement{}, ErrPackageNotFound
	}
	if cta == "" {
		cta = "Lihat produk"
	}
	return models.Advertisement{
		UmkmID:       umkmID,
		ProductID:    productID,
		PackageID:    pkg.ID,
		Headline:     headline,
		CTA:          cta,
		Status:       AdStatusDraft,
		Price:        pkg.Price,
		DurationDays: pkg.DurationDays,
	}, nil
}

// ActivateAd mengaktifkan iklan Draft: set StartAt=now dan EndAt=now+durasi.
// Mengembalikan error bila iklan sudah kadaluarsa.
func ActivateAd(ad *models.Advertisement, now time.Time) error {
	if ad.Status == AdStatusExpired {
		return errors.New("iklan kadaluarsa tidak dapat diaktifkan")
	}
	start := now
	end := now.AddDate(0, 0, ad.DurationDays)
	ad.Status = AdStatusActive
	ad.StartAt = &start
	ad.EndAt = &end
	return nil
}

// ResolveAdStatus mengembalikan status iklan yang sudah memperhitungkan waktu:
// iklan Aktif yang melewati EndAt otomatis menjadi Kadaluarsa. Fungsi ini tidak
// mengubah input; pemanggil yang memutuskan untuk menyimpan perubahan.
func ResolveAdStatus(ad models.Advertisement, now time.Time) string {
	if ad.Status == AdStatusActive && ad.EndAt != nil && !now.Before(*ad.EndAt) {
		return AdStatusExpired
	}
	return ad.Status
}

// IsActive melaporkan apakah iklan sedang tayang pada waktu now.
func IsActive(ad models.Advertisement, now time.Time) bool {
	return ResolveAdStatus(ad, now) == AdStatusActive
}

// FilterActiveAds mengembalikan hanya iklan yang sedang tayang pada waktu now.
func FilterActiveAds(ads []models.Advertisement, now time.Time) []models.Advertisement {
	out := make([]models.Advertisement, 0, len(ads))
	for _, ad := range ads {
		if IsActive(ad, now) {
			out = append(out, ad)
		}
	}
	return out
}
