package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
	"github.com/savora/backend/services"
)

// loadUmkmOrders mengambil order milik satu UMKM lengkap dengan OrderItems dan
// Product yang ter-preload, agar agregasi analitik punya nama/kategori produk.
func loadUmkmOrders(umkmID string) ([]models.Order, error) {
	var orders []models.Order
	err := database.DB.
		Preload("OrderItems").
		Preload("OrderItems.Product").
		Where("umkm_id = ?", umkmID).
		Find(&orders).Error
	return orders, err
}

// GetAnalyticsDashboard - Data for the main dashboard
func GetAnalyticsDashboard(c *fiber.Ctx) error {
	// umkmID := c.Params("umkm_id")

	// Mock Data for MVP
	data := fiber.Map{
		"total_sales_today":     2450000,
		"sales_trend":           12.4, // percentage
		"active_orders":         12,
		"active_orders_trend":   3,
		"active_products":       34,
		"active_products_trend": -2.1,
		"monthly_revenue":       48750000,
		"monthly_revenue_trend": 18.7,

		"food_rescue": fiber.Map{
			"food_saved_kg":          234,
			"food_saved_trend":       18,
			"waste_prevented_kg":     89,
			"waste_prevented_trend":  7,
			"co2_reduced_kg":         156,
			"customers_served":       412,
			"customers_served_trend": 23,
			"platinum_progress":      234, // out of 300kg
		},

		"reputation": fiber.Map{
			"rescue_score":  94,
			"trust_score":   4.8,
			"rating":        4.9,
			"total_reviews": 127,
		},
	}

	return c.JSON(data)
}

// GetAnalyticsSales - Data for Analitik Penjualan
func GetAnalyticsSales(c *fiber.Ctx) error {
	data := fiber.Map{
		"total_orders":           1284,
		"orders_trend":           12.4,
		"revenue":                48800000,
		"revenue_trend":          8.2,
		"products_rescued":       847,
		"products_rescued_trend": 23.1,
		"avg_order_value":        38000,
		"avg_order_value_trend":  -2.8,

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

// GetProductAnalytics - penjualan per produk (agregasi dari OrderItems).
// GET /api/analytics/products/:umkm_id
func GetProductAnalytics(c *fiber.Ctx) error {
	orders, err := loadUmkmOrders(c.Params("umkm_id"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(services.AggregateProductSales(orders))
}

// GetSalesTrend - tren penjualan per periode.
// GET /api/analytics/trend/:umkm_id?granularity=daily|weekly|monthly
func GetSalesTrend(c *fiber.Ctx) error {
	orders, err := loadUmkmOrders(c.Params("umkm_id"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	granularity := c.Query("granularity", services.TrendDaily)
	return c.JSON(services.SalesTrend(orders, granularity))
}

// GetTopProducts - produk terlaris berdasarkan unit terjual.
// GET /api/analytics/top-products/:umkm_id?limit=5
func GetTopProducts(c *fiber.Ctx) error {
	orders, err := loadUmkmOrders(c.Params("umkm_id"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	limit := c.QueryInt("limit", 5)
	return c.JSON(services.TopSellingProducts(orders, limit))
}

// GetUmkmInsight - insight tingkat UMKM: rating + produk terlaris.
// GET /api/analytics/insight/:umkm_id
func GetUmkmInsight(c *fiber.Ctx) error {
	umkmParam := c.Params("umkm_id")
	orders, err := loadUmkmOrders(umkmParam)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	var reviews []models.Review
	if err := database.DB.Preload("ReviewKeywords").Where("target_id = ?", umkmParam).Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	umkmID, _ := strconv.ParseUint(umkmParam, 10, 64)
	return c.JSON(services.BuildUmkmInsight(uint(umkmID), orders, reviews, 5))
}

// GetListingMetrics - metrik performa listing per produk (dari data pesanan).
// GET /api/analytics/listing-metrics/:umkm_id
func GetListingMetrics(c *fiber.Ctx) error {
	umkmParam := c.Params("umkm_id")
	orders, err := loadUmkmOrders(umkmParam)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	var products []models.Product
	if err := database.DB.Where("umkm_id = ?", umkmParam).Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(services.BuildListingMetrics(orders, products))
}
