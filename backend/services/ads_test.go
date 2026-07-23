package services

import (
	"testing"
	"time"

	"github.com/savora/backend/models"
)

func TestNewAdvertisementUsesPackagePricing(t *testing.T) {
	ad, err := NewAdvertisement(1, 10, "populer", "Promo mantap", "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if ad.Status != AdStatusDraft {
		t.Errorf("status awal = %s, want Draft", ad.Status)
	}
	// Harga & durasi diambil dari paket, bukan dari input.
	if ad.Price != 35000 || ad.DurationDays != 7 {
		t.Errorf("pricing paket populer salah: price=%v days=%d", ad.Price, ad.DurationDays)
	}
	if ad.CTA != "Lihat produk" {
		t.Errorf("CTA default salah: %q", ad.CTA)
	}
	if ad.StartAt != nil || ad.EndAt != nil {
		t.Error("draft belum boleh punya jadwal tayang")
	}
}

func TestNewAdvertisementValidation(t *testing.T) {
	cases := []struct {
		name          string
		umkm, product uint
		pkg           string
		wantErr       error
	}{
		{"umkm kosong", 0, 10, "kilat", ErrUmkmRequired},
		{"produk kosong", 1, 0, "kilat", ErrProductRequired},
		{"paket tidak ada", 1, 10, "ghaib", ErrPackageNotFound},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := NewAdvertisement(tc.umkm, tc.product, tc.pkg, "h", "c")
			if err != tc.wantErr {
				t.Errorf("err = %v, want %v", err, tc.wantErr)
			}
		})
	}
}

func TestActivateAdSetsSchedule(t *testing.T) {
	ad, _ := NewAdvertisement(1, 10, "kilat", "Flash sale", "Beli")
	now := time.Date(2026, 7, 19, 12, 0, 0, 0, time.UTC)

	if err := ActivateAd(&ad, now); err != nil {
		t.Fatalf("activate error: %v", err)
	}
	if ad.Status != AdStatusActive {
		t.Errorf("status = %s, want Aktif", ad.Status)
	}
	if ad.StartAt == nil || !ad.StartAt.Equal(now) {
		t.Errorf("StartAt salah: %v", ad.StartAt)
	}
	// Paket kilat = 3 hari.
	wantEnd := now.AddDate(0, 0, 3)
	if ad.EndAt == nil || !ad.EndAt.Equal(wantEnd) {
		t.Errorf("EndAt = %v, want %v", ad.EndAt, wantEnd)
	}
}

func TestResolveAdStatusExpiry(t *testing.T) {
	now := time.Date(2026, 7, 19, 12, 0, 0, 0, time.UTC)
	past := now.Add(-time.Hour)
	future := now.Add(time.Hour)

	activeNow := models.Advertisement{Status: AdStatusActive, EndAt: &future}
	if got := ResolveAdStatus(activeNow, now); got != AdStatusActive {
		t.Errorf("iklan belum lewat harus Aktif, got %s", got)
	}

	expired := models.Advertisement{Status: AdStatusActive, EndAt: &past}
	if got := ResolveAdStatus(expired, now); got != AdStatusExpired {
		t.Errorf("iklan lewat EndAt harus Kadaluarsa, got %s", got)
	}

	draft := models.Advertisement{Status: AdStatusDraft}
	if got := ResolveAdStatus(draft, now); got != AdStatusDraft {
		t.Errorf("draft tetap Draft, got %s", got)
	}
}

func TestActivateExpiredAdRejected(t *testing.T) {
	ad := models.Advertisement{Status: AdStatusExpired, DurationDays: 3}
	if err := ActivateAd(&ad, time.Now()); err == nil {
		t.Error("mengaktifkan iklan kadaluarsa seharusnya error")
	}
}

func TestFilterActiveAds(t *testing.T) {
	now := time.Date(2026, 7, 19, 12, 0, 0, 0, time.UTC)
	past := now.Add(-time.Hour)
	future := now.Add(time.Hour)

	ads := []models.Advertisement{
		{ID: 1, Status: AdStatusActive, EndAt: &future}, // tayang
		{ID: 2, Status: AdStatusActive, EndAt: &past},   // kadaluarsa
		{ID: 3, Status: AdStatusDraft},                  // belum aktif
	}
	active := FilterActiveAds(ads, now)
	if len(active) != 1 || active[0].ID != 1 {
		t.Errorf("hanya iklan tayang yang lolos, got %+v", active)
	}
}
