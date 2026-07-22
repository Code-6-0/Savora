package handlers

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// RegisterMitraDonasiRequest body
type RegisterMitraDonasiRequest struct {
	Name        string `json:"name"`         // Nama penanggung jawab
	Email       string `json:"email"`        // Email login
	Password    string `json:"password"`     // Password
	OrgName     string `json:"org_name"`     // Nama organisasi
	Phone       string `json:"phone"`        // Telepon organisasi
	Address     string `json:"address"`      // Alamat organisasi
	Description string `json:"description"`  // Deskripsi singkat
	DocumentURL string `json:"document_url"` // URL dokumen legalitas (upload handled by frontend)
}

// VerifyMitraDonasiRequest body
type VerifyMitraDonasiRequest struct {
	Status string `json:"status"` // APPROVED or REJECTED
	Note   string `json:"note"`   // Catatan dari admin
}

// RegisterMitraDonasiHandler - POST /api/mitra-donasi/register (public)
func RegisterMitraDonasiHandler(c *fiber.Ctx) error {
	req := new(RegisterMitraDonasiRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi input wajib
	if req.Name == "" || req.Email == "" || req.Password == "" || req.OrgName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Nama, email, password, dan nama organisasi wajib diisi"},
		})
	}

	// Validasi phone wajib
	if req.Phone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Nomor telepon organisasi wajib diisi"},
		})
	}

	// Validasi address wajib
	if req.Address == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Alamat organisasi wajib diisi"},
		})
	}

	// Validasi description wajib
	if req.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Deskripsi organisasi wajib diisi"},
		})
	}

	// Cek email sudah terdaftar
	var existingUser models.User
	if err := database.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "EMAIL_EXISTS", Message: "Email sudah terdaftar"},
		})
	}

	// Buat user dengan role MITRA_DONASI
	user := models.User{
		Name:   req.Name,
		Email:  req.Email,
		Role:   models.RoleMitraDonasi,
		Status: models.StatusPending, // Pending sampai diverifikasi admin
	}

	if err := user.SetPassword(req.Password); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengenkripsi password"},
		})
	}

	// Simpan user
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat akun"},
		})
	}

	// Buat profile mitra donasi
	profile := models.MitraDonasiProfile{
		UserID:             user.ID,
		OrgName:            req.OrgName,
		Phone:              req.Phone,
		Address:            req.Address,
		Description:        req.Description,
		DocumentURL:        req.DocumentURL,
		VerificationStatus: models.VerificationPending,
	}

	if err := database.DB.Create(&profile).Error; err != nil {
		// Rollback user jika gagal buat profile
		database.DB.Delete(&user)
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat profil mitra donasi"},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Pendaftaran mitra donasi berhasil. Akun Anda akan diverifikasi oleh admin dalam 1-2 hari kerja.",
			"user":    sanitizeUser(user),
			"profile": profile,
		},
		Error: nil,
	})
}

// GetMitraDonasiListHandler - GET /api/admin/mitra-donasi (admin only)
func GetMitraDonasiListHandler(c *fiber.Ctx) error {
	// Parse query params
	statusFilter := c.Query("status") // Filter by verification_status (PENDING, APPROVED, REJECTED)

	// Query mitra_donasi_profiles dengan join ke users
	query := database.DB.Model(&models.MitraDonasiProfile{}).
		Select("mitra_donasi_profiles.*, users.name as user_name, users.email as user_email, users.status as user_status").
		Joins("LEFT JOIN users ON users.id = mitra_donasi_profiles.user_id")

	// Apply filter
	if statusFilter != "" {
		query = query.Where("mitra_donasi_profiles.verification_status = ?", statusFilter)
	}

	// Execute query
	type MitraDonasiWithUser struct {
		models.MitraDonasiProfile
		UserName   string `json:"user_name"`
		UserEmail  string `json:"user_email"`
		UserStatus string `json:"user_status"`
	}

	var mitraList []MitraDonasiWithUser
	if err := query.Order("mitra_donasi_profiles.created_at desc").Scan(&mitraList).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data mitra donasi"},
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"mitra_list": mitraList,
			"total":      len(mitraList),
		},
		Error: nil,
	})
}

// VerifyMitraDonasiHandler - PATCH /api/admin/mitra-donasi/{id}/verify (admin only)
func VerifyMitraDonasiHandler(c *fiber.Ctx) error {
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

	// Parse ID from params
	mitraID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID mitra donasi tidak valid"},
		})
	}

	// Parse request body
	req := new(VerifyMitraDonasiRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi status
	if req.Status != models.VerificationApproved && req.Status != models.VerificationRejected {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Status harus APPROVED atau REJECTED"},
		})
	}

	// Validasi note wajib
	if req.Note == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Catatan wajib diisi"},
		})
	}

	// Query mitra donasi profile
	var mitraProfile models.MitraDonasiProfile
	if err := database.DB.First(&mitraProfile, mitraID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "MITRA_NOT_FOUND", Message: "Mitra donasi tidak ditemukan"},
		})
	}

	// Update verification status
	now := time.Now()
	mitraProfile.VerificationStatus = req.Status
	mitraProfile.VerifiedAt = &now

	if err := database.DB.Save(&mitraProfile).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal memperbarui status verifikasi"},
		})
	}

	// Jika APPROVED, update user status menjadi ACTIVE
	if req.Status == models.VerificationApproved {
		var user models.User
		if err := database.DB.First(&user, mitraProfile.UserID).Error; err == nil {
			user.Status = models.StatusActive
			database.DB.Save(&user)
		}
	}

	// Create audit log (CLAUDE.md Section 12: semua aksi admin wajib ke audit_logs)
	action := "VERIFY_MITRA_DONASI_APPROVED"
	if req.Status == models.VerificationRejected {
		action = "VERIFY_MITRA_DONASI_REJECTED"
	}
	createAuditLog(claims.UserID, action, "MITRA_DONASI", uint(mitraID), req.Note)

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message":       "Status verifikasi mitra donasi berhasil diperbarui",
			"mitra_profile": mitraProfile,
		},
		Error: nil,
	})
}
