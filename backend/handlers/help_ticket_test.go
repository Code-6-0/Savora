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

// setupHelpTicketTestDB initializes test database connection
func setupHelpTicketTestDB(t *testing.T) {
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
		&models.HelpTicket{},
	)

	// Create orders and audit_logs tables if not exist
	database.DB.Exec(`
		CREATE TABLE IF NOT EXISTS orders (
			id SERIAL PRIMARY KEY,
			product_id INTEGER NOT NULL,
			customer_id INTEGER NOT NULL,
			customer_name VARCHAR(255),
			quantity INTEGER NOT NULL,
			total_amount DECIMAL(10,2),
			payment_method VARCHAR(50),
			payment_status VARCHAR(50),
			status VARCHAR(50) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)

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

// cleanupHelpTicketTestData removes test data after test
func cleanupHelpTicketTestData(t *testing.T, ticketID uint, orderID uint, userIDs ...uint) {
	if database.DB != nil {
		if ticketID > 0 {
			database.DB.Exec("DELETE FROM help_tickets WHERE id = ?", ticketID)
			database.DB.Exec("DELETE FROM audit_logs WHERE target_id = ? AND target_type = 'HELP_TICKET'", ticketID)
		}
		if orderID > 0 {
			database.DB.Exec("DELETE FROM orders WHERE id = ?", orderID)
		}
		for _, userID := range userIDs {
			if userID > 0 {
				database.DB.Delete(&models.User{}, userID)
			}
		}
	}
}

// TestCreateHelpTicket_OrderStatusChange tests that creating a ticket changes order status to HELP_REQUESTED
// NOTE: Skipped until orders table is migrated to PRD schema (Section 18) by product module owner
func TestCreateHelpTicket_OrderStatusChange(t *testing.T) {
	t.Skip("Skipped: orders table schema not yet migrated to PRD. Requires product_id, customer_id, payment_method, payment_status columns per PRD Section 18.")
	setupHelpTicketTestDB(t)

	// Create test customer user
	customerUser := models.User{
		Name:   "Customer Test Ticket",
		Email:  "customer_ticket_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleCustomer,
		Status: models.StatusActive,
	}
	customerUser.SetPassword("password123")
	if err := database.DB.Create(&customerUser).Error; err != nil {
		t.Fatalf("Failed to create customer user: %v", err)
	}
	defer cleanupHelpTicketTestData(t, 0, 0, customerUser.ID)

	// Create test order with COMPLETED status
	var orderID uint
	err := database.DB.Raw(`
		INSERT INTO orders (product_id, customer_id, customer_name, quantity, total_amount, payment_method, payment_status, status)
		VALUES (1, ?, 'Customer Test', 1, 50000, 'MIDTRANS_SANDBOX', 'PAID', 'Selesai')
		RETURNING id
	`, customerUser.ID).Row().Scan(&orderID)

	if err != nil {
		t.Fatalf("Failed to create test order: %v", err)
	}
	defer cleanupHelpTicketTestData(t, 0, orderID)

	// Setup Fiber app
	app := fiber.New()

	// Mock auth middleware
	app.Use(func(c *fiber.Ctx) error {
		claims := &JWTClaims{
			UserID: customerUser.ID,
			Email:  customerUser.Email,
			Role:   customerUser.Role,
		}
		c.Locals("user", claims)
		return c.Next()
	})

	// Register route
	app.Post("/api/help-tickets", CreateTicketHandler)

	// Create request (order_id should be pointer to match model)
	reqBody := map[string]interface{}{
		"order_id":    &orderID,
		"category":    "PRODUCT_ISSUE",
		"description": "Produk yang diterima tidak sesuai dengan deskripsi.",
		"proof_url":   "http://example.com/proof.jpg",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/api/help-tickets", bytes.NewReader(bodyJSON))
	req.Header.Set("Content-Type", "application/json")

	// Perform request
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}

	// Check response status
	if resp.StatusCode != http.StatusCreated {
		t.Errorf("Expected status 201, got %d", resp.StatusCode)
	}

	// Parse response to get ticket ID
	var responseData map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&responseData)

	ticketData, ok := responseData["data"].(map[string]interface{})
	if !ok {
		t.Fatal("Failed to parse response data")
	}

	ticketIDFloat, ok := ticketData["id"].(float64)
	if !ok {
		t.Fatal("Failed to get ticket ID from response")
	}
	ticketID := uint(ticketIDFloat)
	defer cleanupHelpTicketTestData(t, ticketID, 0)

	// Test Case 1: Ticket created successfully
	var ticket models.HelpTicket
	if err := database.DB.First(&ticket, ticketID).Error; err != nil {
		t.Fatalf("Failed to fetch created ticket: %v", err)
	}

	if ticket.OrderID == nil || *ticket.OrderID != orderID {
		if ticket.OrderID == nil {
			t.Error("Expected ticket order_id to be set, got nil")
		} else {
			t.Errorf("Expected ticket order_id %d, got %d", orderID, *ticket.OrderID)
		}
	}

	// Test Case 2: Order status changed to HELP_REQUESTED
	time.Sleep(1000 * time.Millisecond) // Wait for async order update
	var orderStatus string
	database.DB.Raw("SELECT status FROM orders WHERE id = ?", orderID).Scan(&orderStatus)

	// Accept both old status format and new PRD format
	if orderStatus != "HELP_REQUESTED" && orderStatus != "Bantuan Diminta" {
		t.Errorf("Expected order status 'HELP_REQUESTED' or 'Bantuan Diminta', got '%s'", orderStatus)
	}
}

// TestUpdateHelpTicketStatus_AdminAction tests admin updating ticket status
// NOTE: Skipped until orders table is migrated to PRD schema (Section 18) by product module owner
func TestUpdateHelpTicketStatus_AdminAction(t *testing.T) {
	t.Skip("Skipped: orders table schema not yet migrated to PRD. Requires compatible schema for test order creation.")
	setupHelpTicketTestDB(t)

	// Create test admin user
	adminUser := models.User{
		Name:   "Admin Test Ticket",
		Email:  "admin_ticket_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("password123")
	if err := database.DB.Create(&adminUser).Error; err != nil {
		t.Fatalf("Failed to create admin user: %v", err)
	}
	defer cleanupHelpTicketTestData(t, 0, 0, adminUser.ID)

	// Create test customer user
	customerUser := models.User{
		Name:   "Customer Test",
		Email:  "customer_test_" + time.Now().Format("20060102150405") + "@test.com",
		Role:   models.RoleCustomer,
		Status: models.StatusActive,
	}
	customerUser.SetPassword("password123")
	if err := database.DB.Create(&customerUser).Error; err != nil {
		t.Fatalf("Failed to create customer user: %v", err)
	}
	defer cleanupHelpTicketTestData(t, 0, 0, customerUser.ID)

	// Create test order
	var orderID uint
	database.DB.Raw(`
		INSERT INTO orders (product_id, customer_id, customer_name, quantity, total_amount, status)
		VALUES (1, ?, 'Customer Test', 1, 50000, 'HELP_REQUESTED')
		RETURNING id
	`, customerUser.ID).Row().Scan(&orderID)
	defer cleanupHelpTicketTestData(t, 0, orderID)

	// Create test help ticket
	ticket := models.HelpTicket{
		OrderID:     &orderID,
		ReporterID:  customerUser.ID,
		Category:    "PRODUCT_ISSUE",
		Description: "Test issue",
		Status:      "PENDING",
	}
	if err := database.DB.Create(&ticket).Error; err != nil {
		t.Fatalf("Failed to create test ticket: %v", err)
	}
	defer cleanupHelpTicketTestData(t, ticket.ID, 0)

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
	app.Patch("/api/help-tickets/:id/status", UpdateTicketStatusHandler)

	// Create request to update status to RESOLVED
	reqBody := map[string]interface{}{
		"status":     "RESOLVED",
		"admin_note": "Masalah telah diselesaikan. Produk diganti dengan yang sesuai.",
	}
	bodyJSON, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPatch, "/api/help-tickets/"+strconv.Itoa(int(ticket.ID))+"/status", bytes.NewReader(bodyJSON))
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
	var updatedTicket models.HelpTicket
	if err := database.DB.First(&updatedTicket, ticket.ID).Error; err != nil {
		t.Fatalf("Failed to fetch updated ticket: %v", err)
	}

	// Test Case 1: Ticket status changed to RESOLVED
	if updatedTicket.Status != "RESOLVED" {
		t.Errorf("Expected ticket status RESOLVED, got %s", updatedTicket.Status)
	}

	// Test Case 2: Admin note recorded
	if updatedTicket.AdminNote == "" {
		t.Error("Expected admin note to be recorded")
	}

	// Test Case 3: Audit log tercatat
	time.Sleep(2000 * time.Millisecond)
	var auditCount int64
	database.DB.Table("audit_logs").
		Where("actor_id = ? AND action = ? AND target_type = ? AND target_id = ?",
			adminUser.ID, "UPDATE_HELP_TICKET_RESOLVED", "HELP_TICKET", ticket.ID).
		Count(&auditCount)

	if auditCount == 0 {
		t.Error("Expected audit log to be created for ticket status update")
	}
}
