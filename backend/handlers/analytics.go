package handlers

import (
	"github.com/gofiber/fiber/v2"
)

// Analytics handlers - TODO: Update by Rifaidi after order/review model integration
// Stub untuk compatibility dengan existing routes

func GetUmkmAnalytics(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Analytics endpoint - under development"})
}

func GetProductSalesAnalytics(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Product sales analytics - under development"})
}

func GetSalesTrend(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Sales trend - under development"})
}
