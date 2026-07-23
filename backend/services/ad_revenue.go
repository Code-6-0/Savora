package services

import (
	"fmt"
	"time"

	"github.com/savora/backend/models"
	"gorm.io/gorm"
)

// RecordAdRevenue mencatat pendapatan iklan ke platform_revenue saat iklan di-approve
func RecordAdRevenue(db *gorm.DB, adID uint, price float64) error {
	serviceFee := CalculateServiceFee(price)
	revenue := models.PlatformRevenue{
		SourceType:       "ad",
		SourceID:         adID,
		Amount:           price,
		ServiceFeeAmount: serviceFee,
		Description:      fmt.Sprintf("Iklan #%d", adID),
	}
	return db.Create(&revenue).Error
}
// RecordAdImpression & RecordAdClick - stub untuk metric tracking
// TODO: Implement AdMetric model & tracking when analytics module ready

func RecordAdImpression(db *gorm.DB, adID uint, userID uint) error {
	return nil
}

func RecordAdClick(db *gorm.DB, adID uint, userID uint) error {
	return nil
}

func CalculateAdCTR(db *gorm.DB, adID uint, start, end time.Time) (float64, error) {
	return 0, nil
}
