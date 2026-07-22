import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyReviewText,
  deriveRestaurantSafety,
  normalizeSafetyLevel,
  SAFETY_LEVELS,
} from "../src/lib/reviews.js";

<<<<<<< HEAD
=======
// ---------------------------------------------------------------------------
// classifyReviewText — per-review text classification (tidak berubah)
// ---------------------------------------------------------------------------

>>>>>>> feat/customer-pages
test("classifyReviewText flags severe keywords as Gawat", () => {
  const result = classifyReviewText("Makanannya basi dan ada jamur");
  assert.equal(result.level.key, "gawat");
  assert.ok(result.matched.includes("basi"));
});

test("classifyReviewText flags cautionary keywords as Warning", () => {
<<<<<<< HEAD
  assert.equal(classifyReviewText("baunya agak aneh").level.key, "warning");
=======
  assert.equal(classifyReviewText("baunya agak asam").level.key, "warning");
>>>>>>> feat/customer-pages
});

test("classifyReviewText treats positive keywords as Aman", () => {
  assert.equal(classifyReviewText("enak dan segar banget").level.key, "aman");
});

test("classifyReviewText escalates to the worst level when keywords mix", () => {
  // "enak" (aman) + "basi" (gawat) => harus menang yang paling gawat.
  assert.equal(classifyReviewText("rasanya enak tapi kok basi").level.key, "gawat");
});

test("classifyReviewText defaults to Aman when no keyword matches", () => {
  const result = classifyReviewText("pickup lancar dan cepat");
  assert.equal(result.level.key, "aman");
  assert.deepEqual(result.matched, []);
});

<<<<<<< HEAD
test("deriveRestaurantSafety aggregates the worst level across reviews", () => {
  const reviews = [
    { comment: "enak dan bersih" },
    { comment: "baunya sedikit asam" },
    { comment: "porsi besar" },
  ];
  const safety = deriveRestaurantSafety(reviews);
  assert.equal(safety.level.key, "warning");
  assert.equal(safety.counts.aman, 1);
  assert.equal(safety.counts.warning, 1);
});

test("deriveRestaurantSafety prefers the backend-provided level when present", () => {
  const reviews = [{ comment: "enak semua" }];
  const safety = deriveRestaurantSafety(reviews, "Gawat");
  assert.equal(safety.level.key, "gawat");
});

