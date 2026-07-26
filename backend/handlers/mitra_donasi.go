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
	DocumentURL string `json:"document_url"` // URL dokumen legalitas (deprecated, backward compat)
	Category    string `json:"category"`     // Kategori: donasi, bank_sampah, daur_ulang, kompos, maggot_bsf, pengangkutan_sampah, waste_management

	// Dokumen Legalitas Yayasan (wajib)
	NomorAktaPendirian    string `json:"nomor_akta_pendirian"`     // Nomor akta pendirian yayasan (wajib)
	AktaPendirianURL      string `json:"akta_pendirian_url"`       // URL dokumen akta pendirian (wajib)
	NomorSKKemenkumham    string `json:"nomor_sk_kemenkumham"`     // Nomor SK pengesahan badan hukum (wajib)
	SKKemenkumhamURL      string `json:"sk_kemenkumham_url"`       // URL dokumen SK Kemenkumham (wajib)
	NPWPYayasan           string `json:"npwp_yayasan"`             // Nomor NPWP atas nama yayasan (wajib)
	NPWPYayasanURL        string `json:"npwp_yayasan_url"`         // URL foto/scan NPWP yayasan (wajib)
	KTPPenanggungJawabURL string `json:"ktp_penanggung_jawab_url"` // URL foto KTP penanggung jawab (wajib)
	SelfieKTPURL          string `json:"selfie_ktp_url"`           // URL foto selfie dengan KTP (wajib)

	// Dokumen Tambahan (opsional)
	FotoFasilitasURL  string `json:"foto_fasilitas_url"`   // URL foto kegiatan/fasilitas yayasan (opsional)
	NIBUrl            string `json:"nib_url"`              // URL NIB (opsional)
	TandaDaftarLKSURL string `json:"tanda_daftar_lks_url"` // URL Tanda Daftar LKS (opsional)
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

	// Validasi category wajib
	if req.Category == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Kategori mitra wajib dipilih"},
		})
	}

	// Validasi category value
	validCategories := []string{"donasi", "bank_sampah", "daur_ulang", "kompos", "maggot_bsf", "pengangkutan_sampah", "waste_management"}
	isValidCategory := false
	for _, valid := range validCategories {
		if req.Category == valid {
			isValidCategory = true
			break
		}
	}
	if !isValidCategory {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Kategori mitra tidak valid"},
		})
	}

	// Validasi dokumen legalitas wajib (8 field)
	if req.NomorAktaPendirian == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Nomor akta pendirian yayasan wajib diisi"},
		})
	}
	if req.AktaPendirianURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Dokumen akta pendirian wajib diupload"},
		})
	}
	if req.NomorSKKemenkumham == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Nomor SK Kemenkumham wajib diisi"},
		})
	}
	if req.SKKemenkumhamURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Dokumen SK Kemenkumham wajib diupload"},
		})
	}
	if req.NPWPYayasan == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Nomor NPWP yayasan wajib diisi"},
		})
	}
	if req.NPWPYayasanURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Foto/scan NPWP yayasan wajib diupload"},
		})
	}
	if req.KTPPenanggungJawabURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Foto KTP penanggung jawab wajib diupload"},
		})
	}
	if req.SelfieKTPURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Foto selfie dengan KTP wajib diupload"},
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
		UserID:                 user.ID,
		OrgName:                req.OrgName,
		Phone:                  req.Phone,
		Address:                req.Address,
		Description:            req.Description,
		DocumentURL:            req.DocumentURL, // Backward compatibility
		Category:               req.Category,
		NomorAktaPendirian:     req.NomorAktaPendirian,
		AktaPendirianURL:       req.AktaPendirianURL,
		NomorSKKemenkumham:     req.NomorSKKemenkumham,
		SKKemenkumhamURL:       req.SKKemenkumhamURL,
		NPWPYayasan:            req.NPWPYayasan,
		NPWPYayasanURL:         req.NPWPYayasanURL,
		KTPPenanggungJawabURL:  req.KTPPenanggungJawabURL,
		SelfieKTPURL:           req.SelfieKTPURL,
		FotoFasilitasURL:       req.FotoFasilitasURL,
		NIBUrl:                 req.NIBUrl,
		TandaDaftarLKSURL:      req.TandaDaftarLKSURL,
		VerificationStatus:     models.VerificationPending,
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
		Select("mitra_donasi_profiles.*, users.name as user_name, users.email as user_email, users.status as user_status, users.created_at as user_created_at").
		Joins("LEFT JOIN users ON users.id = mitra_donasi_profiles.user_id")

	// Apply filter
	if statusFilter != "" {
		query = query.Where("mitra_donasi_profiles.verification_status = ?", statusFilter)
	}

	// Execute query
	type MitraDonasiWithUser struct {
		models.MitraDonasiProfile
		UserName      string `json:"user_name"`
		UserEmail     string `json:"user_email"`
		UserStatus    string `json:"user_status"`
		UserCreatedAt string `json:"user_created_at"`
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
	mitraProfile.AdminNote = req.Note
	mitraProfile.VerifiedAt = &now

	if err := database.DB.Save(&mitraProfile).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal memperbarui status verifikasi"},
		})
	}

	// Jika APPROVED, ubah status user menjadi ACTIVE
	// Jika REJECTED, biarkan status user PENDING (tidak bisa login)
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

