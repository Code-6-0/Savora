import {
  computeFoodScore,
  computeFoodScoreFromDates,
  initialFoodScore,
} from "./foodScore.js";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85";

// Anchor waktu untuk data demo, dievaluasi sekali saat modul diimpor (bukan saat
// render). Timestamp demo dihitung relatif ke anchor ini agar fallback tetap
// realistis kapan pun aplikasi dijalankan tanpa backend.
const DEMO_NOW = Date.now();

// Bangun published_at/expires_at demo dari total masa layak + sisa waktu, mirip
// bentuk data yang dikirim API (ISO string). expires_at = anchor + sisa waktu;
// published_at = expires_at − total masa layak.
function demoWindow(totalHours, remainingMinutes) {
  const expires = DEMO_NOW + remainingMinutes * 60 * 1000;
  const published = expires - totalHours * 60 * 60 * 1000;
  return {
    published_at: new Date(published).toISOString(),
    expires_at: new Date(expires).toISOString(),
  };
}

export const fallbackMarketplaceProducts = [
  {
    id: "nasi-campur-bali",
    name: "Nasi Campur Bali Spesial",
    category: "Nasi",
    vendor: "Warung Bu Ratih",
    distanceKm: 0.8,
    original_price: 25000,
    rescue_price: 12000,
    stock: 6,
    food_trust_status: "Fresh",
    trustScore: 92,
    timerMinutes: 135,
    ...demoWindow(8, 135),
    photo_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=85",
    description: "Nasi campur lengkap dengan ayam suwir, telur, sayur urap, dan sambal matah. Disiapkan pagi ini untuk layanan makan siang.",
    pickup_address: "Jl. Kaliurang KM 5, Sleman, Yogyakarta",
    productionTime: "Hari ini, 08:30 WIB",
    shelfLife: "8 jam sejak produksi",
    storage: "Suhu ruang, tertutup",
    packaging: "Kotak food-grade, baru",
    reviews: [
      { name: "Rani P.", rating: 5, comment: "Nasi masih hangat dan porsinya besar. Worth banget!" },
      { name: "Dimas A.", rating: 5, comment: "Pickup cepat, owner-nya ramah. Rasa sesuai foto." },
    ],
  },
  {
    id: "gorengan-campur",
    name: "Paket Gorengan Campur",
    category: "Snack",
    vendor: "Kios Mbak Sari",
    distanceKm: 0.4,
    original_price: 15000,
    rescue_price: 6000,
    stock: 12,
    food_trust_status: "Segera Dijual",
    trustScore: 74,
    timerMinutes: 45,
    ...demoWindow(4, 45),
    photo_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85",
    description: "Isi 10 gorengan pilihan: bakwan, tahu isi, risol, dan tempe mendoan. Cocok untuk teman belajar atau makan sore.",
    pickup_address: "Pasar Colombo, Depok, Sleman",
    productionTime: "Hari ini, 11:45 WIB",
    shelfLife: "4 jam sejak produksi",
    storage: "Wadah tertutup, suhu ruang",
    packaging: "Kertas food-grade",
    reviews: [
      { name: "Yoga S.", rating: 4, comment: "Gorengan masih enak, tapi yang tahu baunya agak asam sedikit." },
      { name: "Putri N.", rating: 5, comment: "Renyah dan segar, porsinya banyak." },
    ],
  },
  {
    id: "roti-sourdough",
    name: "Roti Sourdough Artisan",
    category: "Bakery",
    vendor: "Roti Kayu Bakery",
    distanceKm: 1.2,
    original_price: 45000,
    rescue_price: 22000,
    stock: 3,
    food_trust_status: "Layak Dijual",
    trustScore: 85,
    timerMinutes: 220,
    ...demoWindow(14, 220),
    photo_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85",
    description: "Roti sourdough artisan dengan kulit renyah dan tekstur lembut. Dipanggang pagi ini dengan bahan lokal.",
    pickup_address: "Jl. Pandega Marta 34, Depok, Sleman",
    productionTime: "Hari ini, 06:00 WIB",
    shelfLife: "1 hari sejak produksi",
    storage: "Rak tertutup, suhu ruang",
    packaging: "Paper bag baru",
    reviews: [],
  },
  {
    id: "ayam-bakar",
    name: "Ayam Bakar + Nasi",
    category: "Nasi",
    vendor: "Warung Pak Joko",
    distanceKm: 1.6,
    original_price: 28000,
    rescue_price: 14000,
    stock: 4,
    food_trust_status: "Fresh",
    trustScore: 90,
    timerMinutes: 115,
    ...demoWindow(7, 115),
    photo_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=85",
    description: "Paket ayam bakar bumbu kecap, nasi, lalapan, dan sambal. Porsi lengkap untuk makan siang.",
    pickup_address: "Jl. Gejayan 88, Depok, Sleman",
    productionTime: "Hari ini, 10:00 WIB",
    shelfLife: "7 jam sejak produksi",
    storage: "Hangat, tertutup",
    packaging: "Kotak food-grade, baru",
    reviews: [],
  },
  {
    id: "pastry-cokelat",
    name: "Pastry Cokelat Almond",
    category: "Bakery",
    vendor: "Sweet Corner Patisserie",
    distanceKm: 2.1,
    original_price: 35000,
    rescue_price: 18000,
    stock: 5,
    food_trust_status: "Layak Dijual",
    trustScore: 84,
    timerMinutes: 250,
    ...demoWindow(10, 250),
    photo_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=85",
    description: "Pastry berlapis dengan isian cokelat dan taburan almond panggang.",
    pickup_address: "Jl. Palagan Tentara Pelajar 12, Sleman",
    productionTime: "Hari ini, 09:00 WIB",
    shelfLife: "10 jam sejak produksi",
    storage: "Etalase tertutup, suhu ruang",
    packaging: "Box kertas baru",
    reviews: [],
  },
  {
    id: "nasi-kotak",
    name: "Nasi Kotak Prasmanan",
    category: "Catering",
    vendor: "Catering Ibu Wati",
    distanceKm: 3,
    original_price: 32000,
    rescue_price: 15000,
    stock: 8,
    food_trust_status: "Segera Dijual",
    trustScore: 76,
    timerMinutes: 80,
    ...demoWindow(5, 80),
    photo_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85",
    description: "Nasi kotak pilihan dari acara siang: ayam bumbu, mie, sayur, dan kerupuk.",
    pickup_address: "Jl. Monjali 7, Mlati, Sleman",
    productionTime: "Hari ini, 10:30 WIB",
    shelfLife: "5 jam sejak produksi",
    storage: "Tertutup, suhu ruang",
    packaging: "Kotak food-grade, baru",
    reviews: [
      { name: "Bagus W.", rating: 2, comment: "Sayurnya sudah basi waktu saya buka, sayang sekali." },
      { name: "Sinta L.", rating: 4, comment: "Nasinya enak dan masih hangat." },
    ],
  },
];

