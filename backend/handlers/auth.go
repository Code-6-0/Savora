package handlers

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// Response format seragam (CLAUDE.md Section 12)
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Error   *ErrorInfo  `json:"error"`
}

type ErrorInfo struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// JWT Claims
type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// RegisterRequest body
type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"` // CUSTOMER, UMKM, MITRA_DONASI (bukan ADMIN)
	Phone    string `json:"phone,omitempty"`
	Address  string `json:"address,omitempty"`
}

// LoginRequest body
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// UpdateProfileRequest body
type UpdateProfileRequest struct {
	Name    string `json:"name,omitempty"`
	Phone   string `json:"phone,omitempty"`
	Address string `json:"address,omitempty"`
	Avatar  string `json:"avatar,omitempty"`
}

// RegisterHandler - POST /api/auth/register
func RegisterHandler(c *fiber.Ctx) error {
	req := new(RegisterRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi input
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Nama, email, dan password wajib diisi"},
		})
	}

	// Hard-code role sebagai CUSTOMER untuk endpoint register publik (REVISI #33 PRD)
	// Field role dari client diabaikan - upgrade ke UMKM dilakukan melalui endpoint terpisah
	req.Role = models.RoleCustomer

	// Cek email sudah terdaftar
	var existingUser models.User
	if err := database.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "EMAIL_EXISTS", Message: "Email sudah terdaftar"},
		})
	}

	// Buat user baru
	user := models.User{
		Name:  req.Name,
		Email: req.Email,
		Role:  req.Role,
	}

	if err := user.SetPassword(req.Password); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengenkripsi password"},
		})
	}

	// Set status ACTIVE untuk semua user baru (register publik = CUSTOMER saja)
	user.Status = models.StatusActive

	// Simpan user
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat akun"},
		})
	}

	// Buat profile untuk CUSTOMER (opsional untuk role lain)
	if req.Role == models.RoleCustomer {
		profile := models.CustomerProfile{
			UserID:  user.ID,
			Phone:   req.Phone,
			Address: req.Address,
		}
		database.DB.Create(&profile)
	}

	// Generate JWT token
	token, err := generateJWT(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat token"},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"user":  sanitizeUser(user),
			"token": token,
		},
		Error: nil,
	})
}

// LoginHandler - POST /api/auth/login
func LoginHandler(c *fiber.Ctx) error {
	req := new(LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Email dan password wajib diisi"},
		})
	}

	// Cari user berdasarkan email
	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Email atau password salah"},
		})
	}

	// Cek password
	if !user.CheckPassword(req.Password) {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Email atau password salah"},
		})
	}

	// Cek status user
	if user.Status == models.StatusSuspended {
		return c.Status(fiber.StatusForbidden).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "ACCOUNT_SUSPENDED", Message: "Akun Anda telah disuspend. Hubungi admin untuk informasi lebih lanjut"},
		})
	}

	// Generate JWT token
	token, err := generateJWT(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat token"},
		})
	}

	// Tambahkan verification_status untuk UMKM (K4: solusi ADITIF untuk redirect logic)
	responseData := fiber.Map{
		"user":  sanitizeUser(user),
		"token": token,
	}

	// Jika role UMKM, sertakan verification_status dari UmkmProfile untuk redirect logic
	if user.Role == models.RoleUmkm {
		var umkmProfile models.UmkmProfile
		if err := database.DB.Where("user_id = ?", user.ID).First(&umkmProfile).Error; err == nil {
			responseData["verification_status"] = umkmProfile.VerificationStatus
		}
	}

	// Jika role MITRA_DONASI, sertakan verification_status dari MitraDonasiProfile
	if user.Role == models.RoleMitraDonasi {
		var mitraProfile models.MitraDonasiProfile
		if err := database.DB.Where("user_id = ?", user.ID).First(&mitraProfile).Error; err == nil {
			responseData["verification_status"] = mitraProfile.VerificationStatus
		}
	}

	return c.JSON(APIResponse{
		Success: true,
		Data:    responseData,
		Error:   nil,
	})
}

