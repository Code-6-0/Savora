import test from "node:test";
import assert from "node:assert/strict";
import { computeImpactSummary } from "../src/lib/impact.js";

// ---------------------------------------------------------------------------
// computeImpactSummary — kasus dasar
// ---------------------------------------------------------------------------

test("computeImpactSummary: order kosong → semua nol", () => {
  const result = computeImpactSummary([]);
  assert.equal(result.totalPortions, 0);
  assert.equal(result.totalSaved, 0);
  assert.equal(result.estimatedKg, 0);
});

test("computeImpactSummary: input bukan array → semua nol", () => {
  assert.deepEqual(computeImpactSummary(null), { totalPortions: 0, totalSaved: 0, estimatedKg: 0 });
  assert.deepEqual(computeImpactSummary(undefined), { totalPortions: 0, totalSaved: 0, estimatedKg: 0 });
  assert.deepEqual(computeImpactSummary("bukan array"), { totalPortions: 0, totalSaved: 0, estimatedKg: 0 });
});

// ---------------------------------------------------------------------------
// Order campuran status — hanya Completed yang dihitung
// ---------------------------------------------------------------------------

test("computeImpactSummary: hanya menghitung order Completed", () => {
  const orders = [
    { status: "Completed", quantity: 2, original_price: 25000, rescue_price: 12000 },
    { status: "Paid", quantity: 1, original_price: 30000, rescue_price: 15000 },
    { status: "Cancelled", quantity: 3, original_price: 20000, rescue_price: 10000 },
    { status: "Completed", quantity: 1, original_price: 45000, rescue_price: 22000 },
  ];
  const result = computeImpactSummary(orders);
  // Completed: 2 porsi (hemat 13000×2=26000) + 1 porsi (hemat 23000×1=23000) = 3 porsi, hemat 49000
  assert.equal(result.totalPortions, 3);
  assert.equal(result.totalSaved, 49000);
  assert.equal(result.estimatedKg, 1.2); // 3 × 0.4 = 1.2
});

test("computeImpactSummary: case-insensitive status matching", () => {
  const orders = [
    { status: "completed", quantity: 1, original_price: 20000, rescue_price: 10000 },
    { status: "COMPLETED", quantity: 1, original_price: 20000, rescue_price: 10000 },
    { status: " Completed ", quantity: 1, original_price: 20000, rescue_price: 10000 },
  ];
  const result = computeImpactSummary(orders);
  assert.equal(result.totalPortions, 3);
  assert.equal(result.totalSaved, 30000);
});

// ---------------------------------------------------------------------------
// qty > 1 — porsi dihitung berdasarkan kuantitas
// ---------------------------------------------------------------------------

test("computeImpactSummary: qty > 1 dihitung benar", () => {
  const orders = [
    { status: "Completed", quantity: 5, original_price: 15000, rescue_price: 6000 },
  ];
  const result = computeImpactSummary(orders);
  assert.equal(result.totalPortions, 5);
  assert.equal(result.totalSaved, 45000); // (15000-6000) × 5
  assert.equal(result.estimatedKg, 2); // 5 × 0.4
});

// ---------------------------------------------------------------------------
// Field harga hilang/tidak valid
// ---------------------------------------------------------------------------

test("computeImpactSummary: original_price hilang → hemat 0 tapi porsi tetap dihitung", () => {
  const orders = [
    { status: "Completed", quantity: 2, rescue_price: 12000 },
  ];
  const result = computeImpactSummary(orders);
  assert.equal(result.totalPortions, 2);
  assert.equal(result.totalSaved, 0);
  assert.equal(result.estimatedKg, 0.8); // 2 × 0.4
});

test("computeImpactSummary: rescue_price hilang → hemat 0", () => {
  const orders = [
    { status: "Completed", quantity: 1, original_price: 25000 },
  ];
  const result = computeImpactSummary(orders);
  assert.equal(result.totalPortions, 1);
  assert.equal(result.totalSaved, 0);
});

test("computeImpactSummary: kedua harga hilang → porsi tetap terhitung, hemat 0", () => {
  const orders = [
    { status: "Completed", quantity: 3 },
  ];
  const result = computeImpactSummary(orders);
  assert.equal(result.totalPortions, 3);
  assert.equal(result.totalSaved, 0);
  assert.equal(result.estimatedKg, 1.2);
});

test("computeImpactSummary: original_price <= rescue_price → hemat 0 (bukan negatif)", () => {
  const orders = [
    { status: "Completed", quantity: 1, original_price: 10000, rescue_price: 15000 },
  ];
  const result = computeImpactSummary(orders);
  assert.equal(result.totalPortions, 1);
  assert.equal(result.totalSaved, 0);
});

test("computeImpactSummary: harga NaN atau string → hemat 0", () => {
  const orders = [
    { status: "Completed", quantity: 1, original_price: "invalid", rescue_price: 5000 },
  ];
  const result = computeImpactSummary(orders);
  assert.equal(result.totalPortions, 1);
  assert.equal(result.totalSaved, 0);
});

// ---------------------------------------------------------------------------
// quantity edge cases
// ---------------------------------------------------------------------------

test("computeImpactSummary: quantity hilang atau 0 → porsi 0 untuk order itu", () => {
  const orders = [
    { status: "Completed", original_price: 20000, rescue_price: 10000 },
    { status: "Completed", quantity: 0, original_price: 20000, rescue_price: 10000 },
    { status: "Completed", quantity: -1, original_price: 20000, rescue_price: 10000 },
  ];
  const result = computeImpactSummary(orders);
  assert.equal(result.totalPortions, 0);
  assert.equal(result.totalSaved, 0);
});

// ---------------------------------------------------------------------------
// estimatedKg pembulatan
// ---------------------------------------------------------------------------

test("computeImpactSummary: estimatedKg dibulatkan ke 1 desimal", () => {
  const orders = [
    { status: "Completed", quantity: 7, original_price: 10000, rescue_price: 5000 },
  ];
  const result = computeImpactSummary(orders);
  assert.equal(result.estimatedKg, 2.8); // 7 × 0.4 = 2.8
});

// ---------------------------------------------------------------------------
// Semua order Completed — skenario realistis
// ---------------------------------------------------------------------------

test("computeImpactSummary: semua Completed — akumulasi benar", () => {
  const orders = [
    { status: "Completed", quantity: 1, original_price: 25000, rescue_price: 12000 },
    { status: "Completed", quantity: 2, original_price: 15000, rescue_price: 6000 },
    { status: "Completed", quantity: 1, original_price: 45000, rescue_price: 22000 },
  ];
  const result = computeImpactSummary(orders);
  // porsi: 1 + 2 + 1 = 4
  assert.equal(result.totalPortions, 4);
  // hemat: 13000 + 18000 + 23000 = 54000
  assert.equal(result.totalSaved, 54000);
  // kg: 4 × 0.4 = 1.6
  assert.equal(result.estimatedKg, 1.6);
});
