/**
 * Orders API Helper
 * Handles order creation and retrieval for Savora checkout flow
 */

import { apiPost, apiGet } from './api.js';

/**
 * Create order and get Midtrans payment token
 * @param {Object} orderData - Order data from checkout form
 * @returns {Promise<Object>} Order response with payment URL
 */
export async function createOrder(orderData) {
  // Validasi & konversi tipe di boundary API
  const productId = Number(orderData.productId);
  const quantity = parseInt(orderData.quantity, 10);

  // Guard: product_id harus integer positif
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error('Product ID tidak valid');
  }

  // Guard: quantity harus integer >= 1
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Jumlah harus minimal 1');
  }

  // apiFetch otomatis tambah prefix /api, stringify body, dan handle error
  return apiFetch('/orders', {
    method: 'POST',
    body: {
      product_id: productId,        // number, bukan string
      quantity: quantity,            // number, sudah divalidasi
      billing_name: orderData.billingName,
      billing_email: orderData.billingEmail,
      billing_phone: orderData.billingPhone,
      customer_note: orderData.customerNote || '',
    },
  });
}

/**
 * Get order detail by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order detail with payment status
 */
export async function getOrderDetail(orderId) {
  return apiFetch(`/orders/${orderId}`);
}

/**
 * Normalize order response for frontend consumption
 * @param {Object} order - Raw order from API
 * @returns {Object} Normalized order data
 */
export function normalizeOrder(order) {
  return {
    id: order.id || order.order_id,
    status: order.status,
    paymentStatus: order.payment_status,
    paymentUrl: order.payment?.payment_url || order.payment_url || order.invoice_url,
    pickupCode: order.pickup_code,
    pickupDeadline: order.pickup_deadline,
    reservedUntil: order.reserved_until,
    subtotal: order.subtotal,
    serviceFee: order.service_fee,
    totalPrice: order.total_price,
    product: order.product ? {
      id: order.product.id,
      name: order.product.name,
      rescuePrice: order.product.rescue_price,
      pickupAddress: order.product.pickup_address,
      photoUrl: order.product.photo_url,
    } : null,
  };
}

// Modul Manajemen Pesanan UMKM
//
// Membaca data pesanan dari backend Go (services/order.go) dengan pola
// fetch + fallback demo lokal agar UI tetap jalan saat backend belum tersedia.

const DEFAULT_UMKM_ID = 1;

// Fallback demo (dipakai bila API belum tersedia/mati).
export const fallbackOrders = [
  { id: "SVR-0892", customer: "Rina Marlina", phone: "0812-3456-7890", items: [{name: "Nasi Padang Box", qty: 3, price: 25000}], total: 75000, status: "Menunggu", time: "13:45", date: "9 Jul 2026", payment: "GoPay" },
  { id: "SVR-0891", customer: "Budi Santoso", phone: "0811-2233-4455", items: [{name: "Mie Ayam Spesial", qty: 2, price: 24000}], total: 48000, status: "Diproses", time: "13:20", date: "9 Jul 2026", payment: "OVO" },
  { id: "SVR-0890", customer: "Dewi Rahayu", phone: "0899-8877-6655", items: [{name: "Paket Sarapan", qty: 4, price: 24000}], total: 96000, status: "Siap Diambil", time: "12:55", date: "9 Jul 2026", payment: "ShopeePay" },
  { id: "SVR-0889", customer: "Ahmad Fauzi", phone: "0877-6655-4433", items: [{name: "Nasi Box Campur", qty: 1, price: 22000}], total: 22000, status: "Selesai", time: "12:30", date: "9 Jul 2026", payment: "Tunai" },
  { id: "SVR-0888", customer: "Siti Nurhaliza", phone: "0855-4433-2211", items: [{name: "Kue Basah Assorted", qty: 6, price: 9000}], total: 54000, status: "Dibatalkan", time: "11:45", date: "9 Jul 2026", payment: "DANA" },
];

/**
 * Pemetaan status pesanan dari Backend (Eng) ke UI (Indo)
 */