// GetMitraDonationOffersHandler - GET /api/mitra-donasi/penawaran (mitra donasi only)
func GetMitraDonationOffersHandler(c *fiber.Ctx) error {
	// Get mitra user from context
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}
	claims := userLocal.(*JWTClaims)

	// Get mitra profile
	var mitraProfile models.MitraDonasiProfile
	if err := database.DB.Where("user_id = ?", claims.UserID).First(&mitraProfile).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "MITRA_NOT_FOUND", Message: "Profil mitra donasi tidak ditemukan"},
		})
	}

	// Parse query params
	statusFilter := c.Query("status") // PENDING, ACCEPTED, REJECTED, COMPLETED, EXPIRED, CANCELLED

	// Query donation offers
	query := database.DB.Model(&models.DonationOffer{}).
		Preload("Donor").
		Where("category = ? OR food_type = ?", mitraProfile.Category, "surplus_event")

	// Filter by status
	if statusFilter != "" {
		query = query.Where("status = ?", statusFilter)
	} else {
		// Default: show PENDING and ACCEPTED offers
		query = query.Where("status IN ?", []string{"PENDING", "ACCEPTED"})
	}

	// If showing accepted offers, filter by mitra_id
	if statusFilter == "ACCEPTED" || statusFilter == "COMPLETED" {
		query = query.Where("mitra_id = ?", mitraProfile.ID)
	}

	var offers []models.DonationOffer
	if err := query.Order("created_at desc").Find(&offers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data penawaran"},
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"offers": offers,
			"total":  len(offers),
		},
		Error: nil,
	})
}

// AcceptDonationOfferRequest body
type AcceptDonationOfferRequest struct {
	Notes string `json:"notes"` // Optional notes from mitra
}

// AcceptDonationOfferHandler - POST /api/mitra-donasi/penawaran/:id/accept (mitra donasi only)
func AcceptDonationOfferHandler(c *fiber.Ctx) error {
	// Get mitra user from context
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}
	claims := userLocal.(*JWTClaims)

	// Get mitra profile
	var mitraProfile models.MitraDonasiProfile
	if err := database.DB.Where("user_id = ?", claims.UserID).First(&mitraProfile).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "MITRA_NOT_FOUND", Message: "Profil mitra donasi tidak ditemukan"},
		})
	}

	// Parse offer ID
	offerID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID penawaran tidak valid"},
		})
	}

	// Parse request body
	req := new(AcceptDonationOfferRequest)
	if err := c.BodyParser(req); err != nil {
		// Optional body, ignore errors
		req.Notes = ""
	}

	// Query offer
	var offer models.DonationOffer
	if err := database.DB.First(&offer, offerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "OFFER_NOT_FOUND", Message: "Penawaran tidak ditemukan"},
		})
	}

	// Validasi status
	if offer.Status != "PENDING" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "OFFER_NOT_PENDING", Message: "Penawaran sudah tidak tersedia"},
		})
	}

	// Check if expired
	if time.Now().After(offer.AvailableUntil) {
		// Auto-expire
		offer.Status = "EXPIRED"
		database.DB.Save(&offer)
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "OFFER_EXPIRED", Message: "Penawaran sudah kadaluarsa"},
		})
	}

	// Update offer status
	now := time.Now()
	offer.Status = "ACCEPTED"
	offer.MitraID = &mitraProfile.ID
	offer.AcceptedAt = &now
	if req.Notes != "" {
		offer.Notes = req.Notes
	}

	if err := database.DB.Save(&offer).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal menerima penawaran"},
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Penawaran berhasil diterima",
			"offer":   offer,
		},
		Error: nil,
	})
}

// RejectDonationOfferRequest body
type RejectDonationOfferRequest struct {
	Reason string `json:"reason"` // Required reason for rejection
}

// RejectDonationOfferHandler - POST /api/mitra-donasi/penawaran/:id/reject (mitra donasi only)
func RejectDonationOfferHandler(c *fiber.Ctx) error {
	// Get mitra user from context
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}
	claims := userLocal.(*JWTClaims)

	// Get mitra profile
	var mitraProfile models.MitraDonasiProfile
	if err := database.DB.Where("user_id = ?", claims.UserID).First(&mitraProfile).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "MITRA_NOT_FOUND", Message: "Profil mitra donasi tidak ditemukan"},
		})
	}

	// Parse offer ID
	offerID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID penawaran tidak valid"},
		})
	}

	// Parse request body
	req := new(RejectDonationOfferRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi reason wajib
	if req.Reason == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Alasan penolakan wajib diisi"},
		})
	}

	// Query offer
	var offer models.DonationOffer
	if err := database.DB.First(&offer, offerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "OFFER_NOT_FOUND", Message: "Penawaran tidak ditemukan"},
		})
	}

	// Validasi status
	if offer.Status != "PENDING" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "OFFER_NOT_PENDING", Message: "Penawaran tidak dapat ditolak"},
		})
	}

	// Update offer status
	offer.Status = "REJECTED"
	offer.RejectionReason = req.Reason

	if err := database.DB.Save(&offer).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal menolak penawaran"},
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Penawaran berhasil ditolak",
			"offer":   offer,
		},
		Error: nil,
	})
}

