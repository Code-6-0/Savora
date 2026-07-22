import test from "node:test";
import assert from "node:assert/strict";
import {
  computeFoodScore,
<<<<<<< HEAD
  foodScoreBand,
=======
  computeFoodScoreFromDates,
  foodScoreBand,
  initialFoodScore,
  rescueTimeColor,
>>>>>>> feat/customer-pages
  rescueTimeLabel,
  rescueTimeParts,
} from "../src/lib/foodScore.js";

<<<<<<< HEAD
=======
// ---------------------------------------------------------------------------
// computeFoodScore (jalur fallback — satuan bebas)
// ---------------------------------------------------------------------------

>>>>>>> feat/customer-pages
test("computeFoodScore returns the base score when the rescue window is full", () => {
  assert.equal(computeFoodScore(120, 120, 92), 92);
});

test("computeFoodScore falls to zero exactly at expiry", () => {
  assert.equal(computeFoodScore(0, 120, 92), 0);
});

test("computeFoodScore decreases as the remaining rescue time shrinks", () => {
  const full = computeFoodScore(120, 120, 100);
  const half = computeFoodScore(60, 120, 100);
  const nearlyGone = computeFoodScore(6, 120, 100);
  assert.ok(full > half, "half-window score should be lower than full");
  assert.ok(half > nearlyGone, "near-expiry score should be lowest");
});

test("computeFoodScore never exceeds the UMKM base score (ceiling)", () => {
  assert.ok(computeFoodScore(999, 120, 80) <= 80);
});

test("computeFoodScore clamps invalid inputs to a safe range", () => {
  const score = computeFoodScore(-50, 120, 100);
  assert.ok(score >= 0 && score <= 100);
});

<<<<<<< HEAD
=======
// ---------------------------------------------------------------------------
// computeFoodScoreFromDates — PRD 12.6 Test Case WAJIB
// (skor_awal = 100, masa layak = 8 jam)
// ---------------------------------------------------------------------------

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
const PUBLISH = 0; // epoch ms arbitrary
const EXPIRES = PUBLISH + EIGHT_HOURS_MS;

test("PRD 12.6 wajib: sisa 8 jam → food_score 100", () => {
  const now = EXPIRES - 8 * 3600 * 1000; // f = 1.00
  assert.equal(computeFoodScoreFromDates(100, PUBLISH, EXPIRES, now), 100);
});

test("PRD 12.6 wajib: sisa 6 jam → food_score 83", () => {
  const now = EXPIRES - 6 * 3600 * 1000; // f = 0.75
  assert.equal(computeFoodScoreFromDates(100, PUBLISH, EXPIRES, now), 83);
});

test("PRD 12.6 wajib: sisa 4 jam → food_score 64", () => {
  const now = EXPIRES - 4 * 3600 * 1000; // f = 0.50
  assert.equal(computeFoodScoreFromDates(100, PUBLISH, EXPIRES, now), 64);
});

test("PRD 12.6 wajib: sisa 2 jam → food_score 41", () => {
  const now = EXPIRES - 2 * 3600 * 1000; // f = 0.25
  assert.equal(computeFoodScoreFromDates(100, PUBLISH, EXPIRES, now), 41);
});

test("PRD 12.6 wajib: sisa 1 jam → food_score 26", () => {
  const now = EXPIRES - 1 * 3600 * 1000; // f = 0.125
  assert.equal(computeFoodScoreFromDates(100, PUBLISH, EXPIRES, now), 26);
});

test("PRD 12.6 wajib: sisa 0 jam → food_score 0", () => {
  const now = EXPIRES; // f = 0.00
  assert.equal(computeFoodScoreFromDates(100, PUBLISH, EXPIRES, now), 0);
});

// ---------------------------------------------------------------------------
// computeFoodScoreFromDates — edge cases
// ---------------------------------------------------------------------------

test("computeFoodScoreFromDates returns 0 when total <= 0", () => {
  assert.equal(computeFoodScoreFromDates(100, 1000, 1000, 500), 0);
  assert.equal(computeFoodScoreFromDates(100, 1000, 500, 200), 0);
});

test("computeFoodScoreFromDates clamps f to [0,1] for clock drift", () => {
  // now before publish → f > 1 → clamp to 1
  assert.equal(computeFoodScoreFromDates(100, PUBLISH, EXPIRES, PUBLISH - 9999), 100);
  // now after expires → f < 0 → clamp to 0
  assert.equal(computeFoodScoreFromDates(100, PUBLISH, EXPIRES, EXPIRES + 9999), 0);
});

