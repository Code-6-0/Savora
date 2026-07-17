import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyReviewText,
  deriveRestaurantSafety,
  normalizeSafetyLevel,
  SAFETY_LEVELS,
} from "../src/lib/reviews.js";

test("classifyReviewText flags severe keywords as Gawat", () => {
  const result = classifyReviewText("Makanannya basi dan ada jamur");
  assert.equal(result.level.key, "gawat");
  assert.ok(result.matched.includes("basi"));
});

test("classifyReviewText flags cautionary keywords as Warning", () => {
  assert.equal(classifyReviewText("baunya agak aneh").level.key, "warning");
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
  const safety = deriveRestaurantSafety(null);
  assert.equal(safety.level.key, "aman");
  assert.deepEqual(safety.keywords, []);
});

test("normalizeSafetyLevel maps strings case-insensitively and rejects junk", () => {
  assert.equal(normalizeSafetyLevel("WARNING"), SAFETY_LEVELS.warning);
  assert.equal(normalizeSafetyLevel("tidak-ada"), null);
});
