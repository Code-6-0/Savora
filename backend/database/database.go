package database

import (
	"fmt"
	"log"
	"os"

	"github.com/savora/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	var db *gorm.DB
	var err error

	dbUrl := os.Getenv("DATABASE_URL")
	host := os.Getenv("DB_HOST")
	
	if dbUrl != "" {
		db, err = gorm.Open(postgres.Open(dbUrl), &gorm.Config{})
	} else if host != "" && host != "localhost" {
		// Use Postgres with individual variables
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta", host, user, password, dbname, port)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	} else {
		log.Fatal("Database configuration is missing. Please set DATABASE_URL or DB_HOST.")
	}

	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
	}

	log.Println("Connected to Database (Cloud/Postgres)")
	db.Logger = db.Logger.LogMode(1)

	log.Println("Running Migrations")
	err = db.AutoMigrate(
		&models.User{},
		&models.CustomerProfile{},
		&models.UMKMProfile{},
		&models.MitraDonasiProfile{}, // Task 4: Mitra Donasi
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
		&models.Review{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	SeedDatabase(db)

	DB = db
}

func SeedDatabase(db *gorm.DB) {
	// Seed users (1 admin + 1 per role) - Task 1 requirement
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		log.Println("Seeding demo users...")

		// Admin user
		admin := models.User{
			Name:   "Admin Savora",
			Email:  "admin@savora.com",
			Role:   models.RoleAdmin,
			Status: models.StatusActive,
		}
		admin.SetPassword("admin123")
		db.Create(&admin)

		// Customer user
		customer := models.User{
			Name:   "Customer Demo",
			Email:  "customer@savora.com",
			Role:   models.RoleCustomer,
			Status: models.StatusActive,
		}
		customer.SetPassword("customer123")
		db.Create(&customer)

		// Create customer profile
		customerProfile := models.CustomerProfile{
			UserID:  customer.ID,
			Phone:   "081234567890",
			Address: "Jl. Customer No. 1, Jakarta",
		}
		db.Create(&customerProfile)

		// UMKM user (APPROVED for testing)
		umkm := models.User{
			Name:   "UMKM Demo",
			Email:  "umkm@savora.com",
			Role:   models.RoleUMKM,
			Status: models.StatusActive,
		}
		umkm.SetPassword("umkm123")
		db.Create(&umkm)

		// Create UMKM profile (APPROVED)
		umkmProfile := models.UMKMProfile{
			UserID:             umkm.ID,
			BusinessName:       "Warung Demo",
			Address:            "Jl. UMKM No. 1, Jakarta",
			GeoLocation:        "-6.200000,106.816666",
			VerificationStatus: "APPROVED",
			Rating:             4.5,
		}
		db.Create(&umkmProfile)

		// Mitra Donasi user (PENDING for admin testing)
		mitra := models.User{
			Name:   "Mitra Donasi Demo",
			Email:  "mitra@savora.com",
			Role:   models.RoleMitraDonasi,
			Status: models.StatusPending,
		}
		mitra.SetPassword("mitra123")
		db.Create(&mitra)

		log.Println("✓ Seeded 4 demo users: admin@savora.com, customer@savora.com, umkm@savora.com, mitra@savora.com (all password: <role>123)")
	}

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
