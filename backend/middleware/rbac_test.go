package middleware

import (
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/handlers"
	"github.com/savora/backend/models"
)

// Test: RequireRole - No user context (401)
func TestRequireRole_NoUserContext(t *testing.T) {
	app := fiber.New()

	app.Get("/admin", RequireRole(models.RoleAdmin), func(c *fiber.Ctx) error {
		return c.SendString("Admin only")
	})

	req := httptest.NewRequest("GET", "/admin", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Errorf("Expected status 401 without user context, got %d", resp.StatusCode)
	}
}

// Test: RequireRole - Wrong role (403)
func TestRequireRole_WrongRole(t *testing.T) {
	app := fiber.New()

	app.Get("/admin", func(c *fiber.Ctx) error {
		// Manually set user context with non-admin role
		claims := &handlers.JWTClaims{
			UserID: 1,
			Email:  "customer@test.com",
			Role:   models.RoleCustomer,
		}
		c.Locals("user", claims)
		return c.Next()
	}, RequireRole(models.RoleAdmin), func(c *fiber.Ctx) error {
		return c.SendString("Admin only")
	})

	req := httptest.NewRequest("GET", "/admin", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusForbidden {
		t.Errorf("Expected status 403 for wrong role, got %d", resp.StatusCode)
	}
}

// Test: RequireRole - Correct role (200)
func TestRequireRole_CorrectRole(t *testing.T) {
	app := fiber.New()

	app.Get("/admin", func(c *fiber.Ctx) error {
		// Manually set user context with admin role
		claims := &handlers.JWTClaims{
			UserID: 1,
			Email:  "admin@test.com",
			Role:   models.RoleAdmin,
		}
		c.Locals("user", claims)
		return c.Next()
	}, RequireRole(models.RoleAdmin), func(c *fiber.Ctx) error {
		return c.SendString("Admin only")
	})

	req := httptest.NewRequest("GET", "/admin", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusOK {
		t.Errorf("Expected status 200 for correct role, got %d", resp.StatusCode)
	}
}

// Test: RequireAnyRole - No user context (401)
func TestRequireAnyRole_NoUserContext(t *testing.T) {
	app := fiber.New()

	app.Get("/restricted", RequireAnyRole(models.RoleAdmin, models.RoleUMKM), func(c *fiber.Ctx) error {
		return c.SendString("Admin or UMKM only")
	})

	req := httptest.NewRequest("GET", "/restricted", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusUnauthorized {
		t.Errorf("Expected status 401 without user context, got %d", resp.StatusCode)
	}
}

// Test: RequireAnyRole - Wrong role (403)
func TestRequireAnyRole_WrongRole(t *testing.T) {
	app := fiber.New()

	app.Get("/restricted", func(c *fiber.Ctx) error {
		// Set user context with Customer role (not in allowed list)
		claims := &handlers.JWTClaims{
			UserID: 1,
			Email:  "customer@test.com",
			Role:   models.RoleCustomer,
		}
		c.Locals("user", claims)
		return c.Next()
	}, RequireAnyRole(models.RoleAdmin, models.RoleUMKM), func(c *fiber.Ctx) error {
		return c.SendString("Admin or UMKM only")
	})

	req := httptest.NewRequest("GET", "/restricted", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusForbidden {
		t.Errorf("Expected status 403 for role not in allowed list, got %d", resp.StatusCode)
	}
}

// Test: RequireAnyRole - Correct role (first match)
func TestRequireAnyRole_CorrectRole_FirstMatch(t *testing.T) {
	app := fiber.New()

	app.Get("/restricted", func(c *fiber.Ctx) error {
		// Set user context with Admin role (first in allowed list)
		claims := &handlers.JWTClaims{
			UserID: 1,
			Email:  "admin@test.com",
			Role:   models.RoleAdmin,
		}
		c.Locals("user", claims)
		return c.Next()
	}, RequireAnyRole(models.RoleAdmin, models.RoleUMKM), func(c *fiber.Ctx) error {
		return c.SendString("Admin or UMKM only")
	})

	req := httptest.NewRequest("GET", "/restricted", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusOK {
		t.Errorf("Expected status 200 for allowed role (Admin), got %d", resp.StatusCode)
	}
}

// Test: RequireAnyRole - Correct role (second match)
func TestRequireAnyRole_CorrectRole_SecondMatch(t *testing.T) {
	app := fiber.New()

	app.Get("/restricted", func(c *fiber.Ctx) error {
		// Set user context with UMKM role (second in allowed list)
		claims := &handlers.JWTClaims{
			UserID: 2,
			Email:  "umkm@test.com",
			Role:   models.RoleUMKM,
		}
		c.Locals("user", claims)
		return c.Next()
	}, RequireAnyRole(models.RoleAdmin, models.RoleUMKM), func(c *fiber.Ctx) error {
		return c.SendString("Admin or UMKM only")
	})

	req := httptest.NewRequest("GET", "/restricted", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusOK {
		t.Errorf("Expected status 200 for allowed role (UMKM), got %d", resp.StatusCode)
	}
}

// Test: RequireAdmin shorthand - Admin role (200)
func TestRequireAdmin_AdminRole(t *testing.T) {
	app := fiber.New()

	app.Get("/admin", func(c *fiber.Ctx) error {
		claims := &handlers.JWTClaims{
			UserID: 1,
			Email:  "admin@test.com",
			Role:   models.RoleAdmin,
		}
		c.Locals("user", claims)
		return c.Next()
	}, RequireAdmin(), func(c *fiber.Ctx) error {
		return c.SendString("Admin panel")
	})

	req := httptest.NewRequest("GET", "/admin", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusOK {
		t.Errorf("Expected status 200 for Admin, got %d", resp.StatusCode)
	}
}

// Test: RequireAdmin shorthand - Non-admin role (403)
func TestRequireAdmin_NonAdminRole(t *testing.T) {
	app := fiber.New()

	app.Get("/admin", func(c *fiber.Ctx) error {
		claims := &handlers.JWTClaims{
			UserID: 2,
			Email:  "customer@test.com",
			Role:   models.RoleCustomer,
		}
		c.Locals("user", claims)
		return c.Next()
	}, RequireAdmin(), func(c *fiber.Ctx) error {
		return c.SendString("Admin panel")
	})

	req := httptest.NewRequest("GET", "/admin", nil)
	resp, err := app.Test(req)

	if err != nil {
		t.Fatalf("Failed to test: %v", err)
	}

	if resp.StatusCode != fiber.StatusForbidden {
		t.Errorf("Expected status 403 for non-Admin, got %d", resp.StatusCode)
	}
}
