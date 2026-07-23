// Food Score — Richard Firmansyah (Batch 2)
//
// Food Score adalah indikator kelayakan makanan yang menurun seiring sisa
// waktu rescue makin sedikit menuju batas expired. Model ini rule-based dan
// mengikuti spesifikasi PRD Section 12.6 (sumber kebenaran tunggal): power
// decay dengan eksponen γ = 0,65 terhadap fraksi sisa masa layak.
//
// Kurva ini **cekung (concave)**: skor bertahan relatif tinggi di awal masa
// jual lalu menurun lebih cepat menjelang kedaluwarsa — sesuai perilaku
// degradasi kualitas makanan yang umumnya non-linear (kinetika deteriorasi).
//
// Referensi pendukung (PRD REVISI #11, dipakai di dokumentasi rumus, bukan
// klaim pengukuran lab):
// - FreshTrack: an innovative IoT-sensor-driven food freshness estimation
//   framework integrating blockchain (Scientific Reports, 2026 —
//   nature.com/articles/s41598-026-44579-1). Savora mengadopsi prinsip
//   non-linear-nya secara heuristik berbasis waktu, tanpa sensor.
// - Literatur kinetic shelf-life makanan perishable (Food Chemistry, 2023).

// Batas skor tampilan.
const MIN_SCORE = 0;
const MAX_SCORE = 100;

// Eksponen decay (< 1 = cekung/concave: skor bertahan di awal, turun cepat di akhir).
const DECAY_EXPONENT = 0.65;

// Skor awal DIKUNCI dari status Food Trust Index saat listing dipublikasikan
// (PRD 12.6). Status di luar tabel ini tidak tayang (tanpa skor).
const INITIAL_SCORE_BY_STATUS = {
  Fresh: 100,
  "Layak Dijual": 85,
  "Segera Dijual": 70,
};

/**
 * Skor awal terkunci berdasarkan status Food Trust Index saat publish.
 * @param {string} status status Food Trust Index.
 * @returns {number} skor awal (100/85/70) atau null bila status tidak tayang.
 */
export function initialFoodScore(status) {
  return INITIAL_SCORE_BY_STATUS[status] ?? null;
}

function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return MAX_SCORE;
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, number));
}

/**
 * Hitung Food Score 0-100 dari sisa waktu rescue (basis satuan bebas).
 *
 * Dipakai untuk jalur fallback data demo yang hanya punya `timerMinutes`
 * (tanpa timestamp). Untuk data ber-timestamp gunakan {@link computeFoodScoreFromDates}.
 *
 * @param {number} remaining sisa waktu (satuan bebas: detik/menit).
 * @param {number} window total jendela rescue dalam satuan yang sama dengan `remaining`.
 * @param {number} baseScore skor awal/plafon (mis. skor awal Food Trust Index). Default 100.
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

/**
 * Hitung Food Score 0-100 dari timestamp absolut (PRD 12.6 — sumber kebenaran).
 *
 * total = expiresAt − publishAt; f = clamp((expiresAt − now) / total, 0, 1);
 * food_score = round(skorAwal × f^γ). Jika total ≤ 0 → skor 0.
 *
 * Basis ini tidak reset saat halaman dimuat ulang karena diikat ke waktu
 * publish & expired yang sebenarnya, bukan waktu mount.
 *
 * @param {number} baseScore skor awal terkunci (100/85/70).
 * @param {number} publishAt waktu publish listing (epoch ms).
 * @param {number} expiresAt waktu kedaluwarsa (epoch ms).
 * @param {number} now waktu sekarang (epoch ms).
 * @returns {number} Food Score bulat 0-100.
 */
export function computeFoodScoreFromDates(baseScore, publishAt, expiresAt, now) {
  const total = Number(expiresAt) - Number(publishAt);
  if (!(total > 0)) return 0;
  let f = (Number(expiresAt) - Number(now)) / total;
  f = Math.min(1, Math.max(0, f));
  return Math.round(clampScore(baseScore) * Math.pow(f, DECAY_EXPONENT));
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

// Color indicator sisa waktu ABSOLUT (PRD 5.1 & 12.6, REVISI #31): merah < 1 jam,
// kuning 1-3 jam, hijau > 3 jam. Indikator ini PARALEL dengan band skor (fraksi
// masa layak) dan memang boleh berbeda — menjawab "berapa jam lagi harus diambil",
// bukan "seberapa layak relatif terhadap masa jualnya".
const RESCUE_HOUR = 3600;

/**
 * Petakan sisa waktu absolut ke color indicator timer.
 * @param {number} totalSeconds sisa waktu dalam detik.
 * @returns {{ key: string, label: string, className: string }}
 */
export function rescueTimeColor(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  if (seconds < RESCUE_HOUR) return { key: "red", label: "< 1 jam", className: "is-red" };
  if (seconds < 3 * RESCUE_HOUR) return { key: "yellow", label: "1-3 jam", className: "is-yellow" };
  return { key: "green", label: "> 3 jam", className: "is-green" };
}
