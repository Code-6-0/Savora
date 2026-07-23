// Analitik Penjualan UMKM — modul Dashboard UMKM.
//
// Membaca agregasi analitik dari backend Go (services/analytics.go) dengan pola
// fetch + fallback demo lokal yang sama seperti src/lib/marketplace.js dan
// src/lib/ads.js, agar UI tetap jalan saat backend belum tersedia.

const DEFAULT_UMKM_ID = 1;

// Fallback demo (dipakai bila API belum tersedia).
export const fallbackTopProducts = [
  { product_id: 1, name: "Nasi Kotak Ayam Bakar", category: "Makanan Siap Saji", units_sold: 284, revenue: 5680000, orders_count: 210 },
  { product_id: 2, name: "Nasi Gudeg Komplit", category: "Makanan Siap Saji", units_sold: 267, revenue: 5340000, orders_count: 198 },
  { product_id: 3, name: "Salad Bowl Superfood", category: "Makanan Sehat", units_sold: 156, revenue: 4368000, orders_count: 140 },
];

export const fallbackInsight = {
  umkm_id: DEFAULT_UMKM_ID,
  avg_rating: 4.8,
  review_count: 127,
  total_revenue: 48800000,
  total_units: 1284,
  top_products: fallbackTopProducts,
  keyword_safety: {
    badge: "Aman",
    top_positive: [
      { keyword: "enak", count: 15 },
      { keyword: "segar", count: 12 },
    ],
    top_negative: [
      { keyword: "basi", count: 1 },
    ],
  },
};

/**
 * Rapikan satu baris penjualan produk agar aman dirender.
 * @param {object} raw
 */
export function normalizeProductSales(raw) {
  const base = raw || {};
  return {
    product_id: base.product_id ?? base.id ?? 0,
    name: base.name || "Produk",
    category: base.category || "-",
    units_sold: Number(base.units_sold ?? 0),
    revenue: Number(base.revenue ?? 0),
    orders_count: Number(base.orders_count ?? 0),
  };
}

/**
 * Rapikan insight UMKM (rating + produk terlaris).
 * @param {object} raw
 */
export function normalizeInsight(raw) {
  const base = raw || {};
  const top = Array.isArray(base.top_products) ? base.top_products.map(normalizeProductSales) : [];
  return {
    umkm_id: base.umkm_id ?? DEFAULT_UMKM_ID,
    avg_rating: Number(base.avg_rating ?? 0),
    review_count: Number(base.review_count ?? 0),
    total_revenue: Number(base.total_revenue ?? 0),
    total_units: Number(base.total_units ?? 0),
    top_products: top,
    keyword_safety: base.keyword_safety || { badge: "Belum Cukup Data", top_positive: [], top_negative: [] },
  };
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
}

async function fetchJson(path) {
  const response = await fetch(`${baseUrl()}${path}`);
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error("Analytics API tidak tersedia");
  }
  return response.json();
}

/**
 * Ambil produk terlaris. Fallback ke demo lokal bila API gagal.
 * @param {number} [umkmId]
 * @param {number} [limit]
 */
export async function fetchTopProducts(umkmId = DEFAULT_UMKM_ID, limit = 5) {
  try {
    const data = await fetchJson(`/api/analytics/top-products/${umkmId}?limit=${limit}`);
    if (!Array.isArray(data)) throw new Error("Respons top-products tidak valid");
    return data.map(normalizeProductSales);
  } catch {
    return fallbackTopProducts.slice(0, limit).map(normalizeProductSales);
  }
}

/**
 * Ambil insight UMKM (rating + produk terlaris). Fallback ke demo lokal.
 * @param {number} [umkmId]
 */
export async function fetchUmkmInsight(umkmId = DEFAULT_UMKM_ID) {
  try {
    const data = await fetchJson(`/api/analytics/insight/${umkmId}`);
    return normalizeInsight(data);
  } catch {
    return normalizeInsight(fallbackInsight);
  }
}

/**
 * Ambil tren penjualan per periode. Fallback ke array kosong.
 * @param {number} [umkmId]
 * @param {string} [granularity] - "daily", "weekly", atau "monthly"
 */
export async function fetchSalesTrend(umkmId = DEFAULT_UMKM_ID, granularity = "daily") {
  try {
    const data = await fetchJson(`/api/analytics/trend/${umkmId}?granularity=${granularity}`);
    if (!Array.isArray(data)) throw new Error("Respons trend tidak valid");
    return data.map((point) => ({
      period: String(point.period ?? ""),
      revenue: Number(point.revenue ?? 0),
      units_sold: Number(point.units_sold ?? 0),
		orders: Number(point.orders ?? 0),
		}));
	} catch {
		return [];
	}
}

/**
 * Ambil daftar Waste Log untuk UMKM tertentu.
 */
export async function fetchWasteLogs(umkmId = DEFAULT_UMKM_ID) {
	try {
		const data = await fetchJson(`/api/waste-logs/umkm/${umkmId}`);
		if (!Array.isArray(data)) return [];
		return data;
	} catch {
		return [];
	}
}

/**
 * Catat Waste Log baru.
 */
export async function createWasteLog(payload) {
	const response = await fetch(`${baseUrl()}/api/waste-logs`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload)
	});
	if (!response.ok) {
		throw new Error("Gagal membuat waste log");
	}
	return response.json();
}

/**
 * Ambil metrik performa listing.
 */
export async function fetchListingMetrics(umkmId = DEFAULT_UMKM_ID) {
	try {
		const data = await fetchJson(`/api/analytics/listing-metrics/${umkmId}`);
		if (!Array.isArray(data)) return [];
		return data;
	} catch {
		return [
			{ product_id: 1, name: "Nasi Kotak Ayam Bakar", units_sold: 284, revenue: 5680000, orders_count: 210, stock_left: 8, sell_through: 0.97, views: 1250, ctr: 0.18, conversion_rate: 0.22 },
			{ product_id: 2, name: "Roti Gandum Artisan", units_sold: 267, revenue: 5340000, orders_count: 198, stock_left: 3, sell_through: 0.98, views: 980, ctr: 0.15, conversion_rate: 0.27 },
			{ product_id: 3, name: "Salad Bowl Superfood", units_sold: 156, revenue: 4368000, orders_count: 140, stock_left: 12, sell_through: 0.92, views: 1400, ctr: 0.21, conversion_rate: 0.11 },
		];
	}
}
