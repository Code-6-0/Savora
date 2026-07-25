package handlers

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// VerifyUMKMRequest body
type VerifyUMKMRequest struct {
	Status string `json:"status"` // APPROVED or REJECTED
	Note   string `json:"note"`   // Catatan dari admin
}

// ModerateUserRequest body
type ModerateUserRequest struct {
	Action string `json:"action"` // approve, reject, warning, suspend
	Note   string `json:"note"`   // Catatan dari admin
}

// Helper: Create audit log entry (inline to avoid import cycle with middleware)
func createAuditLog(actorID uint, action, targetType string, targetID uint, note string) {
	// Define AuditLog locally to avoid importing middleware (which imports handlers -> cycle)
	type AuditLog struct {
		ID         uint      `gorm:"primaryKey" json:"id"`
		ActorID    uint      `json:"actor_id"`
		Action     string    `json:"action"`
		TargetType string    `json:"target_type"`
		TargetID   uint      `json:"target_id"`
		Note       string    `json:"note"`
		CreatedAt  time.Time `json:"created_at"`
	}

	auditLog := AuditLog{
		ActorID:    actorID,
		Action:     action,
		TargetType: targetType,
		TargetID:   targetID,
		Note:       note,
		CreatedAt:  time.Now(),
	}

	// Async insert to avoid blocking response
	go func() {
		database.DB.Table("audit_logs").Create(&auditLog)
	}()
}

// VerifyUMKMHandler - PATCH /api/admin/umkm/{id}/verification
func VerifyUMKMHandler(c *fiber.Ctx) error {
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
	umkmID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID UMKM tidak valid"},
		})
	}

	// Parse request body
	req := new(VerifyUMKMRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi status
	if req.Status != "APPROVED" && req.Status != "REJECTED" {
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

	// Query UMKM profile
	var umkmProfile models.UMKMProfile
	if err := database.DB.First(&umkmProfile, umkmID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "UMKM_NOT_FOUND", Message: "UMKM tidak ditemukan"},
		})
	}

	// Update verification status
	umkmProfile.VerificationStatus = req.Status
	if err := database.DB.Save(&umkmProfile).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal memperbarui status verifikasi"},
		})
	}

	// Jika APPROVED, update user status menjadi ACTIVE
	if req.Status == "APPROVED" {
		var user models.User
		if err := database.DB.First(&user, umkmProfile.UserID).Error; err == nil {
			user.Status = models.StatusActive
			database.DB.Save(&user)
		}
	}

	// Create audit log
	action := "VERIFY_UMKM_APPROVED"
	if req.Status == "REJECTED" {
		action = "VERIFY_UMKM_REJECTED"
	}
	createAuditLog(claims.UserID, action, "UMKM", uint(umkmID), req.Note)

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message":      "Status verifikasi UMKM berhasil diperbarui",
			"umkm_profile": umkmProfile,
		},
		Error: nil,
	})
}

// GetUsersHandler - GET /api/admin/users
func GetUsersHandler(c *fiber.Ctx) error {
	// Parse query params
	roleFilter := c.Query("role")       // Filter by role (CUSTOMER, UMKM, ADMIN, MITRA_DONASI)
	statusFilter := c.Query("status")   // Filter by status (ACTIVE, SUSPENDED, PENDING)
	searchQuery := c.Query("search")    // Search by name or email

	query := database.DB.Model(&models.User{})

	// Apply filters
	if roleFilter != "" {
		query = query.Where("role = ?", roleFilter)
	}
	if statusFilter != "" {
		query = query.Where("status = ?", statusFilter)
	}
	if searchQuery != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+searchQuery+"%", "%"+searchQuery+"%")
	}

	// Execute query
	var users []models.User
	if err := query.Order("created_at desc").Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data user"},
		})
	}

	// Sanitize users (remove password_hash)
	sanitizedUsers := make([]fiber.Map, len(users))
	for i, user := range users {
		sanitizedUsers[i] = sanitizeUser(user)
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"users": sanitizedUsers,
			"total": len(sanitizedUsers),
		},
		Error: nil,
	})
}

