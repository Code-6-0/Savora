package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
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

	// Validasi kategori
	validCategories := map[string]bool{
		models.CategoryProductNotAvailable: true,
		models.CategoryNotMatchDescription: true,
		models.CategoryUMKMNotResponsive:   true,
		models.CategoryPickupIssue:         true,
		models.CategoryPaymentIssue:        true,
		models.CategoryOther:               true,
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

	// Query ticket
	var ticket models.HelpTicket
	if err := database.DB.First(&ticket, ticketID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "TICKET_NOT_FOUND", Message: "Ticket tidak ditemukan"},
		})
	}

	// Update status dan admin note
	ticket.Status = req.Status
	if req.AdminNote != "" {
		ticket.AdminNote = req.AdminNote
	}

	if err := database.DB.Save(&ticket).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal memperbarui status ticket"},
		})
	}

	// Create audit log
	action := "UPDATE_HELP_TICKET_STATUS"
	createAuditLog(claims.UserID, action, "HELP_TICKET", uint(ticketID), req.AdminNote)

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"message": "Status ticket berhasil diperbarui",
			"ticket":  ticket,
		},
		Error: nil,
	})
}
