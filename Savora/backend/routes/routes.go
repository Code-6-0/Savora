package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/handlers"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Product Routes
	api.Get("/products/umkm/:umkm_id", handlers.GetProductsByUMKM)
	api.Get("/products/marketplace", handlers.GetActiveMarketplaceProducts)
	api.Post("/products", handlers.CreateProduct)
	api.Put("/products/:id", handlers.UpdateProduct)
	api.Delete("/products/:id", handlers.DeleteProduct)

	// Orders
	api.Get("/orders/umkm/:umkm_id", handlers.GetOrdersByUMKM)
	api.Put("/orders/:id/status", handlers.UpdateOrderStatus)

	// Analytics
	api.Get("/analytics/dashboard/:umkm_id", handlers.GetAnalyticsDashboard)
	api.Get("/analytics/sales/:umkm_id", handlers.GetAnalyticsSales)
	api.Get("/analytics/products/:umkm_id", handlers.GetProductAnalytics)
	api.Get("/analytics/trend/:umkm_id", handlers.GetSalesTrend)
	api.Get("/analytics/top-products/:umkm_id", handlers.GetTopProducts)
	api.Get("/analytics/insight/:umkm_id", handlers.GetUmkmInsight)
	api.Get("/analytics/listing-metrics/:umkm_id", handlers.GetListingMetrics)

	// Ads (Iklan UMKM)
	api.Get("/ads/packages", handlers.GetAdPackages)
	api.Post("/ads", handlers.CreateAd)
	api.Get("/ads/umkm/:umkm_id", handlers.GetAdsByUMKM)
	api.Put("/ads/:id/status", handlers.UpdateAdStatus)
	api.Get("/ads/active", handlers.GetActiveAds)
}
