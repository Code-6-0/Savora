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

// setupTestDB initializes test database connection for UMKM tests
func setupUMKMTestDB(t *testing.T) {
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
		&models.UMKMProfile{},
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

// cleanupUMKMTestData removes test data after test
func cleanupUMKMTestData(t *testing.T, userID, umkmID uint) {
	if database.DB != nil {
		if umkmID > 0 {
			database.DB.Delete(&models.UMKMProfile{}, umkmID)
		}
		if userID > 0 {
			database.DB.Delete(&models.User{}, userID)
		}
		if umkmID > 0 {
			database.DB.Exec("DELETE FROM audit_logs WHERE target_id = ? AND target_type = 'UMKM'", umkmID)
		}
	}
}

// TestVerifyUMKMHandler_Approve tests approve flow
func TestVerifyUMKMHandler_Approve(t *testing.T) {
	setupUMKMTestDB(t)

	// Create test admin user
	adminUser := models.User{
		Name:   "Admin Test UMKM",
		Email:  "admin_umkm_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("password123")
	if err := database.DB.Create(&adminUser).Error; err != nil {
		t.Fatalf("Failed to create admin user: %v", err)
	}
	defer cleanupUMKMTestData(t, adminUser.ID, 0)

	// Create test UMKM user
	umkmUser := models.User{
		Name:   "UMKM Test",
		Email:  "umkm_test_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleUmkm,
		Status: models.StatusPending,
	}
	umkmUser.SetPassword("password123")
	if err := database.DB.Create(&umkmUser).Error; err != nil {
		t.Fatalf("Failed to create UMKM user: %v", err)
	}
	defer cleanupUMKMTestData(t, umkmUser.ID, 0)

	// Create test UMKM profile
	umkmProfile := models.UMKMProfile{
		UserID:               umkmUser.ID,
		NamaBisnis:           "Test Warung",
		JenisBisnis:          "restoran",
		AlamatOperasional:    "Test Address",
		KontakTelepon:        "081234567890",
		EstimasiVolumeSampah: "50 kg/hari",
		JamOperasional:       "08:00-22:00",
		VerificationStatus:   models.VerificationPending,
	}
	if err := database.DB.Create(&umkmProfile).Error; err != nil {
		t.Fatalf("Failed to create UMKM profile: %v", err)
	}
	defer cleanupUMKMTestData(t, 0, umkmProfile.ID)

	// Setup Fiber app
	app := fiber.New()

	// Mock auth middleware to inject admin user
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
	app.Patch("/api/admin/umkm/:id/verification", VerifyUMKMHandler)

	// Create request
	reqBody := VerifyUMKMRequest{
		Status: "APPROVED",
		Note:   "UMKM memenuhi syarat dan dokumen lengkap.",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/api/admin/umkm/"+strconv.Itoa(int(umkmProfile.ID))+"/verification", bytes.NewReader(bodyJSON))
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
	var updatedProfile models.UMKMProfile
	if err := database.DB.First(&updatedProfile, umkmProfile.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated profile: %v", err)
	}

	// Test Case 1: Status berubah ke APPROVED
	if updatedProfile.VerificationStatus != models.VerificationApproved {
		t.Errorf("Expected status APPROVED, got %s", updatedProfile.VerificationStatus)
	}

	// Test Case 2: User status berubah ke ACTIVE
	var updatedUser models.User
	if err := database.DB.First(&updatedUser, umkmUser.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated user: %v", err)
	}
	if updatedUser.Status != models.StatusActive {
		t.Errorf("Expected user status ACTIVE, got %s", updatedUser.Status)
	}

	// Test Case 3: Audit log tercatat
	time.Sleep(2000 * time.Millisecond) // Wait for async audit log insert
	var auditCount int64
	database.DB.Table("audit_logs").
		Where("actor_id = ? AND action = ? AND target_type = ? AND target_id = ?",
			adminUser.ID, "VERIFY_UMKM_APPROVED", "UMKM", umkmProfile.ID).
		Count(&auditCount)

	if auditCount == 0 {
		t.Error("Expected audit log to be created")
	}
}

// TestVerifyUMKMHandler_Reject tests reject flow
func TestVerifyUMKMHandler_Reject(t *testing.T) {
	setupUMKMTestDB(t)

	// Create test admin user
	adminUser := models.User{
		Name:   "Admin Test UMKM Reject",
		Email:  "admin_umkm_reject_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("password123")
	if err := database.DB.Create(&adminUser).Error; err != nil {
		t.Fatalf("Failed to create admin user: %v", err)
	}
	defer cleanupUMKMTestData(t, adminUser.ID, 0)

	// Create test UMKM user
	umkmUser := models.User{
		Name:   "UMKM Reject Test",
		Email:  "umkm_reject_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleUmkm,
		Status: models.StatusPending,
	}
	umkmUser.SetPassword("password123")
	if err := database.DB.Create(&umkmUser).Error; err != nil {
		t.Fatalf("Failed to create UMKM user: %v", err)
	}
	defer cleanupUMKMTestData(t, umkmUser.ID, 0)

	// Create test UMKM profile
	umkmProfile := models.UMKMProfile{
		UserID:               umkmUser.ID,
		NamaBisnis:           "Test Warung Reject",
		JenisBisnis:          "restoran",
		AlamatOperasional:    "Test Address Reject",
		KontakTelepon:        "081234567891",
		EstimasiVolumeSampah: "30 kg/hari",
		JamOperasional:       "09:00-21:00",
		VerificationStatus:   models.VerificationPending,
	}
	if err := database.DB.Create(&umkmProfile).Error; err != nil {
		t.Fatalf("Failed to create UMKM profile: %v", err)
	}
	defer cleanupUMKMTestData(t, 0, umkmProfile.ID)

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
	app.Patch("/api/admin/umkm/:id/verification", VerifyUMKMHandler)

	// Create request with REJECTED status
	reqBody := VerifyUMKMRequest{
		Status: "REJECTED",
		Note:   "Dokumen tidak lengkap. Harap upload ulang dokumen yang valid.",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/api/admin/umkm/"+strconv.Itoa(int(umkmProfile.ID))+"/verification", bytes.NewReader(bodyJSON))
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
	var updatedProfile models.UMKMProfile
	if err := database.DB.First(&updatedProfile, umkmProfile.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated profile: %v", err)
	}

	// Test Case 1: Status berubah ke REJECTED
	if updatedProfile.VerificationStatus != models.VerificationRejected {
		t.Errorf("Expected status REJECTED, got %s", updatedProfile.VerificationStatus)
	}

	// Test Case 2: User status tetap PENDING (tidak berubah ke ACTIVE)
	var updatedUser models.User
	if err := database.DB.First(&updatedUser, umkmUser.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated user: %v", err)
	}
	if updatedUser.Status == models.StatusActive {
		t.Error("User status should NOT be ACTIVE when rejected")
	}

	// Test Case 3: Audit log tercatat dengan action REJECTED
	time.Sleep(2000 * time.Millisecond)
	var auditCount int64
	database.DB.Table("audit_logs").
		Where("actor_id = ? AND action = ? AND target_type = ? AND target_id = ?",
			adminUser.ID, "VERIFY_UMKM_REJECTED", "UMKM", umkmProfile.ID).
		Count(&auditCount)

	if auditCount == 0 {
		t.Error("Expected audit log to be created for REJECTED action")
	}
}
