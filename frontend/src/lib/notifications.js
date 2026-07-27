/**
 * API helpers untuk notifikasi in-app.
 */

import { apiFetch } from './api.js';

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
    return await apiFetch(`/notifications/user/${userId}?role=${encodeURIComponent(role)}`);
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
    const data = await apiFetch(`/notifications/unread/${userId}?role=${encodeURIComponent(role)}`);
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
    await apiFetch(`/notifications/${notificationId}/read`, {
      method: 'PUT'
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
    await apiFetch(`/notifications/read-all/${userId}?role=${encodeURIComponent(role)}`, {
      method: 'PUT'
    });
  } catch {
    // Silent fail untuk demo
  }
}
