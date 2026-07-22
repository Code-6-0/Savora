package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/handlers"
	"github.com/savora/backend/middleware"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Auth Routes (Public)
	auth := api.Group("/auth")
	auth.Post("/register", handlers.RegisterHandler)
	auth.Post("/login", handlers.LoginHandler)

	// Profile Routes (Protected)
	api.Get("/me", middleware.AuthMiddleware, handlers.GetProfileHandler)
	api.Patch("/me", middleware.AuthMiddleware, handlers.UpdateProfileHandler)

	// Product Routes (existing - gating di handler, bukan middleware)
	api.Get("/products/umkm/:umkm_id", handlers.GetProductsByUMKM)
	api.Get("/products/marketplace", handlers.GetActiveMarketplaceProducts)
	api.Post("/products", handlers.CreateProduct)
	api.Put("/products/:id", handlers.UpdateProduct)
	api.Delete("/products/:id", handlers.DeleteProduct)

	// Orders (existing - belum diproteksi)
	api.Get("/orders/umkm/:umkm_id", handlers.GetOrdersByUMKM)
	api.Put("/orders/:id/status", handlers.UpdateOrderStatus)

	// Analytics (existing - belum diproteksi)
	api.Get("/analytics/dashboard/:umkm_id", handlers.GetAnalyticsDashboard)
	api.Get("/analytics/sales/:umkm_id", handlers.GetAnalyticsSales)

	// Mitra Donasi Routes (Task 4)
	mitraDonasi := api.Group("/mitra-donasi")
	mitraDonasi.Post("/register", handlers.RegisterMitraDonasiHandler) // Public

	// Advertisement Routes (Task 5)
	// Public - iklan aktif dan tracking
	api.Get("/advertisements/active", handlers.GetActiveAdsHandler)
	api.Post("/advertisements/:id/impression", handlers.RecordImpressionHandler)
	api.Post("/advertisements/:id/click", handlers.RecordClickHandler)

	// Protected - submit dan list iklan
	api.Post("/advertisements", middleware.AuthMiddleware, handlers.SubmitAdHandler)
	api.Get("/advertisements", middleware.AuthMiddleware, handlers.GetAdsHandler)

	// Admin Routes (Protected - Task 2 & Task 3)
	admin := api.Group("/admin", middleware.AuthMiddleware, middleware.RequireAdmin())
	admin.Get("/umkm", handlers.GetUMKMListHandler)
	admin.Patch("/umkm/:id/verification", handlers.VerifyUMKMHandler)
	admin.Get("/users", handlers.GetUsersHandler)
	admin.Patch("/users/:id/status", handlers.ModerateUserHandler)
	admin.Get("/reports/summary", handlers.GetAdminSummaryHandler) // Task 3: Dashboard Admin
	admin.Get("/products", handlers.GetProductsHandler)             // Task 2: Moderasi Listing
	admin.Patch("/products/:id/status", handlers.ModerateProductHandler) // Task 2: Moderasi Listing

	// Mitra Donasi Admin Routes (Task 4)
	admin.Get("/mitra-donasi", handlers.GetMitraDonasiListHandler)
	admin.Patch("/mitra-donasi/:id/verify", handlers.VerifyMitraDonasiHandler)

	// Advertisement Admin Routes (Task 5)
	admin.Patch("/advertisements/:id/status", handlers.ApproveRejectAdHandler)

	// Revenue Admin Routes (Task 6)
	admin.Get("/revenue", handlers.GetRevenueHandler)
	admin.Get("/revenue/export", handlers.ExportRevenueHandler)

	// Help Center Admin Routes (Task 7)
	admin.Get("/help-tickets", handlers.GetTicketsHandler)
	admin.Patch("/help-tickets/:id/status", handlers.UpdateTicketStatusHandler)

	// Help Center Customer Routes (Task 7)
	api.Post("/help-tickets", middleware.AuthMiddleware, handlers.CreateTicketHandler)
}
