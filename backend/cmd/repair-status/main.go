package main

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

func main() {
	log.Println("🔧 Normalizing product status from English to Indonesian...")

	// Load .env file
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("Warning: .env file not found, relying on environment variables")
	}

	// Connect to database
	database.ConnectDB()

	if database.DB == nil {
		log.Fatal("❌ Failed to connect to database")
	}

	// Normalisasi dari Bahasa Inggris ke Bahasa Indonesia
	repairs := map[string]string{
		"Active":    models.ProductStatusAktif,
		"ACTIVE":    models.ProductStatusAktif,
		"Sold Out":  models.ProductStatusHabis,
		"SOLD OUT":  models.ProductStatusHabis,
		"Expired":   models.ProductStatusKedaluwarsa,
		"EXPIRED":   models.ProductStatusKedaluwarsa,
		// Tambahan case-insensitive variants
		"active":    models.ProductStatusAktif,
		"sold out":  models.ProductStatusHabis,
		"expired":   models.ProductStatusKedaluwarsa,
	}

	totalFixed := 0
	for oldStatus, newStatus := range repairs {
		result := database.DB.Model(&models.Product{}).
			Where("status = ?", oldStatus).
			Update("status", newStatus)

		if result.Error != nil {
			log.Printf("❌ Error normalizing '%s' → '%s': %v", oldStatus, newStatus, result.Error)
		} else if result.RowsAffected > 0 {
			log.Printf("✅ Normalized %d products: '%s' → '%s'", result.RowsAffected, oldStatus, newStatus)
			totalFixed += int(result.RowsAffected)
		}
	}

	if totalFixed == 0 {
		log.Println("✅ No products needed normalization (all already in Indonesian)")
	} else {
		log.Printf("✅ Data normalization complete: %d products updated", totalFixed)
	}

	// Tampilkan ringkasan status produk saat ini
	log.Println("\n📊 Current product status distribution:")
	type StatusCount struct {
		Status string
		Count  int64
	}
	var statusCounts []StatusCount
	database.DB.Model(&models.Product{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Order("count DESC").
		Scan(&statusCounts)

	for _, sc := range statusCounts {
		log.Printf("   - %s: %d products", sc.Status, sc.Count)
	}
}
