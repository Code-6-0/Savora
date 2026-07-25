/**
 * Orders API Helper
 * Handles order creation and retrieval for Savora checkout flow
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create order and get Xendit invoice
 * @param {Object} orderData - Order data from checkout form
 * @returns {Promise<Object>} Order response with invoice URL
 */
export async function createOrder(orderData) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: orderData.productId,
      quantity: orderData.quantity,
      billing_name: orderData.billingName,
      billing_email: orderData.billingEmail,
      billing_phone: orderData.billingPhone,
      customer_note: orderData.customerNote || '',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get order detail by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order detail with payment status
 */
export async function getOrderDetail(orderId) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
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
    paymentUrl: order.payment_url || order.invoice_url,
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
  "CREATED": "Menunggu",
  "PAYMENT_PENDING": "Menunggu",
  "PAID": "Diproses",
  "READY_FOR_PICKUP": "Siap Diambil",
  "COMPLETED": "Selesai",
  "CANCELLED": "Dibatalkan",
  "DONATED": "Didonasikan"
};

/**
 * Pemetaan status pesanan dari UI (Indo) ke Backend (Eng)
 */
const reverseStatusMap = {
  "Menunggu": "CREATED",
  "Diproses": "PAID",
  "Siap Diambil": "READY_FOR_PICKUP",
  "Selesai": "COMPLETED",
  "Dibatalkan": "CANCELLED",
  "Didonasikan": "DONATED"
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

  return {
    id: `SVR-${String(base.id || 0).padStart(4, '0')}`,
    original_id: base.id, // simpan ID asli untuk update
    customer: base.user ? base.user.name : "Pelanggan Guest",
    phone: base.user ? base.user.phone : "0812-XXXX-XXXX",
    items: [{ name: productName, qty: base.quantity || 1, price: productPrice }],
    total: base.total_price ? Number(base.total_price) : 0,
    status: statusMap[base.status] || "Menunggu",
    time: timeStr,
    date: dateStr,
    payment: "GoPay", // Mock payment method
  };
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
}

/**
 * Ambil daftar pesanan UMKM. Fallback ke demo lokal bila API gagal.
 */
export async function fetchUMKMOrders(umkmId = DEFAULT_UMKM_ID) {
  try {
    // TODO: backend belum punya filter per-UMKM; sementara ambil semua orders
const response = await fetch(`${baseUrl()}/orders`);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      throw new Error("Orders API tidak tersedia");
    }
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Respons orders tidak valid");
    
    // Jika backend kosong (array length 0), kita bisa lempar error agar fallback ke dummy berjalan
    if (data.length === 0) {
      throw new Error("Database kosong, fallback ke dummy");
    }

    return data.map(normalizeUMKMOrder);
  } catch (error) {
    console.warn("Using fallback orders:", error.message);
    return fallbackOrders;
  }
}

/**
 * Update status pesanan via API.
 */
export async function updateOrderStatus(orderId, uiStatus) {
  const backendStatus = reverseStatusMap[uiStatus] || uiStatus;
  try {
    const response = await fetch(`${baseUrl()}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: backendStatus })
    });
    if (!response.ok) {
      throw new Error("Gagal mengupdate pesanan");
    }
    return true;
  } catch (error) {
    console.error(error);
    return false; // Anggap berhasil untuk fallback UI
  }
}