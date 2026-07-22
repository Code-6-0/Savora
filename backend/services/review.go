package services

import (
	"errors"
	"strings"
	"time"

	"github.com/savora/backend/models"
	"gorm.io/gorm"
)

// KeywordClassifier adalah interface untuk mesin klasifikasi keyword (Ridwan)
type KeywordClassifier interface {
	ClassifyKeywords(keywords []string) map[string]string // keyword -> level (AMAN/WARNING/GAWAT)
}

// SimpleKeywordClassifier adalah implementasi rule-based sederhana
type SimpleKeywordClassifier struct {
	keywordMap map[string]string
}

func NewSimpleKeywordClassifier() *SimpleKeywordClassifier {
	// Kamus keyword sesuai PRD 12.7
	keywordMap := map[string]string{
		// AMAN (positif)
		"enak":             models.KeywordAman,
		"segar":            models.KeywordAman,
		"fresh":            models.KeywordAman,
		"hangat":           models.KeywordAman,
		"bersih":           models.KeywordAman,
		"layak":            models.KeywordAman,
		"sesuai deskripsi": models.KeywordAman,
		"lezat":            models.KeywordAman,
		"mantap":           models.KeywordAman,
		
		// WARNING
		"kurang segar":  models.KeywordWarning,
		"dingin":        models.KeywordWarning,
		"keras":         models.KeywordWarning,
		"agak asam":     models.KeywordWarning,
		"bau kurang sedap": models.KeywordWarning,
		"kemasan rusak": models.KeywordWarning,
		"porsi kurang":  models.KeywordWarning,
		
		// GAWAT
		"basi":       models.KeywordGawat,
		"bau busuk":  models.KeywordGawat,
		"berjamur":   models.KeywordGawat,
		"berlendir":  models.KeywordGawat,
		"sakit perut": models.KeywordGawat,
		"keracunan":  models.KeywordGawat,
	}

	return &SimpleKeywordClassifier{keywordMap: keywordMap}
}

func (c *SimpleKeywordClassifier) ClassifyKeywords(keywords []string) map[string]string {
	result := make(map[string]string)
	
	for _, kw := range keywords {
		kwLower := strings.ToLower(strings.TrimSpace(kw))
		
		// Exact match
		if level, found := c.keywordMap[kwLower]; found {
			result[kw] = level
			continue
		}
		
		// Substring match (case-insensitive)
		matched := false
		for dictKeyword, level := range c.keywordMap {
			if strings.Contains(kwLower, dictKeyword) {
				result[kw] = level
				matched = true
				break
			}
		}
		
		// Keyword tidak dikenal - simpan tanpa level
		if !matched {
			result[kw] = "" // empty = tidak memengaruhi badge
		}
	}
	
	return result
}

// CreateReviewRequest adalah payload untuk create review
type CreateReviewRequest struct {
	OrderID  uint     `json:"order_id" binding:"required"`
	Rating   int      `json:"rating" binding:"required,min=1,max=5"`
	Comment  string   `json:"comment"`
	Keywords []string `json:"keywords"`
}

// CreateReview membuat review dengan keyword classification
func CreateReview(db *gorm.DB, customerID uint, req CreateReviewRequest, classifier KeywordClassifier) error {
	return db.Transaction(func(tx *gorm.DB) error {
		// 1. Validasi order
		var order models.Order
		if err := tx.Preload("Product").First(&order, req.OrderID).Error; err != nil {
			return errors.New("order tidak ditemukan")
		}

		// Order harus Completed
		if order.Status != models.OrderCompleted {
			return errors.New("review hanya dapat dibuat untuk order yang sudah selesai")
		}

		// Reviewer harus customer pemilik order
		if order.CustomerID != customerID {
			return errors.New("anda tidak berhak mereview order ini")
		}

		// Cek apakah sudah pernah direview (unique constraint)
		var existingReview models.Review
		err := tx.Where("order_id = ?", req.OrderID).First(&existingReview).Error
		if err == nil {
			return errors.New("order ini sudah direview")
		}

		// 2. Validasi rating
		if req.Rating < 1 || req.Rating > 5 {
			return errors.New("rating harus antara 1-5")
		}

		// 3. Simpan review
		keywordsSnapshot := strings.Join(req.Keywords, ", ")
		review := models.Review{
			OrderID:    req.OrderID,
			ReviewerID: customerID,
			TargetID:   order.Product.UmkmID, // umkm_id dari produk
			Rating:     req.Rating,
			Comment:    req.Comment,
			Keywords:   keywordsSnapshot, // denormalisasi snapshot (REVISI #30)
		}

		if err := tx.Create(&review).Error; err != nil {
			return err
		}

		// 4. Klasifikasi keyword & insert review_keywords
		classified := make(map[string]string)
		if len(req.Keywords) > 0 {
			classified = classifier.ClassifyKeywords(req.Keywords)
			
			for keyword, level := range classified {
				// Hanya simpan keyword yang dikenali (level tidak kosong)
				if level != "" {
					reviewKeyword := models.ReviewKeyword{
						ReviewID:  review.ID,
						Keyword:   keyword,
						Level:     level,
						CreatedAt: time.Now(),
					}
					if err := tx.Create(&reviewKeyword).Error; err != nil {
						return err
					}
				}
			}
		}

		// 5. Update agregat keyword_scores per UMKM
		umkmID := order.Product.UmkmID
		if err := updateKeywordScores(tx, umkmID); err != nil {
			return err
		}

		// 6. Update agregat rating UMKM
		if err := updateUmkmRating(tx, umkmID); err != nil {
			return err
		}

		// 7. Flag admin jika ada keyword GAWAT (REVISI #16)
		for _, level := range classified {
			if level == models.KeywordGawat {
				// TODO: Trigger notification ke admin untuk verifikasi
				// Implementasi notifikasi di fase berikutnya
				break
			}
		}

		return nil
	})
}

