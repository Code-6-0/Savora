// Food Score — Richard Firmansyah (Batch 2)
//
// Food Score adalah indikator kelayakan makanan yang menurun seiring sisa
// waktu rescue makin sedikit menuju batas expired. Model ini rule-based dan
// mengacu pada konsep freshness index / shelf-life pada makanan perishable:
// kesegaran cenderung bertahan di awal masa simpan lalu turun lebih cepat
// menjelang batas layak konsumsi (kurva sedikit konveks).
//
// Referensi konsep (dipakai di dokumentasi rumus, bukan klaim lab):
// - Freshness index vs waktu penyimpanan (MDPI Foods 2020).
// - Dynamic pricing perishable food berbasis waktu ke expired (POMS/Wiley).

// Batas skor tampilan.
const MIN_SCORE = 0;
const MAX_SCORE = 100;

// Eksponen decay (< 1 = konveks: skor bertahan di awal, turun cepat di akhir).
const DECAY_EXPONENT = 0.65;

function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return MAX_SCORE;
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, number));
}

/**
 * Hitung Food Score 0-100 dari sisa waktu rescue.
 *
 * @param {number} remaining sisa waktu (satuan bebas: detik/menit).
 * @param {number} window total jendela rescue dalam satuan yang sama dengan `remaining`.
 *   Biasanya diisi sisa waktu saat produk pertama dimuat, sehingga skor mulai
 *   dari `baseScore` lalu meluruh ke 0 tepat saat expired.
 * @param {number} baseScore skor awal/plafon dari UMKM (mis. Food Trust Index). Default 100.
 * @returns {number} Food Score bulat 0-100.
 */
export function computeFoodScore(remaining, window, baseScore = MAX_SCORE) {
  const totalWindow = Number(window) > 0 ? Number(window) : 1;
  const remainingSafe = Math.max(0, Math.min(Number(remaining) || 0, totalWindow));
  const base = clampScore(baseScore);
  const freshnessFraction = remainingSafe / totalWindow;
  const decay = Math.pow(freshnessFraction, DECAY_EXPONENT);
  return Math.round(base * decay);
}

// Ambang band Food Score → label + kelas warna (dipetakan ke CSS marketplace).
const SCORE_BANDS = [
  { min: 80, label: "Sangat Layak", tone: "fresh", className: "is-fresh" },
  { min: 60, label: "Layak", tone: "eligible", className: "is-eligible" },
  { min: 35, label: "Segera Ambil", tone: "urgent", className: "is-urgent" },
  { min: 1, label: "Kritis", tone: "critical", className: "is-critical" },
  { min: 0, label: "Kedaluwarsa", tone: "expired", className: "is-expired" },
];

/**
 * Petakan Food Score ke band tampilan (label, tone, kelas CSS).
 * @param {number} score Food Score 0-100.
 */
export function foodScoreBand(score) {
  const value = clampScore(score);
  return SCORE_BANDS.find((band) => value >= band.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Format sisa waktu rescue menjadi label ringkas untuk kartu, mis. "2j 15m"
 * atau "45m" atau "0m" saat sudah lewat.
 * @param {number} totalSeconds sisa waktu dalam detik.
 */
export function rescueTimeLabel(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}j ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}d`;
}

/**
 * Pecah detik menjadi bagian jam/menit/detik dua digit untuk timer detail.
 * @param {number} totalSeconds sisa waktu dalam detik.
 */
export function rescueTimeParts(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return {
    hours: String(Math.floor(seconds / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((seconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(seconds % 60).padStart(2, "0"),
  };
}
