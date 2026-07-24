package models

import (
	"time"
)

// HelpTicketCategory enum values (PRD Section 14.7 - 7 kategori PERSIS wording)
const (
	CategoryProductNotAvailable      = "Produk tidak tersedia saat pickup"
	CategoryNotMatchDescription      = "Produk tidak sesuai deskripsi/foto"
	CategoryUMKMNotResponsive        = "UMKM tidak merespons"
	CategoryPickupIssue              = "Terjadi kendala saat pickup"
	CategoryOrderCancelled           = "Order dibatalkan sepihak"
	CategoryPaymentSuccessNoCode     = "Pembayaran Midtrans sandbox berhasil tetapi pickup code tidak muncul"
	CategoryPaymentFailedOrExpired   = "Pembayaran Midtrans sandbox gagal/expired atau status tidak berubah"
)

// HelpTicketStatus enum values
const (
	TicketStatusOpen       = "OPEN"
	TicketStatusInProgress = "IN_PROGRESS"
	TicketStatusResolved   = "RESOLVED"
	TicketStatusClosed     = "CLOSED"
)

// HelpTicket represents customer help/support ticket (PRD Section 18)
type HelpTicket struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	OrderID     *uint      `gorm:"index" json:"order_id"` // FK opsional ke orders
	ReporterID  uint       `gorm:"not null;index" json:"reporter_id"` // FK ke users (customer)
	Category    string     `gorm:"size:100;not null" json:"category"` // Kategori kendala (gunakan enum constants)
	Description string     `gorm:"type:text;not null" json:"description"` // Detail kendala
	ProofURL    string     `gorm:"size:500" json:"proof_url"` // URL foto bukti (opsional)
	Status      string     `gorm:"size:50;default:OPEN" json:"status"` // OPEN, IN_PROGRESS, RESOLVED, CLOSED
	AdminNote   string     `gorm:"type:text" json:"admin_note"` // Catatan/respons admin
	CreatedAt   time.Time  `gorm:"index" json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	// Relations
	Reporter User   `gorm:"foreignKey:ReporterID" json:"reporter,omitempty"`
	Order    *Order `gorm:"foreignKey:OrderID" json:"order,omitempty"`
}

// AuditLog represents system audit trail for admin actions (PRD Section 18)
// Tracks all critical admin operations for compliance and accountability
type AuditLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ActorID    uint      `gorm:"not null;index" json:"actor_id"` // FK ke users (admin yang melakukan aksi)
	Action     string    `gorm:"size:100;not null" json:"action"` // approve_umkm, suspend_listing, anulir_keyword, etc
	TargetType string    `gorm:"size:50;not null" json:"target_type"` // order, review, product, user, etc
	TargetID   uint      `gorm:"not null;index" json:"target_id"` // ID dari target yang diakses
	Note       string    `gorm:"type:text" json:"note"` // Catatan tambahan/alasan
	CreatedAt  time.Time `gorm:"index" json:"created_at"`

	// Relations
	Actor User `gorm:"foreignKey:ActorID" json:"actor,omitempty"`
}

// TableName specifies custom table name for HelpTicket
func (HelpTicket) TableName() string {
	return "help_tickets"
}

// TableName specifies custom table name for AuditLog
func (AuditLog) TableName() string {
	return "audit_logs"
}
