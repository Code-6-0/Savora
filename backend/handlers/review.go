package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/models"
	"github.com/savora/backend/services"
)

type ReviewHandler struct {
	classifier services.KeywordClassifier
}

func NewReviewHandler() *ReviewHandler {
	return &ReviewHandler{
		classifier: services.NewSimpleKeywordClassifier(),
	}
}

// CreateReview - POST /reviews (Customer submit review setelah order completed)
func (h *ReviewHandler) CreateReview(c *fiber.Ctx) error {
	db := services.GetDB()
	
	// TODO: Extract customerID dari JWT
	customerID := uint(1)
	
	var req services.CreateReviewRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	err := services.CreateReview(db, customerID, req, h.classifier)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Review berhasil disimpan",
	})
}

// GetKeywordSafety - GET /reviews/keywords/:umkm_id (Public, untuk badge)
func (h *ReviewHandler) GetKeywordSafety(c *fiber.Ctx) error {
	db := services.GetDB()
	umkmID := c.Params("umkm_id")
	
	var umkm models.UmkmProfile
	if err := db.First(&umkm, umkmID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "UMKM tidak ditemukan",
		})
	}

	score, err := services.GetKeywordSafetyScore(db, umkm.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(score)
}

// GetReviewsByUmkm - GET /reviews/umkm/:umkm_id (Public, untuk detail produk)
func (h *ReviewHandler) GetReviewsByUmkm(c *fiber.Ctx) error {
	db := services.GetDB()
	umkmID := c.Params("umkm_id")
	
	var reviews []models.Review
	if err := db.Where("target_id = ?", umkmID).
		Preload("ReviewKeywords").
		Order("created_at desc").
		Limit(50).
		Find(&reviews).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Hitung statistik rating
	var stats struct {
		AverageRating float64 `json:"average_rating"`
		TotalReviews  int64   `json:"total_reviews"`
		Rating1       int64   `json:"rating_1"`
		Rating2       int64   `json:"rating_2"`
		Rating3       int64   `json:"rating_3"`
		Rating4       int64   `json:"rating_4"`
		Rating5       int64   `json:"rating_5"`
	}

	db.Model(&models.Review{}).
		Where("target_id = ?", umkmID).
		Select("AVG(rating) as average_rating, COUNT(*) as total_reviews").
		Scan(&stats)

	db.Model(&models.Review{}).
		Where("target_id = ? AND rating = ?", umkmID, 1).
		Count(&stats.Rating1)

	db.Model(&models.Review{}).
		Where("target_id = ? AND rating = ?", umkmID, 2).
		Count(&stats.Rating2)

	db.Model(&models.Review{}).
		Where("target_id = ? AND rating = ?", umkmID, 3).
		Count(&stats.Rating3)

	db.Model(&models.Review{}).
		Where("target_id = ? AND rating = ?", umkmID, 4).
		Count(&stats.Rating4)

	db.Model(&models.Review{}).
		Where("target_id = ? AND rating = ?", umkmID, 5).
		Count(&stats.Rating5)

	return c.JSON(fiber.Map{
		"reviews": reviews,
		"stats":   stats,
	})
}

// GetReviewsByProduct - GET /reviews/product/:product_id (Public)
func (h *ReviewHandler) GetReviewsByProduct(c *fiber.Ctx) error {
	db := services.GetDB()
	productID := c.Params("product_id")
	
	var product models.Product
	if err := db.First(&product, productID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Produk tidak ditemukan",
		})
	}

	var reviews []models.Review
	if err := db.Where("target_id = ?", product.UmkmID).
		Preload("ReviewKeywords").
		Order("created_at desc").
		Limit(20).
		Find(&reviews).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"product": product,
		"reviews": reviews,
	})
}
