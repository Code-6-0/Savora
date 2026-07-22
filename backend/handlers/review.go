package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
	"github.com/savora/backend/services"
)

// CreateReview - Customer membuat review dengan keyword
func CreateReview(c *fiber.Ctx) error {
	type CreateReviewRequest struct {
		OrderID      uint     `json:"order_id"`
		ReviewerID   uint     `json:"reviewer_id"`
		TargetID     uint     `json:"target_id"` // UMKM ID
		CustomerName string   `json:"customer_name"`
		Rating       int      `json:"rating"`
		Comment      string   `json:"comment"`
		Keywords     []string `json:"keywords"` // Array keyword dari customer
	}

	var req CreateReviewRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	// Classify keywords menggunakan service
	classifiedKeywords := services.ClassifyKeywords(req.Keywords)

	// Create review
	review := models.Review{
		OrderID:      req.OrderID,
		ReviewerID:   req.ReviewerID,
		TargetID:     req.TargetID,
		CustomerName: req.CustomerName,
		Rating:       req.Rating,
		Comment:      req.Comment,
		Keywords:     strings.Join(req.Keywords, ", "), // Denormalized snapshot
	}

	if err := database.DB.Create(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// Save classified keywords
	for _, kw := range classifiedKeywords {
		kw.ReviewID = review.ID
		database.DB.Create(&kw)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Review created successfully",
		"review":  review,
		"classified_keywords": classifiedKeywords,
	})
}

// GetKeywordSafetyBadge - Get badge safety untuk UMKM tertentu
func GetKeywordSafetyBadge(c *fiber.Ctx) error {
	umkmID := c.Params("umkm_id")

	var reviews []models.Review
	if err := database.DB.Where("target_id = ?", umkmID).Preload("ReviewKeywords").Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// Calculate badge menggunakan service
	result := services.CalculateKeywordSafety(reviews)

	return c.JSON(result)
}

// GetReviewsByUMKM - Get semua review untuk UMKM tertentu
func GetReviewsByUMKM(c *fiber.Ctx) error {
	umkmID := c.Params("umkm_id")

	var reviews []models.Review
	if err := database.DB.Where("target_id = ?", umkmID).Preload("ReviewKeywords").Order("created_at desc").Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(reviews)
}
