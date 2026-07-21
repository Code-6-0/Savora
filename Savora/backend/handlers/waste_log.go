package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// GetWasteLogsByUMKM mengambil semua waste log untuk suatu UMKM.
func GetWasteLogsByUMKM(c *fiber.Ctx) error {
	umkmID := c.Params("umkm_id")
	
	var wasteLogs []models.WasteLog
	if err := database.DB.Where("umkm_id = ?", umkmID).Order("created_at desc").Find(&wasteLogs).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve waste logs",
		})
	}
	
	return c.JSON(wasteLogs)
}

// CreateWasteLog menyimpan catatan waste log baru.
func CreateWasteLog(c *fiber.Ctx) error {
	var payload struct {
		UmkmID          uint    `json:"umkm_id"`
		FoodName        string  `json:"food_name"`
		Category        string  `json:"category"`
		EstimatedWeight float64 `json:"estimated_weight"`
		Reason          string  `json:"reason"`
		PhotoURL        string  `json:"photo_url"`
	}

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid payload",
		})
	}

	wasteLog := models.WasteLog{
		UmkmID:          payload.UmkmID,
		FoodName:        payload.FoodName,
		Category:        payload.Category,
		EstimatedWeight: payload.EstimatedWeight,
		Reason:          payload.Reason,
		PhotoURL:        payload.PhotoURL,
	}

	if err := database.DB.Create(&wasteLog).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create waste log",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(wasteLog)
}
