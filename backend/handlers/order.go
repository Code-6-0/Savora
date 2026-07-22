package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
	"github.com/savora/backend/services"
)

// GetOrdersByUMKM
func GetOrdersByUMKM(c *fiber.Ctx) error {
	umkmID := c.Params("umkm_id")

	var orders []models.Order
	if err := database.DB.Where("umkm_id = ?", umkmID).Order("created_at desc").Find(&orders).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(orders)
}

// UpdateOrderStatus - dengan trigger notifikasi otomatis
func UpdateOrderStatus(c *fiber.Ctx) error {
	id := c.Params("id")

	type Request struct {
		Status string `json:"status"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	var order models.Order
	if err := database.DB.First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Order not found"})
	}

	oldStatus := order.Status
	order.Status = req.Status

	if err := database.DB.Save(&order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	// Trigger notifikasi berdasarkan status transition
	triggerNotificationOnStatusChange(order, oldStatus, req.Status)

	return c.JSON(order)
}

// triggerNotificationOnStatusChange - helper untuk membuat notifikasi saat order status berubah
func triggerNotificationOnStatusChange(order models.Order, oldStatus, newStatus string) {
	hasCustomerID := order.CustomerID > 0

	switch newStatus {
	case "Diproses":
		// Notifikasi ke UMKM saat order diterima
		if oldStatus != "Diproses" {
			err := services.NotifyNewOrder(order, order.CustomerName)
			if err != nil {
				// Log error tapi jangan block order update
				println("Failed to create notification:", err.Error())
			}
		}

	case "Siap Diambil":
		if hasCustomerID {
			services.NotifyOrderReady(order.ID, order.CustomerID)
		}

	case "Selesai":
		if hasCustomerID {
			services.NotifyOrderCompleted(order.ID, order.CustomerID)
		}

	case "Dibatalkan":
		if hasCustomerID {
			services.NotifyOrderCancelled(order.ID, order.CustomerID, "Pesanan dibatalkan oleh sistem.")
		}

	case "Tidak Diambil":
		if hasCustomerID {
			services.NotifyNoShow(order.ID, order.CustomerID)
		}
	}
}