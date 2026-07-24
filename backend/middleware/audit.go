package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/handlers"
)

// AuditLog model (minimal untuk Task 1, lengkap di Task 2)
type AuditLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ActorID    uint      `json:"actor_id"` // User yang melakukan action
	Action     string    `json:"action"`   // Nama action (e.g., "VERIFY_UMKM", "SUSPEND_USER")
	TargetType string    `json:"target_type"` // Tipe entity yang dimodifikasi (e.g., "USER", "PRODUCT")
	TargetID   uint      `json:"target_id"` // ID entity yang dimodifikasi
	Note       string    `json:"note"` // Catatan tambahan
	CreatedAt  time.Time `json:"created_at"`
}

// TableName for AuditLog
func (AuditLog) TableName() string {
	return "audit_logs"
}

// AuditMiddleware logs admin actions to audit_logs table
// Call this AFTER the handler succeeds using c.Locals() to pass audit data
func AuditMiddleware(action string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Execute the handler first
		err := c.Next()
		if err != nil {
			return err // Don't log if handler failed
		}

		// Get user from context
		userLocal := c.Locals("user")
		if userLocal == nil {
			return nil // Skip audit if no user (shouldn't happen for protected routes)
		}

		claims := userLocal.(*handlers.JWTClaims)

		// Get audit data from context (set by handler)
		targetType, _ := c.Locals("audit_target_type").(string)
		targetID, _ := c.Locals("audit_target_id").(uint)
		note, _ := c.Locals("audit_note").(string)

		// Create audit log entry
		auditLog := AuditLog{
			ActorID:    claims.UserID,
			Action:     action,
			TargetType: targetType,
			TargetID:   targetID,
			Note:       note,
			CreatedAt:  time.Now(),
		}

		// Save to database (async, don't block response)
		go func() {
			database.DB.Create(&auditLog)
		}()

		return nil
	}
}

// LogAudit is a helper to manually log an audit entry (for use in handlers)
func LogAudit(actorID uint, action, targetType string, targetID uint, note string) {
	auditLog := AuditLog{
		ActorID:    actorID,
		Action:     action,
		TargetType: targetType,
		TargetID:   targetID,
		Note:       note,
		CreatedAt:  time.Now(),
	}

	go func() {
		database.DB.Create(&auditLog)
	}()
}

// Helper to auto-migrate audit_logs table
func InitAuditLog() {
	database.DB.AutoMigrate(&AuditLog{})
}
