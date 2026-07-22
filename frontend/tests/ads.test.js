import test from "node:test";
import assert from "node:assert/strict";
import { fallbackAds, normalizeAd, buildAdTrackingUrl } from "../src/lib/ads.js";

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

test("buildAdTrackingUrl constructs valid impression URL", () => {
  const url = buildAdTrackingUrl("http://localhost:3001", "ad-123", "impression");
  assert.equal(url, "http://localhost:3001/advertisements/ad-123/impression");
});

test("buildAdTrackingUrl constructs valid click URL", () => {
  const url = buildAdTrackingUrl("http://localhost:3001", "ad-456", "click");
  assert.equal(url, "http://localhost:3001/advertisements/ad-456/click");
});

test("buildAdTrackingUrl returns null for empty adId", () => {
  assert.equal(buildAdTrackingUrl("http://localhost:3001", "", "impression"), null);
  assert.equal(buildAdTrackingUrl("http://localhost:3001", "   ", "click"), null);
  assert.equal(buildAdTrackingUrl("http://localhost:3001", null, "impression"), null);
  assert.equal(buildAdTrackingUrl("http://localhost:3001", undefined, "click"), null);
});

test("buildAdTrackingUrl returns null for unknown event type", () => {
  assert.equal(buildAdTrackingUrl("http://localhost:3001", "ad-123", "view"), null);
  assert.equal(buildAdTrackingUrl("http://localhost:3001", "ad-123", "hover"), null);
  assert.equal(buildAdTrackingUrl("http://localhost:3001", "ad-123", ""), null);
});

test("buildAdTrackingUrl encodes special characters in adId", () => {
  const url = buildAdTrackingUrl("http://localhost:3001", "ad/special?id=123", "impression");
  assert.equal(url, "http://localhost:3001/advertisements/ad%2Fspecial%3Fid%3D123/impression");
});

test("buildAdTrackingUrl handles numeric adId", () => {
  const url = buildAdTrackingUrl("http://localhost:3001", 789, "click");
  assert.equal(url, "http://localhost:3001/advertisements/789/click");
});