// ModerateUserHandler - PATCH /api/admin/users/{id}/status
func ModerateUserHandler(c *fiber.Ctx) error {
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
	userID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID user tidak valid"},
		})
	}

	// Parse request body
	req := new(ModerateUserRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi action
	validActions := []string{"approve", "reject", "warning", "suspend"}
	isValid := false
	for _, action := range validActions {
		if req.Action == action {
			isValid = true
			break
		}
	}
	if !isValid {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Action harus salah satu dari: approve, reject, warning, suspend"},
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

	// Query user
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "USER_NOT_FOUND", Message: "User tidak ditemukan"},
		})
	}

	// Tidak boleh moderate diri sendiri
	if user.ID == claims.UserID {
		return c.Status(fiber.StatusForbidden).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "FORBIDDEN", Message: "Anda tidak dapat moderasi akun Anda sendiri"},
		})
	}

	// Update user status berdasarkan action
	var auditAction string
	var message string

	switch req.Action {
	case "approve":
		user.Status = models.StatusActive
		auditAction = "APPROVE_USER"
		message = "User berhasil disetujui"
	case "reject":
		user.Status = models.StatusPending
		auditAction = "REJECT_USER"
		message = "User berhasil ditolak"
	case "warning":
		// Warning tidak mengubah status, hanya mencatat di audit log
		auditAction = "WARNING_USER"
		message = "Warning berhasil diberikan kepada user"
	case "suspend":
		user.Status = models.StatusSuspended
		auditAction = "SUSPEND_USER"
		message = "User berhasil disuspend"
	}

	// Save user jika status berubah
	if req.Action != "warning" {
		if err := database.DB.Save(&user).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal memperbarui status user"},
			})
		}
	}

	// Create audit log
	createAuditLog(claims.UserID, auditAction, "USER", uint(userID), req.Note)

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": message,
			"user":    sanitizeUser(user),
		},
		Error: nil,
	})
}

// GetUMKMListHandler - GET /api/admin/umkm
// Return list umkm_profiles dengan data user (join)
func GetUMKMListHandler(c *fiber.Ctx) error {
	// Parse query params
	statusFilter := c.Query("status") // Filter by verification_status (PENDING, APPROVED, REJECTED)

	// Query umkm_profiles dengan join ke users
	query := database.DB.Model(&models.UMKMProfile{}).
		Select("umkm_profiles.*, users.name as user_name, users.email as user_email, users.status as user_status, users.created_at as user_created_at").
		Joins("LEFT JOIN users ON users.id = umkm_profiles.user_id")

	// Apply filter
	if statusFilter != "" {
		query = query.Where("umkm_profiles.verification_status = ?", statusFilter)
	}

	// Execute query
	type UMKMWithUser struct {
		models.UMKMProfile
		UserName      string    `json:"user_name"`
		UserEmail     string    `json:"user_email"`
		UserStatus    string    `json:"user_status"`
		UserCreatedAt string    `json:"user_created_at"`
	}

	var umkmList []UMKMWithUser
	if err := query.Order("umkm_profiles.created_at desc").Scan(&umkmList).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data UMKM"},
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"umkm_list": umkmList,
			"total":     len(umkmList),
		},
		Error: nil,
	})
}

// TopUMKMData represents top performing UMKM data
type TopUMKMData struct {
	UMKMName        string  `json:"umkm_name"`
	Category        string  `json:"category"`
	OrdersCompleted int64   `json:"orders_completed"`
	RevenueKotor    float64 `json:"revenue_kotor"`
	FoodRescuedKg   float64 `json:"food_rescued_kg"`
}

