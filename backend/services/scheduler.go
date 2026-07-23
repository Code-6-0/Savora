package services

import (
	"log"
	"time"

	"github.com/savora/backend/models"
	"gorm.io/gorm"
)

// SchedulerService menangani cron jobs untuk payment expiry & no-show
type SchedulerService struct {
	db *gorm.DB
}

func NewSchedulerService(db *gorm.DB) *SchedulerService {
	return &SchedulerService{db: db}
}

// ExpireStalePayments menandai payment PENDING yang melewati expired_at
// Fallback bila webhook Xendit tidak sampai
func (s *SchedulerService) ExpireStalePayments() {
	now := time.Now()
	
	var payments []models.Payment
	err := s.db.Where("payment_status = ? AND expired_at < ?", models.PaymentPending, now).
		Find(&payments).Error
	
	if err != nil {
		log.Printf("❌ Scheduler: failed to fetch stale payments: %v", err)
		return
	}

	if len(payments) == 0 {
		return // tidak ada payment expired
	}

	log.Printf("⏰ Scheduler: found %d expired payments, processing...", len(payments))

	for _, payment := range payments {
		err := s.db.Transaction(func(tx *gorm.DB) error {
			// Update payment
			payment.PaymentStatus = models.PaymentExpired
			if err := tx.Save(&payment).Error; err != nil {
				return err
			}

			// Update order
			var order models.Order
			if err := tx.First(&order, payment.OrderID).Error; err != nil {
				return err
			}

			order.Status = models.OrderExpired
			order.PaymentStatus = models.PaymentExpired
			if err := tx.Save(&order).Error; err != nil {
				return err
			}

			// Release stok
			return ReleaseReservedStock(tx, order.ID)
		})

		if err != nil {
			log.Printf("❌ Scheduler: failed to expire payment %d: %v", payment.ID, err)
		} else {
			log.Printf("✅ Scheduler: expired payment %d, order %d", payment.ID, payment.OrderID)
		}
	}
}

// ProcessNoShow menandai order Paid/Ready yang melewati pickup_deadline
func (s *SchedulerService) ProcessNoShow() {
	now := time.Now()
	
	var orders []models.Order
	err := s.db.Where("status IN (?, ?) AND pickup_deadline < ?", 
		models.OrderPaid, models.OrderReadyForPickup, now).
		Find(&orders).Error
	
	if err != nil {
		log.Printf("❌ Scheduler: failed to fetch no-show orders: %v", err)
		return
	}

	if len(orders) == 0 {
		return
	}

	log.Printf("⏰ Scheduler: found %d no-show orders, processing...", len(orders))

	for _, order := range orders {
		order.Status = models.OrderNoShow
		if err := s.db.Save(&order).Error; err != nil {
			log.Printf("❌ Scheduler: failed to mark no-show order %d: %v", order.ID, err)
		} else {
			log.Printf("✅ Scheduler: marked order %d as no-show", order.ID)
		}
	}
}

// RunScheduler menjalankan semua scheduler jobs setiap 1 menit
func (s *SchedulerService) RunScheduler() {
	ticker := time.NewTicker(1 * time.Minute)
	log.Println("🕐 Scheduler started (runs every 1 minute)")

	for range ticker.C {
		s.ExpireStalePayments()
		s.ProcessNoShow()
	}
}
