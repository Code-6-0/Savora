package services

import (
	"log"
	"time"

	"github.com/savora/backend/models"
)

// StartCronJobs memulai job background untuk expired products
func StartCronJobs() {
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
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

	if err := db.Where("status = ? AND expires_at < ?", models.ProductStatusAktif, now).Find(&expiredProducts).Error; err != nil {
		log.Println("❌ Error fetching expired products:", err)
		return
	}

	for _, product := range expiredProducts {
		// Create WasteLog and Notification for products with remaining stock
		if product.Stock > 0 {
			// Calculate estimated weight from stock and weight per portion
			estimatedWeight := float64(product.Stock) * product.WeightPerPortion / 1000.0 // Convert grams to kg
			
			// Create WasteLog
			wasteLog := models.WasteLog{
				UmkmID:           product.UmkmID,
				FoodName:         product.Name,
				Category:         product.Category,
				EstimatedWeight:  estimatedWeight,
				Reason:           "Otomatis oleh sistem: Melewati batas waktu konsumsi (Kadaluarsa)",
				PhotoURL:         product.PhotoURL,
			}
			
			if err := db.Create(&wasteLog).Error; err != nil {
				log.Printf("❌ Error creating waste log for product %d: %v", product.ID, err)
			} else {
				log.Printf("✅ Created waste log for product %d (%s): %.2f kg", product.ID, product.Name, estimatedWeight)
			}
			
			// Create Notification for UMKM
			notification := models.Notification{
				UserRole: "umkm",
				UserID:   product.UmkmID,
				Title:    "Produk Menjadi Limbah",
				Message:  "Produk \"" + product.Name + "\" telah melewati batas waktu konsumsi dan tercatat sebagai limbah makanan.",
				IsRead:   false,
			}
			
			if err := db.Create(&notification).Error; err != nil {
				log.Printf("❌ Error creating notification for UMKM %d: %v", product.UmkmID, err)
			} else {
				log.Printf("✅ Created notification for UMKM %d about product %s", product.UmkmID, product.Name)
			}
		}
		
		// Update product status to Kedaluwarsa
		product.Status = models.ProductStatusKedaluwarsa
		if err := db.Save(&product).Error; err != nil {
			log.Println("❌ Error updating product status:", err)
		}
	}

	if len(expiredProducts) > 0 {
		log.Printf("✅ Marked %d products as expired", len(expiredProducts))
	}
}
