package database

import (
	"fmt"
	"log"
	"os"

	"github.com/savora/backend/models"
	"gorm.io/driver/postgres"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	var db *gorm.DB
	var err error

	host := os.Getenv("DB_HOST")
	if host != "" && host != "localhost" {
		// Use Postgres
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta", host, user, password, dbname, port)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	} else {
		// Fallback to SQLite for local development MVP
		db, err = gorm.Open(sqlite.Open("savora.db"), &gorm.Config{})
	}

	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
	}

	log.Println("Connected to Database")
	db.Logger = db.Logger.LogMode(1)

	log.Println("Running Migrations")
	err = db.AutoMigrate(&models.UMKMProfile{}, &models.Product{}, &models.Order{}, &models.OrderItem{}, &models.Review{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	SeedDatabase(db)

	DB = db
}

func SeedDatabase(db *gorm.DB) {
	// Simple seeder to ensure we have mock data
	var count int64
	db.Model(&models.Order{}).Count(&count)
	if count == 0 {
		orders := []models.Order{
			{UmkmID: 1, CustomerName: "Rina Marlina", TotalAmount: 75000, Status: "Menunggu", PickupTime: "13:45"},
			{UmkmID: 1, CustomerName: "Budi Santoso", TotalAmount: 48000, Status: "Diproses", PickupTime: "13:20"},
			{UmkmID: 1, CustomerName: "Dewi Rahayu", TotalAmount: 96000, Status: "Siap Diambil", PickupTime: "12:55"},
		}
		db.Create(&orders)
		
		reviews := []models.Review{
			{UmkmID: 1, CustomerName: "Rina Marlina", Rating: 5, Comment: "Makanannya masih sangat layak dan enak!", Sentiment: "Positif"},
			{UmkmID: 1, CustomerName: "Budi Santoso", Rating: 4, Comment: "Pelayanan cepat dan makanan masih fresh.", Sentiment: "Positif"},
		}
		db.Create(&reviews)
	}
}
