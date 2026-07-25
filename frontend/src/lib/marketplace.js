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
  {
    id: "soto-ayam",
    name: "Soto Ayam Lamongan",
    category: "Nasi",
    vendor: "Depot Pak Bambang",
    distanceKm: 1.8,
    original_price: 22000,
    rescue_price: 11000,
    stock: 7,
    food_trust_status: "Fresh",
    trustScore: 88,
    timerMinutes: 150,
    ...demoWindow(6, 150),
    photo_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=85",
    description: "Soto ayam kuah bening dengan suwiran ayam, telur, dan pelengkap. Disajikan dengan nasi putih hangat.",
    pickup_address: "Jl. Seturan Raya 45, Depok, Sleman",
    productionTime: "Hari ini, 09:30 WIB",
    shelfLife: "6 jam sejak produksi",
    storage: "Hangat, tertutup",
    packaging: "Mangkok food-grade, baru",
    reviews: [],
  },
  {
    id: "sandwich-club",
    name: "Club Sandwich + Kentang",
    category: "Snack",
    vendor: "Cafe Corner",
    distanceKm: 2.5,
    original_price: 30000,
    rescue_price: 15000,
    stock: 4,
    food_trust_status: "Layak Dijual",
    trustScore: 82,
    timerMinutes: 180,
    ...demoWindow(9, 180),
    photo_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=85",
    description: "Club sandwich isi ayam, telur, selada, tomat dengan kentang goreng. Cocok untuk makan siang ringan.",
    pickup_address: "Jl. Affandi 12, Caturtunggal, Sleman",
    productionTime: "Hari ini, 08:00 WIB",
    shelfLife: "9 jam sejak produksi",
    storage: "Etalase tertutup, suhu ruang",
    packaging: "Paper box baru",
    reviews: [
      { name: "Andi K.", rating: 5, comment: "Sandwich masih fresh dan kentangnya renyah." },
    ],
  },
  {
    id: "pizza-slice",
    name: "Paket 3 Slice Pizza",
    category: "Resto",
    vendor: "Pizza Corner",
    distanceKm: 1.4,
    original_price: 38000,
    rescue_price: 18000,
    stock: 5,
    food_trust_status: "Fresh",
    trustScore: 91,
    timerMinutes: 140,
    ...demoWindow(8, 140),
    photo_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=85",
    description: "3 slice pizza dengan topping pepperoni, jamur, dan keju mozzarella. Fresh dari oven.",
    pickup_address: "Jl. Kaliurang KM 7, Sleman, Yogyakarta",
    productionTime: "Hari ini, 11:00 WIB",
    shelfLife: "8 jam sejak produksi",
    storage: "Hangat, tertutup",
    packaging: "Pizza box baru",
    reviews: [],
  },
  {
    id: "kue-tradisional",
    name: "Paket Kue Tradisional",
    category: "Dessert",
    vendor: "Dapur Nusantara",
    distanceKm: 0.9,
    original_price: 42000,
    rescue_price: 20000,
    stock: 6,
    food_trust_status: "Layak Dijual",
    trustScore: 86,
    timerMinutes: 200,
    ...demoWindow(12, 200),
    photo_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=85",
    description: "Paket berisi klepon, onde-onde, lemper, dan dadar gulung. Kue jajanan pasar pilihan.",
    pickup_address: "Jl. Godean KM 4, Sleman, Yogyakarta",
    productionTime: "Hari ini, 07:00 WIB",
    shelfLife: "12 jam sejak produksi",
    storage: "Wadah tertutup, suhu ruang",
    packaging: "Kotak food-grade, baru",
    reviews: [
      { name: "Lina H.", rating: 5, comment: "Kuenya masih fresh, enak banget!" },
    ],
  },
  {
    id: "premium-sourdough",
    name: "Premium Sourdough Loaf",
    category: "Bakery",
    vendor: "Artisan Bread Co",
    distanceKm: 1.7,
    original_price: 55000,
    rescue_price: 27000,
    stock: 3,
    food_trust_status: "Fresh",
    trustScore: 98,
    timerMinutes: 45,
    ...demoWindow(14, 45),
    photo_url: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1200&q=85",
    description: "Roti sourdough premium dengan fermentasi alami 24 jam. Kulit renyah, dalam lembut.",
    pickup_address: "Jl. Palagan Tentara Pelajar 56, Sleman",
    productionTime: "Hari ini, 06:30 WIB",
    shelfLife: "14 jam sejak produksi",
    storage: "Rak tertutup, suhu ruang",
    packaging: "Paper bag premium",
    reviews: [],
  },
  {
    id: "burger-combo",
    name: "Burger Beef + Fries",
    category: "Resto",
    vendor: "Burger House",
    distanceKm: 2.3,
    original_price: 48000,
    rescue_price: 24000,
    stock: 4,
    food_trust_status: "Layak Dijual",
    trustScore: 83,
    timerMinutes: 160,
    ...demoWindow(7, 160),
    photo_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85",
    description: "Beef burger dengan keju cheddar, sayuran segar, dan kentang goreng. Paket lengkap.",
    pickup_address: "Jl. Seturan Raya 12, Depok, Sleman",
    productionTime: "Hari ini, 10:30 WIB",
    shelfLife: "7 jam sejak produksi",
    storage: "Hangat, tertutup",
    packaging: "Paper box baru",
    reviews: [
      { name: "Budi T.", rating: 4, comment: "Burgernya enak, porsi kentangnya banyak." },
    ],
  },
  {
    id: "nasi-uduk-komplit",
    name: "Nasi Uduk Komplit",
    category: "Nasi",
    vendor: "Warung Betawi",
    distanceKm: 1.1,
    original_price: 26000,
    rescue_price: 13000,
    stock: 7,
    food_trust_status: "Fresh",
    trustScore: 89,
    timerMinutes: 125,
    ...demoWindow(6, 125),
    photo_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=85",
    description: "Nasi uduk dengan ayam goreng, tempe orek, telur balado, dan kerupuk. Makanan khas Betawi.",
    pickup_address: "Jl. Kaliurang KM 6, Sleman, Yogyakarta",
    productionTime: "Hari ini, 09:00 WIB",
    shelfLife: "6 jam sejak produksi",
    storage: "Hangat, tertutup",
    packaging: "Kotak food-grade, baru",
    reviews: [
      { name: "Dewi S.", rating: 5, comment: "Nasi uduknya enak dan masih hangat!" },
    ],
  },
  {
    id: "donat-premium",
    name: "Paket 6 Donat Premium",
    category: "Dessert",
    vendor: "Sweet Donuts",
    distanceKm: 1.9,
    original_price: 40000,
    rescue_price: 20000,
    stock: 4,
    food_trust_status: "Layak Dijual",
    trustScore: 84,
    timerMinutes: 190,
    ...demoWindow(10, 190),
    photo_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=85",
    description: "6 donat dengan topping cokelat, strawberry, dan glaze. Fresh dari oven pagi ini.",
    pickup_address: "Jl. Affandi 45, Caturtunggal, Sleman",
    productionTime: "Hari ini, 07:30 WIB",
    shelfLife: "10 jam sejak produksi",
    storage: "Etalase tertutup, suhu ruang",
    packaging: "Box kertas baru",
    reviews: [],
  },
  {
    id: "salad-bowl",
    name: "Fresh Salad Bowl",
    category: "Vegan",
    vendor: "Green Kitchen",
    distanceKm: 2.0,
    original_price: 38000,
    rescue_price: 19000,
    stock: 5,
    food_trust_status: "Fresh",
    trustScore: 93,
    timerMinutes: 105,
    ...demoWindow(5, 105),
    photo_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85",
    description: "Salad sayuran segar dengan ayam grilled, telur rebus, dan dressing balsamic.",
    pickup_address: "Jl. Palagan Tentara Pelajar 23, Sleman",
    productionTime: "Hari ini, 11:00 WIB",
    shelfLife: "5 jam sejak produksi",
    storage: "Chiller, tertutup",
    packaging: "Bowl food-grade, baru",
    reviews: [
      { name: "Maya K.", rating: 5, comment: "Sayurannya segar, ayamnya juicy!" },
    ],
  },
  {
    id: "thai-tea-dessert",
    name: "Thai Tea + Dessert Box",
    category: "Drinks",
    vendor: "Thai Corner Cafe",
    distanceKm: 1.5,
    original_price: 33000,
    rescue_price: 16500,
    stock: 6,
    food_trust_status: "Layak Dijual",
    trustScore: 87,
    timerMinutes: 170,
    ...demoWindow(8, 170),
    photo_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=85",
    description: "Thai tea original ukuran large dengan dessert box oreo. Minuman dan dessert favorit.",
    pickup_address: "Jl. Gejayan 56, Depok, Sleman",
    productionTime: "Hari ini, 09:30 WIB",
    shelfLife: "8 jam sejak produksi",
    storage: "Chiller, tertutup",
    packaging: "Cup sealed + box dessert",
    reviews: [
      { name: "Rizky F.", rating: 4, comment: "Thai tea-nya enak, dessert box nya lembut." },
    ],
  },
];

