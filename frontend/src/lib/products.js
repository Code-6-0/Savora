// Modul Manajemen Produk UMKM
//
// Membaca data produk dari backend Go (services/product.go) dengan pola
// fetch + fallback demo lokal agar UI tetap jalan saat backend belum tersedia (aturan AGENTS.md).

import { computeFoodScoreFromDates, initialFoodScore } from './foodScore.js';

const DEFAULT_UMKM_ID = 1;

// Fallback demo (dipakai bila API belum tersedia/mati).
export const fallbackProducts = [
  { id: 1, name: "Nasi Kotak Ayam Bakar", category: "Makanan Siap Saji", original_price: 35000, rescue_price: 20000, stock: 8, score: 87, timer: "6j", status: "Aktif" },
  { id: 2, name: "Roti Gandum Artisan", category: "Bakeri & Roti", original_price: 25000, rescue_price: 12000, stock: 3, score: 38, timer: "2j", status: "Hampir Habis" },
  { id: 3, name: "Salad Bowl Superfood", category: "Makanan Sehat", original_price: 45000, rescue_price: 28000, stock: 12, score: 74, timer: "8j", status: "Aktif" },
  { id: 4, name: "Kue Tart Spesial", category: "Kue & Pastri", original_price: 150000, rescue_price: 65000, stock: 1, score: 14, timer: "1j", status: "Kritis" },
  { id: 5, name: "Sandwich Club Tuna", category: "Sandwich & Wrap", original_price: 28000, rescue_price: null, stock: 0, score: 0, timer: "—", status: "Habis" },
  { id: 6, name: "Smoothie Bowl Mango", category: "Minuman & Bowl", original_price: 55000, rescue_price: 35000, stock: 6, score: 68, timer: "7j", status: "Aktif" },
  { id: 7, name: "Pizza Margherita Min", category: "Pizza & Pasta", original_price: 65000, rescue_price: 65000, stock: 4, score: 91, timer: "11j", status: "Aktif" },
  { id: 8, name: "Bakso Premium Solo", category: "Makanan Siap Saji", original_price: 40000, rescue_price: 25000, stock: 6, score: 55, timer: "5j", status: "Aktif" },
];

/**
 * Normalisasi data produk dari backend agar cocok dengan field UI.
 */
export function normalizeProduct(raw) {
  const base = raw || {};
  
  let normalizedStatus = base.status || "Aktif";
  if (normalizedStatus === "Active") normalizedStatus = "Aktif";
  else if (normalizedStatus === "Sold Out") normalizedStatus = "Habis";
  else if (normalizedStatus === "Expired") normalizedStatus = "Kedaluwarsa";

  // Hitung rescue score dan timer dari timestamp
  let rescueScore = 100; // Default jika tidak ada expires_at
  let rescueTimer = "—"; // Default jika tidak ada expires_at
  
  if (base.expires_at) {
    const expiresMs = new Date(base.expires_at).getTime();
    const now = Date.now();
    const remainingMs = expiresMs - now;
    
    if (remainingMs > 0) {
      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      rescueTimer = `${remainingHours}j`;
      
      // Hitung score dari published_at/created_at → expires_at
      const publishRaw = base.published_at || base.created_at;
      if (publishRaw) {
        const publishMs = new Date(publishRaw).getTime();
        const baseScore = initialFoodScore(base.food_trust_status || "Layak Dijual");
        if (baseScore !== null) {
          rescueScore = Math.round(computeFoodScoreFromDates(baseScore, publishMs, expiresMs, now));
        }
      }
    } else {
      rescueTimer = "0j";
      rescueScore = 0;
    }
  }

  return {
    id: base.id ?? 0,
    name: base.name || "Produk",
    category: base.category || "-",
    original_price: Number(base.original_price ?? 0),
    rescue_price: base.rescue_price ? Number(base.rescue_price) : null,
    stock: Number(base.stock ?? 0),
    score: rescueScore,
    timer: rescueTimer,
    status: normalizedStatus,
    production_time: base.production_time || null,
    expires_at: base.expires_at || null,
    published_at: base.published_at || base.created_at || null,
    photo_url: base.photo_url || null,
    packaging_condition: base.packaging_condition || "Standar",
    storage_method: base.storage_method || "Sesuai",
  };
}

/**
 * Ambil daftar produk UMKM dari backend.
 * Dummy fallback hanya aktif jika NEXT_PUBLIC_USE_MOCK=true.
 */
export async function fetchUMKMProducts(umkmId = DEFAULT_UMKM_ID) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
  
  try {
    const response = await fetch(`${baseUrl()}/api/products/umkm/${umkmId}`);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      throw new Error("Products API tidak tersedia");
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Respons products tidak valid");
    }
    
    // Array kosong adalah hasil VALID, bukan error
    return data.map(normalizeProduct);
  } catch (error) {
    // Hanya gunakan fallback jika NEXT_PUBLIC_USE_MOCK=true
    if (useMock) {
      console.warn("Using fallback products:", error.message);
      return fallbackProducts;
    }
    // Jika tidak mock, lempar error ke komponen
    throw error;
  }
}

/**
 * Buat produk baru via API.
 * Otomatis menghitung expires_at dari production_time + shelf_life_hours jika belum ada.
 */
export async function createProduct(productData) {
  try {
    const payload = { ...productData };
    
    // Hitung expires_at jika belum ada tapi ada production_time & shelf_life_hours
    if (!payload.expires_at && payload.production_time && payload.shelf_life_hours) {
      const productionMs = new Date(payload.production_time).getTime();
      const shelfLifeMs = Number(payload.shelf_life_hours) * 60 * 60 * 1000;
      payload.expires_at = new Date(productionMs + shelfLifeMs).toISOString();
    }
    
    // Validasi: expires_at tidak boleh di masa lalu
    if (payload.expires_at) {
      const expiresMs = new Date(payload.expires_at).getTime();
      if (expiresMs < Date.now()) {
        throw new Error("Waktu kedaluwarsa tidak boleh di masa lalu");
      }
    }
    
    const response = await fetch(`${baseUrl()}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Gagal membuat produk");
    }
    const data = await response.json();
    return normalizeProduct(data);
  } catch (error) {
    console.error(error);
    throw error; // Lempar error agar form bisa tangkap
  }
}

/**
 * Update produk via API.
 * Otomatis menghitung expires_at dari production_time + shelf_life_hours jika belum ada.
 */
export async function updateProduct(productId, productData) {
  try {
    const payload = { ...productData };
    
    // Hitung expires_at jika belum ada tapi ada production_time & shelf_life_hours
    if (!payload.expires_at && payload.production_time && payload.shelf_life_hours) {
      const productionMs = new Date(payload.production_time).getTime();
      const shelfLifeMs = Number(payload.shelf_life_hours) * 60 * 60 * 1000;
      payload.expires_at = new Date(productionMs + shelfLifeMs).toISOString();
    }
    
    // Validasi: expires_at tidak boleh di masa lalu
    if (payload.expires_at) {
      const expiresMs = new Date(payload.expires_at).getTime();
      if (expiresMs < Date.now()) {
        throw new Error("Waktu kedaluwarsa tidak boleh di masa lalu");
      }
    }
    
    const response = await fetch(`${baseUrl()}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Gagal mengupdate produk");
    }
    const data = await response.json();
    return normalizeProduct(data);
  } catch (error) {
    console.error(error);
    throw error; // Lempar error agar form bisa tangkap
  }
}

/**
 * Hapus produk via API.
 */
export async function deleteProduct(productId) {
  try {
    await apiFetch(`/products/${productId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
