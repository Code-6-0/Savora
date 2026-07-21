package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"github.com/savora/backend/database"
	"github.com/savora/backend/routes"
	"github.com/savora/backend/services"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, relying on environment variables")
	}

	database.ConnectDB()
	
	// Start background jobs (Waste Log Automation)
	services.StartCronJobs()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, PUT, DELETE",
	}))

	routes.SetupRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Server running on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