// GetMitraDonationHistoryHandler - GET /api/mitra-donasi/riwayat (mitra donasi only)
func GetMitraDonationHistoryHandler(c *fiber.Ctx) error {
	// Get mitra user from context
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}
	claims := userLocal.(*JWTClaims)

	// Get mitra profile
	var mitraProfile models.MitraDonasiProfile
	if err := database.DB.Where("user_id = ?", claims.UserID).First(&mitraProfile).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "MITRA_NOT_FOUND", Message: "Profil mitra donasi tidak ditemukan"},
		})
	}

	// Parse query params for filtering
	dateFrom := c.Query("date_from") // Format: YYYY-MM-DD
	dateTo := c.Query("date_to")     // Format: YYYY-MM-DD

	// Query donation history
	query := database.DB.Model(&models.DonationHistory{}).
		Preload("Offer").
		Preload("Donor").
		Where("mitra_id = ?", mitraProfile.ID)

	// Apply date filters
	if dateFrom != "" {
		query = query.Where("pickup_date >= ?", dateFrom)
	}
	if dateTo != "" {
		query = query.Where("pickup_date <= ?", dateTo)
	}

	var history []models.DonationHistory
	if err := query.Order("pickup_date desc").Find(&history).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data riwayat"},
		})
	}

	// Calculate summary stats
	totalPortions := 0
	totalWeight := 0.0
	for _, h := range history {
		totalPortions += h.PortionsSaved
		totalWeight += h.WeightKg
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"history":        history,
			"total":          len(history),
			"total_portions": totalPortions,
			"total_weight":   totalWeight,
		},
		Error: nil,
	})
}

// GetMitraDashboardStatsHandler - GET /api/mitra-donasi/dashboard (mitra donasi only)
func GetMitraDashboardStatsHandler(c *fiber.Ctx) error {
	// Get mitra user from context
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}
	claims := userLocal.(*JWTClaims)

	// Get mitra profile
	var mitraProfile models.MitraDonasiProfile
	if err := database.DB.Where("user_id = ?", claims.UserID).First(&mitraProfile).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "MITRA_NOT_FOUND", Message: "Profil mitra donasi tidak ditemukan"},
		})
	}

	// Count PENDING offers (matching mitra category)
	var pendingCount int64
	database.DB.Model(&models.DonationOffer{}).
		Where("status = ? AND (category = ? OR food_type = ?)", "PENDING", mitraProfile.Category, "surplus_event").
		Count(&pendingCount)

	// Count ACCEPTED offers (scheduled pickups)
	var acceptedCount int64
	database.DB.Model(&models.DonationOffer{}).
		Where("status = ? AND mitra_id = ?", "ACCEPTED", mitraProfile.ID).
		Count(&acceptedCount)

	// Get total portions saved from history
	type PortionSum struct {
		TotalPortions int     `json:"total_portions"`
		TotalWeight   float64 `json:"total_weight"`
	}
	var portionSum PortionSum
	database.DB.Model(&models.DonationHistory{}).
		Select("COALESCE(SUM(portions_saved), 0) as total_portions, COALESCE(SUM(weight_kg), 0) as total_weight").
		Where("mitra_id = ?", mitraProfile.ID).
		Scan(&portionSum)

	// Count unique donors
	var uniqueDonors int64
	database.DB.Model(&models.DonationHistory{}).
		Where("mitra_id = ?", mitraProfile.ID).
		Distinct("donor_id").
		Count(&uniqueDonors)

	// Get latest pending offers (max 5 for dashboard preview)
	var latestOffers []models.DonationOffer
	database.DB.Model(&models.DonationOffer{}).
		Preload("Donor").
		Where("status = ? AND (category = ? OR food_type = ?)", "PENDING", mitraProfile.Category, "surplus_event").
		Order("created_at desc").
		Limit(5).
		Find(&latestOffers)

	// Get upcoming scheduled pickups (ACCEPTED offers)
	var scheduledPickups []models.DonationOffer
	database.DB.Model(&models.DonationOffer{}).
		Preload("Donor").
		Where("status = ? AND mitra_id = ?", "ACCEPTED", mitraProfile.ID).
		Order("available_from asc").
		Limit(5).
		Find(&scheduledPickups)

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"stats": fiber.Map{
				"pending_offers":    pendingCount,
				"scheduled_pickups": acceptedCount,
				"total_portions":    portionSum.TotalPortions,
				"unique_donors":     uniqueDonors,
			},
			"latest_offers":      latestOffers,
			"scheduled_pickups":  scheduledPickups,
		},
		Error: nil,
	})
}
