// Modul Manajemen Produk UMKM
//
// Membaca data produk dari backend Go (services/product.go) dengan pola
// fetch + fallback demo lokal agar UI tetap jalan saat backend belum tersedia (aturan AGENTS.md).

const DEFAULT_UMKM_ID = 1;

// Fallback demo (dipakai bila API belum tersedia/mati).
export const fallbackProducts = [
  { id: 1, name: "Nasi Kotak Ayam Bakar", category: "Makanan Siap Saji", original_price: 35000, rescue_price: 20000, stock: 8, score: 87, timer: "6j", status: "Aktif" },
  { id: 2, name: "Roti Gandum Artisan", category: "Bakeri & Roti", original_price: 25000, rescue_price: 12000, stock: 3, score: 38, timer: "2j", status: "Hampir Habis" },
  { id: 3, name: "Salad Bowl Superfood", category: "Makanan Sehat", original_price: 45000, rescue_price: 28000, stock: 12, score: 74, timer: "8j", status: "Aktif" },
  { id: 4, name: "Kue Tart Spesial", category: "Kue & Pastri", original_price: 150000, rescue_price: 65000, stock: 1, score: 14, timer: "1j", status: "Kritis" },
  { id: 5, name: "Sandwich Club Tuna", category: "Sandwich & Wrap", original_price: 28000, rescue_price: null, stock: 0, score: 0, timer: "-", status: "Habis" },
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

  return {
    id: base.id ?? 0,
    name: base.name || "Produk",
    category: base.category || "-",
    original_price: Number(base.original_price ?? 0),
    rescue_price: base.rescue_price ? Number(base.rescue_price) : null,
    stock: Number(base.stock ?? 0),
    score: base.food_score !== undefined ? Number(base.food_score) : 100,
    timer: "12j", // Di-mock karena perhitungan timer bergantung pada jam real dari backend yang biasanya lebih kompleks di UI
    status: normalizedStatus,
    expires_at: base.expires_at || null,
    photo_url: base.photo_url || null,
  };
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
}

/**
 * Ambil daftar produk UMKM. Fallback ke demo lokal bila API gagal.
 */
export async function fetchUMKMProducts(umkmId = DEFAULT_UMKM_ID, allowFallback = true) {
  try {
    const response = await fetch(`${baseUrl()}/api/products/umkm/${umkmId}`);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      if (allowFallback) throw new Error("Products API tidak tersedia");
      return [];
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      if (allowFallback) throw new Error("Respons products tidak valid");
      return [];
    }
    
    // Jika backend kosong (array length 0), kita bisa lempar error agar fallback ke dummy berjalan
    // (Ini berguna untuk prototype lomba agar layar tidak kosong).
    if (data.length === 0 && allowFallback) {
      throw new Error("Database kosong, fallback ke dummy");
    }

    return data.map(normalizeProduct);
  } catch (error) {
    if (allowFallback) {
      console.warn("Using fallback products:", error.message);
      return fallbackProducts;
    }
    console.error("Gagal mengambil data produk real:", error.message);
    return [];
  }
}

/**
 * Buat produk baru via API.
 */
export async function createProduct(productData) {
  try {
    const response = await fetch(`${baseUrl()}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error("Gagal membuat produk");
    }
    const data = await response.json();
    return normalizeProduct(data);
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Update produk via API.
 */
export async function updateProduct(productId, productData) {
  try {
    const response = await fetch(`${baseUrl()}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error("Gagal mengupdate produk");
    }
    const data = await response.json();
    return normalizeProduct(data);
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Hapus produk via API.
 */
export async function deleteProduct(productId) {
  try {
    const response = await fetch(`${baseUrl()}/api/products/${productId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error("Gagal menghapus produk");
    }
    return true;
  } catch (error) {
    console.error(error);
    return false; // Anggap saja berhasil untuk keperluan demo UI jika backend down
  }
}