const statusMap = {
  "CREATED": "Menunggu Pembayaran",
  "PAYMENT_PENDING": "Menunggu Pembayaran",
  "PAID": "Diproses",
  "PAYMENT_FAILED": "Gagal Bayar",
  "READY_FOR_PICKUP": "Siap Diambil",
  "COMPLETED": "Selesai",
  "NO_SHOW": "Tidak Diambil",
  "CANCELLED": "Dibatalkan",
  "EXPIRED": "Kedaluwarsa",
  "HELP_REQUESTED": "Butuh Bantuan",
  "DONATED": "Didonasikan"
};

/**
 * Normalisasi data pesanan dari backend agar cocok dengan field UI UMKM.
 */
export function normalizeUMKMOrder(raw) {
  const base = raw || {};
  
  // Format waktu dan tanggal sederhana dari created_at
  let timeStr = "12:00";
  let dateStr = "9 Jul 2026";
  if (base.created_at) {
    const d = new Date(base.created_at);
    timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Jika relasi Product tidak di-load, fallback nama item
  const productName = base.product ? base.product.name : "Produk Makanan";
  const productPrice = base.product ? (base.product.rescue_price || base.product.original_price) : 0;

  // Extract payment method dari berbagai kemungkinan field
  let paymentMethod = "Belum Tersedia";
  if (base.payment_method) {
    paymentMethod = base.payment_method;
  } else if (base.payment && base.payment.method) {
    paymentMethod = base.payment.method;
  }

  return {
    id: `SVR-${String(base.id || 0).padStart(4, '0')}`,
    original_id: base.id, // simpan ID asli untuk update
    backend_status: base.status, // simpan status backend asli
    customer: base.user ? base.user.name : "Pelanggan Guest",
    phone: base.user ? base.user.phone : "0812-XXXX-XXXX",
    items: [{ name: productName, qty: base.quantity || 1, price: productPrice }],
    total: base.total_price ? Number(base.total_price) : 0,
    status: statusMap[base.status] || "Menunggu Pembayaran",
    time: timeStr,
    date: dateStr,
    payment: paymentMethod,
  };
}

/**
 * Ambil daftar pesanan UMKM dari backend.
 */
export async function fetchUMKMOrders(umkmId = DEFAULT_UMKM_ID) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  try {
    // apiFetch otomatis tambah prefix /api dan handle error
    const data = await apiFetch('/orders');

    // Handle response format: array langsung atau { data: [...] }
    const orders = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);

    // Filter orders by UMKM ID (client-side filtering karena backend belum support)
    const filteredData = orders.filter(order =>
      order.product && order.product.umkm_id === umkmId
    );

    // Array kosong adalah hasil VALID, bukan error
    return filteredData.map(normalizeUMKMOrder);
  } catch (error) {
    // Hanya gunakan fallback jika NEXT_PUBLIC_USE_MOCK=true
    if (useMock) {
      console.warn("Using fallback orders:", error.message);
      return fallbackOrders;
    }
    // Jika tidak mock, lempar error ke komponen
    throw error;
  }
}

/**
 * Update status pesanan via API.
 * @param {number} orderId - ID numerik asli pesanan (bukan string SVR-xxxx)
 * @param {string} backendStatus - Status backend (PAID, READY_FOR_PICKUP, dll)
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function updateOrderStatus(orderId, backendStatus) {
  try {
    await apiFetch(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: { status: backendStatus }
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Gagal terhubung ke server"
    };
  }
}

/**
 * Transisi status yang diizinkan untuk UMKM sesuai backend state machine.
 * UMKM hanya boleh: PAID → READY_FOR_PICKUP, READY_FOR_PICKUP → COMPLETED
 */
export const allowedUmkmTransitions = {
  "PAID": ["READY_FOR_PICKUP"],
  "READY_FOR_PICKUP": ["COMPLETED"]
};

/**
 * Cek apakah transisi dari status A ke B diizinkan untuk UMKM.
 * @param {string} fromStatus - Status backend saat ini
 * @param {string} toStatus - Status backend tujuan
 * @returns {boolean}
 */
export function canTransition(fromStatus, toStatus) {
  const allowed = allowedUmkmTransitions[fromStatus] || [];
  return allowed.includes(toStatus);
}