const defaultMetadata = {
  vendor: "UMKM Savora",
  distanceKm: 1,
  food_trust_status: "Layak Dijual",
  trustScore: 82,
  timerMinutes: 120,
  photo_url: FALLBACK_IMAGE,
  description: "Rescue deal dari UMKM lokal. Periksa detail dan kondisi makanan saat pickup.",
  pickup_address: "Lokasi pickup dikonfirmasi setelah order dibuat.",
  productionTime: "Hari ini",
  shelfLife: "Sesuai informasi UMKM",
  storage: "Sesuai informasi UMKM",
  packaging: "Kemasan aman",
  reviews: [],
};

export function normalizeMarketplaceProduct(raw) {
  const base = raw || {};
  const originalPrice = Number(base.original_price) || 0;
  const rescuePrice = Number(base.rescue_price) || originalPrice;
  const fallbackDiscount = originalPrice > 0 ? Math.max(0, Math.round(((originalPrice - rescuePrice) / originalPrice) * 100)) : 0;

  // Timestamp: terima ISO string atau epoch ms dari API. Fallback:
  // published_at ← created_at. Kalau keduanya kosong → undefined (jalur
  // timerMinutes lama dipakai di computeProductScore).
  const publishRaw = base.published_at || base.created_at;
  const expiresRaw = base.expires_at;
  const publishMs = publishRaw ? new Date(publishRaw).getTime() : undefined;
  const expiresMs = expiresRaw ? new Date(expiresRaw).getTime() : undefined;

  // Skor awal dikunci dari status Food Trust Index (PRD 12.6).
  const baseScore = initialFoodScore(base.food_trust_status || defaultMetadata.food_trust_status);

  return {
    ...defaultMetadata,
    ...base,
    id: String(base.id),
    name: base.name || "Rescue Deal Savora",
    category: base.category || "Lainnya",
    original_price: originalPrice,
    rescue_price: rescuePrice,
    stock: Number.isFinite(Number(base.stock)) ? Number(base.stock) : 0,
    vendor: base.vendor || base.umkm_name || defaultMetadata.vendor,
    distanceKm: Number(base.distanceKm ?? defaultMetadata.distanceKm),
    discountPercent: Number(base.discountPercent ?? fallbackDiscount),
    food_trust_status: base.food_trust_status || defaultMetadata.food_trust_status,
    trustScore: Number(base.trustScore ?? defaultMetadata.trustScore),
    timerMinutes: Number(base.timerMinutes ?? defaultMetadata.timerMinutes),
    photo_url: base.photo_url || defaultMetadata.photo_url,
    // Timestamp & skor awal terkunci untuk scoring berbasis waktu absolut.
    _publishMs: Number.isFinite(publishMs) ? publishMs : undefined,
    _expiresMs: Number.isFinite(expiresMs) ? expiresMs : undefined,
    _baseScore: baseScore,
  };
}

