// Ulasan Keyword — Richard Firmansyah (Batch 2, sisi customer)
//
// Alih-alih hanya mengandalkan moderasi & rating manual, Savora menandai
// tingkat kegawatan ulasan per restoran berdasarkan keyword. Mesin
// klasifikasi utama (rule-based / backend) adalah tanggung jawab modul
// Score (Ridwan) & Review (Nadi). Di sisi customer, modul ini:
<<<<<<< HEAD
//   1. Menghormati level yang sudah dihitung backend bila tersedia.
//   2. Menyediakan fallback klasifikasi lokal agar UI lomba tetap jalan.
=======
//   1. Menghormati level yang sudah dihitung backend bila tersedia
//      (safety_level dari API = prioritas tertinggi).
//   2. Menyediakan fallback klasifikasi lokal yang MENIRU threshold
//      backend sesuai PRD 12.7 (REVISI #16), BUKAN worst-case.
>>>>>>> feat/customer-pages

// Tiga tingkat keamanan, dari paling gawat ke paling aman.
export const SAFETY_LEVELS = {
  gawat: { key: "gawat", label: "Gawat", rank: 3, className: "is-gawat" },
  warning: { key: "warning", label: "Warning", rank: 2, className: "is-warning" },
  aman: { key: "aman", label: "Aman", rank: 1, className: "is-aman" },
};

