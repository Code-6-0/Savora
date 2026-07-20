import test from "node:test";
import assert from "node:assert/strict";
import { normalizeProductSales, normalizeInsight, fallbackTopProducts } from "../src/lib/analytics.js";

test("normalizeProductSales coerces numeric fields and supplies defaults", () => {
  const row = normalizeProductSales({ product_id: 7, name: "Nasi Kotak", units_sold: "12", revenue: "240000" });
  assert.equal(row.product_id, 7);
  assert.equal(row.name, "Nasi Kotak");
  assert.equal(row.units_sold, 12);
  assert.equal(row.revenue, 240000);
  assert.equal(row.orders_count, 0);
});

test("normalizeProductSales handles empty input safely", () => {
  const row = normalizeProductSales(undefined);
  assert.equal(row.product_id, 0);
  assert.equal(row.name, "Produk");
  assert.equal(row.units_sold, 0);
});

test("normalizeInsight normalizes nested top_products", () => {
  const insight = normalizeInsight({
    umkm_id: 1,
    avg_rating: "4.5",
    review_count: "10",
    top_products: [{ product_id: 1, name: "A", units_sold: "5" }],
  });
  assert.equal(insight.avg_rating, 4.5);
  assert.equal(insight.review_count, 10);
  assert.equal(insight.top_products.length, 1);
  assert.equal(insight.top_products[0].units_sold, 5);
});

test("normalizeInsight tolerates missing top_products", () => {
  const insight = normalizeInsight({ avg_rating: 3 });
  assert.deepEqual(insight.top_products, []);
  assert.equal(insight.total_units, 0);
});

test("fallbackTopProducts are already valid shapes", () => {
  const normalized = fallbackTopProducts.map(normalizeProductSales);
  assert.ok(normalized.every((p) => p.units_sold > 0 && p.name.length > 0));
});
