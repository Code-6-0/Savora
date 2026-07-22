package handlers

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// GetActiveAdsHandler - GET /api/advertisements/active (public)
// Mengambil iklan yang sedang aktif untuk ditampilkan di marketplace
func GetActiveAdsHandler(c *fiber.Ctx) error {
	now := time.Now()

	var activeAds []models.Advertisement
	err := database.DB.
		Where("status = ?", models.AdStatusActive).
		Where("starts_at <= ?", now).
		Where("expires_at > ?", now).
		Order("created_at desc").
		Find(&activeAds).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil iklan aktif"},
		})
	}

	// Periksa dan update status EXPIRED untuk iklan yang sudah lewat masa aktif
	for i := range activeAds {
		if activeAds[i].ExpiresAt != nil && activeAds[i].ExpiresAt.Before(now) {
			activeAds[i].Status = models.AdStatusExpired
			database.DB.Save(&activeAds[i])
		}
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"advertisements": activeAds,
			"total":          len(activeAds),
		},
		Error: nil,
	})
}

// RecordImpressionHandler - POST /api/advertisements/{id}/impression (system/public)
// Mencatat 1 impression (tayangan) untuk iklan tertentu
func RecordImpressionHandler(c *fiber.Ctx) error {
	// Parse ad ID
	adID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID iklan tidak valid"},
		})
	}

	// Cek iklan exists dan aktif
	var ad models.Advertisement
	if err := database.DB.First(&ad, adID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "AD_NOT_FOUND", Message: "Iklan tidak ditemukan"},
		})
	}

	// Hanya catat impression jika status ACTIVE
	if ad.Status != models.AdStatusActive {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "AD_NOT_ACTIVE", Message: "Iklan tidak aktif"},
		})
	}

	// Ambil atau buat ad_metrics untuk hari ini
	today := time.Now().Truncate(24 * time.Hour) // Reset ke 00:00:00

	var metrics models.AdMetrics
	result := database.DB.Where("ad_id = ? AND date = ?", adID, today).First(&metrics)

	if result.Error != nil {
		// Buat record baru untuk hari ini
		metrics = models.AdMetrics{
			AdID:        uint(adID),
			Impressions: 1,
			Clicks:      0,
			Date:        today,
		}
		metrics.CalculateCTR()
		database.DB.Create(&metrics)
	} else {
		// Update record yang sudah ada
		metrics.Impressions++
		metrics.CalculateCTR()
		database.DB.Save(&metrics)
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Impression recorded",
			"metrics": metrics,
		},
		Error: nil,
	})
}

// RecordClickHandler - POST /api/advertisements/{id}/click (system/public)
// Mencatat 1 click (klik) untuk iklan tertentu
func RecordClickHandler(c *fiber.Ctx) error {
	// Parse ad ID
	adID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID iklan tidak valid"},
		})
	}

	// Cek iklan exists dan aktif
	var ad models.Advertisement
	if err := database.DB.First(&ad, adID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "AD_NOT_FOUND", Message: "Iklan tidak ditemukan"},
		})
	}

	// Hanya catat click jika status ACTIVE
	if ad.Status != models.AdStatusActive {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "AD_NOT_ACTIVE", Message: "Iklan tidak aktif"},
		})
	}

	// Ambil atau buat ad_metrics untuk hari ini
	today := time.Now().Truncate(24 * time.Hour)

	var metrics models.AdMetrics
	result := database.DB.Where("ad_id = ? AND date = ?", adID, today).First(&metrics)

	if result.Error != nil {
		// Buat record baru (dengan 1 click dan 1 impression otomatis)
		// Asumsi: setiap click pasti ada impression-nya
		metrics = models.AdMetrics{
			AdID:        uint(adID),
			Impressions: 1,
			Clicks:      1,
			Date:        today,
		}
		metrics.CalculateCTR()
		database.DB.Create(&metrics)
	} else {
		// Update record yang sudah ada
		metrics.Clicks++
		metrics.CalculateCTR()
		database.DB.Save(&metrics)
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Click recorded",
			"metrics": metrics,
		},
		Error: nil,
	})
}
