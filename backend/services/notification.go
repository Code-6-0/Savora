package services

import (
	"fmt"

	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// CreateNotification - helper untuk membuat notifikasi in-app
func CreateNotification(userID uint, userRole, title, message string) error {
	notif := models.Notification{
		UserID:   userID,
		UserRole: userRole,
		Title:    title,
		Message:  message,
		IsRead:   false,
	}
	return database.DB.Create(&notif).Error
}

// NotifyNewOrder - notifikasi ke UMKM saat ada order baru
func NotifyNewOrder(order models.Order, customerName string) error {
	title := "Pesanan Baru"
	message := fmt.Sprintf("Pesanan #%d dari %s seharga Rp%.0f menunggu konfirmasi.", order.ID, customerName, order.TotalAmount)
	return CreateNotification(order.UmkmID, "umkm", title, message)
}

// NotifyOrderReady - notifikasi ke customer saat pesanan siap diambil
func NotifyOrderReady(orderID, customerID uint) error {
	title := "Pesanan Siap Diambil"
	message := fmt.Sprintf("Pesanan #%d sudah siap! Datang ke lokasi dan tunjukkan pickup code.", orderID)
	// customer_id harusnya dari order, tapi untuk sederhana kita passed parameter
	return CreateNotification(customerID, "customer", title, message)
}

// NotifyOrderCompleted - notifikasi ke customer saat pesanan selesai
func NotifyOrderCompleted(orderID, customerID uint) error {
	title := "Pesanan Selesai"
	message := fmt.Sprintf("Pesanan #%d berhasil diselesaikan. Berikan rating dan ulasan!", orderID)
	return CreateNotification(customerID, "customer", title, message)
}

// NotifyPaymentSuccess - notifikasi ke customer saat pembayaran berhasil
func NotifyPaymentSuccess(orderID, customerID uint, amount float64) error {
	title := "Pembayaran Berhasil"
	message := fmt.Sprintf("Pembayaran untuk pesanan #%d sebesar Rp%.0f berhasil diterima.", orderID, amount)
	return CreateNotification(customerID, "customer", title, message)
}

// NotifyPaymentFailed - notifikasi ke customer saat pembayaran gagal
func NotifyPaymentFailed(orderID, customerID uint) error {
	title := "Pembayaran Gagal"
	message := fmt.Sprintf("Pembayaran untuk pesanan #%d gagal. Silakan coba lagi.", orderID)
	return CreateNotification(customerID, "customer", title, message)
}

// NotifyOrderCancelled - notifikasi ke customer saat order dibatalkan
func NotifyOrderCancelled(orderID, customerID uint, reason string) error {
	title := "Pesanan Dibatalkan"
	message := fmt.Sprintf("Pesanan #%d telah dibatalkan. %s", orderID, reason)
	return CreateNotification(customerID, "customer", title, message)
}

// NotifyNoShow - notifikasi ke customer saat tidak datang ambil pesanan
func NotifyNoShow(orderID, customerID uint) error {
	title := "Pesanan Tidak Diambil"
	message := fmt.Sprintf("Pesanan #%d tidak diambil sampai batas waktu. Pesanan dibatalkan.", orderID)
	return CreateNotification(customerID, "customer", title, message)
}
