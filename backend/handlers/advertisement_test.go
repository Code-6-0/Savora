package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// setupAdvertisementTestDB initializes test database connection
func setupAdvertisementTestDB(t *testing.T) {
	if database.DB == nil {
		godotenv.Load("../.env")
		database.ConnectDB()

		if database.DB == nil {
			t.Skip("Database not connected, skipping integration test")
		}
	}

	// Auto migrate tables
	database.DB.AutoMigrate(
		&models.User{},
		&models.Advertisement{},
		&models.PlatformRevenue{},
	)

	// Create audit_logs table if not exists
	database.DB.Exec(`
		CREATE TABLE IF NOT EXISTS audit_logs (
			id SERIAL PRIMARY KEY,
			actor_id INTEGER NOT NULL,
			action VARCHAR(255) NOT NULL,
			target_type VARCHAR(50) NOT NULL,
			target_id INTEGER NOT NULL,
			note TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
}

// cleanupAdvertisementTestData removes test data after test
func cleanupAdvertisementTestData(t *testing.T, adID uint, revenueID uint, userIDs ...uint) {
	if database.DB != nil {
		if adID > 0 {
			database.DB.Delete(&models.Advertisement{}, adID)
			database.DB.Exec("DELETE FROM audit_logs WHERE target_id = ? AND target_type = 'ADVERTISEMENT'", adID)
		}
		if revenueID > 0 {
			database.DB.Delete(&models.PlatformRevenue{}, revenueID)
		}
		for _, userID := range userIDs {
			if userID > 0 {
				database.DB.Delete(&models.User{}, userID)
			}
		}
	}
}

// TestApproveAdvertisement_CreatesPlatformRevenue tests that approving ad creates platform_revenue record
func TestApproveAdvertisement_CreatesPlatformRevenue(t *testing.T) {
	setupAdvertisementTestDB(t)

	// Create test admin user
	adminUser := models.User{
		Name:   "Admin Test Ad",
		Email:  "admin_ad_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("password123")
	if err := database.DB.Create(&adminUser).Error; err != nil {
		t.Fatalf("Failed to create admin user: %v", err)
	}
	defer cleanupAdvertisementTestData(t, 0, 0, adminUser.ID)

	// Create test UMKM user (advertiser)
	umkmUser := models.User{
		Name:   "UMKM Advertiser",
		Email:  "umkm_ad_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleUmkm,
		Status: models.StatusActive,
	}
	umkmUser.SetPassword("password123")
	if err := database.DB.Create(&umkmUser).Error; err != nil {
		t.Fatalf("Failed to create UMKM user: %v", err)
	}
	defer cleanupAdvertisementTestData(t, 0, 0, umkmUser.ID)

	// Create test advertisement with PENDING status
	ad := models.Advertisement{
		AdvertiserID:   umkmUser.ID,
		AdvertiserType: "UMKM",
		Title:          "Test Ad Campaign",
		ImageURL:       "http://example.com/ad.jpg",
		TargetURL:      "http://example.com/product",
		DurationDays:   7,
		Price:          100000,
		ServiceFee:     5000, // 5% of 100000
		Status:         models.AdStatusPending,
	}
	if err := database.DB.Create(&ad).Error; err != nil {
		t.Fatalf("Failed to create test advertisement: %v", err)
	}
	defer cleanupAdvertisementTestData(t, ad.ID, 0)

	// Setup Fiber app
	app := fiber.New()

	// Mock auth middleware
	app.Use(func(c *fiber.Ctx) error {
		claims := &JWTClaims{
			UserID: adminUser.ID,
			Email:  adminUser.Email,
			Role:   adminUser.Role,
		}
		c.Locals("user", claims)
		return c.Next()
	})

	// Register route
	app.Patch("/api/advertisements/:id/status", ApproveRejectAdHandler)

	// Create request to approve advertisement
	reqBody := map[string]interface{}{
		"status": "APPROVED",
		"note":   "Iklan disetujui. Konten sesuai dengan guidelines platform.",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/api/advertisements/"+strconv.Itoa(int(ad.ID))+"/status", bytes.NewReader(bodyJSON))
	req.Header.Set("Content-Type", "application/json")

	// Perform request
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}

	// Check response status
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	// Verify database changes
	var updatedAd models.Advertisement
	if err := database.DB.First(&updatedAd, ad.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated advertisement: %v", err)
	}

	// Test Case 1: Ad status changed to APPROVED
	if updatedAd.Status != models.AdStatusApproved {
		t.Errorf("Expected ad status APPROVED, got %s", updatedAd.Status)
	}

	// Test Case 2: ApprovedBy and ApprovedAt are set
	if updatedAd.ApprovedBy == nil || *updatedAd.ApprovedBy != adminUser.ID {
		t.Error("Expected ApprovedBy to be set to admin user ID")
	}

	if updatedAd.ApprovedAt == nil {
		t.Error("Expected ApprovedAt to be set")
	}

	// Test Case 3: StartsAt and ExpiresAt are set
	if updatedAd.StartsAt == nil {
		t.Error("Expected StartsAt to be set")
	}

	if updatedAd.ExpiresAt == nil {
		t.Error("Expected ExpiresAt to be set")
	}

	// Test Case 4: PlatformRevenue record created
	var revenue models.PlatformRevenue
	err = database.DB.Where("source_type = ? AND source_id = ?", "ADVERTISEMENT", ad.ID).First(&revenue).Error
	if err != nil {
		t.Fatalf("Expected platform_revenue record to be created: %v", err)
	}
	defer cleanupAdvertisementTestData(t, 0, revenue.ID)

	// Verify revenue amounts
	if revenue.Amount != ad.Price {
		t.Errorf("Expected revenue amount %f, got %f", ad.Price, revenue.Amount)
	}

	if revenue.ServiceFeeAmount != ad.ServiceFee {
		t.Errorf("Expected service fee amount %f, got %f", ad.ServiceFee, revenue.ServiceFeeAmount)
	}

	// Test Case 5: Audit log tercatat
	time.Sleep(2000 * time.Millisecond)
	var auditCount int64
	database.DB.Table("audit_logs").
		Where("actor_id = ? AND action = ? AND target_type = ? AND target_id = ?",
			adminUser.ID, "APPROVE_ADVERTISEMENT", "ADVERTISEMENT", ad.ID).
		Count(&auditCount)

	if auditCount == 0 {
		t.Error("Expected audit log to be created for advertisement approval")
	}
}

// TestRejectAdvertisement_NoPlatformRevenue tests that rejecting ad does NOT create platform_revenue
func TestRejectAdvertisement_NoPlatformRevenue(t *testing.T) {
	setupAdvertisementTestDB(t)

	// Create test admin user
	adminUser := models.User{
		Name:   "Admin Test Ad Reject",
		Email:  "admin_ad_reject_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("password123")
	if err := database.DB.Create(&adminUser).Error; err != nil {
		t.Fatalf("Failed to create admin user: %v", err)
	}
	defer cleanupAdvertisementTestData(t, 0, 0, adminUser.ID)

	// Create test UMKM user (advertiser)
	umkmUser := models.User{
		Name:   "UMKM Advertiser Reject",
		Email:  "umkm_ad_reject_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleUmkm,
		Status: models.StatusActive,
	}
	umkmUser.SetPassword("password123")
	if err := database.DB.Create(&umkmUser).Error; err != nil {
		t.Fatalf("Failed to create UMKM user: %v", err)
	}
	defer cleanupAdvertisementTestData(t, 0, 0, umkmUser.ID)

	// Create test advertisement with PENDING status
	ad := models.Advertisement{
		AdvertiserID:   umkmUser.ID,
		AdvertiserType: "UMKM",
		Title:          "Test Ad Reject",
		ImageURL:       "http://example.com/ad2.jpg",
		TargetURL:      "http://example.com/product2",
		DurationDays:   7,
		Price:          100000,
		ServiceFee:     5000,
		Status:         models.AdStatusPending,
	}
	if err := database.DB.Create(&ad).Error; err != nil {
		t.Fatalf("Failed to create test advertisement: %v", err)
	}
	defer cleanupAdvertisementTestData(t, ad.ID, 0)

	// Setup Fiber app
	app := fiber.New()

	// Mock auth middleware
	app.Use(func(c *fiber.Ctx) error {
		claims := &JWTClaims{
			UserID: adminUser.ID,
			Email:  adminUser.Email,
			Role:   adminUser.Role,
		}
		c.Locals("user", claims)
		return c.Next()
	})

	// Register route
	app.Patch("/api/advertisements/:id/status", ApproveRejectAdHandler)

	// Create request to reject advertisement
	reqBody := map[string]interface{}{
		"status": "REJECTED",
		"note":   "Iklan ditolak karena konten tidak sesuai dengan guidelines platform.",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/api/advertisements/"+strconv.Itoa(int(ad.ID))+"/status", bytes.NewReader(bodyJSON))
	req.Header.Set("Content-Type", "application/json")

	// Perform request
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}

	// Check response status
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	// Verify database changes
	var updatedAd models.Advertisement
	if err := database.DB.First(&updatedAd, ad.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated advertisement: %v", err)
	}

	// Test Case 1: Ad status changed to REJECTED
	if updatedAd.Status != models.AdStatusRejected {
		t.Errorf("Expected ad status REJECTED, got %s", updatedAd.Status)
	}

	// Test Case 2: NO platform_revenue record created for rejected ad
	var revenueCount int64
	database.DB.Model(&models.PlatformRevenue{}).
		Where("source_type = ? AND source_id = ?", "ADVERTISEMENT", ad.ID).
		Count(&revenueCount)

	if revenueCount > 0 {
		t.Error("Expected NO platform_revenue record for rejected advertisement")
	}

	// Test Case 3: Audit log tercatat with REJECT action
	time.Sleep(2000 * time.Millisecond)
	var auditCount int64
	database.DB.Table("audit_logs").
		Where("actor_id = ? AND action = ? AND target_type = ? AND target_id = ?",
			adminUser.ID, "REJECT_ADVERTISEMENT", "ADVERTISEMENT", ad.ID).
		Count(&auditCount)

	if auditCount == 0 {
		t.Error("Expected audit log to be created for advertisement rejection")
	}
}
