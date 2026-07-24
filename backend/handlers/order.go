package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/models"
	"github.com/savora/backend/services"
)

type OrderHandler struct {
	xenditService *services.XenditService
}

func NewOrderHandler(xendit *services.XenditService) *OrderHandler {
	return &OrderHandler{
		xenditService: xendit,
	}
}

// CreateOrder - POST /orders (Customer checkout)
func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	db := services.GetDB()
	
	// TODO: Extract customerID dari JWT middleware (Wa Ode)
	customerID := uint(1) // mock untuk development
	
	var req services.CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	response, err := services.CreateOrder(db, customerID, req, h.xenditService)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(201).JSON(response)
}

// GetOrders - GET /orders (list order by role)
func (h *OrderHandler) GetOrders(c *fiber.Ctx) error {
	db := services.GetDB()
	
	// TODO: Extract user dari JWT (role-based filtering)
	var orders []models.Order
	if err := db.Preload("Product").Preload("Customer").Order("created_at desc").Find(&orders).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(orders)
}

// GetOrderDetail - GET /orders/:id
func (h *OrderHandler) GetOrderDetail(c *fiber.Ctx) error {
	db := services.GetDB()
	id := c.Params("id")
	
	var order models.Order
	if err := db.Preload("Product").Preload("Customer").First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Order tidak ditemukan",
		})
	}

	return c.JSON(order)
}

// UpdateOrderStatus - PATCH /orders/:id/status (UMKM/Admin)
func (h *OrderHandler) UpdateOrderStatus(c *fiber.Ctx) error {
	db := services.GetDB()
	id := c.Params("id")

	type Request struct {
		Status string `json:"status"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validasi transisi khusus: Paid -> Ready for Pickup (REVISI #8)
	if req.Status == models.OrderReadyForPickup {
		var order models.Order
		if err := db.First(&order, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{
				"error": "Order tidak ditemukan",
			})
		}

		if order.Status != models.OrderPaid {
			return c.Status(400).JSON(fiber.Map{
				"error": "Order harus berstatus Paid untuk diubah menjadi Ready for Pickup",
			})
		}

		order.Status = models.OrderReadyForPickup
		if err := db.Save(&order).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		return c.JSON(fiber.Map{
			"message": "Order siap diambil",
			"order":   order,
		})
	}

	// Transisi lain (mis. No Show)
	var order models.Order
	if err := db.First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Order tidak ditemukan",
		})
	}

	if err := services.TransitionOrderStatus(db, order.ID, req.Status); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Status order berhasil diupdate",
	})
}

// ValidatePickupCode - POST /orders/:id/validate-pickup (UMKM)
func (h *OrderHandler) ValidatePickupCode(c *fiber.Ctx) error {
	db := services.GetDB()
	id := c.Params("id")

	type Request struct {
		PickupCode string `json:"pickup_code"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var order models.Order
	if err := db.First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Order tidak ditemukan",
		})
	}

	// Validasi pickup code
	if order.PickupCode != req.PickupCode {
		return c.Status(400).JSON(fiber.Map{
			"error": "Pickup code tidak valid",
		})
	}

	// Validasi status order
	if order.Status != models.OrderReadyForPickup {
		return c.Status(400).JSON(fiber.Map{
			"error": "Order belum siap diambil",
		})
	}

	// Update ke Completed
	order.Status = models.OrderCompleted
	now := c.Context().Time()
	order.CompletedAt = &now

	if err := db.Save(&order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Pickup berhasil, order selesai",
		"order":   order,
	})
}

// Standalone function stubs for routes.go compatibility
func GetOrdersByUMKM(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{"error": "Not implemented"})
}

func UpdateOrderStatus(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{"error": "Not implemented - use OrderHandler.UpdateOrderStatus"})
}
