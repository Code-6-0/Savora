package handlers

import (
	"math"

	"github.com/gofiber/fiber/v2"
)

// CalculateDynamicDiscount - Menghitung rekomendasi diskon berdasarkan Food Trust Index
// Sesuai PRD Section 13.2 dan 13.3 (guardrail harga minimum)
func CalculateDynamicDiscount(c *fiber.Ctx) error {
	type DiscountRequest struct {
		TrustStatus   string  `json:"trust_status"`   // Fresh, Layak Dijual, Segera Dijual
		OriginalPrice float64 `json:"original_price"`
		MinimumPrice  float64 `json:"minimum_price"` // Guardrail dari UMKM
	}

	type DiscountResult struct {
		Discount      float64 `json:"discount"`       // Persentase diskon
		RescuePrice   float64 `json:"rescue_price"`   // Harga setelah diskon
		Reason        string  `json:"reason"`
		MinPriceHit   bool    `json:"min_price_hit"`  // Apakah guardrail aktif
	}

	var req DiscountRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	var discount float64
	var reason string

	// Tabel diskon dari PRD Section 13.2
	switch req.TrustStatus {
	case "Fresh":
		discount = 15 // 10-20% (ambil tengah)
		reason = "Produk dalam kondisi fresh. Diskon standar untuk food rescue."
	case "Layak Dijual":
		discount = 27 // 20-35% (ambil tengah)
		reason = "Produk masih layak dijual. Diskon menarik untuk mempercepat penjualan."
	case "Segera Dijual":
		discount = 42 // 35-50% (ambil tengah)
		reason = "Produk mendekati batas konsumsi. Diskon tinggi untuk penjualan cepat dan menghindari food waste."
	case "Tidak Disarankan Dijual", "Tidak Layak Konsumsi":
		return c.JSON(DiscountResult{
			Discount:    0,
			RescuePrice: 0,
			Reason:      "Produk tidak boleh dijual untuk konsumsi manusia. Pertimbangkan jalur recovery lain seperti donasi atau kompos.",
			MinPriceHit: false,
		})
	default:
		discount = 20
		reason = "Diskon default untuk produk food rescue."
	}

	rescuePrice := req.OriginalPrice * (1 - discount/100)
	minPriceHit := false

	// Check minimum price constraint (guardrail dari PRD 13.3)
	if req.MinimumPrice > 0 && rescuePrice < req.MinimumPrice {
		adjustedDiscount := ((req.OriginalPrice - req.MinimumPrice) / req.OriginalPrice) * 100
		rescuePrice = req.MinimumPrice
		discount = adjustedDiscount
		reason = reason + " Harga disesuaikan dengan harga minimum yang ditetapkan UMKM."
		minPriceHit = true
	}

	result := DiscountResult{
		Discount:    math.Round(discount*100) / 100,
		RescuePrice: math.Round(rescuePrice),
		Reason:      reason,
		MinPriceHit: minPriceHit,
	}

	return c.JSON(result)
}
