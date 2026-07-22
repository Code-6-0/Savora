package models

import (
	"time"
)

// HelpTicketCategory enum values
const (
	CategoryProductNotAvailable = "PRODUK_TIDAK_TERSEDIA"
	CategoryNotMatchDescription = "TIDAK_SESUAI_DESKRIPSI"
	CategoryUMKMNotResponsive   = "UMKM_TIDAK_MERESPONS"
	CategoryPickupIssue         = "KENDALA_PICKUP"
	CategoryPaymentIssue        = "PAYMENT_BERMASALAH"
	CategoryOther               = "LAINNYA"
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
	Category    string     `gorm:"size:50;not null" json:"category"` // Kategori kendala
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

// TableName specifies custom table name
func (HelpTicket) TableName() string {
	return "help_tickets"
}
