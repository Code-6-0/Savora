package middleware

import (
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/savora/backend/handlers"
)

// Helper: Generate valid JWT token for testing
func generateTestToken(userID uint, email, role string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "savora-secret-key-change-in-production"
	}

	claims := handlers.JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// Helper: Generate expired JWT token for testing
func generateExpiredToken(userID uint, email, role string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "savora-secret-key-change-in-production"
	}

	claims := handlers.JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)), // Expired 1 hour ago
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// Test: AuthMiddleware - No token (401)
func TestAuthMiddleware_NoToken(t *testing.T) {
	app := fiber.New()

	app.Get("/protected", AuthMiddleware, func(c *fiber.Ctx) error {
		return c.SendString("Success")
	})

	req := httptest.NewRequest("GET", "/protected", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", resp.StatusCode)
	}
}

// Test: AuthMiddleware - Invalid token format (401)
func TestAuthMiddleware_InvalidTokenFormat(t *testing.T) {
	app := fiber.New()

	app.Get("/protected", AuthMiddleware, func(c *fiber.Ctx) error {
		return c.SendString("Success")
	})

	req := httptest.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "InvalidFormat")
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", resp.StatusCode)
	}
}

// Test: AuthMiddleware - Invalid token string (401)
func TestAuthMiddleware_InvalidToken(t *testing.T) {
	app := fiber.New()

	app.Get("/protected", AuthMiddleware, func(c *fiber.Ctx) error {
		return c.SendString("Success")
	})

	req := httptest.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer invalid.token.here")
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", resp.StatusCode)
	}
}

// Test: AuthMiddleware - Expired token (401)
func TestAuthMiddleware_ExpiredToken(t *testing.T) {
	app := fiber.New()

	app.Get("/protected", AuthMiddleware, func(c *fiber.Ctx) error {
		return c.SendString("Success")
	})

	token, err := generateExpiredToken(1, "test@example.com", "CUSTOMER")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	req := httptest.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Errorf("Expected status 401 for expired token, got %d", resp.StatusCode)
	}
}

// Test: AuthMiddleware - Valid token (200)
func TestAuthMiddleware_ValidToken(t *testing.T) {
	app := fiber.New()

	var capturedUserID uint
	var capturedRole string

	app.Get("/protected", AuthMiddleware, func(c *fiber.Ctx) error {
		userLocal := c.Locals("user")
		if userLocal == nil {
			return c.Status(500).SendString("No user in context")
		}

		claims := userLocal.(*handlers.JWTClaims)
		capturedUserID = claims.UserID
		capturedRole = claims.Role

		return c.SendString("Success")
	})

	token, err := generateTestToken(123, "test@example.com", "CUSTOMER")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	req := httptest.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusOK {
		t.Errorf("Expected status 200 for valid token, got %d", resp.StatusCode)
	}

	if capturedUserID != 123 {
		t.Errorf("Expected user ID 123, got %d", capturedUserID)
	}

	if capturedRole != "CUSTOMER" {
		t.Errorf("Expected role CUSTOMER, got %s", capturedRole)
	}
}

// Test: OptionalAuthMiddleware - No token (continues without user)
func TestOptionalAuthMiddleware_NoToken(t *testing.T) {
	app := fiber.New()

	app.Get("/public", OptionalAuthMiddleware, func(c *fiber.Ctx) error {
		userLocal := c.Locals("user")
		if userLocal == nil {
			return c.SendString("No user")
		}
		return c.SendString("Has user")
	})

	req := httptest.NewRequest("GET", "/public", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}

// Test: OptionalAuthMiddleware - Valid token (sets user)
func TestOptionalAuthMiddleware_ValidToken(t *testing.T) {
	app := fiber.New()

	var hasUser bool

	app.Get("/public", OptionalAuthMiddleware, func(c *fiber.Ctx) error {
		userLocal := c.Locals("user")
		hasUser = userLocal != nil
		return c.SendString("OK")
	})

	token, err := generateTestToken(123, "test@example.com", "CUSTOMER")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	req := httptest.NewRequest("GET", "/public", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	if !hasUser {
		t.Error("Expected user to be set in context with valid token")
	}
}