test("deriveRestaurantSafety is safe with empty or invalid input", () => {
=======
test("classifyReviewText uses PRD 12.7 keyword dictionary", () => {
  // Gawat: basi, bau busuk, berjamur, berlendir, sakit perut, keracunan
  assert.equal(classifyReviewText("bau busuk sekali").level.key, "gawat");
  assert.equal(classifyReviewText("berlendir dan keracunan").level.key, "gawat");
  // Warning: kurang segar, dingin, keras, agak asam, bau kurang sedap, kemasan rusak, porsi kurang
  assert.equal(classifyReviewText("kurang segar dan dingin").level.key, "warning");
  assert.equal(classifyReviewText("kemasan rusak, porsi kurang").level.key, "warning");
  // Aman: enak, segar, fresh, hangat, bersih, layak, sesuai deskripsi
  assert.equal(classifyReviewText("hangat dan layak, sesuai deskripsi").level.key, "aman");
});

// ---------------------------------------------------------------------------
// deriveRestaurantSafety — threshold rules (PRD 12.7, REVISI #16)
// ---------------------------------------------------------------------------

test("deriveRestaurantSafety: badge TIDAK tampil jika < 3 review", () => {
  // 1 review dengan keyword gawat → badge tetap Aman (threshold tidak tercapai).
  const reviews = [{ name: "Andi", comment: "basi dan berjamur" }];
  const safety = deriveRestaurantSafety(reviews);
  assert.equal(safety.level.key, "aman", "< 3 review → badge tidak tampil (Aman)");
});

test("deriveRestaurantSafety: Gawat requires >= 3 keyword from >= 2 reviewers", () => {
  // 3 keyword gawat dari 2 reviewer berbeda → Gawat.
  const reviews = [
    { name: "Andi", comment: "basi dan berjamur" }, // 2 keyword gawat
    { name: "Budi", comment: "bau busuk" },         // 1 keyword gawat
    { name: "Citra", comment: "enak sih" },         // 0 keyword gawat
  ];
  const safety = deriveRestaurantSafety(reviews);
  assert.equal(safety.level.key, "gawat", "3 keyword gawat dari 2 reviewer → Gawat");
});

test("deriveRestaurantSafety: 3 keyword gawat dari 1 reviewer TIDAK cukup", () => {
  // 3 keyword gawat tetapi dari 1 reviewer saja → tidak jadi Gawat.
  const reviews = [
    { name: "Andi", comment: "basi, berjamur, dan bau busuk" }, // 3 keyword, 1 reviewer
    { name: "Budi", comment: "enak kok" },
    { name: "Citra", comment: "segar" },
  ];
  const safety = deriveRestaurantSafety(reviews);
  assert.notEqual(safety.level.key, "gawat", "3 keyword dari 1 reviewer → tidak Gawat");
});

test("deriveRestaurantSafety: Warning if >= 3 keyword Warning", () => {
  const reviews = [
    { name: "Andi", comment: "kurang segar" },
    { name: "Budi", comment: "dingin dan keras" },   // 2 keyword warning
    { name: "Citra", comment: "agak asam" },
  ];
  const safety = deriveRestaurantSafety(reviews);
  assert.equal(safety.level.key, "warning", ">= 3 keyword Warning → Warning");
});

test("deriveRestaurantSafety: Warning if 1-2 keyword Gawat", () => {
  // 1 keyword gawat → Warning (bukan Gawat).
  const reviews = [
    { name: "Andi", comment: "basi sedikit" },
    { name: "Budi", comment: "enak" },
    { name: "Citra", comment: "fresh" },
  ];
  const safety = deriveRestaurantSafety(reviews);
  assert.equal(safety.level.key, "warning", "1 keyword Gawat → Warning");

  // 2 keyword gawat dari 2 reviewer → Warning (belum 3 keyword).
  // Catatan: pakai keyword yang tidak match substring lain (basi, keracunan)
  // agar tidak double-count.
  const reviews2 = [
    { name: "Andi", comment: "basi" },
    { name: "Budi", comment: "keracunan" },
    { name: "Citra", comment: "segar" },
  ];
  const safety2 = deriveRestaurantSafety(reviews2);
  assert.equal(safety2.level.key, "warning", "2 keyword Gawat → Warning");
});

test("deriveRestaurantSafety: Aman if no threshold met", () => {
  const reviews = [
    { name: "Andi", comment: "enak dan segar" },
    { name: "Budi", comment: "bersih" },
    { name: "Citra", comment: "hangat" },
  ];
  const safety = deriveRestaurantSafety(reviews);
  assert.equal(safety.level.key, "aman");
});

test("deriveRestaurantSafety: backend level takes priority", () => {
  // Backend mengirim "Gawat" → badge jadi Gawat walau review lokal semua positif.
  const reviews = [
    { name: "Andi", comment: "enak semua" },
    { name: "Budi", comment: "segar" },
    { name: "Citra", comment: "fresh" },
  ];
  const safety = deriveRestaurantSafety(reviews, "Gawat");
  assert.equal(safety.level.key, "gawat", "backend level prioritas tertinggi");
});

test("deriveRestaurantSafety: safe with empty or invalid input", () => {
>>>>>>> feat/customer-pages
  const safety = deriveRestaurantSafety(null);
  assert.equal(safety.level.key, "aman");
  assert.deepEqual(safety.keywords, []);
});

<<<<<<< HEAD
test("normalizeSafetyLevel maps strings case-insensitively and rejects junk", () => {
  assert.equal(normalizeSafetyLevel("WARNING"), SAFETY_LEVELS.warning);
  assert.equal(normalizeSafetyLevel("tidak-ada"), null);
=======
test("deriveRestaurantSafety: counts reviewer uniqueness correctly", () => {
  // 4 keyword gawat, tetapi dari 1 reviewer (nama sama) → tidak Gawat.
  const reviews = [
    { name: "Andi", comment: "basi" },
    { name: "Andi", comment: "berjamur" },
    { name: "Andi", comment: "bau busuk" },
    { name: "Andi", comment: "berlendir" },
  ];
  const safety = deriveRestaurantSafety(reviews);
  assert.notEqual(safety.level.key, "gawat", "1 reviewer saja → tidak Gawat");
});

test("deriveRestaurantSafety: anonymous reviewers counted as unique by index", () => {
  // Review tanpa nama → gunakan indeks sebagai identitas unik.
  const reviews = [
    { comment: "basi" },           // __anon_0
    { comment: "berjamur" },       // __anon_1
    { comment: "bau busuk" },      // __anon_2
  ];
  const safety = deriveRestaurantSafety(reviews);
  assert.equal(safety.level.key, "gawat", "3 keyword dari 3 reviewer anonim → Gawat");
});

// ---------------------------------------------------------------------------
// normalizeSafetyLevel
// ---------------------------------------------------------------------------

test("normalizeSafetyLevel maps strings case-insensitively and rejects junk", () => {
  assert.equal(normalizeSafetyLevel("WARNING"), SAFETY_LEVELS.warning);
  assert.equal(normalizeSafetyLevel("Gawat"), SAFETY_LEVELS.gawat);
  assert.equal(normalizeSafetyLevel("aman"), SAFETY_LEVELS.aman);
  assert.equal(normalizeSafetyLevel("tidak-ada"), null);
  assert.equal(normalizeSafetyLevel(""), null);
>>>>>>> feat/customer-pages
});
