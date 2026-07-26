// Pengiklanan UMKM — sisi UMKM (Dashboard) memasang & mengelola iklan.
//
// Melengkapi src/lib/ads.js (sisi customer yang merender slot). Modul ini
// bertanggung jawab menjual/membuat slot: memilih paket durasi tetap,
// membuat iklan, mengaktifkan, dan menampilkan daftar iklan milik UMKM.
// Pola fetch + fallback demo mengikuti src/lib/marketplace.js.

import { baseUrl } from './apiBase.js';

const DEFAULT_UMKM_ID = 1;

// Status iklan harus konsisten dengan services/ads.go backend.
export const AD_STATUS = {
  Draft: { key: "Draft", label: "Draft", className: "is-draft" },
  Aktif: { key: "Aktif", label: "Aktif", className: "is-aktif" },
  Kedaluwarsa: { key: "Kedaluwarsa", label: "Kedaluwarsa", className: "is-kedaluwarsa" },
};

// Fallback katalog dihapus agar selalu mengambil dari API (Tugas 5).

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

/**
 * Ambil katalog paket iklan langsung dari API.
 */
export async function fetchAdPackages() {
  const response = await fetch(`${baseUrl()}/api/ads/packages`);
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.includes("application/json")) throw new Error("Ads API tidak tersedia");
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error("Respons paket tidak valid");
  return data.map(normalizeAdPackage);
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
