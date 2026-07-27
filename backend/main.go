package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"github.com/savora/backend/database"
	"github.com/savora/backend/handlers"
	"github.com/savora/backend/middleware"
	"github.com/savora/backend/routes"
	"github.com/savora/backend/services"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ .env file not found, using environment variables")
	}

	// Init database
	if err := services.InitDB(); err != nil {
		log.Fatalf("❌ Failed to initialize database: %v", err)
	}

	// Share connection: auth/admin handlers use database.DB, avoid duplicate connection
	database.DB = services.GetDB()

	// Start cron jobs (auto-expire products)
	services.StartCronJobs()
	log.Println("✅ Cron jobs started")

	// Init database.DB (for admin module - uses backend/database package)
	// TEMPORARY FIX: Disabled to prevent duplicate DB connection race condition
	// Using services.InitDB() only - see analisis_masalah_refresh_produk.md
	// database.ConnectDB()

	// Init Xendit service
	xenditService := services.NewXenditService()
	log.Println("✅ Xendit service initialized")

	// Start scheduler (fallback payment expiry + no-show)
	go func() {
		scheduler := services.NewSchedulerService(services.GetDB())
		scheduler.RunScheduler()
	}()
	log.Println("✅ Scheduler started")

	// Setup Fiber app
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE",
	}))

	// Setup routes (inline routes for order/payment/review/help-ticket - milik anggota lain)
	setupRoutes(app, xenditService)

	// Setup centralized routes (auth/admin - dari routes/routes.go)
	routes.SetupRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("🚀 Server running on port %s", port)
	log.Fatal(app.Listen(":" + port))
}

func setupRoutes(app *fiber.App, xenditService *services.XenditService) {
	// Grup /api untuk semua route backend (konvensi final tim)
	api := app.Group("/api")

	// Product routes
	api.Get("/products/umkm/:umkm_id", handlers.GetProductsByUMKM)
	api.Get("/products/marketplace", handlers.GetActiveMarketplaceProducts)
	api.Post("/products", handlers.CreateProduct)
	api.Put("/products/:id", handlers.UpdateProduct)
	api.Delete("/products/:id", handlers.DeleteProduct)

	// Order routes
	orderHandler := handlers.NewOrderHandler(xenditService)
	api.Post("/orders", middleware.AuthMiddleware, orderHandler.CreateOrder)
	api.Get("/orders", middleware.AuthMiddleware, orderHandler.GetOrders)
	api.Get("/orders/:id", orderHandler.GetOrderDetail)
	api.Patch("/orders/:id/status", orderHandler.UpdateOrderStatus)
	api.Post("/orders/:id/validate-pickup", orderHandler.ValidatePickupCode)

	// Payment routes (webhook Xendit sekarang di /api/payments/xendit-webhook)
	paymentHandler := handlers.NewPaymentHandler(xenditService)
	api.Post("/payments/xendit-webhook", paymentHandler.XenditWebhook)

	// Review routes
	reviewHandler := handlers.NewReviewHandler()
	api.Post("/reviews", reviewHandler.CreateReview)
	api.Get("/reviews/keywords/:umkm_id", reviewHandler.GetKeywordSafety)
	api.Get("/reviews/umkm/:umkm_id", reviewHandler.GetReviewsByUmkm)
	api.Get("/reviews/product/:product_id", reviewHandler.GetReviewsByProduct)

	// Help Ticket routes (Should Have - Fase 7)
	helpHandler := handlers.NewHelpTicketHandler()
	api.Post("/help-tickets", helpHandler.CreateHelpTicket)
	api.Get("/help-tickets", helpHandler.GetHelpTickets)
	api.Get("/payments/:payment_id/logs", helpHandler.GetPaymentLogs)
	api.Patch("/help-tickets/:id/status", helpHandler.UpdateTicketStatus)

	// // Ad routes (Tugas 1)
	// TODO(iklan-soon): dinonaktifkan sementara mengikuti build tag di handlers/ads.go
	// api.Get("/ads/packages", handlers.GetAdPackages)
	// api.Post("/ads", handlers.CreateAd)
	// api.Get("/ads/umkm/:umkm_id", handlers.GetAdsByUMKM)
	// api.Put("/ads/:id/status", handlers.UpdateAdStatus)
	// api.Get("/ads/active", handlers.GetActiveAds)

	// Waste Log routes (Tugas 2)
	api.Get("/waste-logs/umkm/:umkm_id", handlers.GetWasteLogsByUMKM)
	api.Post("/waste-logs", handlers.CreateWasteLog)

	// Analytics routes (Tugas 4)
	api.Get("/analytics/insight/:umkm_id", handlers.GetUmkmInsight)
}
