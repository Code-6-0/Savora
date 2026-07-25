/**
 * Modul keranjang belanja murni (tanpa React).
 * Semua fungsi pure, tidak ada side effect kecuali persist ke localStorage.
 *
 * Item minimal: { id, name, photo_url, rescue_price, stock, qty }
 */

const STORAGE_KEY = "savora_cart";

/**
 * Tambah item ke keranjang. Jika sudah ada, tambahkan qty (clamp ke stock).
 */
export function addItem(items, product, qty) {
  if (!product || !product.id) return items;

  const existing = items.find((item) => item.id === product.id);

  if (existing) {
    const newQty = Math.min(existing.qty + qty, product.stock);
    return items.map((item) =>
      item.id === product.id ? { ...item, qty: newQty } : item
    );
  }

  const clampedQty = Math.max(1, Math.min(qty, product.stock));
  const newItem = {
    id: product.id,
    name: product.name,
    photo_url: product.photo_url,
    rescue_price: product.rescue_price,
    stock: product.stock,
    qty: clampedQty,
  };

  return [...items, newItem];
}

/**
 * Hapus item dari keranjang berdasarkan productId.
 */
export function removeItem(items, productId) {
  return items.filter((item) => item.id !== productId);
}

/**
 * Update quantity item, dengan clamp ke [1, stock].
 */
export function updateQty(items, productId, qty) {
  return items.map((item) => {
    if (item.id !== productId) return item;
    const clampedQty = Math.max(1, Math.min(qty, item.stock));
    return { ...item, qty: clampedQty };
  });
}

/**
 * Hitung subtotal (rescue_price × qty untuk semua item).
 */
export function computeSubtotal(items) {
  return items.reduce((sum, item) => sum + item.rescue_price * item.qty, 0);
}

/**
 * Hitung service fee 5% dari subtotal.
 */
export function computeServiceFee(subtotal) {
  return Math.round(subtotal * 0.05);
}

/**
 * Hitung total (subtotal + service fee).
 */
export function computeTotal(items) {
  const subtotal = computeSubtotal(items);
  const serviceFee = computeServiceFee(subtotal);
  return subtotal + serviceFee;
}

/**
 * Kosongkan keranjang (return array kosong).
 */
export function clearCart() {
  return [];
}

/**
 * Load keranjang dari localStorage.
 * Guard SSR dan JSON rusak.
 */
export function loadCart() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

/**
 * Save keranjang ke localStorage.
 * Guard SSR.
 */
export function saveCart(items) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    // Silent fail untuk quota exceeded, dll.
  }
}
