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

// setupModerationTestDB initializes test database connection
func setupModerationTestDB(t *testing.T) {
	if database.DB == nil {
		godotenv.Load("../.env")
		database.ConnectDB()

		if database.DB == nil {
			t.Skip("Database not connected, skipping integration test")
		}
	}

	// Auto migrate tables
	database.DB.AutoMigrate(&models.User{})

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

// cleanupModerationTestData removes test data after test
func cleanupModerationTestData(t *testing.T, userIDs ...uint) {
	if database.DB != nil {
		for _, userID := range userIDs {
			if userID > 0 {
				database.DB.Delete(&models.User{}, userID)
				database.DB.Exec("DELETE FROM audit_logs WHERE target_id = ? AND target_type = 'USER'", userID)
			}
		}
	}
}

// TestModerateUserHandler_Warning tests warning action
func TestModerateUserHandler_Warning(t *testing.T) {
	setupModerationTestDB(t)

	// Create test admin user
	adminUser := models.User{
		Name:   "Admin Test Moderation",
		Email:  "admin_mod_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("password123")
	if err := database.DB.Create(&adminUser).Error; err != nil {
		t.Fatalf("Failed to create admin user: %v", err)
	}
	defer cleanupModerationTestData(t, adminUser.ID)

	// Create test target user (UMKM)
	targetUser := models.User{
		Name:   "Target User Warning",
		Email:  "target_warning_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleUmkm,
		Status: models.StatusActive,
	}
	targetUser.SetPassword("password123")
	if err := database.DB.Create(&targetUser).Error; err != nil {
		t.Fatalf("Failed to create target user: %v", err)
	}
	defer cleanupModerationTestData(t, targetUser.ID)

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
	app.Patch("/api/admin/users/:id/moderate", ModerateUserHandler)

	// Create request with warning action
	reqBody := ModerateUserRequest{
		Action: "warning",
		Note:   "Peringatan: ditemukan pelanggaran kecil pada listing produk.",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/api/admin/users/"+strconv.Itoa(int(targetUser.ID))+"/moderate", bytes.NewReader(bodyJSON))
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
	var updatedUser models.User
	if err := database.DB.First(&updatedUser, targetUser.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated user: %v", err)
	}

	// Test Case 1: Status tetap ACTIVE (warning tidak mengubah status)
	if updatedUser.Status != models.StatusActive {
		t.Errorf("Expected status to remain ACTIVE, got %s", updatedUser.Status)
	}

	// Test Case 2: Audit log tercatat dengan action WARNING
	time.Sleep(2000 * time.Millisecond) // Wait for async audit log insert
	var auditCount int64
	database.DB.Table("audit_logs").
		Where("actor_id = ? AND action = ? AND target_type = ? AND target_id = ?",
			adminUser.ID, "MODERATE_USER_WARNING", "USER", targetUser.ID).
		Count(&auditCount)

	if auditCount == 0 {
		t.Error("Expected audit log to be created for WARNING action")
	}
}

// TestModerateUserHandler_Suspend tests suspend action
func TestModerateUserHandler_Suspend(t *testing.T) {
	setupModerationTestDB(t)

	// Create test admin user
	adminUser := models.User{
		Name:   "Admin Test Suspend",
		Email:  "admin_suspend_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("password123")
	if err := database.DB.Create(&adminUser).Error; err != nil {
		t.Fatalf("Failed to create admin user: %v", err)
	}
	defer cleanupModerationTestData(t, adminUser.ID)

	// Create test target user (UMKM with ACTIVE status)
	targetUser := models.User{
		Name:   "Target User Suspend",
		Email:  "target_suspend_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleUmkm,
		Status: models.StatusActive,
	}
	targetUser.SetPassword("password123")
	if err := database.DB.Create(&targetUser).Error; err != nil {
		t.Fatalf("Failed to create target user: %v", err)
	}
	defer cleanupModerationTestData(t, targetUser.ID)

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
	app.Patch("/api/admin/users/:id/moderate", ModerateUserHandler)

	// Create request with suspend action
	reqBody := ModerateUserRequest{
		Action: "suspend",
		Note:   "Akun disuspend karena pelanggaran berat: listing produk yang sudah kedaluwarsa.",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/api/admin/users/"+strconv.Itoa(int(targetUser.ID))+"/moderate", bytes.NewReader(bodyJSON))
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
	var updatedUser models.User
	if err := database.DB.First(&updatedUser, targetUser.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated user: %v", err)
	}

	// Test Case 1: Status berubah ke SUSPENDED
	if updatedUser.Status != models.StatusSuspended {
		t.Errorf("Expected status SUSPENDED, got %s", updatedUser.Status)
	}

	// Test Case 2: Audit log tercatat dengan action SUSPEND
	time.Sleep(2000 * time.Millisecond) // Wait for async audit log insert
	var auditCount int64
	database.DB.Table("audit_logs").
		Where("actor_id = ? AND action = ? AND target_type = ? AND target_id = ?",
			adminUser.ID, "MODERATE_USER_SUSPEND", "USER", targetUser.ID).
		Count(&auditCount)

	if auditCount == 0 {
		t.Error("Expected audit log to be created for SUSPEND action")
	}
}

// TestModerateUserHandler_Approve tests approve action (reactivate suspended user)
func TestModerateUserHandler_Approve(t *testing.T) {
	setupModerationTestDB(t)

	// Create test admin user
	adminUser := models.User{
		Name:   "Admin Test Approve",
		Email:  "admin_approve_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("password123")
	if err := database.DB.Create(&adminUser).Error; err != nil {
		t.Fatalf("Failed to create admin user: %v", err)
	}
	defer cleanupModerationTestData(t, adminUser.ID)

	// Create test target user (SUSPENDED status)
	targetUser := models.User{
		Name:   "Target User Approve",
		Email:  "target_approve_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleUmkm,
		Status: models.StatusSuspended,
	}
	targetUser.SetPassword("password123")
	if err := database.DB.Create(&targetUser).Error; err != nil {
		t.Fatalf("Failed to create target user: %v", err)
	}
	defer cleanupModerationTestData(t, targetUser.ID)

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
	app.Patch("/api/admin/users/:id/moderate", ModerateUserHandler)

	// Create request with approve action
	reqBody := ModerateUserRequest{
		Action: "approve",
		Note:   "Akun diaktifkan kembali setelah peninjauan.",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/api/admin/users/"+strconv.Itoa(int(targetUser.ID))+"/moderate", bytes.NewReader(bodyJSON))
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
	var updatedUser models.User
	if err := database.DB.First(&updatedUser, targetUser.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated user: %v", err)
	}

	// Test Case 1: Status berubah ke ACTIVE
	if updatedUser.Status != models.StatusActive {
		t.Errorf("Expected status ACTIVE, got %s", updatedUser.Status)
	}

	// Test Case 2: Audit log tercatat dengan action APPROVE
	time.Sleep(2000 * time.Millisecond) // Wait for async audit log insert
	var auditCount int64
	database.DB.Table("audit_logs").
		Where("actor_id = ? AND action = ? AND target_type = ? AND target_id = ?",
			adminUser.ID, "MODERATE_USER_APPROVE", "USER", targetUser.ID).
		Count(&auditCount)

	if auditCount == 0 {
		t.Error("Expected audit log to be created for APPROVE action")
	}
}