/**
 * Hitung Food Score & sisa detik untuk sebuah produk terhadap waktu `now`.
 *
 * Jalur utama: gunakan timestamp absolut (expires_at − published_at).
 * Jalur fallback (data demo tanpa timestamp): gunakan timerMinutes + elapsed
 * detik sejak mount, seperti perilaku lama.
 *
 * @param {object} product produk hasil normalizeMarketplaceProduct.
 * @param {number} now epoch ms waktu sekarang.
 * @param {number} [elapsedSeconds] detik berlalu sejak mount (fallback only).
 * @returns {{ score: number, remainingSeconds: number }}
 */
export function computeProductScore(product, now, elapsedSeconds = 0) {
  const baseScore = product._baseScore;
  // Status yang tidak dikenali → tidak tayang (skor null, disembunyikan).
  if (baseScore == null) return { score: 0, remainingSeconds: 0 };

  if (product._publishMs && product._expiresMs) {
    // Jalur utama: timestamp absolut (PRD 12.6).
    const score = computeFoodScoreFromDates(baseScore, product._publishMs, product._expiresMs, now);
    const remainingSeconds = Math.max(0, Math.floor((product._expiresMs - now) / 1000));
    return { score, remainingSeconds };
  }

  // Jalur fallback: timerMinutes + elapsed (data demo lama tanpa timestamp).
  const windowSeconds = Math.max(1, Math.round((Number(product.timerMinutes) || 0) * 60));
  const remainingSeconds = Math.max(0, windowSeconds - elapsedSeconds);
  const score = computeFoodScore(remainingSeconds, windowSeconds, baseScore);
  return { score, remainingSeconds };
}

export function filterMarketplaceProducts(products, { search = "", category = "Semua", trustStatus = "Semua", sort = "default" } = {}) {
  const term = search.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const searchTarget = `${product.name} ${product.vendor} ${product.category}`.toLowerCase();
    return (!term || searchTarget.includes(term))
      && (category === "Semua" || product.category === category)
      && (trustStatus === "Semua" || product.food_trust_status === trustStatus);
  });

  if (sort === "nearest") return [...filtered].sort((first, second) => first.distanceKm - second.distanceKm);
  if (sort === "lowest-price") return [...filtered].sort((first, second) => first.rescue_price - second.rescue_price);
  return filtered;
}

export async function fetchMarketplaceProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  try {
    const response = await fetch(`${baseUrl}/api/products/marketplace`);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) throw new Error("Marketplace API tidak tersedia");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Respons marketplace tidak valid");
    return data.map(normalizeMarketplaceProduct);
  } catch {
    return fallbackMarketplaceProducts.map(normalizeMarketplaceProduct);
  }
}

export async function fetchMarketplaceProduct(id) {
  const products = await fetchMarketplaceProducts();
  return products.find((product) => product.id === String(id));
}
