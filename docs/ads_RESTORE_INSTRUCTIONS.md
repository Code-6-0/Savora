# Cara Mengembalikan Modul Iklan UMKM Lama

> **Konteks:** Modul iklan UMKM lama (paket berbasis durasi: Kilat/Populer/Sorotan) dinonaktifkan sementara dengan build tag karena tidak kompatibel dengan model `Advertisement` versi PRD Section 18. Fitur admin iklan (PRD-compliant) TETAP JALAN dan tidak terpengaruh.

---

## 1. Hapus Build Tag

Hapus baris pertama `//go:build iklan_soon` dan baris TODO comment dari 3 file berikut:

1. `backend/services/ads.go` (baris 1-3)
2. `backend/services/ads_test.go` (baris 1-3)
3. `backend/handlers/ads.go` (baris 1-3)

**Contoh: Sebelum**
```go
//go:build iklan_soon

// TODO(iklan-soon): dinonaktifkan sementara...

package services
```

**Contoh: Sesudah**
```go
package services
```

---

## 2. Sesuaikan Model ke PRD Section 18

File yang perlu diubah: `backend/services/ads.go` dan `backend/handlers/ads.go`

### Mapping Field Lama → Field Baru PRD

| Field Lama (dihapus) | Field Baru PRD | Deskripsi |
|----------------------|----------------|-----------|
| `UmkmID` | `AdvertiserID` | FK ke `users.id` |
| `ProductID` | ❌ HAPUS | Tidak ada di model baru |
| `PackageID` | ❌ HAPUS | Tidak ada di model baru (durasi paket menjadi `DurationDays` manual) |
| `Headline` | `Title` | Judul iklan |
| `CTA` | ❌ HAPUS | Tidak ada di model baru (gunakan `TargetURL` sebagai link) |
| `StartAt` | `StartsAt` | Waktu mulai tayang |
| `EndAt` | `ExpiresAt` | Waktu selesai tayang |

### Field Baru yang Harus Ditambahkan

| Field | Tipe | Deskripsi | Wajib? |
|-------|------|-----------|--------|
| `AdvertiserType` | string | "UMKM" atau "EXTERNAL" | ✅ |
| `ImageURL` | string | URL gambar iklan | ✅ |
| `TargetURL` | string | Link redirect saat iklan diklik | ✅ |
| `DurationDays` | int | Durasi iklan (hari) | ✅ |
| `Price` | float64 | Harga sebelum service fee | ✅ |
| `ServiceFee` | float64 | 5% dari `Price` | ✅ |
| `Status` | string | PENDING/APPROVED/REJECTED/ACTIVE/EXPIRED | ✅ |
| `ApprovedBy` | *uint | FK ke admin yang approve | (nullable) |
| `ApprovedAt` | *time.Time | Waktu approve | (nullable) |

### Konstanta Status (Ubah)

**Lama:**
```go
const (
    AdStatusDraft   = "Draft"
    AdStatusActive  = "Aktif"
    AdStatusExpired = "Kadaluarsa"
)
```

**Baru (PRD):**
```go
const (
    AdStatusPending  = "PENDING"
    AdStatusApproved = "APPROVED"
    AdStatusRejected = "REJECTED"
    AdStatusActive   = "ACTIVE"
    AdStatusExpired  = "EXPIRED"
)
```

---

## 3. Kembalikan Routing di `routes/routes.go`

**Sekarang (di-stub):**
```go
// Line 43-48
api.Get("/ads/packages", handlers.AdComingSoonStub)
api.Post("/ads", handlers.AdComingSoonStub)
api.Get("/ads/umkm/:umkm_id", handlers.AdComingSoonStub)
api.Put("/ads/:id/status", handlers.AdComingSoonStub)
api.Get("/ads/active", handlers.AdComingSoonStub)
```

**Kembalikan ke handler asli setelah diperbaiki:**
```go
api.Get("/ads/packages", handlers.GetAdPackages)
api.Post("/ads", handlers.CreateAd)
api.Get("/ads/umkm/:umkm_id", handlers.GetAdsByUMKM)
api.Put("/ads/:id/status", handlers.UpdateAdStatus)
api.Get("/ads/active", handlers.GetActiveAds)
```

**CATATAN:** Routing admin iklan (`/admin/advertisements/*`) TIDAK DI-STUB dan tetap menggunakan handler PRD-compliant:
```go
// Line 76-77 - SUDAH BENAR, tidak perlu diubah
admin.Get("/advertisements", handlers.GetAdsHandler)
admin.Patch("/advertisements/:id/status", handlers.ApproveRejectAdHandler)
```

---

## 4. Hapus File Stub

Setelah routing dikembalikan, hapus file `backend/handlers/ads_stub.go`.

```bash
rm backend/handlers/ads_stub.go
```

---

## 5. Contoh Refactoring `services/ads.go`

### Sebelum (field lama):
```go
func NewAdvertisement(umkmID, productID uint, packageID, headline, cta string) (models.Advertisement, error) {
    // ...
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
```

### Sesudah (field PRD):
```go
func NewAdvertisement(advertiserID uint, advertiserType, title, imageURL, targetURL string, durationDays int, price float64) (models.Advertisement, error) {
    serviceFee := price * 0.05
    return models.Advertisement{
        AdvertiserID:   advertiserID,
        AdvertiserType: advertiserType,
        Title:          title,
        ImageURL:       imageURL,
        TargetURL:      targetURL,
        DurationDays:   durationDays,
        Price:          price,
        ServiceFee:     serviceFee,
        Status:         models.AdStatusPending, // PRD: semua iklan mulai dari PENDING
    }, nil
}
```

**PENTING:** Konsep "paket iklan" (Kilat/Populer/Sorotan) dihapus dari model. Jika ingin tetap menawarkan paket, buat sebagai konstanta di frontend/backend tapi simpan hanya `DurationDays` dan `Price` di database.

---

## 6. Test & Verifikasi

Setelah refactoring:

1. **Build:**
   ```bash
   cd backend && go build ./...
   ```

2. **Test:**
   ```bash
   go test ./services/... ./handlers/...
   ```

3. **Manual smoke test:**
   - `GET /api/ads/packages` harus return daftar paket (bukan 501)
   - `POST /api/ads` harus bisa submit iklan UMKM
   - `GET /admin/advertisements` tetap berfungsi (sudah PRD-compliant)

---

## Kontak

Koordinasi dengan PIC modul iklan UMKM sebelum restore. Fitur admin iklan (PRD-compliant) tidak terpengaruh dan tetap jalan penuh.
