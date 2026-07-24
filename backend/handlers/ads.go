//go:build iklan_soon

// TODO(iklan-soon): dinonaktifkan sementara, menunggu penyesuaian ke model Advertisement PRD — koordinasi PIC iklan

package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/models"
	"github.com/savora/backend/services"
)

// GetAdPackages - katalog paket iklan yang bisa dibeli UMKM.
// GET /api/ads/packages
func GetAdPackages(c *fiber.Ctx) error {
	return c.JSON(services.AdPackages())
}

// CreateAd - UMKM memasang iklan baru (status awal Draft).
// POST /api/ads
func CreateAd(c *fiber.Ctx) error {
	type Request struct {
		UmkmID    uint   `json:"umkm_id"`
		ProductID uint   `json:"product_id"`
		PackageID string `json:"package_id"`
		Headline  string `json:"headline"`
		CTA       string `json:"cta"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	ad, err := services.NewAdvertisement(req.UmkmID, req.ProductID, req.PackageID, req.Headline, req.CTA)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if err := services.GetDB().Create(&ad).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(ad)
}

// GetAdsByUMKM - daftar iklan milik satu UMKM. Status kadaluarsa dihitung
// terhadap waktu sekarang dan disimpan bila berubah.
// GET /api/ads/umkm/:umkm_id
func GetAdsByUMKM(c *fiber.Ctx) error {
	umkmID := c.Params("umkm_id")

	var ads []models.Advertisement
	if err := services.GetDB().Where("umkm_id = ?", umkmID).Find(&ads).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	now := time.Now()
	for i := range ads {
		if resolved := services.ResolveAdStatus(ads[i], now); resolved != ads[i].Status {
			ads[i].Status = resolved
			services.GetDB().Model(&ads[i]).Update("status", resolved)
		}
	}

	return c.JSON(ads)
}

// UpdateAdStatus - ubah status iklan (mis. aktifkan iklan Draft).
// PUT /api/ads/:id/status  body: {"status": "Aktif"}
func UpdateAdStatus(c *fiber.Ctx) error {
	id := c.Params("id")

	type Request struct {
		Status string `json:"status"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	var ad models.Advertisement
	if err := services.GetDB().First(&ad, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Advertisement not found"})
	}

	switch req.Status {
	case services.AdStatusActive:
		if err := services.ActivateAd(&ad, time.Now()); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
	case services.AdStatusDraft, services.AdStatusExpired:
		ad.Status = req.Status
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Status tidak valid"})
	}

	if err := services.GetDB().Save(&ad).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(ad)
}

// GetActiveAds - iklan yang sedang tayang, dibentuk sesuai kontrak frontend
// (src/lib/ads.js -> normalizeAd). Dikonsumsi sisi customer marketplace.
// GET /api/ads/active
func GetActiveAds(c *fiber.Ctx) error {
	var ads []models.Advertisement
	if err := services.GetDB().Find(&ads).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	active := services.FilterActiveAds(ads, time.Now())

	// Bentuk respons agar cocok dengan normalizeAd (type, sponsor, headline, cta, href, photo_url).
	out := make([]fiber.Map, 0, len(active))
	for _, ad := range active {
		var product models.Product
		services.GetDB().First(&product, ad.ProductID)

		var umkm models.UMKMProfile
		services.GetDB().First(&umkm, ad.UmkmID)

		out = append(out, fiber.Map{
			"ad_id":     ad.ID,
			"type":      "umkm",
			"sponsor":   umkm.BusinessName,
			"headline":  ad.Headline,
			"cta":       ad.CTA,
			"href":      "/marketplace/" + itoa(int(ad.ProductID)),
			"image_url": product.PhotoURL,
		})
	}

	return c.JSON(out)
}

// itoa kecil agar tidak menambah import strconv di file ini.
func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	return string(buf[i:])
}
