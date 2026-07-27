package handlers

import (
	"time"

	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/models"
	"github.com/savora/backend/services"
)

type OrderHandler struct {
	xenditService *services.XenditService
}

func NewOrderHandler(xendit *services.XenditService) *OrderHandler {
	return &OrderHandler{
		xenditService: xendit,
	}
}

// CreateOrder - POST /orders (Customer checkout)
func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	db := services.GetDB()

	// Extract customerID dari JWT middleware
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized: token tidak valid",
		})
	}

	claims := userLocal.(*JWTClaims)
	customerID := claims.UserID

	var req services.CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body: " + err.Error(),
		})
	}

	// Validasi manual (Fiber tidak support tag binding: seperti Gin)
	if req.ProductID == 0 {
		return c.Status(422).JSON(fiber.Map{
			"error": "Product ID wajib diisi",
		})
	}
	if req.Quantity < 1 {
		return c.Status(422).JSON(fiber.Map{
			"error": "Jumlah harus minimal 1",
		})
	}
	if req.BillingName == "" {
		return c.Status(422).JSON(fiber.Map{
			"error": "Nama pemesan wajib diisi",
		})
	}
	if req.BillingPhone == "" {
		return c.Status(422).JSON(fiber.Map{
			"error": "Nomor telepon wajib diisi",
		})
	}

	response, err := services.CreateOrder(db, customerID, req, h.xenditService)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(201).JSON(response)
}

// GetOrders - GET /orders (list order by role)
func (h *OrderHandler) GetOrders(c *fiber.Ctx) error {
	db := services.GetDB()

	// Extract user dari JWT (role-based filtering)
	userLocal := c.Locals("user")
	if userLocal == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized: token tidak valid",
		})
	}

	claims := userLocal.(*JWTClaims)
	userID := claims.UserID
	role := claims.Role

	var orders []models.Order
	query := db.Preload("Product").Preload("Customer").Order("created_at desc")

	// Role-based filtering (case-insensitive)
	roleUpper := strings.ToUpper(role)
	if roleUpper == "CUSTOMER" {
		// Customer hanya lihat order miliknya sendiri
		query = query.Where("customer_id = ?", userID)
	} else if roleUpper == "ADMIN" {
		// Admin lihat semua order (tidak ada filter)
	} else {
		// Role lain tidak punya akses ke orders
		return c.Status(403).JSON(fiber.Map{
			"error": "Forbidden: role tidak memiliki akses ke orders",
		})
	}

	if err := query.Find(&orders).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(orders)
}

// GetOrderDetail - GET /orders/:id
func (h *OrderHandler) GetOrderDetail(c *fiber.Ctx) error {
	db := services.GetDB()
	id := c.Params("id")

	var order models.Order
	if err := db.Preload("Product").Preload("Customer").Preload("Payment").First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Order tidak ditemukan",
		})
	}

	// DTO response untuk tidak bocorkan data sensitif customer
	type OrderDetailResponse struct {
		ID             uint       `json:"id"`
		ProductID      uint       `json:"product_id"`
		CustomerID     uint       `json:"customer_id"`
		Quantity       int        `json:"quantity"`
		Subtotal       float64    `json:"subtotal"`
		ServiceFee     float64    `json:"service_fee"`
		TotalPrice     float64    `json:"total_price"`
		PaymentMethod  string     `json:"payment_method"`
		PaymentStatus  string     `json:"payment_status"`
		PickupCode     *string    `json:"pickup_code,omitempty"`
		ReservedUntil  time.Time  `json:"reserved_until"`
		PickupDeadline *time.Time `json:"pickup_deadline,omitempty"`
		Status         string     `json:"status"`
		CancelReason   string     `json:"cancel_reason,omitempty"`
		CreatedAt      time.Time  `json:"created_at"`
		PaidAt         *time.Time `json:"paid_at,omitempty"`
		CompletedAt    *time.Time `json:"completed_at,omitempty"`

		// Relations (selective fields only)
		Product      models.Product  `json:"product,omitempty"`
		CustomerName string          `json:"customer_name"`
		Payment      *models.Payment `json:"payment,omitempty"`
	}

	response := OrderDetailResponse{
		ID:             order.ID,
		ProductID:      order.ProductID,
		CustomerID:     order.CustomerID,
		Quantity:       order.Quantity,
		Subtotal:       order.Subtotal,
		ServiceFee:     order.ServiceFee,
		TotalPrice:     order.TotalPrice,
		PaymentMethod:  order.PaymentMethod,
		PaymentStatus:  order.PaymentStatus,
		PickupCode:     order.PickupCode,
		ReservedUntil:  order.ReservedUntil,
		PickupDeadline: order.PickupDeadline,
		Status:         order.Status,
		CancelReason:   order.CancelReason,
		CreatedAt:      order.CreatedAt,
		PaidAt:         order.PaidAt,
		CompletedAt:    order.CompletedAt,
		Product:        order.Product,
		CustomerName:   order.Customer.Name,
		Payment:        order.Payment,
	}

	return c.JSON(response)
}

