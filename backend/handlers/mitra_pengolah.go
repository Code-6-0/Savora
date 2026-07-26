package handlers

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// ApplyMitraPengolahRequest body
type ApplyMitraPengolahRequest struct {
	NamaOrganisasi      string `json:"nama_organisasi"`
	Kategori            string `json:"kategori"` // organisasi_donasi, budidaya_maggot, kompos, pengolahan_organik, pakan_ternak, bank_sampah
	AlamatLokasi        string `json:"alamat_lokasi"`
	KapasitasPengolahan string `json:"kapasitas_pengolahan"` // e.g. "50 kg/hari"
	NamaPenanggungJawab string `json:"nama_penanggung_jawab"`
	KontakTelepon       string `json:"kontak_telepon"`
	KontakEmail         string `json:"kontak_email"`
	JadwalPickup        string `json:"jadwal_pickup"`              // e.g. "Senin-Jumat 08:00-16:00"
	DokumenLegalitasURL string `json:"dokumen_legalitas_url"`     // nullable
	FotoFasilitasURL    string `json:"foto_fasilitas_url"`        // nullable
	DeskripsiSingkat    string `json:"deskripsi_singkat"`
}

// VerifyMitraPengolahRequest body
type VerifyMitraPengolahRequest struct {
	Status          string `json:"status"`           // APPROVED or REJECTED
	Note            string `json:"note"`             // Catatan dari admin
	RejectionReason string `json:"rejection_reason"` // Alasan reject (optional, tapi wajib jika status=REJECTED)
}

// ApplyMitraPengolahHandler - POST /api/mitra-pengolah/apply (protected - wajib login)
func ApplyMitraPengolahHandler(c *fiber.Ctx) error {
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

	req := new(ApplyMitraPengolahRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi input wajib
	if req.NamaOrganisasi == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Nama organisasi wajib diisi"},
		})
	}

	if req.Kategori == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Kategori wajib diisi"},
		})
	}

	// Validasi kategori valid
	if !models.IsValidKategori(req.Kategori) {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Kategori tidak valid. Pilih salah satu: organisasi_donasi, budidaya_maggot, kompos, pengolahan_organik, pakan_ternak, bank_sampah"},
		})
	}

	if req.AlamatLokasi == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Alamat lokasi wajib diisi"},
		})
	}

	if req.KapasitasPengolahan == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Kapasitas pengolahan wajib diisi"},
		})
	}

	if req.NamaPenanggungJawab == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Nama penanggung jawab wajib diisi"},
		})
	}

	if req.KontakTelepon == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Kontak telepon wajib diisi"},
		})
	}

	if req.KontakEmail == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Kontak email wajib diisi"},
		})
	}

	if req.JadwalPickup == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Jadwal pickup wajib diisi"},
		})
	}

	if req.DeskripsiSingkat == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Deskripsi singkat wajib diisi"},
		})
	}

	// Cek apakah user sudah pernah apply (prevent duplicate application)
	var existingApp models.MitraPengolahApplication
	if err := database.DB.Where("user_id = ?", claims.UserID).First(&existingApp).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "ALREADY_APPLIED", Message: "Anda sudah pernah mendaftar sebagai mitra pengolah. Status: " + existingApp.VerificationStatus},
		})
	}

	// Buat application baru
	application := models.MitraPengolahApplication{
		UserID:              claims.UserID,
		NamaOrganisasi:      req.NamaOrganisasi,
		Kategori:            req.Kategori,
		AlamatLokasi:        req.AlamatLokasi,
		KapasitasPengolahan: req.KapasitasPengolahan,
		NamaPenanggungJawab: req.NamaPenanggungJawab,
		KontakTelepon:       req.KontakTelepon,
		KontakEmail:         req.KontakEmail,
		JadwalPickup:        req.JadwalPickup,
		DokumenLegalitasURL: req.DokumenLegalitasURL,
		FotoFasilitasURL:    req.FotoFasilitasURL,
		DeskripsiSingkat:    req.DeskripsiSingkat,
		VerificationStatus:  models.VerificationPending,
	}

	if err := database.DB.Create(&application).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat pendaftaran mitra pengolah"},
		})
	}

	return c.Status(fiber.StatusCreated).JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message":     "Pendaftaran mitra pengolah berhasil. Aplikasi Anda akan diverifikasi oleh admin dalam 3-7 hari kerja.",
			"application": application,
		},
		Error: nil,
	})
}

