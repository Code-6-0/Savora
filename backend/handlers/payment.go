package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/services"
)

type PaymentHandler struct {
	xenditService *services.XenditService
}

func NewPaymentHandler(xendit *services.XenditService) *PaymentHandler {
	return &PaymentHandler{
		xenditService: xendit,
	}
}

// XenditWebhook menangani callback dari Xendit
func (h *PaymentHandler) XenditWebhook(c *fiber.Ctx) error {
	db := services.GetDB()

	var payload map[string]interface{}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid JSON payload",
		})
	}

	// Ambil callback token dari header
	callbackToken := c.Get("x-callback-token")
	if callbackToken == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Missing x-callback-token header",
		})
	}

	// Proses webhook
	err := h.xenditService.HandleWebhook(db, payload, callbackToken)
	if err != nil {
		// Internal server error - Xendit akan retry
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to process webhook",
		})
	}

	// Success - response 200 OK (Xendit tidak akan retry)
	return c.SendStatus(200)
}
