import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeAdStatus,
  normalizeAdPackage,
  normalizeUmkmAd,
  AD_STATUS,
} from "../src/lib/umkmAds.js";

test("normalizeAdStatus maps known statuses and defaults to Draft", () => {
  assert.equal(normalizeAdStatus("Aktif").key, "Aktif");
  assert.equal(normalizeAdStatus("Kadaluarsa").key, "Kadaluarsa");
  assert.equal(normalizeAdStatus("apa saja").key, "Draft");
  assert.equal(normalizeAdStatus("").key, "Draft");
});

test("normalizeAdPackage coerces duration and price", () => {
  const pkg = normalizeAdPackage({ id: "populer", name: "Populer", duration_days: "7", price: "35000" });
  assert.equal(pkg.duration_days, 7);
  assert.equal(pkg.price, 35000);
});

test("normalizeUmkmAd fills display-safe defaults", () => {
  const ad = normalizeUmkmAd({});
  assert.equal(ad.status, "Draft");
  assert.equal(ad.cta, "Lihat produk");
  assert.equal(ad.product_id, 0);
});

test("normalizeUmkmAd accepts ad_id alias and preserves schedule", () => {
  const ad = normalizeUmkmAd({ ad_id: 5, status: "Aktif", start_at: "2026-07-19T00:00:00Z", end_at: "2026-07-26T00:00:00Z" });
  assert.equal(ad.id, 5);
  assert.equal(ad.status, "Aktif");
  assert.equal(ad.start_at, "2026-07-19T00:00:00Z");
});

test("AD_STATUS exposes the three known states", () => {
  assert.deepEqual(Object.keys(AD_STATUS).sort(), ["Aktif", "Draft", "Kadaluarsa"]);
});
