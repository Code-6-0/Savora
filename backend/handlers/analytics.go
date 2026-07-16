package handlers

import (
	"github.com/gofiber/fiber/v2"
	// "github.com/savora/backend/database"
	// "github.com/savora/backend/models"
)

// GetAnalyticsDashboard - Data for the main dashboard
func GetAnalyticsDashboard(c *fiber.Ctx) error {
	// umkmID := c.Params("umkm_id")
	
	// Mock Data for MVP
	data := fiber.Map{
		"total_sales_today": 2450000,
		"sales_trend": 12.4, // percentage
		"active_orders": 12,
		"active_orders_trend": 3,
		"active_products": 34,
		"active_products_trend": -2.1,
		"monthly_revenue": 48750000,
		"monthly_revenue_trend": 18.7,
		
		"food_rescue": fiber.Map{
			"food_saved_kg": 234,
			"food_saved_trend": 18,
			"waste_prevented_kg": 89,
			"waste_prevented_trend": 7,
			"co2_reduced_kg": 156,
			"customers_served": 412,
			"customers_served_trend": 23,
			"platinum_progress": 234, // out of 300kg
		},

		"reputation": fiber.Map{
			"rescue_score": 94,
			"trust_score": 4.8,
			"rating": 4.9,
			"total_reviews": 127,
		},
	}

	return c.JSON(data)
}

// GetAnalyticsSales - Data for Analitik Penjualan
func GetAnalyticsSales(c *fiber.Ctx) error {
	data := fiber.Map{
		"total_orders": 1284,
		"orders_trend": 12.4,
		"revenue": 48800000,
		"revenue_trend": 8.2,
		"products_rescued": 847,
		"products_rescued_trend": 23.1,
		"avg_order_value": 38000,
		"avg_order_value_trend": -2.8,

		// Mock Chart Data
		"sales_chart": []fiber.Map{
			{"date": "01/06", "value": 1500000},
			{"date": "05/06", "value": 2100000},
			{"date": "09/06", "value": 1200000},
			{"date": "13/06", "value": 2800000},
			{"date": "17/06", "value": 2400000},
			{"date": "21/06", "value": 3100000},
			{"date": "25/06", "value": 2600000},
			{"date": "30/06", "value": 3400000},
		},
		"orders_chart": []fiber.Map{
			{"date": "01/06", "value": 45},
			{"date": "05/06", "value": 65},
			{"date": "09/06", "value": 75},
			{"date": "13/06", "value": 85},
			{"date": "17/06", "value": 60},
			{"date": "21/06", "value": 90},
			{"date": "25/06", "value": 105},
			{"date": "30/06", "value": 110},
		},
	}
	return c.JSON(data)
}
