package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/services"
	"github.com/savora/backend/models"
)

// GetProductsByUMKM
func GetProductsByUMKM(c *fiber.Ctx) error {
	umkmID := c.Params("umkm_id")
	var products []models.Product

	if err := services.GetDB().Where("umkm_id = ?", umkmID).Order("created_at desc").Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(products)
}

// GetActiveMarketplaceProducts
func GetActiveMarketplaceProducts(c *fiber.Ctx) error {
	var products []models.Product

	if err := services.GetDB().Where("status = ?", "Aktif").Order("created_at desc").Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(products)
}

// CreateProduct
func CreateProduct(c *fiber.Ctx) error {
	product := new(models.Product)

	if err := c.BodyParser(product); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	product.FoodTrustStatus = CalculateFoodTrustStatus(product)

	if product.FoodTrustStatus == "Tidak Layak Konsumsi" {
		product.Status = "Limbah"
	}

	if err := services.GetDB().Create(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if product.Status == "Limbah" {
		estimatedWeight := float64(product.Stock) * product.WeightPerPortion / 1000.0
		wasteLog := models.WasteLog{
			UmkmID:          product.UmkmID,
			FoodName:        product.Name,
			Category:        product.Category,
			EstimatedWeight: estimatedWeight,
			Reason:          "Otomatis oleh sistem: Tidak Layak Konsumsi (Berdasarkan Food Trust Index)",
			PhotoURL:        product.PhotoURL,
		}
		services.GetDB().Create(&wasteLog)

		notification := models.Notification{
			UserID:   product.UmkmID,
			UserRole: "umkm",
			Title:    "Produk Ditolak Sistem",
			Message:  "Produk " + product.Name + " terdeteksi Tidak Layak Konsumsi dan otomatis dialihkan ke Waste Log.",
		}
		services.GetDB().Create(&notification)
	}

	return c.Status(fiber.StatusCreated).JSON(product)
}

// UpdateProduct
func UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var product models.Product

	if err := services.GetDB().First(&product, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
	}

	var updateData models.Product
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	updateData.FoodTrustStatus = CalculateFoodTrustStatus(&updateData)

	if updateData.FoodTrustStatus == "Tidak Layak Konsumsi" && product.Status != "Limbah" {
		updateData.Status = "Limbah"
	}

	services.GetDB().Model(&product).Updates(updateData)

	if updateData.Status == "Limbah" && product.Status != "Limbah" {
		estimatedWeight := float64(product.Stock) * product.WeightPerPortion / 1000.0
		wasteLog := models.WasteLog{
			UmkmID:          product.UmkmID,
			FoodName:        product.Name,
			Category:        product.Category,
			EstimatedWeight: estimatedWeight,
			Reason:          "Otomatis oleh sistem: Update produk menjadi Tidak Layak Konsumsi",
			PhotoURL:        product.PhotoURL,
		}
		services.GetDB().Create(&wasteLog)

		notification := models.Notification{
			UserID:   product.UmkmID,
			UserRole: "umkm",
			Title:    "Produk Menjadi Limbah",
			Message:  "Produk " + product.Name + " telah diubah menjadi Tidak Layak Konsumsi dan masuk ke Waste Log.",
		}
		services.GetDB().Create(&notification)
	}

	return c.JSON(product)
}

// DeleteProduct
func DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var product models.Product

	if err := services.GetDB().First(&product, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
	}

	services.GetDB().Delete(&product)

	return c.JSON(fiber.Map{"message": "Product successfully deleted"})
}

// CalculateFoodTrustStatus menghitung FTI berdasarkan PRD 12.4
func CalculateFoodTrustStatus(p *models.Product) string {
	if p.ProductionTime == nil || p.ExpiresAt == nil {
		// Fallback jika tidak ada data waktu
		return p.FoodTrustStatus
	}

	now := time.Now()
	totalLifespan := p.ExpiresAt.Sub(*p.ProductionTime)
	remainingTime := p.ExpiresAt.Sub(now)

	var f float64 = 0
	if totalLifespan > 0 {
		f = float64(remainingTime) / float64(totalLifespan)
	}

	if f <= 0 || p.PackagingCondition == "Rusak" {
		return "Tidak Layak Konsumsi"
	}
	if f < 0.15 || p.StorageMethod == "Tidak Sesuai" {
		return "Tidak Disarankan Dijual"
	}
	if f < 0.40 {
		return "Segera Dijual"
	}
	if f < 0.75 || p.PackagingCondition == "Standar" {
		return "Layak Dijual"
	}
	if f >= 0.75 && p.PackagingCondition == "Baik" && p.StorageMethod == "Sesuai" {
		return "Fresh"
	}

	return "Layak Dijual" // Fallback
}
