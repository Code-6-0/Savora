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

	if os.Getenv("AUTO_MIGRATE") == "true" {
		log.Println("Running Migrations")
		err = db.AutoMigrate(
			&models.User{},
			&models.CustomerProfile{},
			&models.UMKMProfile{},
			&models.MitraDonasiProfile{}, // Task 4: Mitra Donasi
			&models.Product{},
			&models.Order{},
			&models.Payment{},            // P1 MVP - payment transactions
			&models.PaymentLog{},         // P1 MVP - payment audit log
			&models.Review{},
			&models.Advertisement{},      // Task 5: Iklan
			&models.AdMetrics{},          // Task 5: Iklan Metrics
			&models.PlatformRevenue{},    // Task 5 & 6: Revenue Platform
			&models.HelpTicket{},         // Task 7: Help Center
			&models.Notification{},       // P2 Should Have - in-app notifications
			&models.WasteLog{},           // P2 Should Have - waste tracking
		)
		if err != nil {
			log.Fatal("Failed to migrate database:", err)
		}
	} else {
		log.Println("Skipping AutoMigrate (AUTO_MIGRATE != true)")
	}

	// Manual migration: drop old password_hash column (if exists)
	// Background: Old schema had "password_hash", new schema has "password"
	// AutoMigrate adds "password" but doesn't remove "password_hash", causing NOT NULL conflict
	log.Println("Checking schema alignment...")
	db.Exec(`
		DO $$
		BEGIN
			IF EXISTS (
				SELECT 1 FROM information_schema.columns
				WHERE table_name='users' AND column_name='password_hash'
			) THEN
				ALTER TABLE users DROP COLUMN password_hash;
				RAISE NOTICE 'Dropped old users.password_hash column';
			END IF;
		END $$;
	`)

	// Note: Auto-seeding disabled to prevent conflict with dedicated seeder (cmd/seed/main.go)
	// Run seeder explicitly: cd backend && go run cmd/seed/main.go
	// SeedDatabase(db)

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
			Role:   models.RoleUmkm,
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

		// Create Mitra Donasi profile (PENDING for verification testing - Task 4)
		mitraProfile := models.MitraDonasiProfile{
			UserID:             mitra.ID,
			OrgName:            "Yayasan Peduli Sesama",
			Phone:              "082134567890",
			Address:            "Jl. Sosial No. 15, Jakarta Selatan",
			Description:        "Yayasan sosial yang fokus pada penyaluran makanan untuk masyarakat kurang mampu. Telah beroperasi sejak 2020 dengan jangkauan 5 kelurahan di Jakarta Selatan.",
			DocumentURL:        "https://drive.google.com/file/d/example-akta-yayasan",
			VerificationStatus: models.VerificationPending,
		}
		db.Create(&mitraProfile)

		log.Println("✓ Seeded 4 demo users: admin@savora.com, customer@savora.com, umkm@savora.com, mitra@savora.com (all password: <role>123)")
		log.Println("✓ Seeded 1 pending mitra donasi profile for verification testing")
	}

	// Note: Order and Review seed data removed - structure changed to comply with PRD Section 18
	// Orders now require: ProductID, CustomerID, Quantity, Subtotal, ServiceFee, TotalPrice, etc.
	// Reviews now use keyword classification (review_keywords + keyword_scores), not Sentiment
	// Seed data for these will be added by respective module owners when structure is stable
}
