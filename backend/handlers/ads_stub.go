package handlers

import "github.com/gofiber/fiber/v2"

// TODO(iklan-soon): dinonaktifkan sementara, menunggu penyesuaian ke model Advertisement PRD — koordinasi PIC iklan

// AdComingSoonStub is a temporary stub handler for all ad-related endpoints
// Returns HTTP 501 (Not Implemented) with a "Coming Soon" message
// Used to unblock the build while the ads module is being reworked to comply with PRD Section 18
func AdComingSoonStub(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(APIResponse{
		Success: false,
		Data:    nil,
		Error:   &ErrorInfo{Code: "COMING_SOON", Message: "Fitur iklan segera hadir"},
	})
}
