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

	// Notifications
	api.Get("/notifications/user/:user_id", handlers.GetNotificationsByUser)
	api.Get("/notifications/unread/:user_id", handlers.GetUnreadCount)
	api.Put("/notifications/:id/read", handlers.MarkAsRead)
	api.Put("/notifications/read-all/:user_id", handlers.MarkAllAsRead)

	// Analytics (stub handlers)
	api.Get("/analytics/dashboard/:umkm_id", handlers.GetUmkmAnalytics)
	api.Get("/analytics/sales/:umkm_id", handlers.GetProductSalesAnalytics)
	api.Get("/analytics/trend/:umkm_id", handlers.GetSalesTrend)

	// Ads (Iklan UMKM)
	api.Get("/ads/packages", handlers.GetAdPackages)
	api.Post("/ads", handlers.CreateAd)
	api.Get("/ads/umkm/:umkm_id", handlers.GetAdsByUMKM)
	api.Put("/ads/:id/status", handlers.UpdateAdStatus)
	api.Get("/ads/active", handlers.GetActiveAds)

	// Waste Logs
	api.Get("/waste-logs/umkm/:umkm_id", handlers.GetWasteLogsByUMKM)
	api.Post("/waste-logs", handlers.CreateWasteLog)

	// Dynamic Discount
	api.Post("/discount/calculate", handlers.CalculateDynamicDiscount)

	// Upload Image
	api.Post("/upload/image", handlers.UploadImage)
}
