package database

import (
	"fmt"
	"log"
	"os"
	"time"

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
	err = db.AutoMigrate(&models.UMKMProfile{}, &models.Product{}, &models.Order{}, &models.OrderItem{}, &models.Review{}, &models.ReviewKeyword{}, &models.Advertisement{}, &models.WasteLog{}, &models.Notification{})
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
		// Produk contoh milik UMKM 1, dipakai untuk agregasi analitik & iklan.
		products := []models.Product{
			{UmkmID: 1, Name: "Nasi Kotak Ayam Bakar", Category: "Makanan Siap Saji", OriginalPrice: 35000, RescuePrice: 20000, Stock: 8, Status: "Aktif", PhotoURL: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=85"},
			{UmkmID: 1, Name: "Roti Gandum Artisan", Category: "Bakeri & Roti", OriginalPrice: 25000, RescuePrice: 12000, Stock: 3, Status: "Aktif", PhotoURL: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85"},
			{UmkmID: 1, Name: "Salad Bowl Superfood", Category: "Makanan Sehat", OriginalPrice: 45000, RescuePrice: 28000, Stock: 12, Status: "Aktif", PhotoURL: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85"},
		}
		db.Create(&products)

		// Order beserta OrderItem agar analitik penjualan per produk terisi.
		orders := []models.Order{
			{UmkmID: 1, CustomerName: "Rina Marlina", TotalAmount: 40000, Status: "Selesai", PickupTime: "13:45", OrderItems: []models.OrderItem{
				{ProductID: products[0].ID, Quantity: 2, Price: 20000},
			}},
			{UmkmID: 1, CustomerName: "Budi Santoso", TotalAmount: 48000, Status: "Selesai", PickupTime: "13:20", OrderItems: []models.OrderItem{
				{ProductID: products[0].ID, Quantity: 1, Price: 20000},
				{ProductID: products[1].ID, Quantity: 1, Price: 12000},
				{ProductID: products[2].ID, Quantity: 1, Price: 16000},
			}},
			{UmkmID: 1, CustomerName: "Dewi Rahayu", TotalAmount: 56000, Status: "Selesai", PickupTime: "12:55", OrderItems: []models.OrderItem{
				{ProductID: products[2].ID, Quantity: 2, Price: 28000},
			}},
		}
		db.Create(&orders)

		reviews := []models.Review{
			{TargetID: 1, CustomerName: "Rina Marlina", Rating: 5, Comment: "Makanannya masih sangat layak dan enak!", Keywords: "enak, segar"},
			{TargetID: 1, CustomerName: "Budi Santoso", Rating: 4, Comment: "Pelayanan cepat dan makanan masih fresh.", Keywords: "fresh"},
			{TargetID: 1, CustomerName: "Andi Saputra", Rating: 1, Comment: "Ayamnya sudah basi dan bau", Keywords: "basi, bau"},
			{TargetID: 1, CustomerName: "Siti Aminah", Rating: 2, Comment: "Sayurnya basi", Keywords: "basi"},
			{TargetID: 1, CustomerName: "Joko", Rating: 1, Comment: "Nasinya berjamur", Keywords: "berjamur"},
		}
		db.Create(&reviews)

		reviewKeywords := []models.ReviewKeyword{
			{ReviewID: reviews[0].ID, Keyword: "enak", Level: "Aman"},
			{ReviewID: reviews[0].ID, Keyword: "segar", Level: "Aman"},
			{ReviewID: reviews[1].ID, Keyword: "fresh", Level: "Aman"},
			{ReviewID: reviews[2].ID, Keyword: "basi", Level: "Gawat"},
			{ReviewID: reviews[2].ID, Keyword: "bau", Level: "Warning"},
			{ReviewID: reviews[3].ID, Keyword: "basi", Level: "Gawat"},
			{ReviewID: reviews[4].ID, Keyword: "berjamur", Level: "Gawat"},
		}
		db.Create(&reviewKeywords)

		// Satu iklan aktif contoh untuk produk terlaris.
		now := time.Now()
		end := now.AddDate(0, 0, 7)
		ads := []models.Advertisement{
			{UmkmID: 1, ProductID: products[0].ID, PackageID: "populer", Headline: "Nasi Kotak Ayam Bakar, fresh & hemat!", CTA: "Selamatkan sekarang", Status: "Aktif", Price: 35000, DurationDays: 7, StartAt: &now, EndAt: &end},
		}
		db.Create(&ads)

		// Seeder untuk Waste Log
		wasteLogs := []models.WasteLog{
			{UmkmID: 1, FoodName: "Kue Basah Campur", Category: "Kue & Jajanan", EstimatedWeight: 1.5, Reason: "Melewati batas kadaluarsa, tidak terjual kemarin", CreatedAt: now.AddDate(0, 0, -1)},
			{UmkmID: 1, FoodName: "Nasi Rames", Category: "Makanan Siap Saji", EstimatedWeight: 2.0, Reason: "Sayur basi", CreatedAt: now.AddDate(0, 0, -2)},
		}
		db.Create(&wasteLogs)
	}
}
