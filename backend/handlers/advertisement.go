package handlers

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// SubmitAdRequest body
type SubmitAdRequest struct {
	Title          string  `json:"title"`
	ImageURL       string  `json:"image_url"`
	TargetURL      string  `json:"target_url"`
	DurationDays   int     `json:"duration_days"`
	Price          float64 `json:"price"`
	AdvertiserType string  `json:"advertiser_type"` // UMKM or EXTERNAL
}

// ApproveRejectAdRequest body
type ApproveRejectAdRequest struct {
	Status string `json:"status"` // APPROVED or REJECTED
	Note   string `json:"note"`   // Catatan admin
}

// SubmitAdHandler - POST /api/advertisements (authenticated: UMKM or anyone with valid token)
func SubmitAdHandler(c *fiber.Ctx) error {
	// Get user from context
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}
	claims := userLocal.(*JWTClaims)

	// Parse request
	req := new(SubmitAdRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi input wajib
	if req.Title == "" || req.ImageURL == "" || req.TargetURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Judul, gambar, dan target URL wajib diisi"},
		})
	}

	if req.DurationDays <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Durasi iklan harus lebih dari 0 hari"},
		})
	}

	if req.Price <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Harga iklan harus lebih dari 0"},
		})
	}

	// Validasi advertiser_type
	if req.AdvertiserType != models.AdvertiserTypeUMKM && req.AdvertiserType != models.AdvertiserTypeExternal {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Tipe advertiser harus UMKM atau EXTERNAL"},
		})
	}

	// Hitung service fee 5%
	serviceFee := req.Price * 0.05

	// Buat advertisement
	ad := models.Advertisement{
		AdvertiserID:   claims.UserID,
		AdvertiserType: req.AdvertiserType,
		Title:          req.Title,
		ImageURL:       req.ImageURL,
		TargetURL:      req.TargetURL,
		DurationDays:   req.DurationDays,
		Price:          req.Price,
		ServiceFee:     serviceFee,
		Status:         models.AdStatusPending,
	}

	if err := database.DB.Create(&ad).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat iklan"},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message":       "Iklan berhasil diajukan. Menunggu persetujuan admin.",
			"advertisement": ad,
		},
		Error: nil,
	})
}

// GetAdsHandler - GET /api/advertisements (authenticated: advertiser or admin)
func GetAdsHandler(c *fiber.Ctx) error {
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}
	claims := userLocal.(*JWTClaims)

	// Query params
	statusFilter := c.Query("status") // Filter by status

	query := database.DB.Model(&models.Advertisement{})

	// Admin bisa lihat semua, user biasa hanya miliknya
	if claims.Role != models.RoleAdmin {
		query = query.Where("advertiser_id = ?", claims.UserID)
	}

	// Apply status filter
	if statusFilter != "" {
		query = query.Where("status = ?", statusFilter)
	}

	var ads []models.Advertisement
	if err := query.Order("created_at desc").Find(&ads).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data iklan"},
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"advertisements": ads,
			"total":          len(ads),
		},
		Error: nil,
	})
}

// ApproveRejectAdHandler - PATCH /api/advertisements/{id}/status (admin only)
func ApproveRejectAdHandler(c *fiber.Ctx) error {
	// Get admin user from context
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}
	claims := userLocal.(*JWTClaims)

	// Parse ID
	adID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID iklan tidak valid"},
		})
	}

	// Parse request
	req := new(ApproveRejectAdRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi status
	if req.Status != models.AdStatusApproved && req.Status != models.AdStatusRejected {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Status harus APPROVED atau REJECTED"},
		})
	}

	// Query iklan
	var ad models.Advertisement
	if err := database.DB.First(&ad, adID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "AD_NOT_FOUND", Message: "Iklan tidak ditemukan"},
		})
	}

	// Cek status saat ini harus PENDING
	if ad.Status != models.AdStatusPending {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INVALID_STATUS", Message: "Hanya iklan berstatus PENDING yang bisa diverifikasi"},
		})
	}

	now := time.Now()
	adminID := claims.UserID

	// Update status
	ad.Status = req.Status
	ad.ApprovedBy = &adminID
	ad.ApprovedAt = &now

	// Jika APPROVED, set starts_at dan expires_at, dan ubah status ke ACTIVE
	if req.Status == models.AdStatusApproved {
		ad.StartsAt = &now
		expiresAt := now.AddDate(0, 0, ad.DurationDays)
		ad.ExpiresAt = &expiresAt
		ad.Status = models.AdStatusActive

		// Catat revenue ke platform_revenue
		revenue := models.PlatformRevenue{
			SourceType:       models.RevenueSourceAdvertisement,
			SourceID:         ad.ID,
			Amount:           ad.Price,
			ServiceFeeAmount: ad.ServiceFee,
			Description:      "Service fee iklan: " + ad.Title,
		}
		database.DB.Create(&revenue)
	}

	if err := database.DB.Save(&ad).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal memperbarui status iklan"},
		})
	}

	// Create audit log
	action := "APPROVE_ADVERTISEMENT"
	if req.Status == models.AdStatusRejected {
		action = "REJECT_ADVERTISEMENT"
	}
	createAuditLog(claims.UserID, action, "ADVERTISEMENT", uint(adID), req.Note)

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message":       "Status iklan berhasil diperbarui",
			"advertisement": ad,
		},
		Error: nil,
	})
}
