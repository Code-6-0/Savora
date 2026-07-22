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
