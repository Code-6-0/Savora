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

// GetAdminSummaryHandler - GET /api/admin/reports/summary
// Return ringkasan platform: user per role, UMKM verified, listing aktif, order per status, transaksi
func GetAdminSummaryHandler(c *fiber.Ctx) error {
	// Summary structure
	type Summary struct {
		// User counts per role
		TotalUsers       int64 `json:"total_users"`
		TotalCustomers   int64 `json:"total_customers"`
		TotalUMKM        int64 `json:"total_umkm"`
		TotalAdmins      int64 `json:"total_admins"`
		TotalMitraDonasi int64 `json:"total_mitra_donasi"`

		// UMKM verification
		UMKMVerified int64 `json:"umkm_verified"`
		UMKMPending  int64 `json:"umkm_pending"`

		// Products/Listings
		TotalProducts  int64 `json:"total_products"`
		ActiveProducts int64 `json:"active_products"`

		// Orders per status (gunakan status existing: Bahasa Indonesia)
		TotalOrders       int64 `json:"total_orders"`
		OrdersMenunggu    int64 `json:"orders_menunggu"`
		OrdersDiproses    int64 `json:"orders_diproses"`
		OrdersSiapDiambil int64 `json:"orders_siap_diambil"`
		OrdersSelesai     int64 `json:"orders_selesai"`
		OrdersDibatalkan  int64 `json:"orders_dibatalkan"`

		// Transaction summary
		TotalTransactionValue float64 `json:"total_transaction_value"`
		CompletedOrders       int64   `json:"completed_orders"`
	}

	summary := Summary{}

	// Count users per role
	database.DB.Model(&models.User{}).Count(&summary.TotalUsers)
	database.DB.Model(&models.User{}).Where("role = ?", models.RoleCustomer).Count(&summary.TotalCustomers)
	database.DB.Model(&models.User{}).Where("role = ?", models.RoleUMKM).Count(&summary.TotalUMKM)
	database.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&summary.TotalAdmins)
	database.DB.Model(&models.User{}).Where("role = ?", models.RoleMitraDonasi).Count(&summary.TotalMitraDonasi)

	// Count UMKM verification status
	database.DB.Model(&models.UMKMProfile{}).Where("verification_status = ?", "APPROVED").Count(&summary.UMKMVerified)
	database.DB.Model(&models.UMKMProfile{}).Where("verification_status = ?", "PENDING").Count(&summary.UMKMPending)

	// Count products
	database.DB.Model(&models.Product{}).Count(&summary.TotalProducts)
	database.DB.Model(&models.Product{}).Where("status = ?", "Active").Count(&summary.ActiveProducts)

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
	statusFilter := c.Query("status") // Filter by status (Active, Suspended)
	searchQuery := c.Query("search")  // Search by name or UMKM

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

	// Validasi status
	if req.Status != "Active" && req.Status != "Suspended" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Status harus Active atau Suspended"},
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

	// Update status
	product.Status = req.Status
	if err := database.DB.Save(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal memperbarui status produk"},
		})
	}

	// Create audit log
	action := "MODERATE_PRODUCT_ACTIVE"
	if req.Status == "Suspended" {
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
