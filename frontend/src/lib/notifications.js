/**
 * API helpers untuk notifikasi in-app.
 * Base URL dari env; fallback ke localhost:3000.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Data demo untuk fallback tanpa backend
const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    user_id: 1,
    user_role: 'umkm',
    title: 'Pesanan Baru',
    message: 'Pesanan #1 dari Rina Marlina seharga Rp40.000 menunggu konfirmasi.',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    user_role: 'umkm',
    title: 'Produk Menjadi Limbah',
    message: '2 porsi Nasi Kotak Ayam Bakar telah melewati batas kelayakan konsumsi dan dialihkan ke Waste Log.',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    user_id: 1,
    user_role: 'umkm',
    title: 'Pesanan Selesai',
    message: 'Pesanan #2 berhasil diselesaikan oleh Budi Santoso.',
    is_read: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

/**
 * Fetch notifikasi untuk user tertentu.
 * @param {number} userId
 * @param {string} role - 'customer' | 'umkm' | 'admin'
 * @returns {Promise<Array>} array of notifications
 */
export async function fetchNotifications(userId, role = 'umkm') {
  try {
    const res = await fetch(`${API_BASE}/notifications/user/${userId}?role=${role}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    // Fallback demo data
    return DEMO_NOTIFICATIONS.filter(n => n.user_role === role);
  }
}

/**
 * Fetch jumlah notifikasi belum dibaca.
 * @param {number} userId
 * @param {string} role
 * @returns {Promise<number>}
 */
export async function fetchUnreadCount(userId, role = 'umkm') {
  try {
    const res = await fetch(`${API_BASE}/notifications/unread/${userId}?role=${role}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.count || 0;
  } catch {
    // Fallback: hitung dari demo
    return DEMO_NOTIFICATIONS.filter(n => n.user_role === role && !n.is_read).length;
  }
}

/**
 * Tandai satu notifikasi sudah dibaca.
 * @param {number} notificationId
 */
export async function markAsRead(notificationId) {
  try {
    await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  } catch {
    // Silent fail untuk demo
  }
}

/**
 * Tandai semua notifikasi sudah dibaca.
 * @param {number} userId
 * @param {string} role
 */
export async function markAllAsRead(userId, role = 'umkm') {
  try {
    await fetch(`${API_BASE}/notifications/read-all/${userId}?role=${role}`, {
      method: 'PUT',
    });
  } catch {
    // Silent fail untuk demo
  }
}
