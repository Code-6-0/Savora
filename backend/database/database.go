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
		&models.MitraDonasiProfile{},         // Task 4: Mitra Donasi
		&models.MitraPengolahApplication{},   // Mitra Pengolah (ecosystem partner)
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

	DB = db
}
