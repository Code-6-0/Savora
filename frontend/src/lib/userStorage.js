/**
 * Helper untuk storage per-akun dengan namespace otomatis.
 *
 * Setiap akun (user.id) punya simpanan sendiri untuk keranjang, lokasi, dll.
 * Guest/belum login punya namespace "guest" terpisah.
 *
 * Fitur:
 * - Namespace otomatis berdasarkan akun yang login
 * - Migrasi sekali jalan dari kunci global lama ke namespace baru
 * - Logout tidak menghapus data (data tetap tersimpan per akun)
 */

/**
 * Dapatkan namespace untuk user saat ini.
 * @returns {string} - "user_{id}" atau "guest"
 */
function getCurrentUserNamespace() {
  if (typeof window === 'undefined') return 'guest';

  try {
    const userStr = window.localStorage.getItem('savora_user');
    if (!userStr) return 'guest';

    const user = JSON.parse(userStr);
    if (user && user.id) {
      return `user_${user.id}`;
    }
    return 'guest';
  } catch (e) {
    return 'guest';
  }
}

/**
 * Buat kunci localStorage dengan namespace akun.
 * @param {string} baseKey - Kunci dasar (mis. "savora_cart")
 * @returns {string} - Kunci dengan namespace (mis. "savora_cart_user_123")
 */
function getNamespacedKey(baseKey) {
  const namespace = getCurrentUserNamespace();
  return `${baseKey}_${namespace}`;
}

/**
 * Baca data dari localStorage dengan namespace akun.
 * @param {string} baseKey - Kunci dasar
 * @returns {string|null} - Data atau null
 */
export function readUserData(baseKey) {
  if (typeof window === 'undefined') return null;

  try {
    const key = getNamespacedKey(baseKey);
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

/**
 * Tulis data ke localStorage dengan namespace akun.
 * @param {string} baseKey - Kunci dasar
 * @param {string} value - Data yang akan disimpan
 */
export function writeUserData(baseKey, value) {
  if (typeof window === 'undefined') return;

  try {
    const key = getNamespacedKey(baseKey);
    window.localStorage.setItem(key, value);
  } catch (e) {
    // Silent fail untuk quota exceeded, dll.
  }
}

/**
 * Hapus data dari localStorage dengan namespace akun.
 * @param {string} baseKey - Kunci dasar
 */
export function removeUserData(baseKey) {
  if (typeof window === 'undefined') return;

  try {
    const key = getNamespacedKey(baseKey);
    window.localStorage.removeItem(key);
  } catch (e) {
    // Silent fail
  }
}

/**
 * Migrasi data lama dari kunci global ke namespace akun (sekali jalan).
 * Dipanggil otomatis saat aplikasi load pertama kali.
 *
 * @param {string} baseKey - Kunci dasar (mis. "savora_cart")
 */
export function migrateOldData(baseKey) {
  if (typeof window === 'undefined') return;

  try {
    // Cek apakah ada data di kunci lama (global)
    const oldData = window.localStorage.getItem(baseKey);
    if (!oldData) return; // Tidak ada data lama, skip

    // Cek apakah data baru sudah ada (sudah pernah migrasi)
    const newKey = getNamespacedKey(baseKey);
    const newData = window.localStorage.getItem(newKey);
    if (newData) {
      // Data baru sudah ada, hapus data lama dan selesai
      window.localStorage.removeItem(baseKey);
      return;
    }

    // Migrasi: pindahkan data lama ke namespace baru
    window.localStorage.setItem(newKey, oldData);

    // Hapus data lama
    window.localStorage.removeItem(baseKey);
  } catch (e) {
    // Silent fail
  }
}
