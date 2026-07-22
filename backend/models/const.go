package models

// User roles
const (
	RoleCustomer    = "CUSTOMER"
	RoleUmkm        = "UMKM"
	RoleAdmin       = "ADMIN"
	RoleMitraDonasi = "MITRA_DONASI"
)

// Order statuses
const (
	OrderCreated          = "CREATED"
	OrderPaymentPending   = "PAYMENT_PENDING"
	OrderPaid             = "PAID"
	OrderPaymentFailed    = "PAYMENT_FAILED"
	OrderReadyForPickup   = "READY_FOR_PICKUP"
	OrderCompleted        = "COMPLETED"
	OrderNoShow           = "NO_SHOW"
	OrderCancelled        = "CANCELLED"
	OrderExpired          = "EXPIRED"
	OrderHelpRequested    = "HELP_REQUESTED"
)

// Payment methods
const (
	PaymentMethodXenditSandbox = "XENDIT_SANDBOX"
)

// Payment statuses
const (
	PaymentUnpaid   = "UNPAID"
	PaymentPending  = "PENDING"
	PaymentPaid     = "PAID"
	PaymentFailed   = "FAILED"
	PaymentExpired  = "EXPIRED"
)

// Keyword levels for safety badge
const (
	KeywordAman    = "AMAN"
	KeywordWarning = "WARNING"
	KeywordGawat   = "GAWAT"
)

// Verification statuses
const (
	VerificationPending  = "PENDING"
	VerificationApproved = "APPROVED"
	VerificationRejected = "REJECTED"
)
