/**
 * Helper untuk validasi dan konversi datetime produk
 */

/**
 * Konversi ISO string ke format datetime-local (YYYY-MM-DDTHH:mm)
 * Timezone-aware: menggunakan waktu lokal browser
 */
export function isoToDatetimeLocal(isoString) {
  if (!isoString) return "";
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    
    // Format: YYYY-MM-DDTHH:mm (local timezone)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return "";
  }
}

/**
 * Konversi datetime-local string ke ISO string
 * Timezone-aware: input lokal, output UTC ISO
 */
export function datetimeLocalToISO(datetimeLocal) {
  if (!datetimeLocal) return null;
  
  try {
    const date = new Date(datetimeLocal);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch (e) {
    return null;
  }
}

/**
 * Validasi waktu kedaluwarsa produk
 * Returns: { valid: boolean, errors: string[] }
 */
export function validateProductDates(production_time, expires_at) {
  const errors = [];
  const now = Date.now();
  
  // expires_at wajib ada
  if (!expires_at) {
    errors.push("Waktu kedaluwarsa wajib diisi");
    return { valid: false, errors };
  }
  
  const expiresMs = new Date(expires_at).getTime();
  
  // expires_at harus > sekarang
  if (expiresMs <= now) {
    errors.push("Waktu kedaluwarsa harus di masa depan");
  }
  
  // expires_at harus > production_time (jika ada)
  if (production_time) {
    const productionMs = new Date(production_time).getTime();
    if (expiresMs <= productionMs) {
      errors.push("Waktu kedaluwarsa harus setelah waktu produksi");
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Deteksi apakah user memperpanjang expires_at dari nilai sebelumnya
 * Returns: { extended: boolean, originalExpiry: Date|null, newExpiry: Date }
 */
export function detectExpiryExtension(originalExpiresAt, newExpiresAt) {
  if (!originalExpiresAt || !newExpiresAt) {
    return { extended: false, originalExpiry: null, newExpiry: null };
  }
  
  try {
    const original = new Date(originalExpiresAt);
    const updated = new Date(newExpiresAt);
    
    if (isNaN(original.getTime()) || isNaN(updated.getTime())) {
      return { extended: false, originalExpiry: null, newExpiry: null };
    }
    
    const extended = updated.getTime() > original.getTime();
    return { extended, originalExpiry: original, newExpiry: updated };
  } catch (e) {
    return { extended: false, originalExpiry: null, newExpiry: null };
  }
}
