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
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Auth check: User harus sudah login
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Silakan login terlebih dahulu"},
		})
	}

	claims := userLocal.(*JWTClaims)

	// Role check: Hanya UMKM yang bisa create product
	if claims.Role != models.RoleUMKM {
		return c.Status(fiber.StatusForbidden).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "FORBIDDEN", Message: "Hanya UMKM yang dapat membuat produk"},
		})
	}

	// Owner check & Gating: Query umkm_profile dari user_id (bukan dari product.UmkmID)
	var umkmProfile models.UMKMProfile
	if err := database.DB.Where("user_id = ?", claims.UserID).First(&umkmProfile).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UMKM_PROFILE_NOT_FOUND", Message: "Profil UMKM tidak ditemukan"},
		})
	}

	// Verifikasi product.UmkmID harus match dengan umkmProfile.ID (owner check)
	if product.UmkmID != umkmProfile.ID {
		return c.Status(fiber.StatusForbidden).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "FORBIDDEN", Message: "Anda tidak dapat membuat produk untuk UMKM lain"},
		})
	}

	// Gating: Cek UMKM verification status (PRD FR-02)
	if umkmProfile.VerificationStatus != "APPROVED" {
		return c.Status(fiber.StatusForbidden).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UMKM_NOT_VERIFIED", Message: "UMKM belum diverifikasi. Silakan tunggu verifikasi admin sebelum membuat produk"},
		})
	}

	if err := database.DB.Create(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat produk"},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(APIResponse{
		Success: true,
		Data:    fiber.Map{"product": product},
		Error:   nil,
	})
}

// UpdateProduct
func UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var product models.Product

	if err := database.DB.First(&product, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "PRODUCT_NOT_FOUND", Message: "Produk tidak ditemukan"},
		})
	}

	// Authorization check: owner UMKM atau Admin
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Silakan login terlebih dahulu"},
		})
	}

	claims := userLocal.(*JWTClaims)

	// Admin dapat mengubah produk apapun
	if claims.Role != models.RoleAdmin {
		// Non-admin harus menjadi owner
		var umkmProfile models.UMKMProfile
		if err := database.DB.Where("user_id = ?", claims.UserID).First(&umkmProfile).Error; err != nil {
			return c.Status(fiber.StatusForbidden).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "FORBIDDEN", Message: "Anda tidak memiliki izin untuk mengubah produk ini"},
			})
		}

		if product.UmkmID != umkmProfile.ID {
			return c.Status(fiber.StatusForbidden).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "FORBIDDEN", Message: "Anda tidak memiliki izin untuk mengubah produk ini"},
			})
		}
	}

	var updateData models.Product
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	database.DB.Model(&product).Updates(updateData)

	return c.JSON(APIResponse{
		Success: true,
		Data:    fiber.Map{"product": product},
		Error:   nil,
	})
}

// DeleteProduct
func DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var product models.Product

	if err := database.DB.First(&product, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "PRODUCT_NOT_FOUND", Message: "Produk tidak ditemukan"},
		})
	}

	// Authorization check: owner UMKM atau Admin
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Silakan login terlebih dahulu"},
		})
	}

	claims := userLocal.(*JWTClaims)

	// Admin dapat menghapus produk apapun
	if claims.Role != models.RoleAdmin {
		// Non-admin harus menjadi owner
		var umkmProfile models.UMKMProfile
		if err := database.DB.Where("user_id = ?", claims.UserID).First(&umkmProfile).Error; err != nil {
			return c.Status(fiber.StatusForbidden).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "FORBIDDEN", Message: "Anda tidak memiliki izin untuk menghapus produk ini"},
			})
		}

		if product.UmkmID != umkmProfile.ID {
			return c.Status(fiber.StatusForbidden).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "FORBIDDEN", Message: "Anda tidak memiliki izin untuk menghapus produk ini"},
			})
		}
	}

	database.DB.Delete(&product)

	return c.JSON(APIResponse{
		Success: true,
		Data:    fiber.Map{"message": "Produk berhasil dihapus"},
		Error:   nil,
	})
}
