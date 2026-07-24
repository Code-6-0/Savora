package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
	"github.com/savora/backend/services"
)

// CreateTicketRequest body
type CreateTicketRequest struct {
	OrderID     *uint  `json:"order_id"` // Opsional
	Category    string `json:"category"`
	Description string `json:"description"`
	ProofURL    string `json:"proof_url"` // Opsional
}

// UpdateTicketStatusRequest body
type UpdateTicketStatusRequest struct {
	Status    string `json:"status"`     // OPEN, IN_PROGRESS, RESOLVED, CLOSED
	AdminNote string `json:"admin_note"` // Catatan admin
	Action    string `json:"action"`     // WARN_UMKM, CANCEL_ORDER, CLOSE_INVALID (opsional, PRD 14.8)
}

// CreateTicketHandler - POST /api/help-tickets (authenticated: customer)
func CreateTicketHandler(c *fiber.Ctx) error {
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
	req := new(CreateTicketRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Validasi input wajib
	if req.Category == "" || req.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Kategori dan deskripsi wajib diisi"},
		})
	}

	// Validasi kategori (PRD Section 14.7 - 7 kategori PERSIS wording)
	validCategories := map[string]bool{
		models.CategoryProductNotAvailable:    true,
		models.CategoryNotMatchDescription:    true,
		models.CategoryUMKMNotResponsive:      true,
		models.CategoryPickupIssue:            true,
		models.CategoryOrderCancelled:         true,
		models.CategoryPaymentSuccessNoCode:   true,
		models.CategoryPaymentFailedOrExpired: true,
	}
	if !validCategories[req.Category] {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Kategori tidak valid"},
		})
	}

	// Buat help ticket
	ticket := models.HelpTicket{
		OrderID:     req.OrderID,
		ReporterID:  claims.UserID,
		Category:    req.Category,
		Description: req.Description,
		ProofURL:    req.ProofURL,
		Status:      models.TicketStatusOpen,
	}

	if err := database.DB.Create(&ticket).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat ticket bantuan"},
		})
	}

	// Update order status ke HELP_REQUESTED jika order_id ada (PRD Section 14.7)
	if req.OrderID != nil {
		var order models.Order
		if err := database.DB.First(&order, *req.OrderID).Error; err == nil {
			order.Status = "HELP_REQUESTED"
			database.DB.Save(&order)
		}
	}

	return c.Status(fiber.StatusCreated).JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Ticket bantuan berhasil dibuat. Admin kami akan segera membantu Anda.",
			"ticket":  ticket,
		},
		Error: nil,
	})
}

// GetTicketsHandler - GET /api/help-tickets (admin only)
func GetTicketsHandler(c *fiber.Ctx) error {
	// Query params
	statusFilter := c.Query("status")   // Filter by status
	categoryFilter := c.Query("category") // Filter by category

	// Query tickets dengan join ke users (reporter)
	query := database.DB.Model(&models.HelpTicket{}).
		Select("help_tickets.*, users.name as reporter_name, users.email as reporter_email").
		Joins("LEFT JOIN users ON users.id = help_tickets.reporter_id")

	// Apply filters
	if statusFilter != "" {
		query = query.Where("help_tickets.status = ?", statusFilter)
	}
	if categoryFilter != "" {
		query = query.Where("help_tickets.category = ?", categoryFilter)
	}

	// Execute query
	type TicketWithReporter struct {
		models.HelpTicket
		ReporterName  string `json:"reporter_name"`
		ReporterEmail string `json:"reporter_email"`
	}

	var tickets []TicketWithReporter
	if err := query.Order("help_tickets.created_at desc").Scan(&tickets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data ticket"},
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"tickets": tickets,
			"total":   len(tickets),
		},
		Error: nil,
	})
}