// GetAdminSummaryHandler - GET /api/admin/reports/summary
// Return ringkasan platform: user per role, UMKM verified, listing aktif, order per status, transaksi
// DIPERLUAS untuk Dashboard Admin (spec §2): Platform Overview, Aktivitas Hari Ini, Moderasi Prioritas,
// Platform Health, Top UMKM, Environmental Impact
func GetAdminSummaryHandler(c *fiber.Ctx) error {
	// Summary structure - DIPERLUAS untuk Dashboard Admin (spec §2)
	type Summary struct {
		// User counts per role (existing)
		TotalUsers       int64 `json:"total_users"`
		TotalCustomers   int64 `json:"total_customers"`
		TotalUMKM        int64 `json:"total_umkm"`
		TotalAdmins      int64 `json:"total_admins"`
		TotalMitraDonasi int64 `json:"total_mitra_donasi"`

		// UMKM verification (existing)
		UMKMVerified int64 `json:"umkm_verified"`
		UMKMPending  int64 `json:"umkm_pending"`

		// Products/Listings (existing)
		TotalProducts  int64 `json:"total_products"`
		ActiveProducts int64 `json:"active_products"`

		// Orders per status (existing - gunakan status Bahasa Indonesia)
		TotalOrders       int64 `json:"total_orders"`
		OrdersMenunggu    int64 `json:"orders_menunggu"`
		OrdersDiproses    int64 `json:"orders_diproses"`
		OrdersSiapDiambil int64 `json:"orders_siap_diambil"`
		OrdersSelesai     int64 `json:"orders_selesai"`
		OrdersDibatalkan  int64 `json:"orders_dibatalkan"`

		// Transaction summary (existing)
		TotalTransactionValue float64 `json:"total_transaction_value"`
		CompletedOrders       int64   `json:"completed_orders"`

		// === FIELD BARU UNTUK DASHBOARD (spec §2) ===

		// Platform Overview - delta vs periode sebelumnya (§2.1)
		UMKMAktifDeltaPersen   float64 `json:"umkm_aktif_delta_persen"`   // % perubahan UMKM aktif vs bulan lalu
		CustomerBaruCount      int64   `json:"customer_baru_count"`       // Customer baru bulan ini
		TransaksiHariIniCount  int64   `json:"transaksi_hari_ini_count"`  // Order hari ini
		RevenueBulanIni        float64 `json:"revenue_bulan_ini"`         // Revenue bulan berjalan
		RevenueDeltaPersen     float64 `json:"revenue_delta_persen"`      // % perubahan revenue vs bulan lalu

		// Aktivitas Hari Ini (§2.2)
		OrdersTodayCount           int64            `json:"orders_today_count"`            // Total order hari ini
		OrdersTodayByStatus        map[string]int64 `json:"orders_today_by_status"`        // Breakdown status order hari ini
		RegistrationsTodayUMKM     int64            `json:"registrations_today_umkm"`      // Pendaftaran UMKM hari ini
		RegistrationsTodayCustomer int64            `json:"registrations_today_customer"`  // Pendaftaran customer hari ini

		// Moderasi Prioritas - counts untuk badge sidebar & panel (§2.3)
		// umkm_pending sudah ada di atas
		MitraPendingCount    int64 `json:"mitra_pending_count"`    // Mitra donasi menunggu verifikasi
		IklanPendingCount    int64 `json:"iklan_pending_count"`    // Iklan menunggu tinjauan
		ListingModerasiCount int64 `json:"listing_moderasi_count"` // Listing perlu moderasi
		TiketHelpBaruCount   int64 `json:"tiket_help_baru_count"`  // Tiket help baru (status OPEN)

		// Platform Health (§2.5)
		MakananDiselamatkanKg float64 `json:"makanan_diselamatkan_kg"` // Total kg makanan diselamatkan (completed orders)
		ProdukRescueAktif     int64   `json:"produk_rescue_aktif"`     // Produk rescue aktif & belum expired
		PickupSuksesPersen    float64 `json:"pickup_sukses_persen"`    // % pickup sukses (Selesai / Total)
		ListingKedaluwarsa    int64   `json:"listing_kedaluwarsa"`     // Listing sudah expired
		// waste_log_count - SKIP (tabel belum ada, sesuai PROGRESS.md)

		// Top UMKM Paling Aktif (§2.6) - top 4 berdasarkan orders completed bulan ini
		TopUMKM []TopUMKMData `json:"top_umkm"`

		// Environmental Impact (§2.7) - metrik FR-13
		TotalMakananDiselamatkanKg float64 `json:"total_makanan_diselamatkan_kg"` // Kumulatif kg (all-time)
		PortiDiselamatkan          int64   `json:"porsi_diselamatkan"`            // Total porsi diselamatkan (all-time)
		OrderCompletedCount        int64   `json:"order_completed_count"`         // Total order completed (all-time)
		// waste_log & estimasi_co2 - SKIP (sesuai PROGRESS.md §2)
	}

	summary := Summary{}

	// === TIME HELPERS - untuk filtering periode ===
	now := time.Now()
	startOfToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	endOfToday := startOfToday.Add(24 * time.Hour)

	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	startOfLastMonth := startOfMonth.AddDate(0, -1, 0)
	endOfLastMonth := startOfMonth

	// === QUERY EXISTING (unchanged) ===

	// Count users per role
	database.DB.Model(&models.User{}).Count(&summary.TotalUsers)
	database.DB.Model(&models.User{}).Where("role = ?", models.RoleCustomer).Count(&summary.TotalCustomers)
	database.DB.Model(&models.User{}).Where("role = ?", models.RoleUmkm).Count(&summary.TotalUMKM)
	database.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&summary.TotalAdmins)
	database.DB.Model(&models.User{}).Where("role = ?", models.RoleMitraDonasi).Count(&summary.TotalMitraDonasi)

	// Count UMKM verification status
	database.DB.Model(&models.UMKMProfile{}).Where("verification_status = ?", "APPROVED").Count(&summary.UMKMVerified)
	database.DB.Model(&models.UMKMProfile{}).Where("verification_status = ?", "PENDING").Count(&summary.UMKMPending)

	// Count products
	database.DB.Model(&models.Product{}).Count(&summary.TotalProducts)
	database.DB.Model(&models.Product{}).Where("status = ?", models.ProductStatusAktif).Count(&summary.ActiveProducts)

	// Count orders per status (status existing: Bahasa Indonesia)
	database.DB.Model(&models.Order{}).Count(&summary.TotalOrders)
	database.DB.Model(&models.Order{}).Where("status = ?", "Menunggu").Count(&summary.OrdersMenunggu)
	database.DB.Model(&models.Order{}).Where("status = ?", "Diproses").Count(&summary.OrdersDiproses)
	database.DB.Model(&models.Order{}).Where("status = ?", "Siap Diambil").Count(&summary.OrdersSiapDiambil)
	database.DB.Model(&models.Order{}).Where("status = ?", "Selesai").Count(&summary.OrdersSelesai)
	database.DB.Model(&models.Order{}).Where("status = ?", "Dibatalkan").Count(&summary.OrdersDibatalkan)

	// Sum transaction value dari order selesai
	database.DB.Model(&models.Order{}).Where("status = ?", "Selesai").Count(&summary.CompletedOrders)
	database.DB.Model(&models.Order{}).Where("status = ?", "Selesai").Select("COALESCE(SUM(total_amount), 0)").Scan(&summary.TotalTransactionValue)

	// === QUERY BARU - PLATFORM OVERVIEW DELTA (§2.1) ===

	// Delta UMKM aktif (APPROVED) bulan ini vs bulan lalu
	var umkmThisMonth, umkmLastMonth int64
	database.DB.Model(&models.UMKMProfile{}).
		Where("verification_status = ? AND created_at >= ? AND created_at < ?", "APPROVED", startOfMonth, endOfMonth).
		Count(&umkmThisMonth)
	database.DB.Model(&models.UMKMProfile{}).
		Where("verification_status = ? AND created_at >= ? AND created_at < ?", "APPROVED", startOfLastMonth, endOfLastMonth).
		Count(&umkmLastMonth)
	if umkmLastMonth > 0 {
		summary.UMKMAktifDeltaPersen = float64(umkmThisMonth-umkmLastMonth) / float64(umkmLastMonth) * 100
	}

	// Customer baru bulan ini
	database.DB.Model(&models.User{}).
		Where("role = ? AND created_at >= ? AND created_at < ?", models.RoleCustomer, startOfMonth, endOfMonth).
		Count(&summary.CustomerBaruCount)

	// Transaksi hari ini
	database.DB.Model(&models.Order{}).
		Where("created_at >= ? AND created_at < ?", startOfToday, endOfToday).
		Count(&summary.TransaksiHariIniCount)

	// Revenue bulan ini dari platform_revenue + delta vs bulan lalu
	database.DB.Model(&models.PlatformRevenue{}).
		Where("created_at >= ? AND created_at < ?", startOfMonth, endOfMonth).
		Select("COALESCE(SUM(service_fee_amount), 0)").
		Scan(&summary.RevenueBulanIni)

	var revenueLastMonth float64
	database.DB.Model(&models.PlatformRevenue{}).
		Where("created_at >= ? AND created_at < ?", startOfLastMonth, endOfLastMonth).
		Select("COALESCE(SUM(service_fee_amount), 0)").
		Scan(&revenueLastMonth)
	if revenueLastMonth > 0 {
		summary.RevenueDeltaPersen = (summary.RevenueBulanIni - revenueLastMonth) / revenueLastMonth * 100
	}

	// === AKTIVITAS HARI INI (§2.2) ===

	// Total orders hari ini
	database.DB.Model(&models.Order{}).
		Where("created_at >= ? AND created_at < ?", startOfToday, endOfToday).
		Count(&summary.OrdersTodayCount)

	// Orders hari ini by status - query dengan GROUP BY
	type StatusCount struct {
		Status string
		Count  int64
	}
	var statusCounts []StatusCount
	database.DB.Model(&models.Order{}).
		Select("status, COUNT(*) as count").
		Where("created_at >= ? AND created_at < ?", startOfToday, endOfToday).
		Group("status").
		Scan(&statusCounts)
	summary.OrdersTodayByStatus = make(map[string]int64)
	for _, sc := range statusCounts {
		summary.OrdersTodayByStatus[sc.Status] = sc.Count
	}

	// Registrations hari ini (UMKM & Customer)
	database.DB.Model(&models.User{}).
		Where("role = ? AND created_at >= ? AND created_at < ?", models.RoleUmkm, startOfToday, endOfToday).
		Count(&summary.RegistrationsTodayUMKM)
	database.DB.Model(&models.User{}).
		Where("role = ? AND created_at >= ? AND created_at < ?", models.RoleCustomer, startOfToday, endOfToday).
		Count(&summary.RegistrationsTodayCustomer)

	// === MODERASI PRIORITAS - BADGE COUNTS (§2.3) ===
	// umkm_pending sudah diquery di atas (existing)

	// Mitra donasi pending
	database.DB.Model(&models.MitraDonasiProfile{}).
		Where("verification_status = ?", models.VerificationPending).
		Count(&summary.MitraPendingCount)

	// Iklan pending
	database.DB.Model(&models.Advertisement{}).
		Where("status = ?", models.AdStatusPending).
		Count(&summary.IklanPendingCount)

	// Listing perlu moderasi (expired tapi masih aktif OR food_trust warning)
	database.DB.Model(&models.Product{}).
		Where("status = ? AND (expires_at < ? OR food_trust_status IN (?))",
			models.ProductStatusAktif, now, []string{"Tidak Disarankan Dijual", "Tidak Layak Konsumsi"}).
		Count(&summary.ListingModerasiCount)

	// Tiket help baru (status OPEN)
	database.DB.Model(&models.HelpTicket{}).
		Where("status = ?", models.TicketStatusOpen).
		Count(&summary.TiketHelpBaruCount)

	// === PLATFORM HEALTH (§2.5) ===

	// Makanan diselamatkan (kg) - JOIN order_items & products
	// Query: SUM(order_items.quantity * products.weight_per_portion) WHERE orders.status = 'Selesai'
	type FoodRescued struct {
		TotalKg float64
	}
	var foodRescued FoodRescued
	database.DB.Table("orders").
		Select("COALESCE(SUM(order_items.quantity * products.weight_per_portion), 0) as total_kg").
		Joins("JOIN order_items ON order_items.order_id = orders.id").
		Joins("JOIN products ON products.id = order_items.product_id").
		Where("orders.status = ?", "Selesai").
		Scan(&foodRescued)
	summary.MakananDiselamatkanKg = foodRescued.TotalKg

	// Produk rescue aktif (status Active & belum expired)
	database.DB.Model(&models.Product{}).
		Where("status = ? AND (expires_at IS NULL OR expires_at > ?)", models.ProductStatusAktif, now).
		Count(&summary.ProdukRescueAktif)

	// Pickup sukses % - Selesai / (Selesai + Dibatalkan) * 100
	totalRelevantOrders := summary.OrdersSelesai + summary.OrdersDibatalkan
	if totalRelevantOrders > 0 {
		summary.PickupSuksesPersen = float64(summary.OrdersSelesai) / float64(totalRelevantOrders) * 100
	}

	// Listing kedaluwarsa
	database.DB.Model(&models.Product{}).
		Where("expires_at IS NOT NULL AND expires_at < ?", now).
		Count(&summary.ListingKedaluwarsa)

	// === TOP UMKM PALING AKTIF - BULAN INI (§2.6) ===
	// Agregat: GROUP BY umkm_id, COUNT orders, SUM total_amount, SUM(quantity * weight)
	type TopUMKMRaw struct {
		UMKMID          uint
		OrdersCompleted int64
		RevenueKotor    float64
		FoodRescuedKg   float64
	}
	var topUMKMRaw []TopUMKMRaw
	database.DB.Table("orders").
		Select(`orders.umkm_id,
				COUNT(orders.id) as orders_completed,
				COALESCE(SUM(orders.total_amount), 0) as revenue_kotor,
				COALESCE(SUM(order_items.quantity * products.weight_per_portion), 0) as food_rescued_kg`).
		Joins("JOIN order_items ON order_items.order_id = orders.id").
		Joins("JOIN products ON products.id = order_items.product_id").
		Where("orders.status = ? AND orders.created_at >= ? AND orders.created_at < ?",
			"Selesai", startOfMonth, endOfMonth).
		Group("orders.umkm_id").
		Order("orders_completed DESC").
		Limit(4).
		Scan(&topUMKMRaw)

	// Enrich dengan nama UMKM & category dari umkm_profiles & products
	summary.TopUMKM = make([]TopUMKMData, 0, len(topUMKMRaw))
	for _, raw := range topUMKMRaw {
		var umkmProfile models.UMKMProfile
		var categoryProduct models.Product

		// Get UMKM name
		database.DB.Where("user_id = ?", raw.UMKMID).First(&umkmProfile)

		// Get most common category dari products UMKM ini
		database.DB.Model(&models.Product{}).
			Where("umkm_id = ?", raw.UMKMID).
			Select("category").
			Group("category").
			Order("COUNT(*) DESC").
			Limit(1).
			First(&categoryProduct)

		summary.TopUMKM = append(summary.TopUMKM, TopUMKMData{
			UMKMName:        umkmProfile.BusinessName,
			Category:        categoryProduct.Category,
			OrdersCompleted: raw.OrdersCompleted,
			RevenueKotor:    raw.RevenueKotor,
			FoodRescuedKg:   raw.FoodRescuedKg,
		})
	}

	// === ENVIRONMENTAL IMPACT (§2.7) - FR-13 ===

	// Total makanan diselamatkan (kg) all-time - sama dengan MakananDiselamatkanKg tapi tanpa filter periode
	summary.TotalMakananDiselamatkanKg = foodRescued.TotalKg // Sudah all-time dari query sebelumnya

	// Porsi diselamatkan all-time - SUM(order_items.quantity) WHERE orders.status = 'Selesai'
	database.DB.Table("orders").
		Select("COALESCE(SUM(order_items.quantity), 0)").
		Joins("JOIN order_items ON order_items.order_id = orders.id").
		Where("orders.status = ?", "Selesai").
		Scan(&summary.PortiDiselamatkan)

	// Order completed count all-time
	summary.OrderCompletedCount = summary.CompletedOrders // Sudah diquery di atas (existing)

	// === RECENT DATA (existing, unchanged) ===

	// Get recent orders (5 terbaru)
	var recentOrders []models.Order
	database.DB.Order("created_at desc").Limit(5).Preload("OrderItems.Product").Find(&recentOrders)

	// Get recent products (5 terbaru)
	var recentProducts []models.Product
	database.DB.Order("created_at desc").Limit(5).Find(&recentProducts)

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"summary":         summary,
			"recent_orders":   recentOrders,
			"recent_products": recentProducts,
		},
		Error: nil,
	})
}

