package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/handlers"
	"github.com/savora/backend/middleware"
	"github.com/savora/backend/models"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Auth Routes (public) - Added by Alia (auth module)
	api.Post("/auth/register", handlers.RegisterHandler)
	api.Post("/auth/login", handlers.LoginHandler)

	// Mitra Donasi Register (public)
	api.Post("/mitra-donasi/register", handlers.RegisterMitraDonasiHandler)

	// Profile Routes (protected) - Added by Alia (admin module, BUG 2 fix)
	api.Get("/me", middleware.AuthMiddleware, handlers.GetProfileHandler)
	api.Patch("/me", middleware.AuthMiddleware, handlers.UpdateProfileHandler)

	// Product Routes
	api.Get("/products/umkm/:umkm_id", handlers.GetProductsByUMKM)
	api.Get("/products/marketplace", handlers.GetActiveMarketplaceProducts)
	api.Post("/products", handlers.CreateProduct)
	api.Put("/products/:id", handlers.UpdateProduct)
	api.Delete("/products/:id", handlers.DeleteProduct)

	// Orders
	// TODO(pemilik modul): handler tidak ditemukan — main tidak compile sejak e4cd920, wiring perlu diperbaiki pemilik modul
	// api.Get("/orders/umkm/:umkm_id", handlers.GetOrdersByUMKM)
	// api.Put("/orders/:id/status", handlers.UpdateOrderStatus)

	// Notifications
	api.Get("/notifications/user/:user_id", handlers.GetNotificationsByUser)
	api.Get("/notifications/unread/:user_id", handlers.GetUnreadCount)
	api.Put("/notifications/:id/read", handlers.MarkAsRead)
	api.Put("/notifications/read-all/:user_id", handlers.MarkAllAsRead)

	// Analytics
	// TODO(pemilik modul): handler tidak ditemukan — main tidak compile sejak e4cd920, wiring perlu diperbaiki pemilik modul
	// api.Get("/analytics/dashboard/:umkm_id", handlers.GetAnalyticsDashboard)
	// api.Get("/analytics/sales/:umkm_id", handlers.GetAnalyticsSales)
	// api.Get("/analytics/products/:umkm_id", handlers.GetProductAnalytics)
	api.Get("/analytics/trend/:umkm_id", handlers.GetSalesTrend)
	// TODO(pemilik modul): handler tidak ditemukan — main tidak compile sejak e4cd920, wiring perlu diperbaiki pemilik modul
	// api.Get("/analytics/top-products/:umkm_id", handlers.GetTopProducts)
	// api.Get("/analytics/insight/:umkm_id", handlers.GetUmkmInsight)
	// api.Get("/analytics/listing-metrics/:umkm_id", handlers.GetListingMetrics)

	// Ads (Iklan UMKM) - Replaced with stub by Alia (ads parking task)
	api.Get("/ads/packages", handlers.AdComingSoonStub)
	api.Post("/ads", handlers.AdComingSoonStub)
	api.Get("/ads/umkm/:umkm_id", handlers.AdComingSoonStub)
	api.Put("/ads/:id/status", handlers.AdComingSoonStub)
	api.Get("/ads/active", handlers.AdComingSoonStub)

	// Waste Logs
	api.Get("/waste-logs/umkm/:umkm_id", handlers.GetWasteLogsByUMKM)
	api.Post("/waste-logs", handlers.CreateWasteLog)

	// Reviews & Keywords
	// TODO(pemilik modul): handler tidak ditemukan — main tidak compile sejak e4cd920, wiring perlu diperbaiki pemilik modul
	// api.Post("/reviews", handlers.CreateReview)
	// api.Get("/reviews/umkm/:umkm_id", handlers.GetReviewsByUMKM)
	// api.Get("/keywords/badge/:umkm_id", handlers.GetKeywordSafetyBadge)

	// Dynamic Discount
	api.Post("/discount/calculate", handlers.CalculateDynamicDiscount)

	// Upload Image
	api.Post("/upload/image", handlers.UploadImage)

	// Admin Routes (protected with JWT + RBAC) - Added by Alia (admin module)
	admin := api.Group("/admin", middleware.AuthMiddleware, middleware.RequireRole(models.RoleAdmin))
	admin.Get("/reports/summary", handlers.GetAdminSummaryHandler)
	admin.Get("/umkm", handlers.GetUMKMListHandler)
	admin.Patch("/umkm/:id/verification", handlers.VerifyUMKMHandler)
	admin.Get("/users", handlers.GetUsersHandler)
	admin.Patch("/users/:id/warning", handlers.ModerateUserHandler)
	admin.Patch("/users/:id/suspend", handlers.ModerateUserHandler)
	admin.Get("/revenue", handlers.GetRevenueHandler)
	admin.Get("/revenue/export", handlers.ExportRevenueHandler)
	admin.Get("/advertisements", handlers.GetAdsHandler)
	admin.Patch("/advertisements/:id/status", handlers.ApproveRejectAdHandler)
	admin.Get("/products", handlers.GetProductsHandler)
	admin.Patch("/products/:id/status", handlers.ModerateProductHandler)
	admin.Get("/mitra-donasi", handlers.GetMitraDonasiListHandler)
	admin.Patch("/mitra-donasi/:id/verify", handlers.VerifyMitraDonasiHandler)
	admin.Get("/help-tickets", handlers.GetTicketsHandler)
	admin.Patch("/help-tickets/:id/status", handlers.UpdateTicketStatusHandler)
}