// UpdateTicketStatusHandler - PATCH /api/help-tickets/{id}/status (admin only)
// Mendukung aksi penanganan sesuai PRD Section 14.8
func UpdateTicketStatusHandler(c *fiber.Ctx) error {
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
	ticketID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "ID ticket tidak valid"},
		})
	}

	// Parse request
	req := new(UpdateTicketStatusRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Data tidak valid"},
		})
	}

	// Query ticket
	var ticket models.HelpTicket
	if err := database.DB.First(&ticket, ticketID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "TICKET_NOT_FOUND", Message: "Ticket tidak ditemukan"},
		})
	}

	// Handle aksi penanganan sesuai PRD Section 14.8
	switch req.Action {
	case "WARN_UMKM":
		// Beri warning ke UMKM terkait (PRD 14.8: Produk tidak tersedia, UMKM tidak merespons)
		if req.AdminNote == "" {
			return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Catatan warning wajib diisi"},
			})
		}
		if ticket.OrderID != nil {
			var order models.Order
			if err := database.DB.Preload("Product").First(&order, *ticket.OrderID).Error; err == nil {
				// Catat ke audit_logs dengan target UMKM
				createAuditLog(claims.UserID, "WARN_UMKM", "UMKM", order.Product.UmkmID, req.AdminNote)
			}
		}
		// Update ticket status ke RESOLVED
		ticket.Status = models.TicketStatusResolved
		ticket.AdminNote = req.AdminNote

	case "CANCEL_ORDER":
		// Batalkan order terkait (PRD 14.8: UMKM tidak merespons)
		if req.AdminNote == "" {
			return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Catatan alasan pembatalan wajib diisi"},
			})
		}
		if ticket.OrderID != nil {
			var order models.Order
			if err := database.DB.First(&order, *ticket.OrderID).Error; err == nil {
				// Update order status ke CANCELLED
				order.Status = "CANCELLED"
				database.DB.Save(&order)
				// Catat ke audit_logs
				createAuditLog(claims.UserID, "CANCEL_ORDER", "ORDER", order.ID, req.AdminNote)
			}
		}
		// Update ticket status ke RESOLVED
		ticket.Status = models.TicketStatusResolved
		ticket.AdminNote = req.AdminNote

	case "CLOSE_INVALID":
		// Tutup tiket karena komplain tidak valid (PRD 14.8: Komplain tidak valid)
		if req.AdminNote == "" {
			return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Catatan alasan penolakan wajib diisi"},
			})
		}
		// Update ticket status ke CLOSED
		ticket.Status = models.TicketStatusClosed
		ticket.AdminNote = req.AdminNote
		// Catat ke audit_logs
		createAuditLog(claims.UserID, "CLOSE_INVALID_TICKET", "HELP_TICKET", uint(ticketID), req.AdminNote)

	default:
		// Default: update status biasa (behaviour existing untuk backward compatibility)
		// Validasi status
		validStatuses := map[string]bool{
			models.TicketStatusOpen:       true,
			models.TicketStatusInProgress: true,
			models.TicketStatusResolved:   true,
			models.TicketStatusClosed:     true,
		}
		if !validStatuses[req.Status] {
			return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "VALIDATION_ERROR", Message: "Status tidak valid"},
			})
		}
		ticket.Status = req.Status
		if req.AdminNote != "" {
			ticket.AdminNote = req.AdminNote
		}
		// Catat ke audit_logs
		createAuditLog(claims.UserID, "UPDATE_HELP_TICKET_STATUS", "HELP_TICKET", uint(ticketID), req.AdminNote)
	}

	// Save ticket
	if err := database.DB.Save(&ticket).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal memperbarui ticket"},
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Ticket berhasil ditangani",
			"ticket":  ticket,
		},
		Error: nil,
	})
}

// ═══════════════════════════════════════════════════════════════════════════
// Shim kompatibilitas untuk wiring main.go setupRoutes() — jangan hapus.
// Constructor pattern dari origin/main yang hilang saat rewrite Alia.
// ═══════════════════════════════════════════════════════════════════════════

type HelpTicketHandler struct{}

func NewHelpTicketHandler() *HelpTicketHandler {
	return &HelpTicketHandler{}
}

// CreateHelpTicket - Method wrapper untuk CreateTicketHandler
func (h *HelpTicketHandler) CreateHelpTicket(c *fiber.Ctx) error {
	return CreateTicketHandler(c)
}

// GetHelpTickets - Method wrapper untuk GetTicketsHandler
func (h *HelpTicketHandler) GetHelpTickets(c *fiber.Ctx) error {
	return GetTicketsHandler(c)
}

// UpdateTicketStatus - Method wrapper untuk UpdateTicketStatusHandler
func (h *HelpTicketHandler) UpdateTicketStatus(c *fiber.Ctx) error {
	return UpdateTicketStatusHandler(c)
}

// GetPaymentLogs - GET /payments/:payment_id/logs (Admin, untuk troubleshooting)
// Ported from origin/main - hilang saat rewrite
func (h *HelpTicketHandler) GetPaymentLogs(c *fiber.Ctx) error {
	db := services.GetDB()
	paymentID := c.Params("payment_id")
	
	var logs []models.PaymentLog
	if err := db.Where("payment_id = ?", paymentID).Order("created_at desc").Find(&logs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(logs)
}