// ModerateProductRequest body
type ModerateProductRequest struct {
	Status string `json:"status"` // Active or Suspended
	Note   string `json:"note"`   // Catatan dari admin
}

// GetProductsHandler - GET /api/admin/products
// Return list products dengan filter status & search
func GetProductsHandler(c *fiber.Ctx) error {
	// Parse query params
	statusFilter := c.Query("status")           // Filter by status (Active, Suspended)
	searchQuery := c.Query("search")            // Search by name or UMKM
	categoryFilter := c.Query("category")       // Filter by category
	foodTrustFilter := c.Query("food_trust")    // Filter by food_trust_status
	expiredFilter := c.Query("expired")         // Filter expired products (true/false)

	// Query products dengan join ke umkm_profiles
	query := database.DB.Model(&models.Product{}).
		Select("products.*, umkm_profiles.business_name as umkm_name").
		Joins("LEFT JOIN umkm_profiles ON umkm_profiles.user_id = products.umkm_id")

	// Apply filters
	if statusFilter != "" {
		query = query.Where("products.status = ?", statusFilter)
	}
	if searchQuery != "" {
		query = query.Where("products.name ILIKE ? OR umkm_profiles.business_name ILIKE ?", "%"+searchQuery+"%", "%"+searchQuery+"%")
	}
	if categoryFilter != "" {
		query = query.Where("products.category = ?", categoryFilter)
	}
	if foodTrustFilter != "" {
		query = query.Where("products.food_trust_status = ?", foodTrustFilter)
	}
	if expiredFilter == "true" {
		query = query.Where("products.expires_at < NOW()")
	} else if expiredFilter == "false" {
		query = query.Where("products.expires_at >= NOW() OR products.expires_at IS NULL")
	}

	// Execute query
	type ProductWithUMKM struct {
		models.Product
		UMKMName string `json:"umkm_name"`
	}

	var products []ProductWithUMKM
	if err := query.Order("products.created_at desc").Scan(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data produk"},
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"products": products,
			"total":    len(products),
		},
		Error: nil,
	})
}

