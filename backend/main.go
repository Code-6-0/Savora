package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"github.com/savora/backend/handlers"
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
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE",
	}))

	// Setup routes
	setupRoutes(app, xenditService)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("🚀 Server running on port %s", port)
	log.Fatal(app.Listen(":" + port))
}

func setupRoutes(app *fiber.App, xenditService *services.XenditService) {
	// Order routes
	orderHandler := handlers.NewOrderHandler(xenditService)
	app.Post("/orders", orderHandler.CreateOrder)
	app.Get("/orders", orderHandler.GetOrders)
	app.Get("/orders/:id", orderHandler.GetOrderDetail)
	app.Patch("/orders/:id/status", orderHandler.UpdateOrderStatus)
	app.Post("/orders/:id/validate-pickup", orderHandler.ValidatePickupCode)

	// Payment routes
	paymentHandler := handlers.NewPaymentHandler(xenditService)
	app.Post("/payments/xendit-webhook", paymentHandler.XenditWebhook)

	// Review routes
	reviewHandler := handlers.NewReviewHandler()
	app.Post("/reviews", reviewHandler.CreateReview)
	app.Get("/reviews/keywords/:umkm_id", reviewHandler.GetKeywordSafety)
	app.Get("/reviews/umkm/:umkm_id", reviewHandler.GetReviewsByUmkm)
	app.Get("/reviews/product/:product_id", reviewHandler.GetReviewsByProduct)

	// Help Ticket routes (Should Have - Fase 7)
	helpHandler := handlers.NewHelpTicketHandler()
	app.Post("/help-tickets", helpHandler.CreateHelpTicket)
	app.Get("/help-tickets", helpHandler.GetHelpTickets)
	app.Get("/payments/:payment_id/logs", helpHandler.GetPaymentLogs)
	app.Patch("/help-tickets/:id/status", helpHandler.UpdateTicketStatus)
}
