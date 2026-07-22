package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/models"
	"github.com/savora/backend/services"
)

type HelpTicketHandler struct{}

func NewHelpTicketHandler() *HelpTicketHandler {
	return &HelpTicketHandler{}
}

// CreateHelpTicket - POST /help-tickets (Customer)
func (h *HelpTicketHandler) CreateHelpTicket(c *fiber.Ctx) error {
	db := services.GetDB()
	
	// TODO: Extract customerID dari JWT
	customerID := uint(1)
	
	type Request struct {
		OrderID     uint   `json:"order_id" binding:"required"`
		Category    string `json:"category" binding:"required"`
		Description string `json:"description" binding:"required"`
		ProofURL    string `json:"proof_url"`
	}
	
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validasi order exists dan milik customer
	var order models.Order
	if err := db.First(&order, req.OrderID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Order tidak ditemukan",
		})
	}

	if order.CustomerID != customerID {
		return c.Status(403).JSON(fiber.Map{
			"error": "Tidak berhak membuat tiket untuk order ini",
		})
	}

	// Buat help ticket
	ticket := models.HelpTicket{
		OrderID:     req.OrderID,
		ReporterID:  customerID,
		Category:    req.Category,
		Description: req.Description,
		ProofURL:    req.ProofURL,
		Status:      "OPEN",
	}

	if err := db.Create(&ticket).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Transisi order ke Help Requested
	order.Status = models.OrderHelpRequested
	if err := db.Save(&order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Help ticket berhasil dibuat",
		"ticket":  ticket,
	})
}

// GetHelpTickets - GET /help-tickets (Admin)
func (h *HelpTicketHandler) GetHelpTickets(c *fiber.Ctx) error {
	db := services.GetDB()
	
	var tickets []models.HelpTicket
	if err := db.Preload("Order").Preload("Reporter").Order("created_at desc").Find(&tickets).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(tickets)
}

// GetPaymentLogs - GET /payments/:payment_id/logs (Admin, untuk troubleshooting)
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

// UpdateTicketStatus - PATCH /help-tickets/:id/status (Admin)
func (h *HelpTicketHandler) UpdateTicketStatus(c *fiber.Ctx) error {
	db := services.GetDB()
	id := c.Params("id")

	type Request struct {
		Status    string `json:"status"`
		AdminNote string `json:"admin_note"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var ticket models.HelpTicket
	if err := db.First(&ticket, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Ticket tidak ditemukan",
		})
	}

	ticket.Status = req.Status
	ticket.AdminNote = req.AdminNote

	if err := db.Save(&ticket).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Ticket status updated",
		"ticket":  ticket,
	})
}
