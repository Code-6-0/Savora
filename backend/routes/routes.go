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
}