<<<<<<< HEAD
// Kamus keyword → level. Disusun berbahasa Indonesia sesuai konteks kuliner.
// Dibuat cukup lengkap untuk demo, tetap sederhana untuk dijelaskan ke juri.
const KEYWORD_MAP = [
  { level: "gawat", words: ["basi", "berjamur", "jamur", "busuk", "beracun", "keracunan", "berulat", "berlendir", "kadaluarsa", "kadaluwarsa", "expired"] },
  { level: "warning", words: ["bau", "asam", "tengik", "apek", "lembek", "berair", "kurang segar", "hampir basi", "aneh", "melempem"] },
  { level: "aman", words: ["enak", "segar", "fresh", "lezat", "mantap", "bersih", "higienis", "wangi", "gurih", "recommended", "rekomendasi"] },
=======
// Kamus keyword → level (PRD 12.7, sumber kebenaran tunggal).
// Disusun berbahasa Indonesia sesuai konteks kuliner. Sinonim lokal
// ditambahkan selama levelnya konsisten dengan PRD.
const KEYWORD_MAP = [
  {
    level: "gawat",
    words: [
      // PRD 12.7: basi, bau busuk, berjamur, berlendir, sakit perut, keracunan
      "basi", "bau busuk", "berjamur", "berlendir", "sakit perut", "keracunan",
      // Sinonim lokal konsisten level Gawat
      "jamur", "busuk", "beracun", "berulat", "kadaluarsa", "kadaluwarsa", "expired",
    ],
  },
  {
    level: "warning",
    words: [
      // PRD 12.7: kurang segar, dingin, keras, agak asam, bau kurang sedap,
      // kemasan rusak, porsi kurang
      "kurang segar", "dingin", "keras", "agak asam", "bau kurang sedap",
      "kemasan rusak", "porsi kurang",
      // Sinonim lokal konsisten level Warning
      "bau", "asam", "tengik", "apek", "lembek", "berair", "hampir basi",
      "aneh", "melempem",
    ],
  },
  {
    level: "aman",
    words: [
      // PRD 12.7: enak, segar, fresh, hangat, bersih, layak, sesuai deskripsi
      "enak", "segar", "fresh", "hangat", "bersih", "layak", "sesuai deskripsi",
      // Sinonim lokal konsisten level Aman
      "lezat", "mantap", "higienis", "wangi", "gurih", "recommended", "rekomendasi",
    ],
  },
>>>>>>> feat/customer-pages
];

/**
 * Normalisasi key level ke salah satu SAFETY_LEVELS.
 * @param {string} value
 * @returns {object|null}
 */
export function normalizeSafetyLevel(value) {
  if (!value) return null;
  const key = String(value).trim().toLowerCase();
  return SAFETY_LEVELS[key] || null;
}

/**
 * Klasifikasikan satu teks ulasan menjadi level keamanan + keyword yang cocok.
 * Level paling gawat menang bila beberapa keyword muncul sekaligus.
<<<<<<< HEAD
=======
 *
 * Fungsi ini dipakai untuk dua tujuan:
 *   - Highlight keyword pada teks ulasan di halaman detail.
 *   - Input per-review untuk aggregasi threshold di deriveRestaurantSafety.
 *
>>>>>>> feat/customer-pages
 * @param {string} text isi ulasan.
 * @returns {{ level: object, matched: string[] }}
 */
export function classifyReviewText(text) {
  const haystack = String(text || "").toLowerCase();
  const matched = [];
  let best = SAFETY_LEVELS.aman;
  let bestRank = 0; // 0 = belum ada keyword yang cocok.

  for (const group of KEYWORD_MAP) {
    const level = SAFETY_LEVELS[group.level];
    for (const word of group.words) {
      if (haystack.includes(word)) {
        matched.push(word);
        if (level.rank > bestRank) {
          bestRank = level.rank;
          best = level;
        }
      }
    }
  }

  // Tanpa keyword sama sekali: anggap netral/aman agar tidak memberi alarm palsu.
  return { level: bestRank === 0 ? SAFETY_LEVELS.aman : best, matched };
}

/**
 * Turunkan status keamanan restoran dari kumpulan ulasan.
 *
 * Prioritas sumber:
 *   1. `apiLevel` — level yang sudah dihitung backend (paling dipercaya).
<<<<<<< HEAD
 *   2. Agregasi keyword lokal dari daftar review.
 *
 * @param {Array<{comment?: string, text?: string}>} reviews daftar ulasan.
=======
 *   2. Agregasi keyword lokal dengan THRESHOLD sesuai PRD 12.7 (REVISI #16).
 *      BUKAN worst-case (1 keyword Gawat langsung badge Gawat) — itu dilarang.
 *
 * Threshold badge (PRD 12.7):
 *   - Badge hanya tampil jika ada >= 3 review.
 *   - Gawat: >= 3 keyword Gawat dari >= 2 reviewer (customer) berbeda.
 *   - Warning: >= 3 keyword Warning ATAU 1-2 keyword Gawat.
 *   - Selain itu: Aman.
 *
 * Catatan: rolling window 30 hari dan verifikasi admin ada di backend;
 * fallback lokal hanya menerapkan threshold di atas.
 *
 * @param {Array<{comment?: string, text?: string, name?: string}>} reviews daftar ulasan.
>>>>>>> feat/customer-pages
 * @param {string} [apiLevel] level keamanan dari backend, bila ada.
 * @returns {{ level: object, counts: {gawat:number,warning:number,aman:number}, keywords: string[] }}
 */
export function deriveRestaurantSafety(reviews, apiLevel) {
<<<<<<< HEAD
  const counts = { gawat: 0, warning: 0, aman: 0 };
  const keywords = new Set();
  let worst = SAFETY_LEVELS.aman;
  let worstRank = 0;

  for (const review of Array.isArray(reviews) ? reviews : []) {
    const { level, matched } = classifyReviewText(review?.comment ?? review?.text);
    if (matched.length > 0) {
      counts[level.key] += 1;
      matched.forEach((word) => keywords.add(word));
      if (level.rank > worstRank) {
        worstRank = level.rank;
        worst = level;
      }
    }
  }

  const fromApi = normalizeSafetyLevel(apiLevel);
  const level = fromApi || (worstRank === 0 ? SAFETY_LEVELS.aman : worst);
  return { level, counts, keywords: [...keywords] };
=======
  const allKeywords = new Set();

  // Hitung keyword per level dan lacak reviewer unik yang menyebut keyword gawat.
  let totalGawatKeywords = 0;
  let totalWarningKeywords = 0;
  const gawatReviewers = new Set();
  const reviewList = Array.isArray(reviews) ? reviews : [];

  // counts: berapa review yang mengandung keyword level X (untuk backward compat).
  const counts = { gawat: 0, warning: 0, aman: 0 };

  for (const review of reviewList) {
    const { level, matched } = classifyReviewText(review?.comment ?? review?.text);
    if (matched.length > 0) {
      counts[level.key] += 1;
      matched.forEach((word) => allKeywords.add(word));
    }

    // Hitung keyword gawat & warning dari review ini secara terpisah.
    const reviewText = String(review?.comment ?? review?.text ?? "").toLowerCase();
    let reviewGawatCount = 0;
    let reviewWarningCount = 0;

    for (const group of KEYWORD_MAP) {
      for (const word of group.words) {
        if (reviewText.includes(word)) {
          if (group.level === "gawat") reviewGawatCount++;
          else if (group.level === "warning") reviewWarningCount++;
        }
      }
    }

    if (reviewGawatCount > 0) {
      totalGawatKeywords += reviewGawatCount;
      // Gunakan nama reviewer sebagai identitas unik; fallback ke indeks.
      const reviewerKey = review?.name || review?.customer || `__anon_${reviewList.indexOf(review)}`;
      gawatReviewers.add(reviewerKey);
    }
    totalWarningKeywords += reviewWarningCount;
  }

  // Backend level = prioritas tertinggi.
  const fromApi = normalizeSafetyLevel(apiLevel);
  if (fromApi) {
    return { level: fromApi, counts, keywords: [...allKeywords] };
  }

  // Fallback lokal: terapkan threshold PRD 12.7.
  // Badge hanya tampil jika ada >= 3 review.
  if (reviewList.length < 3) {
    return { level: SAFETY_LEVELS.aman, counts, keywords: [...allKeywords] };
  }

  // Gawat: >= 3 keyword Gawat dari >= 2 customer berbeda.
  if (totalGawatKeywords >= 3 && gawatReviewers.size >= 2) {
    return { level: SAFETY_LEVELS.gawat, counts, keywords: [...allKeywords] };
  }

  // Warning: >= 3 keyword Warning ATAU 1-2 keyword Gawat.
  if (totalWarningKeywords >= 3 || (totalGawatKeywords >= 1 && totalGawatKeywords <= 2)) {
    return { level: SAFETY_LEVELS.warning, counts, keywords: [...allKeywords] };
  }

  // Selain itu: Aman.
  return { level: SAFETY_LEVELS.aman, counts, keywords: [...allKeywords] };
>>>>>>> feat/customer-pages
}
