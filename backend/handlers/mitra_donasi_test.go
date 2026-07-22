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

// setupTestDB initializes test database connection
func setupTestDB(t *testing.T) {
	// Connect to database if not already connected
	if database.DB == nil {
		// Load .env file untuk DATABASE_URL
		godotenv.Load("../.env") // .env ada di backend/.env (parent dari handlers/)

		// Connect to database
		database.ConnectDB()

		if database.DB == nil {
			t.Skip("Database not connected, skipping integration test")
		}
	}

	// Auto migrate tables jika belum ada
	database.DB.AutoMigrate(
		&models.User{},
		&models.MitraDonasiProfile{},
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

// cleanupTestData removes test data after test
func cleanupTestData(t *testing.T, userID, mitraID uint) {
	if database.DB != nil {
		database.DB.Delete(&models.MitraDonasiProfile{}, mitraID)
		database.DB.Delete(&models.User{}, userID)
		database.DB.Exec("DELETE FROM audit_logs WHERE target_id = ? AND target_type = 'MITRA_DONASI'", mitraID)
	}
}

// TestVerifyMitraDonasiHandler_Approve tests approve flow
func TestVerifyMitraDonasiHandler_Approve(t *testing.T) {
	setupTestDB(t)

	// Create test admin user
	adminUser := models.User{
		Name:   "Admin Test",
		Email:  "admin_test_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("password123")
	if err := database.DB.Create(&adminUser).Error; err != nil {
		t.Fatalf("Failed to create admin user: %v", err)
	}
	defer cleanupTestData(t, adminUser.ID, 0)

	// Create test mitra donasi user
	mitraUser := models.User{
		Name:   "Mitra Test",
		Email:  "mitra_test_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleMitraDonasi,
		Status: models.StatusPending,
	}
	mitraUser.SetPassword("password123")
	if err := database.DB.Create(&mitraUser).Error; err != nil {
		t.Fatalf("Failed to create mitra user: %v", err)
	}
	defer cleanupTestData(t, mitraUser.ID, 0)

	// Create test mitra profile
	mitraProfile := models.MitraDonasiProfile{
		UserID:             mitraUser.ID,
		OrgName:            "Test Organization",
		Phone:              "081234567890",
		Address:            "Test Address",
		Description:        "Test Description",
		DocumentURL:        "http://example.com/doc.pdf",
		VerificationStatus: models.VerificationPending,
	}
	if err := database.DB.Create(&mitraProfile).Error; err != nil {
		t.Fatalf("Failed to create mitra profile: %v", err)
	}
	defer cleanupTestData(t, 0, mitraProfile.ID)

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
	app.Patch("/api/admin/mitra-donasi/:id/verify", VerifyMitraDonasiHandler)

	// Create request
	reqBody := VerifyMitraDonasiRequest{
		Status: models.VerificationApproved,
		Note:   "Dokumen lengkap dan valid. Disetujui oleh admin.",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/api/admin/mitra-donasi/"+strconv.Itoa(int(mitraProfile.ID))+"/verify", bytes.NewReader(bodyJSON))
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
	var updatedProfile models.MitraDonasiProfile
	if err := database.DB.First(&updatedProfile, mitraProfile.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated profile: %v", err)
	}

	// Test Case 1: Status berubah ke APPROVED
	if updatedProfile.VerificationStatus != models.VerificationApproved {
		t.Errorf("Expected status APPROVED, got %s", updatedProfile.VerificationStatus)
	}

	// Test Case 2: VerifiedAt terisi
	if updatedProfile.VerifiedAt == nil {
		t.Error("Expected VerifiedAt to be set, got nil")
	}

	// Test Case 3: User status berubah ke ACTIVE
	var updatedUser models.User
	if err := database.DB.First(&updatedUser, mitraUser.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated user: %v", err)
	}
	if updatedUser.Status != models.StatusActive {
		t.Errorf("Expected user status ACTIVE, got %s", updatedUser.Status)
	}

	// Test Case 4: Audit log tercatat
	time.Sleep(2000 * time.Millisecond) // Wait for async audit log insert (increased to 2s for reliability)
	var auditCount int64
	database.DB.Table("audit_logs").
		Where("actor_id = ? AND action = ? AND target_type = ? AND target_id = ?",
			adminUser.ID, "VERIFY_MITRA_DONASI_APPROVED", "MITRA_DONASI", mitraProfile.ID).
		Count(&auditCount)

	if auditCount == 0 {
		t.Error("Expected audit log to be created")
	}
}

// TestVerifyMitraDonasiHandler_Reject tests reject flow
func TestVerifyMitraDonasiHandler_Reject(t *testing.T) {
	setupTestDB(t)

	// Create test admin user
	adminUser := models.User{
		Name:   "Admin Test Reject",
		Email:  "admin_reject_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("password123")
	if err := database.DB.Create(&adminUser).Error; err != nil {
		t.Fatalf("Failed to create admin user: %v", err)
	}
	defer cleanupTestData(t, adminUser.ID, 0)

	// Create test mitra donasi user
	mitraUser := models.User{
		Name:   "Mitra Reject Test",
		Email:  "mitra_reject_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleMitraDonasi,
		Status: models.StatusPending,
	}
	mitraUser.SetPassword("password123")
	if err := database.DB.Create(&mitraUser).Error; err != nil {
		t.Fatalf("Failed to create mitra user: %v", err)
	}
	defer cleanupTestData(t, mitraUser.ID, 0)

	// Create test mitra profile
	mitraProfile := models.MitraDonasiProfile{
		UserID:             mitraUser.ID,
		OrgName:            "Test Org Reject",
		Phone:              "081234567891",
		Address:            "Test Address Reject",
		Description:        "Test Description Reject",
		DocumentURL:        "http://example.com/doc2.pdf",
		VerificationStatus: models.VerificationPending,
	}
	if err := database.DB.Create(&mitraProfile).Error; err != nil {
		t.Fatalf("Failed to create mitra profile: %v", err)
	}
	defer cleanupTestData(t, 0, mitraProfile.ID)

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
	app.Patch("/api/admin/mitra-donasi/:id/verify", VerifyMitraDonasiHandler)

	// Create request with REJECTED status
	reqBody := VerifyMitraDonasiRequest{
		Status: models.VerificationRejected,
		Note:   "Dokumen tidak lengkap. Harap upload ulang dokumen legalitas yang valid.",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/api/admin/mitra-donasi/"+strconv.Itoa(int(mitraProfile.ID))+"/verify", bytes.NewReader(bodyJSON))
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
	var updatedProfile models.MitraDonasiProfile
	if err := database.DB.First(&updatedProfile, mitraProfile.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated profile: %v", err)
	}

	// Test Case 1: Status berubah ke REJECTED
	if updatedProfile.VerificationStatus != models.VerificationRejected {
		t.Errorf("Expected status REJECTED, got %s", updatedProfile.VerificationStatus)
	}

	// Test Case 2: VerifiedAt terisi
	if updatedProfile.VerifiedAt == nil {
		t.Error("Expected VerifiedAt to be set, got nil")
	}

	// Test Case 3: User status tetap PENDING (tidak berubah ke ACTIVE)
	var updatedUser models.User
	if err := database.DB.First(&updatedUser, mitraUser.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated user: %v", err)
	}
	if updatedUser.Status == models.StatusActive {
		t.Error("User status should NOT be ACTIVE when rejected")
	}

	// Test Case 4: Audit log tercatat dengan action REJECTED
	time.Sleep(2000 * time.Millisecond) // Wait for async audit log insert (increased to 2s for reliability)
	var auditCount int64
	database.DB.Table("audit_logs").
		Where("actor_id = ? AND action = ? AND target_type = ? AND target_id = ?",
			adminUser.ID, "VERIFY_MITRA_DONASI_REJECTED", "MITRA_DONASI", mitraProfile.ID).
		Count(&auditCount)

	if auditCount == 0 {
		t.Error("Expected audit log to be created for REJECTED action")
	}
}
