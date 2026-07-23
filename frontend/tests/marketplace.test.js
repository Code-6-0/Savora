import test from "node:test";
import assert from "node:assert/strict";
import { filterMarketplaceProducts, normalizeMarketplaceProduct } from "../src/lib/marketplace.js";

const now = Date.now();
const products = [
  { id: 1, name: "Nasi Campur Bali", category: "Nasi", vendor: "Warung Bu Ratih", rescue_price: 12000, distanceKm: 0.8, food_trust_status: "Fresh", stock: 5, _baseScore: 100, _publishMs: now - 3600000, _expiresMs: now + 7200000 },
  { id: 2, name: "Roti Sourdough", category: "Bakery", vendor: "Roti Kayu", rescue_price: 22000, distanceKm: 1.2, food_trust_status: "Layak Dijual", stock: 3, _baseScore: 85, _publishMs: now - 3600000, _expiresMs: now + 7200000 },
  { id: 3, name: "Paket Gorengan", category: "Snack", vendor: "Kios Sari", rescue_price: 6000, distanceKm: 0.4, food_trust_status: "Segera Dijual", stock: 10, _baseScore: 70, _publishMs: now - 3600000, _expiresMs: now + 3600000 },
];

test("filterMarketplaceProducts matches names and UMKM names without case sensitivity", () => {
  assert.deepEqual(
    filterMarketplaceProducts(products, { search: "kayu" }).map((product) => product.id),
    [2],
  );
});

test("filterMarketplaceProducts applies a category and Food Trust Index together", () => {
  assert.deepEqual(
    filterMarketplaceProducts(products, { category: "Snack", trustStatus: "Segera Dijual" }).map((product) => product.id),
    [3],
  );
});

test("filterMarketplaceProducts sorts nearby rescue deals first", () => {
  assert.deepEqual(
    filterMarketplaceProducts(products, { sort: "nearest" }).map((product) => product.id),
    [3, 1, 2],
  );
});

test("normalizeMarketplaceProduct keeps API data and supplies display-safe defaults", () => {
  const product = normalizeMarketplaceProduct({ id: 9, name: "Nasi Hemat", rescue_price: 10000, original_price: 20000, stock: 2 });
  assert.equal(product.food_trust_status, "Layak Dijual");
  assert.equal(product.vendor, "UMKM Savora");
  assert.equal(product.discountPercent, 50);
});

test("filterMarketplaceProducts hides products with stock <= 0", () => {
  const testProducts = [
    { id: 1, name: "Product A", category: "Nasi", vendor: "Vendor A", rescue_price: 10000, distanceKm: 1, food_trust_status: "Fresh", stock: 5, _baseScore: 100, _publishMs: Date.now() - 3600000, _expiresMs: Date.now() + 3600000 },
    { id: 2, name: "Product B", category: "Nasi", vendor: "Vendor B", rescue_price: 10000, distanceKm: 1, food_trust_status: "Fresh", stock: 0, _baseScore: 100, _publishMs: Date.now() - 3600000, _expiresMs: Date.now() + 3600000 },
  ];
  const result = filterMarketplaceProducts(testProducts, {});
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
});

test("filterMarketplaceProducts hides products with status Tidak Layak Konsumsi", () => {
  const testProducts = [
    { id: 1, name: "Product A", category: "Nasi", vendor: "Vendor A", rescue_price: 10000, distanceKm: 1, food_trust_status: "Fresh", stock: 5, _baseScore: 100, _publishMs: Date.now() - 3600000, _expiresMs: Date.now() + 3600000 },
    { id: 2, name: "Product B", category: "Nasi", vendor: "Vendor B", rescue_price: 10000, distanceKm: 1, food_trust_status: "Tidak Layak Konsumsi", stock: 5, _baseScore: 100, _publishMs: Date.now() - 3600000, _expiresMs: Date.now() + 3600000 },
  ];
  const result = filterMarketplaceProducts(testProducts, {});
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
});

test("filterMarketplaceProducts hides products with status Tidak Disarankan Dijual", () => {
  const testProducts = [
    { id: 1, name: "Product A", category: "Nasi", vendor: "Vendor A", rescue_price: 10000, distanceKm: 1, food_trust_status: "Layak Dijual", stock: 5, _baseScore: 85, _publishMs: Date.now() - 3600000, _expiresMs: Date.now() + 3600000 },
    { id: 2, name: "Product B", category: "Nasi", vendor: "Vendor B", rescue_price: 10000, distanceKm: 1, food_trust_status: "Tidak Disarankan Dijual", stock: 5, _baseScore: 85, _publishMs: Date.now() - 3600000, _expiresMs: Date.now() + 3600000 },
  ];
  const result = filterMarketplaceProducts(testProducts, {});
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
});

test("filterMarketplaceProducts hides expired products", () => {
  const now = Date.now();
  const testProducts = [
    { id: 1, name: "Product A", category: "Nasi", vendor: "Vendor A", rescue_price: 10000, distanceKm: 1, food_trust_status: "Fresh", stock: 5, _baseScore: 100, _publishMs: now - 7200000, _expiresMs: now + 3600000 },
    { id: 2, name: "Product B", category: "Nasi", vendor: "Vendor B", rescue_price: 10000, distanceKm: 1, food_trust_status: "Fresh", stock: 5, _baseScore: 100, _publishMs: now - 7200000, _expiresMs: now - 1000 },
  ];
  const result = filterMarketplaceProducts(testProducts, {});
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
});

test("filterMarketplaceProducts treats null/undefined stock as available", () => {
  const testProducts = [
    { id: 1, name: "Product A", category: "Nasi", vendor: "Vendor A", rescue_price: 10000, distanceKm: 1, food_trust_status: "Fresh", stock: null, _baseScore: 100, _publishMs: Date.now() - 3600000, _expiresMs: Date.now() + 3600000 },
    { id: 2, name: "Product B", category: "Nasi", vendor: "Vendor B", rescue_price: 10000, distanceKm: 1, food_trust_status: "Fresh", stock: undefined, _baseScore: 100, _publishMs: Date.now() - 3600000, _expiresMs: Date.now() + 3600000 },
  ];
  const result = filterMarketplaceProducts(testProducts, {});
  assert.equal(result.length, 2);
});
