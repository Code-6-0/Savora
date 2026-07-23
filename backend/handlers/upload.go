package handlers

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// UploadImage - Upload gambar ke Supabase Storage
// Endpoint: POST /api/upload/image
// Body: { "image": "data:image/jpeg;base64,..." } atau multipart/form-data
func UploadImage(c *fiber.Ctx) error {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	bucketName := os.Getenv("SUPABASE_BUCKET_NAME")

	if supabaseURL == "" || supabaseKey == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Supabase credentials not configured",
		})
	}

	if bucketName == "" {
		bucketName = "savora_img" // Default bucket name
	}

	// Try to parse as JSON (base64 string from frontend)
	type ImagePayload struct {
		Image string `json:"image"` // Base64 data URI or raw base64
	}

	var payload ImagePayload
	if err := c.BodyParser(&payload); err == nil && payload.Image != "" {
		// Handle base64 upload
		return handleBase64Upload(c, payload.Image, supabaseURL, supabaseKey, bucketName)
	}

	// Try to parse as multipart/form-data
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No image provided. Send 'image' field as base64 JSON or multipart form-data",
		})
	}

	return handleMultipartUpload(c, file, supabaseURL, supabaseKey, bucketName)
}

func handleBase64Upload(c *fiber.Ctx, imageData, supabaseURL, supabaseKey, bucketName string) error {
	// Parse data URI (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
	var contentType string
	var base64Data string

	if strings.HasPrefix(imageData, "data:") {
		parts := strings.SplitN(imageData, ",", 2)
		if len(parts) != 2 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid data URI format"})
		}
		// Extract content type from "data:image/jpeg;base64"
		header := parts[0]
		if strings.Contains(header, "image/jpeg") || strings.Contains(header, "image/jpg") {
			contentType = "image/jpeg"
		} else if strings.Contains(header, "image/png") {
			contentType = "image/png"
		} else if strings.Contains(header, "image/webp") {
			contentType = "image/webp"
		} else {
			contentType = "image/jpeg" // Default
		}
		base64Data = parts[1]
	} else {
		// Assume raw base64 without data URI prefix
		base64Data = imageData
		contentType = "image/jpeg" // Default
	}

	// Decode base64
	imgBytes, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid base64 encoding"})
	}

	// Generate unique filename
	ext := ".jpg"
	if contentType == "image/png" {
		ext = ".png"
	} else if contentType == "image/webp" {
		ext = ".webp"
	}
	filename := fmt.Sprintf("products/%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)

	// Upload to Supabase Storage
	publicURL, err := uploadToSupabase(imgBytes, filename, contentType, supabaseURL, supabaseKey, bucketName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"url":      publicURL,
		"filename": filename,
	})
}

func handleMultipartUpload(c *fiber.Ctx, file *multipart.FileHeader, supabaseURL, supabaseKey, bucketName string) error {
	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Cannot open uploaded file"})
	}
	defer src.Close()

	// Read file bytes
	imgBytes, err := io.ReadAll(src)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Cannot read file"})
	}

	// Detect content type
	contentType := http.DetectContentType(imgBytes)
	if !strings.HasPrefix(contentType, "image/") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "File must be an image"})
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".jpg"
	}
	filename := fmt.Sprintf("products/%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)

	// Upload to Supabase Storage
	publicURL, err := uploadToSupabase(imgBytes, filename, contentType, supabaseURL, supabaseKey, bucketName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"url":      publicURL,
		"filename": filename,
	})
}

func uploadToSupabase(imgBytes []byte, filename, contentType, supabaseURL, supabaseKey, bucketName string) (string, error) {
	// Supabase Storage API endpoint
	uploadURL := fmt.Sprintf("%s/storage/v1/object/%s/%s", supabaseURL, bucketName, filename)

	// Create HTTP request
	req, err := http.NewRequest("POST", uploadURL, bytes.NewReader(imgBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "true") // Allow overwrite if file exists

	// Execute request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("upload request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("upload failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Construct public URL
	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", supabaseURL, bucketName, filename)
	return publicURL, nil
}
