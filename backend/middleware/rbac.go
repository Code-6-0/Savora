package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/handlers"
	"github.com/savora/backend/models"
)

// RequireAdmin middleware ensures only ADMIN role can access the route
func RequireAdmin() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user claims from context (set by AuthMiddleware)
		userLocal := c.Locals("user")
		if userLocal == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(handlers.APIResponse{
				Success: false,
				Data:    nil,
				Error:   &handlers.ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
			})
		}

		claims := userLocal.(*handlers.JWTClaims)

		// Check if user is admin
		if claims.Role != models.RoleAdmin {
			return c.Status(fiber.StatusForbidden).JSON(handlers.APIResponse{
				Success: false,
				Data:    nil,
				Error:   &handlers.ErrorInfo{Code: "FORBIDDEN", Message: "Akses ditolak. Hanya admin yang dapat mengakses fitur ini"},
			})
		}

		return c.Next()
	}
}

// RequireRoles middleware ensures user has one of the allowed roles
func RequireRoles(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userLocal := c.Locals("user")
		if userLocal == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(handlers.APIResponse{
				Success: false,
				Data:    nil,
				Error:   &handlers.ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
			})
		}

		claims := userLocal.(*handlers.JWTClaims)

		// Check if user role is in allowed roles
		for _, role := range allowedRoles {
			if claims.Role == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(handlers.APIResponse{
			Success: false,
			Data:    nil,
			Error:   &handlers.ErrorInfo{Code: "FORBIDDEN", Message: "Akses ditolak. Anda tidak memiliki izin untuk mengakses fitur ini"},
		})
	}
}

// RequireRole is an alias for RequireRoles with a single role (for backward compatibility with Task 1 tests)
func RequireRole(role string) fiber.Handler {
	return RequireRoles(role)
}

// RequireAnyRole is an alias for RequireRoles (for backward compatibility with Task 1 tests)
func RequireAnyRole(roles ...string) fiber.Handler {
	return RequireRoles(roles...)
}
