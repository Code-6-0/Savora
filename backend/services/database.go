package services

import (
	"fmt"
	"log"
	"os"

	"github.com/savora/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() error {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
		return err
	}

	DB = db
	log.Println("✅ Database connection established")

	// Membersihkan data order yatim (orphaned orders) yang menyebabkan error foreign key saat migrasi
	DB.Exec("DELETE FROM payment_logs WHERE payment_id IN (SELECT id FROM payments WHERE order_id IN (SELECT id FROM orders WHERE customer_id NOT IN (SELECT id FROM users) OR product_id NOT IN (SELECT id FROM products)))")
	DB.Exec("DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE customer_id NOT IN (SELECT id FROM users) OR product_id NOT IN (SELECT id FROM products))")
	DB.Exec("DELETE FROM orders WHERE customer_id NOT IN (SELECT id FROM users)")
	DB.Exec("DELETE FROM orders WHERE product_id NOT IN (SELECT id FROM products)")

	// Auto-migrate semua model (Inti MVP + Perluasan)
	err = DB.AutoMigrate(
		// Core auth & profiles
		&models.User{},
		&models.CustomerProfile{},
		&models.UmkmProfile{},
		&models.MitraDonasiProfile{},
		
		// Core products & orders
		&models.Product{},
		&models.Order{},
		&models.Payment{},
		&models.PaymentLog{},
		
		// Reviews & keywords
		&models.Review{},
		&models.ReviewKeyword{},
		&models.KeywordScore{},
		
		// Platform revenue
		&models.PlatformRevenue{},
		
		// Perluasan: ads, help, waste, notifications
		&models.Advertisement{},
		&models.WasteLog{},
		&models.HelpTicket{},
		&models.Notification{},
	)

	if err != nil {
		log.Fatalf("Failed to auto-migrate models: %v", err)
		return err
	}

	log.Println("✅ Database migrations completed")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
