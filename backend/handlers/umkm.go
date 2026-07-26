package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// ApplyUMKMRequest body
type ApplyUMKMRequest struct {
	NamaBisnis           string `json:"nama_bisnis"`
	JenisBisnis          string `json:"jenis_bisnis"` // restoran, cafe, bakery, hotel, katering, lainnya
	AlamatOperasional    string `json:"alamat_operasional"`
	KontakTelepon        string `json:"kontak_telepon"`
	EstimasiVolumeSampah string `json:"estimasi_volume_sampah"` // e.g. "50 kg/hari"
	JamOperasional       string `json:"jam_operasional"`        // e.g. "08:00-22:00"
	DokumenURL           string `json:"dokumen_url"`            // nullable
}

// ApplyUMKMHandler - POST /api/umkm/register (protected - wajib login)
func ApplyUMKMHandler(c *fiber.Ctx) error {
	// Get user from context (wajib login)
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Anda harus login terlebih dahulu"},
		})
	}
	claims := userLocal.(*JWTClaims)

	req := new(ApplyUMKMRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi input wajib
	if req.NamaBisnis == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Nama bisnis wajib diisi"},
		})
	}

	if req.JenisBisnis == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Jenis bisnis wajib diisi"},
		})
	}

	// Validasi jenis bisnis valid
	if !models.IsValidJenisBisnis(req.JenisBisnis) {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Jenis bisnis tidak valid. Pilih salah satu: restoran, cafe, bakery, hotel, katering, lainnya"},
		})
	}

	if req.AlamatOperasional == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Alamat operasional wajib diisi"},
		})
	}

	if req.KontakTelepon == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Kontak telepon wajib diisi"},
		})
	}

	if req.EstimasiVolumeSampah == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Estimasi volume sampah wajib diisi"},
		})
	}

	if req.JamOperasional == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Jam operasional wajib diisi"},
		})
	}

	// Cek apakah user sudah pernah apply (prevent duplicate application)
	var existingProfile models.UMKMProfile
	if err := database.DB.Where("user_id = ?", claims.UserID).First(&existingProfile).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "ALREADY_APPLIED", Message: "Anda sudah pernah mendaftar sebagai UMKM. Status: " + existingProfile.VerificationStatus},
		})
	}

	// Buat profile UMKM baru
	profile := models.UMKMProfile{
		UserID:               claims.UserID,
		NamaBisnis:           req.NamaBisnis,
		JenisBisnis:          req.JenisBisnis,
		AlamatOperasional:    req.AlamatOperasional,
		KontakTelepon:        req.KontakTelepon,
		EstimasiVolumeSampah: req.EstimasiVolumeSampah,
		JamOperasional:       req.JamOperasional,
		DokumenURL:           req.DokumenURL,
		VerificationStatus:   models.VerificationPending,
	}

	if err := database.DB.Create(&profile).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat pendaftaran UMKM"},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Pendaftaran UMKM berhasil. Aplikasi Anda akan diverifikasi oleh admin dalam 3-7 hari kerja.",
			"profile": profile,
		},
		Error: nil,
	})
}
