import test from "node:test";
import assert from "node:assert/strict";
import { fallbackAds, normalizeAd } from "../src/lib/ads.js";

test("normalizeAd keeps a valid UMKM ad and marks internal links as same-tab", () => {
  const ad = normalizeAd(fallbackAds[0]);
  assert.equal(ad.type, "umkm");
  assert.equal(ad.external, false);
  assert.equal(ad.href, "/marketplace/nasi-campur-bali");
});

test("normalizeAd marks third-party http links as external", () => {
  const ad = normalizeAd({ type: "eksternal", href: "https://example.com/promo" });
  assert.equal(ad.type, "eksternal");
  assert.equal(ad.external, true);
});

test("normalizeAd supplies display-safe defaults for sparse input", () => {
  const ad = normalizeAd({});
  assert.equal(ad.type, "eksternal");
  assert.equal(ad.href, "#");
  assert.equal(ad.external, false);
  assert.ok(ad.sponsor.length > 0);
  assert.ok(ad.headline.length > 0);
  assert.ok(ad.photo_url.startsWith("https://"));
});

test("normalizeAd falls back to 'eksternal' for an unknown ad type", () => {
  assert.equal(normalizeAd({ type: "banner-raksasa" }).type, "eksternal");
});

test("normalizeAd accepts API aliases (ad_id, vendor, title, image_url)", () => {
  const ad = normalizeAd({ ad_id: 7, vendor: "Kios Sari", title: "Diskon sore", image_url: "https://images.unsplash.com/x" });
  assert.equal(ad.id, "7");
  assert.equal(ad.sponsor, "Kios Sari");
  assert.equal(ad.headline, "Diskon sore");
  assert.equal(ad.photo_url, "https://images.unsplash.com/x");
});
