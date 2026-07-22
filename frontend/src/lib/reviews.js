// Ulasan Keyword — Richard Firmansyah (Batch 2, sisi customer)
//
// Alih-alih hanya mengandalkan moderasi & rating manual, Savora menandai
// tingkat kegawatan ulasan per restoran berdasarkan keyword. Mesin
// klasifikasi utama (rule-based / backend) adalah tanggung jawab modul
// Score (Ridwan) & Review (Nadi). Di sisi customer, modul ini:
//   1. Menghormati level yang sudah dihitung backend bila tersedia.
//   2. Menyediakan fallback klasifikasi lokal agar UI lomba tetap jalan.

// Tiga tingkat keamanan, dari paling gawat ke paling aman.
export const SAFETY_LEVELS = {
  gawat: { key: "gawat", label: "Gawat", rank: 3, className: "is-gawat" },
  warning: { key: "warning", label: "Warning", rank: 2, className: "is-warning" },
  aman: { key: "aman", label: "Aman", rank: 1, className: "is-aman" },
};

// Kamus keyword → level. Disusun berbahasa Indonesia sesuai konteks kuliner.
// Dibuat cukup lengkap untuk demo, tetap sederhana untuk dijelaskan ke juri.
const KEYWORD_MAP = [
  { level: "gawat", words: ["basi", "berjamur", "jamur", "busuk", "beracun", "keracunan", "berulat", "berlendir", "kadaluarsa", "kadaluwarsa", "expired"] },
  { level: "warning", words: ["bau", "asam", "tengik", "apek", "lembek", "berair", "kurang segar", "hampir basi", "aneh", "melempem"] },
  { level: "aman", words: ["enak", "segar", "fresh", "lezat", "mantap", "bersih", "higienis", "wangi", "gurih", "recommended", "rekomendasi"] },
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
 *   2. Agregasi keyword lokal dari daftar review.
 *
 * @param {Array<{comment?: string, text?: string}>} reviews daftar ulasan.
 * @param {string} [apiLevel] level keamanan dari backend, bila ada.
 * @returns {{ level: object, counts: {gawat:number,warning:number,aman:number}, keywords: string[] }}
 */
export function deriveRestaurantSafety(reviews, apiLevel) {
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
}
