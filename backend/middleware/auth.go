package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/savora/backend/handlers"
)

// AuthMiddleware verifies JWT token and sets user claims in context
func AuthMiddleware(c *fiber.Ctx) error {
	// Get Authorization header
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(handlers.APIResponse{
			Success: false,
			Data:    nil,
			Error:   &handlers.ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak ditemukan. Silakan login terlebih dahulu"},
		})
	}

	// Extract token from "Bearer <token>" format
	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		return c.Status(fiber.StatusUnauthorized).JSON(handlers.APIResponse{
			Success: false,
			Data:    nil,
			Error:   &handlers.ErrorInfo{Code: "UNAUTHORIZED", Message: "Format token tidak valid. Gunakan format: Bearer <token>"},
		})
	}

	tokenString := tokenParts[1]

	// Parse and validate token
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "savora-secret-key-change-in-production" // Default untuk development
	}

	token, err := jwt.ParseWithClaims(tokenString, &handlers.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fiber.NewError(fiber.StatusUnauthorized, "Metode signing token tidak valid")
		}
		return []byte(secret), nil
	})

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(handlers.APIResponse{
			Success: false,
			Data:    nil,
			Error:   &handlers.ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid atau sudah kadaluarsa"},
		})
	}

	// Extract claims
	claims, ok := token.Claims.(*handlers.JWTClaims)
	if !ok || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(handlers.APIResponse{
			Success: false,
			Data:    nil,
			Error:   &handlers.ErrorInfo{Code: "UNAUTHORIZED", Message: "Token tidak valid"},
		})
	}

	// Store user claims in context for downstream handlers
	c.Locals("user", claims)

	return c.Next()
}

// OptionalAuthMiddleware is like AuthMiddleware but doesn't fail if no token
// Useful for endpoints that work both with and without authentication
func OptionalAuthMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Next() // No token, continue without setting user context
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		return c.Next() // Invalid format, continue without setting user context
	}

	tokenString := tokenParts[1]
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "savora-secret-key-change-in-production"
	}

	token, err := jwt.ParseWithClaims(tokenString, &handlers.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid signing method")
		}
		return []byte(secret), nil
	})

	if err == nil {
		if claims, ok := token.Claims.(*handlers.JWTClaims); ok && token.Valid {
			c.Locals("user", claims)
		}
	}

	return c.Next()
}
