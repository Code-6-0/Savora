package services

import (
	"fmt"
	"log"
	"time"

	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// StartCronJobs memulai job background
func StartCronJobs() {
	go func() {
		// Jalankan setiap 10 detik untuk kemudahan demonstrasi
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()

		for {
			<-ticker.C
			processExpiredProducts()
		}
	}()
}

func processExpiredProducts() {
	var expiredProducts []models.Product
	now := time.Now()

	// Cari produk yang statusnya "Aktif", tetapi sudah melewati batas waktu konsumsi (ExpiresAt)
	if err := database.DB.Where("status = ? AND expires_at < ?", "Aktif", now).Find(&expiredProducts).Error; err != nil {
		log.Println("Error fetching expired products:", err)
		return
	}

	for _, product := range expiredProducts {
		if product.Stock > 0 {
			// Hitung estimasi berat sisa stok (kg)
			estimatedWeight := float64(product.Stock) * product.WeightPerPortion / 1000.0

			// 1. Buat catatan Waste Log otomatis
			wasteLog := models.WasteLog{
				UmkmID:          product.UmkmID,
				FoodName:        product.Name,
				Category:        product.Category,
				EstimatedWeight: estimatedWeight,
				Reason:          "Otomatis oleh sistem: Melewati batas waktu konsumsi (Kadaluarsa)",
				PhotoURL:        product.PhotoURL,
			}
			if err := database.DB.Create(&wasteLog).Error; err != nil {
				log.Println("Failed to create automatic waste log for product ID:", product.ID)
				continue
			}

			// 2. Ubah status produk menjadi "Limbah"
			product.Status = "Limbah"
			if err := database.DB.Save(&product).Error; err != nil {
				log.Println("Failed to update product status for ID:", product.ID)
				continue
			}

			// 3. Buat Notifikasi untuk UMKM
			notification := models.Notification{
				UmkmID:  product.UmkmID,
				Title:   "Produk Menjadi Limbah",
				Message: fmt.Sprintf("%d porsi %s telah melewati batas kelayakan konsumsi dan dialihkan ke Waste Log.", product.Stock, product.Name),
			}
			if err := database.DB.Create(&notification).Error; err != nil {
				log.Println("Failed to create notification for UMKM:", product.UmkmID)
			}
			
			log.Printf("Successfully processed expired product %s (ID: %d) into Waste Log\n", product.Name, product.ID)
		} else {
			// Kalau stok 0, tapi masih Aktif dan expired, mungkin terjual habis tapi status belum Terjual
			product.Status = "Terjual"
			database.DB.Save(&product)
		}
	}
}
