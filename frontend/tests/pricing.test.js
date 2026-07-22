import test from "node:test";
import assert from "node:assert/strict";
import { computeCheckoutPricing, SERVICE_FEE_PERCENT } from "../src/lib/pricing.js";

test("computeCheckoutPricing calculates subtotal correctly", () => {
  const result = computeCheckoutPricing(12000, 2);
  assert.equal(result.subtotal, 24000, "subtotal = unitPrice × qty");
});

test("computeCheckoutPricing calculates service fee as 5% rounded", () => {
  // 5% dari 24000 = 1200
  const result = computeCheckoutPricing(12000, 2);
  assert.equal(result.serviceFee, 1200);
  assert.equal(SERVICE_FEE_PERCENT, 5);
});

test("computeCheckoutPricing calculates total = subtotal + serviceFee", () => {
  const result = computeCheckoutPricing(12000, 2);
  assert.equal(result.total, 25200, "24000 + 1200 = 25200");
});

test("computeCheckoutPricing rounds service fee to nearest rupiah", () => {
  // unitPrice 10001, qty 1 → subtotal 10001
  // 5% dari 10001 = 500.05 → dibulatkan ke 500
  const result = computeCheckoutPricing(10001, 1);
  assert.equal(result.serviceFee, 500, "500.05 rounded to 500");
  assert.equal(result.total, 10501);
});

test("computeCheckoutPricing handles single item", () => {
  const result = computeCheckoutPricing(15000, 1);
  assert.equal(result.subtotal, 15000);
  assert.equal(result.serviceFee, 750); // 5% dari 15000
  assert.equal(result.total, 15750);
});

test("computeCheckoutPricing clamps negative price to 0", () => {
  const result = computeCheckoutPricing(-1000, 2);
  assert.equal(result.subtotal, 0);
  assert.equal(result.serviceFee, 0);
  assert.equal(result.total, 0);
});

test("computeCheckoutPricing clamps quantity to minimum 1", () => {
  const result = computeCheckoutPricing(10000, 0);
  assert.equal(result.subtotal, 10000, "qty 0 → clamped to 1");
  assert.equal(result.total, 10500);
});

test("computeCheckoutPricing handles large quantities", () => {
  const result = computeCheckoutPricing(8000, 10);
  assert.equal(result.subtotal, 80000);
  assert.equal(result.serviceFee, 4000);
  assert.equal(result.total, 84000);
});