// ModerateProductHandler - PATCH /api/admin/products/{id}/status
func ModerateProductHandler(c *fiber.Ctx) error {
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
	productID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID produk tidak valid"},
		})
	}

	// Parse request body
	req := new(ModerateProductRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Normalisasi input dari Bahasa Inggris ke Bahasa Indonesia (backward compatibility)
	statusMap := map[string]string{
		"Active":    models.ProductStatusAktif,
		"Suspended": models.ProductStatusSuspended,
		"Warning":   "Warning", // special action, tidak diset ke product.Status
	}

	normalizedStatus, valid := statusMap[req.Status]
	if !valid {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Status harus Active, Suspended, atau Warning"},
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

	// Query product
	var product models.Product
	if err := database.DB.First(&product, productID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "PRODUCT_NOT_FOUND", Message: "Produk tidak ditemukan"},
		})
	}

	// Update status (only if not Warning action)
	if normalizedStatus != "Warning" {
		product.Status = normalizedStatus
		if err := database.DB.Save(&product).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal memperbarui status produk"},
			})
		}
	}

	// Create audit log (gunakan req.Status asli untuk backward compatibility)
	action := "MODERATE_PRODUCT_WARNING"
	if req.Status == "Active" {
		action = "MODERATE_PRODUCT_ACTIVE"
	} else if req.Status == "Suspended" {
		action = "MODERATE_PRODUCT_SUSPENDED"
	}
	createAuditLog(claims.UserID, action, "PRODUCT", uint(productID), req.Note)

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Status produk berhasil diperbarui",
			"product": product,
		},
		Error: nil,
	})
}
