package services

import (
	"log"
	"time"

	"github.com/savora/backend/models"
)

// StartCronJobs memulai job background untuk expired products
func StartCronJobs() {
	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			processExpiredProducts()
		}
	}()
}

func processExpiredProducts() {
	db := GetDB()
	var expiredProducts []models.Product
	now := time.Now()

	if err := db.Where("status = ? AND expires_at < ?", "Active", now).Find(&expiredProducts).Error; err != nil {
		log.Println("❌ Error fetching expired products:", err)
		return
	}

	for _, product := range expiredProducts {
		product.Status = "Expired"
		if err := db.Save(&product).Error; err != nil {
			log.Println("❌ Error updating product status:", err)
		}
	}

	if len(expiredProducts) > 0 {
		log.Printf("✅ Marked %d products as expired", len(expiredProducts))
	}
}