test("computeFoodScoreFromDates uses locked base score correctly", () => {
  // Layak Dijual base = 85
  const now = EXPIRES - 8 * 3600 * 1000; // f = 1
  assert.equal(computeFoodScoreFromDates(85, PUBLISH, EXPIRES, now), 85);
  // Segera Dijual base = 70
  assert.equal(computeFoodScoreFromDates(70, PUBLISH, EXPIRES, now), 70);
});

// ---------------------------------------------------------------------------
// initialFoodScore — skor awal terkunci dari status Food Trust Index
// ---------------------------------------------------------------------------

test("initialFoodScore returns correct locked scores", () => {
  assert.equal(initialFoodScore("Fresh"), 100);
  assert.equal(initialFoodScore("Layak Dijual"), 85);
  assert.equal(initialFoodScore("Segera Dijual"), 70);
});

test("initialFoodScore returns null for non-eligible statuses", () => {
  assert.equal(initialFoodScore("Tidak Disarankan Dijual"), null);
  assert.equal(initialFoodScore("Tidak Layak Konsumsi"), null);
  assert.equal(initialFoodScore(""), null);
  assert.equal(initialFoodScore(undefined), null);
});

// ---------------------------------------------------------------------------
// foodScoreBand
// ---------------------------------------------------------------------------

>>>>>>> feat/customer-pages
test("foodScoreBand maps scores to the correct display band", () => {
  assert.equal(foodScoreBand(92).label, "Sangat Layak");
  assert.equal(foodScoreBand(70).label, "Layak");
  assert.equal(foodScoreBand(40).label, "Segera Ambil");
  assert.equal(foodScoreBand(10).label, "Kritis");
  assert.equal(foodScoreBand(0).label, "Kedaluwarsa");
});

<<<<<<< HEAD
=======
// ---------------------------------------------------------------------------
// rescueTimeColor — color indicator sisa waktu ABSOLUT (PRD 5.1 & REVISI #31)
// ---------------------------------------------------------------------------

test("rescueTimeColor: merah < 1 jam", () => {
  assert.equal(rescueTimeColor(0).key, "red");
  assert.equal(rescueTimeColor(30 * 60).key, "red");
  assert.equal(rescueTimeColor(3599).key, "red");
});

test("rescueTimeColor: kuning 1-3 jam", () => {
  assert.equal(rescueTimeColor(3600).key, "yellow");
  assert.equal(rescueTimeColor(2 * 3600).key, "yellow");
  assert.equal(rescueTimeColor(3 * 3600 - 1).key, "yellow");
});

test("rescueTimeColor: hijau > 3 jam", () => {
  assert.equal(rescueTimeColor(3 * 3600).key, "green");
  assert.equal(rescueTimeColor(5 * 3600).key, "green");
});

test("rescueTimeColor paralel with band skor (PRD REVISI #31 example)", () => {
  // Produk 24 jam dengan sisa 5 jam: hijau (> 3 jam) tapi band "Segera Ambil"
  // (f ≈ 0.21 → score ≈ 35). Dua indikator BOLEH berbeda.
  const remainingSeconds = 5 * 3600;
  const timeColor = rescueTimeColor(remainingSeconds);
  assert.equal(timeColor.key, "green", "sisa 5 jam → hijau");
  // f = 5/24 ≈ 0.208, score = round(100 * 0.208^0.65) ≈ 35
  const score = computeFoodScoreFromDates(100, 0, 24 * 3600 * 1000, 19 * 3600 * 1000);
  const band = foodScoreBand(score);
  assert.equal(band.label, "Segera Ambil", "score ~35 → Segera Ambil");
  // They differ — this is by design per PRD REVISI #31
  assert.notEqual(timeColor.key, "red");
});

// ---------------------------------------------------------------------------
// rescueTimeLabel & rescueTimeParts
// ---------------------------------------------------------------------------

>>>>>>> feat/customer-pages
test("rescueTimeLabel formats hours, minutes, and expiry", () => {
  assert.equal(rescueTimeLabel(2 * 3600 + 15 * 60), "2j 15m");
  assert.equal(rescueTimeLabel(45 * 60), "45m");
  assert.equal(rescueTimeLabel(0), "0d");
});

test("rescueTimeParts zero-pads hours, minutes, and seconds", () => {
  assert.deepEqual(rescueTimeParts(3661), { hours: "01", minutes: "01", seconds: "01" });
  assert.deepEqual(rescueTimeParts(-10), { hours: "00", minutes: "00", seconds: "00" });
});
