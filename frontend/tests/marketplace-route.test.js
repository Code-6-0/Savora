import test from "node:test";
import assert from "node:assert/strict";
import { isMarketplaceRoute } from "../src/lib/routes.js";

test("isMarketplaceRoute excludes the marketplace root and every customer product-detail route from the UMKM shell", () => {
  assert.equal(isMarketplaceRoute("/marketplace"), true);
  assert.equal(isMarketplaceRoute("/marketplace/nasi-campur-bali"), true);
  assert.equal(isMarketplaceRoute("/produk"), false);
});
