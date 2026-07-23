package models

import (
	"time"
)

type MitraDonasiProfile struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	UserID             uint      `json:"user_id" gorm:"uniqueIndex"`
	OrgName            string    `json:"org_name"`
	Phone              string    `json:"phone"`
	Address            string    `json:"address"`
	Description        string    `json:"description,omitempty"`
	DocumentURL        string    `json:"document_url,omitempty"` // dokumen legalitas
	VerificationStatus string    `json:"verification_status"`    // PENDING, APPROVED, REJECTED
	VerifiedAt         *time.Time `json:"verified_at,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	// Relations
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type HelpTicket struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	OrderID     uint      `json:"order_id"`
	ReporterID  uint      `json:"reporter_id"`     // customer_id
	Category    string    `json:"category"`        // produk_tidak_tersedia, tidak_sesuai_deskripsi, umkm_tidak_merespons, kendala_pickup, pembayaran_bermasalah
	Description string    `json:"description" gorm:"type:text"`
	ProofURL    string    `json:"proof_url,omitempty"` // foto bukti
	Status      string    `json:"status"`              // OPEN, IN_PROGRESS, RESOLVED, CLOSED
	AdminNote   string    `json:"admin_note,omitempty" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Order    Order `json:"order,omitempty" gorm:"foreignKey:OrderID"`
	Reporter User  `json:"reporter,omitempty" gorm:"foreignKey:ReporterID"`
}

type AuditLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ActorID    uint      `json:"actor_id"`    // user_id yang melakukan aksi
	Action     string    `json:"action"`      // approve_umkm, suspend_listing, anulir_keyword, etc
	TargetType string    `json:"target_type"` // order, review, product, user, etc
	TargetID   uint      `json:"target_id"`
	Note       string    `json:"note,omitempty" gorm:"type:text"`
	CreatedAt  time.Time `json:"created_at"`

	// Relations
	Actor User `json:"actor,omitempty" gorm:"foreignKey:ActorID"`
}