// updateKeywordScores menghitung ulang agregat keyword per UMKM (rolling 30 hari)
func updateKeywordScores(tx *gorm.DB, umkmID uint) error {
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	// Hitung total keyword per level dari 30 hari terakhir
	type KeywordCount struct {
		Level string
		Count int
	}

	var counts []KeywordCount
	err := tx.Raw(`
		SELECT rk.level, COUNT(*) as count
		FROM review_keywords rk
		JOIN reviews r ON r.id = rk.review_id
		WHERE r.target_id = ? AND r.created_at > ?
		GROUP BY rk.level
	`, umkmID, thirtyDaysAgo).Scan(&counts).Error

	if err != nil {
		return err
	}

	totalAman := 0
	totalWarning := 0
	totalGawat := 0

	for _, c := range counts {
		switch c.Level {
		case models.KeywordAman:
			totalAman = c.Count
		case models.KeywordWarning:
			totalWarning = c.Count
		case models.KeywordGawat:
			totalGawat = c.Count
		}
	}

	// Tentukan safety level berdasarkan threshold (PRD 12.7)
	safetyLevel := models.KeywordAman // default

	// Hitung jumlah customer unik yang beri keyword Gawat
	var uniqueGawatCustomers int64
	tx.Raw(`
		SELECT COUNT(DISTINCT r.reviewer_id)
		FROM review_keywords rk
		JOIN reviews r ON r.id = rk.review_id
		WHERE r.target_id = ? AND r.created_at > ? AND rk.level = ?
	`, umkmID, thirtyDaysAgo, models.KeywordGawat).Scan(&uniqueGawatCustomers)

	if totalGawat >= 3 && uniqueGawatCustomers >= 2 {
		safetyLevel = models.KeywordGawat
	} else if totalWarning >= 3 || (totalGawat >= 1 && totalGawat < 3) {
		safetyLevel = models.KeywordWarning
	}

	// Upsert keyword_scores
	var keywordScore models.KeywordScore
	err = tx.Where("umkm_id = ?", umkmID).First(&keywordScore).Error

	if err == gorm.ErrRecordNotFound {
		// Insert baru
		keywordScore = models.KeywordScore{
			UmkmID:       umkmID,
			TotalAman:    totalAman,
			TotalWarning: totalWarning,
			TotalGawat:   totalGawat,
			SafetyLevel:  safetyLevel,
		}
		return tx.Create(&keywordScore).Error
	}

	// Update existing
	keywordScore.TotalAman = totalAman
	keywordScore.TotalWarning = totalWarning
	keywordScore.TotalGawat = totalGawat
	keywordScore.SafetyLevel = safetyLevel
	return tx.Save(&keywordScore).Error
}

// updateUmkmRating menghitung ulang rata-rata rating UMKM
func updateUmkmRating(tx *gorm.DB, umkmID uint) error {
	var avgRating float64
	err := tx.Raw(`
		SELECT COALESCE(AVG(rating), 0)
		FROM reviews
		WHERE target_id = ?
	`, umkmID).Scan(&avgRating).Error

	if err != nil {
		return err
	}

	// Update rating di umkm_profiles
	return tx.Model(&models.UmkmProfile{}).
		Where("id = ?", umkmID).
		Update("rating", avgRating).Error
}

// GetKeywordSafetyScore mengambil badge keyword safety per UMKM
func GetKeywordSafetyScore(db *gorm.DB, umkmID uint) (*models.KeywordScore, error) {
	var score models.KeywordScore
	err := db.Where("umkm_id = ?", umkmID).First(&score).Error
	if err == gorm.ErrRecordNotFound {
		// Belum ada review - return default AMAN
		return &models.KeywordScore{
			UmkmID:      umkmID,
			SafetyLevel: models.KeywordAman,
		}, nil
	}
	return &score, err
}