const defaultMetadata = {
  vendor: null,
  distanceKm: null,
  food_trust_status: "Layak Dijual",
  trustScore: 82,
  timerMinutes: 120,
  photo_url: FALLBACK_IMAGE,
  description: null,
  pickup_address: null,
  productionTime: null,
  shelfLife: null,
  storage: null,
  packaging: null,
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
  let publishMs = publishRaw ? new Date(publishRaw).getTime() : undefined;
  let expiresMs = expiresRaw ? new Date(expiresRaw).getTime() : undefined;

  // FIX: Jika expires_at kosong tapi published_at ada, turunkan deadline absolut
  // dari published_at + timerMinutes agar timer konsisten lintas refresh.
  // Jalur "timerMinutes + elapsed" hanya untuk data demo murni tanpa timestamp.
  if (!expiresMs && publishMs && base.timerMinutes) {
    expiresMs = publishMs + Number(base.timerMinutes) * 60 * 1000;
  }

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
    vendor: base.vendor || base.umkm_name || null,
    distanceKm: base.distanceKm != null ? Number(base.distanceKm) : null,
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

export function filterMarketplaceProducts(products, { search = "", category = "Semua", trustStatus = "Semua", sort = "default", promo = false, minRating = null, maxDistanceKm = null, openNow = false } = {}) {
  const term = search.trim().toLowerCase();
  const now = Date.now();

  const filtered = products.filter((product) => {
    // Sembunyikan produk yang tidak boleh tayang (PRD 12.6, guardrail 13.3)
    // 1. Stok habis (null/undefined = tersedia)
    if (Number.isFinite(product.stock) && product.stock <= 0) return false;

    // 2. Status Food Trust tidak layak
    const status = product.food_trust_status;
    if (status === "Tidak Layak Konsumsi" || status === "Tidak Disarankan Dijual") return false;

    // 3. Sudah expired (skor <= 0 atau sisa waktu <= 0)
    const { score, remainingSeconds } = computeProductScore(product, now, 0);
    if (score <= 0 || remainingSeconds <= 0) return false;

    // Filter search, kategori, dan status
    const searchTarget = `${product.name} ${product.vendor} ${product.category}`.toLowerCase();
    if (term && !searchTarget.includes(term)) return false;
    if (category !== "Semua" && product.category !== category) return false;
    if (trustStatus !== "Semua" && product.food_trust_status !== trustStatus) return false;

    // Filter promo: diskon >= 40%
    if (promo) {
      const originalPrice = Number(product.original_price) || 0;
      const rescuePrice = Number(product.rescue_price) || originalPrice;
      const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - rescuePrice) / originalPrice) * 100) : 0;
      if (discountPercent < 40) return false;
    }

    // Filter rating: rating >= minRating (pakai fallback rating seperti di render kartu)
    if (minRating !== null) {
      const rating = product.rating ?? (4.5 + ((product.id?.length ?? 0) % 5) * 0.1);
      if (rating < minRating) return false;
    }

    // Filter distance: distanceKm < maxDistanceKm
    if (maxDistanceKm !== null) {
      const distance = Number(product.distanceKm ?? 999);
      if (distance >= maxDistanceKm) return false;
    }

    // Filter openNow: remainingSeconds > 0 (produk belum expired)
    if (openNow) {
      if (remainingSeconds <= 0) return false;
    }

    return true;
  });

  if (sort === "nearest") return [...filtered].sort((first, second) => first.distanceKm - second.distanceKm);
  if (sort === "lowest-price") return [...filtered].sort((first, second) => first.rescue_price - second.rescue_price);
  return filtered;
}

