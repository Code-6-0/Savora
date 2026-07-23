package services

import (
	"fmt"

	"github.com/savora/backend/models"
)

// CreateNotification - helper untuk membuat notifikasi in-app
func CreateNotification(userID uint, userRole, title, message string) error {
	db := GetDB()
	notif := models.Notification{
		UserID:    userID,
		UserRole:  userRole,
		Title:     title,
		Message:   message,
		IsRead:    false,
	}
	return db.Create(&notif).Error
}

// NotifyNewOrder - notifikasi ke UMKM saat ada order baru
func NotifyNewOrder(order models.Order, customerName string) error {
	db := GetDB()
	
	// Get product untuk UMKM info
	var product models.Product
	if err := db.First(&product, order.ProductID).Error; err != nil {
		return err
	}

	title := "Pesanan Baru"
	message := fmt.Sprintf("Pesanan #%d dari customer seharga Rp%.0f menunggu konfirmasi.", order.ID, order.TotalPrice)
	return CreateNotification(product.UmkmID, "UMKM", title, message)
}

// NotifyOrderPaid - notifikasi ke customer saat pembayaran berhasil
func NotifyOrderPaid(orderID, customerID uint) error {
	title := "Pembayaran Berhasil"
	message := fmt.Sprintf("Pesanan #%d sudah dibayar. Ambil di UMKM sesuai pickup code.", orderID)
	return CreateNotification(customerID, "CUSTOMER", title, message)
}

// NotifyOrderReady - notifikasi ke customer saat pesanan siap diambil
func NotifyOrderReady(orderID, customerID uint) error {
	title := "Pesanan Siap Diambil"
	message := fmt.Sprintf("Pesanan #%d sudah siap diambil di UMKM.", orderID)
	return CreateNotification(customerID, "CUSTOMER", title, message)
}

// NotifyOrderCompleted - notifikasi ke customer saat pickup selesai
func NotifyOrderCompleted(orderID, customerID uint) error {
	title := "Pickup Selesai"
	message := fmt.Sprintf("Pesanan #%d telah diambil. Silakan beri rating & review.", orderID)
	return CreateNotification(customerID, "CUSTOMER", title, message)
}

// NotifyPaymentExpired - notifikasi ke customer saat pembayaran expired
func NotifyPaymentExpired(orderID, customerID uint) error {
	title := "Pembayaran Expired"
	message := fmt.Sprintf("Pembayaran untuk pesanan #%d sudah expired. Stok dikembalikan.", orderID)
	return CreateNotification(customerID, "CUSTOMER", title, message)
}

// NotifyNoShow - notifikasi ke UMKM saat customer no-show
func NotifyNoShow(order models.Order, umkmID uint) error {
	title := "Order No-Show"
	message := fmt.Sprintf("Pesanan #%d tidak diambil melampaui batas waktu.", order.ID)
	return CreateNotification(umkmID, "UMKM", title, message)
}