// UpdateOrderStatus - PATCH /orders/:id/status (UMKM/Admin)
func (h *OrderHandler) UpdateOrderStatus(c *fiber.Ctx) error {
	db := services.GetDB()
	id := c.Params("id")

	type Request struct {
		Status string `json:"status"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validasi transisi khusus: Paid -> Ready for Pickup (REVISI #8)
	if req.Status == models.OrderReadyForPickup {
		var order models.Order
		if err := db.First(&order, id).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{
				"error": "Order tidak ditemukan",
			})
		}

		if order.Status != models.OrderPaid {
			return c.Status(400).JSON(fiber.Map{
				"error": "Order harus berstatus Paid untuk diubah menjadi Ready for Pickup",
			})
		}

		order.Status = models.OrderReadyForPickup
		res := db.Model(&models.Order{}).
			Where("id = ? AND status = ?", order.ID, models.OrderPaid).
			Updates(map[string]interface{}{
				"status": models.OrderReadyForPickup,
			})

		if res.Error != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": res.Error.Error(),
			})
		}

		if res.RowsAffected == 0 {
			return c.Status(400).JSON(fiber.Map{
				"error": "Order sudah diproses atau status berubah",
			})
		}

		// Refresh order untuk response
		db.First(&order, id)

		return c.JSON(fiber.Map{
			"message": "Order siap diambil",
			"order":   order,
		})
	}

	// Transisi lain (mis. No Show)
	var order models.Order
	if err := db.First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Order tidak ditemukan",
		})
	}

	if err := services.TransitionOrderStatus(db, order.ID, req.Status); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Status order berhasil diupdate",
	})
}

// ValidatePickupCode - POST /orders/:id/validate-pickup (UMKM)
func (h *OrderHandler) ValidatePickupCode(c *fiber.Ctx) error {
	db := services.GetDB()
	id := c.Params("id")

	type Request struct {
		PickupCode string `json:"pickup_code"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var order models.Order
	if err := db.First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Order tidak ditemukan",
		})
	}

	// Validasi pickup code (handle pointer type)
	if order.PickupCode == nil || *order.PickupCode != req.PickupCode {
		return c.Status(400).JSON(fiber.Map{
			"error": "Pickup code tidak valid",
		})
	}

	// Validasi status order
	if order.Status != models.OrderReadyForPickup {
		return c.Status(400).JSON(fiber.Map{
			"error": "Order belum siap diambil",
		})
	}

	// Update ke Completed dengan Updates untuk hindari duplicate key issue
	now := c.Context().Time()
	res := db.Model(&models.Order{}).
		Where("id = ? AND status = ?", order.ID, models.OrderReadyForPickup).
		Updates(map[string]interface{}{
			"status":       models.OrderCompleted,
			"completed_at": now,
		})

	if res.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": res.Error.Error(),
		})
	}

	if res.RowsAffected == 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Order sudah diproses atau status berubah",
		})
	}

	// Refresh order untuk response
	db.First(&order, id)

	return c.JSON(fiber.Map{
		"message": "Pickup berhasil, order selesai",
		"order":   order,
	})
}

// Standalone function stubs for routes.go compatibility
func GetOrdersByUMKM(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{"error": "Not implemented"})
}

func UpdateOrderStatus(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{"error": "Not implemented - use OrderHandler.UpdateOrderStatus"})
}
