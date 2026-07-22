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
}
