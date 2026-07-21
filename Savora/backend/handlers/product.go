package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// GetProductsByUMKM
func GetProductsByUMKM(c *fiber.Ctx) error {
	umkmID := c.Params("umkm_id")
	var products []models.Product

	if err := database.DB.Where("umkm_id = ?", umkmID).Order("created_at desc").Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(products)
}

// GetActiveMarketplaceProducts
func GetActiveMarketplaceProducts(c *fiber.Ctx) error {
	var products []models.Product

	if err := database.DB.Where("status = ?", "Aktif").Order("created_at desc").Find(&products).Error; err != nil {
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

	if product.FoodTrustStatus == "Tidak Layak Konsumsi" {
		product.Status = "Limbah"
	}

	if err := database.DB.Create(&product).Error; err != nil {
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
		database.DB.Create(&wasteLog)

		notification := models.Notification{
			UmkmID:  product.UmkmID,
			Title:   "Produk Ditolak Sistem",
			Message: "Produk " + product.Name + " terdeteksi Tidak Layak Konsumsi dan otomatis dialihkan ke Waste Log.",
		}
		database.DB.Create(&notification)
	}

	return c.Status(fiber.StatusCreated).JSON(product)
}

// UpdateProduct
func UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var product models.Product

	if err := database.DB.First(&product, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
	}

	var updateData models.Product
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	if updateData.FoodTrustStatus == "Tidak Layak Konsumsi" && product.Status != "Limbah" {
		updateData.Status = "Limbah"
	}

	database.DB.Model(&product).Updates(updateData)

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
		database.DB.Create(&wasteLog)

		notification := models.Notification{
			UmkmID:  product.UmkmID,
			Title:   "Produk Menjadi Limbah",
			Message: "Produk " + product.Name + " telah diubah menjadi Tidak Layak Konsumsi dan masuk ke Waste Log.",
		}
		database.DB.Create(&notification)
	}

	return c.JSON(product)
}

// DeleteProduct
func DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var product models.Product

	if err := database.DB.First(&product, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
	}

	database.DB.Delete(&product)

	return c.JSON(fiber.Map{"message": "Product successfully deleted"})
}