/**
 * Fetch produk marketplace dari API backend. Jika gagal, gunakan data demo.
 *
 * Mengembalikan objek `{ products, source }`:
 *   - `products` — array produk yang sudah dinormalisasi.
 *   - `source`  — `"api"` jika data dari backend, `"fallback"` jika demo lokal.
 *
 * Backward compatibility: hasil juga bertindak sebagai array (memiliki
 * `.map`, `.filter`, dll.) via spread, sehingga pemanggil lama yang
 * langsung memanggil `result.map(...)` tetap berfungsi.
 */
export async function fetchMarketplaceProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const makeResult = (products, source) => {
    const result = [...products];
    result.products = products;
    result.source = source;
    return result;
  };
  try {
    const response = await fetch(`${baseUrl}/api/products/marketplace`, {
      signal: AbortSignal.timeout(3000),
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) throw new Error("Marketplace API tidak tersedia");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Respons marketplace tidak valid");
    return makeResult(data.map(normalizeMarketplaceProduct), "api");
  } catch {
    return makeResult(fallbackMarketplaceProducts.map(normalizeMarketplaceProduct), "fallback");
  }
}

/**
 * Pilih produk rekomendasi untuk section "Makanan Rekomendasi".
 *
 * @param {Array} products - array produk yang sudah difilter/sorted
 * @param {object} [options] - opsi untuk pemilihan (now, elapsedSeconds)
 * @returns {Array} max 4 produk untuk section rekomendasi
 */
export function selectRecommendedProducts(products, options = {}) {
  const { now = Date.now(), elapsedSeconds = 0 } = options;

  // Jika catalog besar (> 12 produk), gunakan produk ke-13 s.d. ke-16
  if (products.length > 12) {
    return products.slice(12, 16);
  }

  // Jika tidak ada produk sama sekali
  if (products.length === 0) {
    return [];
  }

  // Jika catalog kecil (<= 12 produk), pilih subset berdasarkan Food Score tertinggi
  const scored = products.map(product => {
    const { score } = computeProductScore(product, now, elapsedSeconds);
    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 4).map(item => item.product);
}

export async function fetchMarketplaceProduct(id) {
  const result = await fetchMarketplaceProducts();
  const product = result.products.find((product) => product.id === String(id));
  return { product, source: result.source };
}
