package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// GetNotificationsByUser - GET /api/notifications/user/:user_id?role=customer
func GetNotificationsByUser(c *fiber.Ctx) error {
	userID, err := strconv.ParseUint(c.Params("user_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user_id"})
	}

	role := c.Query("role", "customer")

	var notifications []models.Notification
	if err := database.DB.Where("user_id = ? AND user_role = ?", userID, role).
		Order("created_at desc").
		Limit(50).
		Find(&notifications).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(notifications)
}

// GetUnreadCount - GET /api/notifications/unread/:user_id?role=customer
func GetUnreadCount(c *fiber.Ctx) error {
	userID, err := strconv.ParseUint(c.Params("user_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user_id"})
	}

	role := c.Query("role", "customer")

	var count int64
	if err := database.DB.Model(&models.Notification{}).
		Where("user_id = ? AND user_role = ? AND is_read = ?", userID, role, false).
		Count(&count).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"count": count})
}

// MarkAsRead - PUT /api/notifications/:id/read
func MarkAsRead(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := database.DB.Model(&models.Notification{}).
		Where("id = ?", id).
		Update("is_read", true).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Notification marked as read"})
}

// MarkAllAsRead - PUT /api/notifications/read-all/:user_id?role=customer
func MarkAllAsRead(c *fiber.Ctx) error {
	userID, err := strconv.ParseUint(c.Params("user_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user_id"})
	}

	role := c.Query("role", "customer")

	if err := database.DB.Model(&models.Notification{}).
		Where("user_id = ? AND user_role = ? AND is_read = ?", userID, role, false).
		Update("is_read", true).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "All notifications marked as read"})
}