// GetProfileHandler - GET /api/me (protected)
func GetProfileHandler(c *fiber.Ctx) error {
	// User didapat dari middleware auth (c.Locals("user"))
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}

	claims := userLocal.(*JWTClaims)

	// Ambil user dari database dengan data terbaru
	var user models.User
	if err := database.DB.First(&user, claims.UserID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "USER_NOT_FOUND", Message: "User tidak ditemukan"},
		})
	}

	// Ambil profile berdasarkan role
	var customerProfile *models.CustomerProfile
	var umkmProfile *models.UmkmProfile
	var mitraProfileResponse interface{}

	if user.Role == models.RoleCustomer {
		var cp models.CustomerProfile
		if err := database.DB.Where("user_id = ?", user.ID).First(&cp).Error; err == nil {
			customerProfile = &cp
		}
	} else if user.Role == models.RoleUmkm {
		var up models.UmkmProfile
		if err := database.DB.Where("user_id = ?", user.ID).First(&up).Error; err == nil {
			umkmProfile = &up
		}
	} else if user.Role == models.RoleMitraDonasi {
		var mp models.MitraDonasiProfile
		if err := database.DB.Where("user_id = ?", user.ID).First(&mp).Error; err == nil {
			// Query audit_logs untuk mendapatkan catatan admin terbaru (dari audit_logs, bukan kolom tabel)
			var auditLog struct {
				Note string
			}
			database.DB.Table("audit_logs").
				Select("note").
				Where("target_type = ? AND target_id = ?", "MITRA_DONASI", mp.ID).
				Order("created_at DESC").
				Limit(1).
				Scan(&auditLog)

			// Buat response map dengan semua field profil + admin_note dari audit_logs
			mitraProfileResponse = fiber.Map{
				"id":                  mp.ID,
				"user_id":             mp.UserID,
				"org_name":            mp.OrgName,
				"phone":               mp.Phone,
				"address":             mp.Address,
				"description":         mp.Description,
				"document_url":        mp.DocumentURL,
				"verification_status": mp.VerificationStatus,
				"verified_at":         mp.VerifiedAt,
				"created_at":          mp.CreatedAt,
				"updated_at":          mp.UpdatedAt,
				"admin_note":          auditLog.Note, // Dari audit_logs, bukan kolom tabel
			}
		}
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"user":             sanitizeUser(user),
			"customer_profile": customerProfile,
			"umkm_profile":     umkmProfile,
			"mitra_profile":    mitraProfileResponse,
		},
		Error: nil,
	})
}

// UpdateProfileHandler - PATCH /api/me (protected)
func UpdateProfileHandler(c *fiber.Ctx) error {
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}

	claims := userLocal.(*JWTClaims)
	req := new(UpdateProfileRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Update user name jika ada
	var user models.User
	if err := database.DB.First(&user, claims.UserID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "USER_NOT_FOUND", Message: "User tidak ditemukan"},
		})
	}

	if req.Name != "" {
		user.Name = req.Name
		database.DB.Save(&user)
	}

	// Update customer profile jika role CUSTOMER
	if user.Role == models.RoleCustomer {
		var profile models.CustomerProfile
		err := database.DB.Where("user_id = ?", user.ID).First(&profile).Error

		if err != nil {
			// Buat profile baru jika belum ada
			profile = models.CustomerProfile{UserID: user.ID}
		}

		if req.Phone != "" {
			profile.Phone = req.Phone
		}
		if req.Address != "" {
			profile.Address = req.Address
		}
		if req.Avatar != "" {
			profile.Avatar = req.Avatar
		}

		database.DB.Save(&profile)
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Profil berhasil diperbarui",
			"user":    sanitizeUser(user),
		},
		Error: nil,
	})
}

// Helper: Generate JWT token
func generateJWT(user models.User) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "savora-secret-key-change-in-production" // Default untuk development
	}

	claims := JWTClaims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour * 7)), // 7 hari
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// Helper: Sanitize user untuk response (hapus password_hash)
func sanitizeUser(user models.User) fiber.Map {
	return fiber.Map{
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"role":       user.Role,
		"status":     user.Status,
		"created_at": user.CreatedAt,
	}
}