// GetMitraPengolahListHandler - GET /api/admin/mitra-pengolah (admin only)
func GetMitraPengolahListHandler(c *fiber.Ctx) error {
	// Parse query params
	statusFilter := c.Query("status")   // Filter by verification_status (PENDING, APPROVED, REJECTED)
	kategoriFilter := c.Query("kategori") // Filter by kategori

	// Query mitra_pengolah_applications dengan join ke users
	query := database.DB.Model(&models.MitraPengolahApplication{}).
		Select("mitra_pengolah_applications.*, users.name as user_name, users.email as user_email, users.status as user_status, users.created_at as user_created_at").
		Joins("LEFT JOIN users ON users.id = mitra_pengolah_applications.user_id")

	// Apply filters
	if statusFilter != "" {
		query = query.Where("mitra_pengolah_applications.verification_status = ?", statusFilter)
	}
	if kategoriFilter != "" {
		query = query.Where("mitra_pengolah_applications.kategori = ?", kategoriFilter)
	}

	// Execute query
	type MitraPengolahWithUser struct {
		models.MitraPengolahApplication
		UserName      string `json:"user_name"`
		UserEmail     string `json:"user_email"`
		UserStatus    string `json:"user_status"`
		UserCreatedAt string `json:"user_created_at"`
	}

	var mitraList []MitraPengolahWithUser
	if err := query.Order("mitra_pengolah_applications.created_at desc").Scan(&mitraList).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data mitra pengolah"},
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

// GetMitraPengolahDetailHandler - GET /api/admin/mitra-pengolah/:id (admin only)
func GetMitraPengolahDetailHandler(c *fiber.Ctx) error {
	// Parse ID from params
	mitraID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID mitra pengolah tidak valid"},
		})
	}

	// Query mitra pengolah application dengan join ke users
	var application models.MitraPengolahApplication
	if err := database.DB.Preload("User").First(&application, mitraID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "MITRA_NOT_FOUND", Message: "Mitra pengolah tidak ditemukan"},
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"application": application,
		},
		Error: nil,
	})
}

// VerifyMitraPengolahHandler - PATCH /api/admin/mitra-pengolah/:id/verify (admin only)
func VerifyMitraPengolahHandler(c *fiber.Ctx) error {
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
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID mitra pengolah tidak valid"},
		})
	}

	// Parse request body
	req := new(VerifyMitraPengolahRequest)
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

	// Validasi rejection_reason wajib jika status REJECTED
	if req.Status == models.VerificationRejected && req.RejectionReason == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Alasan penolakan wajib diisi jika status REJECTED"},
		})
	}

	// Query mitra pengolah application
	var application models.MitraPengolahApplication
	if err := database.DB.First(&application, mitraID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "MITRA_NOT_FOUND", Message: "Mitra pengolah tidak ditemukan"},
		})
	}

	// Update verification status
	now := time.Now()
	application.VerificationStatus = req.Status
	application.VerifiedAt = &now
	if req.Status == models.VerificationRejected {
		application.RejectionReason = req.RejectionReason
	}

	if err := database.DB.Save(&application).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal memperbarui status verifikasi"},
		})
	}

	// Jika APPROVED, update user status menjadi ACTIVE (opsional - tergantung business logic)
	// Untuk mitra pengolah, mungkin tidak perlu mengubah user status karena mereka tetap sebagai customer/umkm
	// Tapi kita ikuti pola yang sama dengan mitra donasi untuk konsistensi
	if req.Status == models.VerificationApproved {
		var user models.User
		if err := database.DB.First(&user, application.UserID).Error; err == nil {
			user.Status = models.StatusActive
			database.DB.Save(&user)
		}
	}

	// Create audit log (CLAUDE.md Section 12: semua aksi admin wajib ke audit_logs)
	action := "VERIFY_MITRA_PENGOLAH_APPROVED"
	if req.Status == models.VerificationRejected {
		action = "VERIFY_MITRA_PENGOLAH_REJECTED"
	}
	createAuditLog(claims.UserID, action, "MITRA_PENGOLAH", uint(mitraID), req.Note)

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message":     "Status verifikasi mitra pengolah berhasil diperbarui",
			"application": application,
		},
		Error: nil,
	})
}
