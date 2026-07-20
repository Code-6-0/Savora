// Slot Iklan Marketplace — Richard Firmansyah (Batch 2, sisi customer)
//
// Marketplace menampilkan dua jenis iklan:
//   - "umkm"  : produk UMKM yang membeli premium listing / slot iklan.
//   - "eksternal" : pengiklan pihak ketiga (brand/aplikasi luar).
// Modul admin (Alia) yang meng-approve iklan; modul UMKM (Rifaidi) yang
// menjual slot. Di sisi customer kita hanya merender slot yang aktif, dengan
// fallback demo lokal mengikuti pola src/lib/marketplace.js.

const AD_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85";

export const AD_TYPES = {
  umkm: { key: "umkm", label: "Promoted UMKM" },
  eksternal: { key: "eksternal", label: "Iklan" },
};

export const fallbackAds = [
  {
    id: "ad-warung-bu-ratih",
    type: "umkm",
    sponsor: "Warung Bu Ratih",
    headline: "Paket makan siang hemat, selalu fresh tiap hari",
    cta: "Lihat rescue deals",
    href: "/marketplace/nasi-campur-bali",
    photo_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "ad-roti-kayu",
    type: "umkm",
    sponsor: "Roti Kayu Bakery",
    headline: "Sourdough artisan, diselamatkan dengan harga setengah",
    cta: "Selamatkan roti",
    href: "/marketplace/roti-sourdough",
    photo_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "ad-eco-partner",
    type: "eksternal",
    sponsor: "EcoBox Reusable",
    headline: "Wadah makan pakai ulang untuk gaya hidup zero waste",
    cta: "Kunjungi partner",
    href: "https://example.com/ecobox",
    photo_url: "https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=1200&q=85",
  },
];

/**
 * Rapikan satu objek iklan dari API/fallback agar aman dirender.
 * @param {object} raw
 */
export function normalizeAd(raw) {
  const base = raw || {};
  const type = AD_TYPES[base.type]?.key || "eksternal";
  const href = typeof base.href === "string" && base.href.length > 0 ? base.href : "#";
  return {
    id: String(base.id ?? base.ad_id ?? base.sponsor ?? "ad"),
    type,
    sponsor: base.sponsor || base.vendor || "Sponsor Savora",
    headline: base.headline || base.title || "Dukung UMKM lokal di Savora",
    cta: base.cta || (type === "umkm" ? "Lihat produk" : "Pelajari"),
    href,
    // Tautan pihak ketiga terbuka di tab baru; tautan internal tetap same-tab.
    external: /^https?:\/\//i.test(href),
    photo_url: base.photo_url || base.image_url || AD_FALLBACK_IMAGE,
  };
}

/**
 * Ambil iklan aktif dari backend, fallback ke demo lokal.
 * Mengikuti kontrak & pola fetch src/lib/marketplace.js.
 * @param {number} [limit] jumlah maksimal iklan yang dikembalikan.
 */
export async function fetchAds(limit = 3) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  try {
    const response = await fetch(`${baseUrl}/api/ads/active`);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) throw new Error("Ads API tidak tersedia");
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Respons ads tidak valid");
    return data.map(normalizeAd).slice(0, limit);
  } catch {
    return fallbackAds.map(normalizeAd).slice(0, limit);
  }
}
