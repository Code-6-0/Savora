import test from "node:test";
import assert from "node:assert/strict";
import { filterMarketplaceProducts, normalizeMarketplaceProduct } from "../src/lib/marketplace.js";

const products = [
  { id: 1, name: "Nasi Campur Bali", category: "Nasi", vendor: "Warung Bu Ratih", rescue_price: 12000, distanceKm: 0.8, food_trust_status: "Fresh" },
  { id: 2, name: "Roti Sourdough", category: "Bakery", vendor: "Roti Kayu", rescue_price: 22000, distanceKm: 1.2, food_trust_status: "Layak Dijual" },
  { id: 3, name: "Paket Gorengan", category: "Snack", vendor: "Kios Sari", rescue_price: 6000, distanceKm: 0.4, food_trust_status: "Segera Dijual" },
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
