// Pengiklanan UMKM — sisi UMKM (Dashboard) memasang & mengelola iklan.
//
// Melengkapi src/lib/ads.js (sisi customer yang merender slot). Modul ini
// bertanggung jawab menjual/membuat slot: memilih paket durasi tetap,
// membuat iklan, mengaktifkan, dan menampilkan daftar iklan milik UMKM.
// Pola fetch + fallback demo mengikuti src/lib/marketplace.js.

const DEFAULT_UMKM_ID = 1;

// Status iklan harus konsisten dengan services/ads.go backend.
export const AD_STATUS = {
  Draft: { key: "Draft", label: "Draft", className: "is-draft" },
  Aktif: { key: "Aktif", label: "Aktif", className: "is-aktif" },
  Kadaluarsa: { key: "Kadaluarsa", label: "Kadaluarsa", className: "is-kadaluarsa" },
};

// Fallback katalog paket (harus sama dengan services/ads.go adPackages).
export const fallbackAdPackages = [
  { id: "kilat", name: "Kilat", duration_days: 3, price: 15000, description: "Tayang 3 hari, cocok untuk flash sale rescue deal." },
  { id: "populer", name: "Populer", duration_days: 7, price: 35000, description: "Tayang 7 hari, paling banyak dipilih UMKM." },
  { id: "sorotan", name: "Sorotan", duration_days: 30, price: 99000, description: "Tayang 30 hari, sorotan penuh sebulan." },
];

/**
 * Normalisasi status iklan ke salah satu AD_STATUS (default Draft).
 * @param {string} value
 */
export function normalizeAdStatus(value) {
  const key = String(value || "").trim();
  return AD_STATUS[key] || AD_STATUS.Draft;
}

/**
 * Rapikan satu paket iklan.
 * @param {object} raw
 */
export function normalizeAdPackage(raw) {
  const base = raw || {};
  return {
    id: String(base.id ?? "paket"),
    name: base.name || "Paket",
    duration_days: Number(base.duration_days ?? 0),
    price: Number(base.price ?? 0),
    description: base.description || "",
  };
}

/**
 * Rapikan satu iklan milik UMKM untuk ditampilkan di dashboard.
 * @param {object} raw
 */
export function normalizeUmkmAd(raw) {
  const base = raw || {};
  return {
    id: base.id ?? base.ad_id ?? 0,
    umkm_id: Number(base.umkm_id ?? DEFAULT_UMKM_ID),
    product_id: Number(base.product_id ?? 0),
    package_id: String(base.package_id ?? ""),
    headline: base.headline || "",
    cta: base.cta || "Lihat produk",
    status: normalizeAdStatus(base.status).key,
    price: Number(base.price ?? 0),
    duration_days: Number(base.duration_days ?? 0),
    start_at: base.start_at ?? null,
    end_at: base.end_at ?? null,
  };
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
}

/**
 * Ambil katalog paket iklan. Fallback ke demo lokal bila API gagal.
 */
export async function fetchAdPackages() {
  try {
    const response = await fetch(`${baseUrl()}/api/ads/packages`);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) throw new Error("Ads API tidak tersedia");
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Respons paket tidak valid");
    return data.map(normalizeAdPackage);
  } catch {
    return fallbackAdPackages.map(normalizeAdPackage);
  }
}

/**
 * Ambil daftar iklan milik satu UMKM. Fallback ke array kosong.
 * @param {number} [umkmId]
 */
export async function fetchUmkmAds(umkmId = DEFAULT_UMKM_ID) {
  try {
    const response = await fetch(`${baseUrl()}/api/ads/umkm/${umkmId}`);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) throw new Error("Ads API tidak tersedia");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Respons iklan tidak valid");
    return data.map(normalizeUmkmAd);
  } catch {
    return [];
  }
}

/**
 * Buat iklan baru (status Draft). Mengembalikan iklan hasil normalisasi.
 * @param {{umkm_id?:number, product_id:number, package_id:string, headline?:string, cta?:string}} payload
 */
export async function createUmkmAd(payload) {
  const body = {
    umkm_id: payload.umkm_id ?? DEFAULT_UMKM_ID,
    product_id: payload.product_id,
    package_id: payload.package_id,
    headline: payload.headline || "",
    cta: payload.cta || "",
  };
  const response = await fetch(`${baseUrl()}/api/ads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Gagal membuat iklan");
  }
  return normalizeUmkmAd(await response.json());
}

/**
 * Ubah status iklan (mis. aktifkan). Mengembalikan iklan hasil normalisasi.
 * @param {number} id
 * @param {string} status
 */
export async function updateAdStatus(id, status) {
  const response = await fetch(`${baseUrl()}/api/ads/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Gagal mengubah status iklan");
  }
  return normalizeUmkmAd(await response.json());
}
