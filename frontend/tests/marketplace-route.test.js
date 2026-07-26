import test from "node:test";
import assert from "node:assert/strict";
import { isCustomerRoute } from "../src/lib/routes.js";

test("isCustomerRoute excludes the marketplace root and every customer product-detail route from the UMKM shell", () => {
  assert.equal(isCustomerRoute("/"), true);
  assert.equal(isCustomerRoute("/marketplace"), true);
  assert.equal(isCustomerRoute("/marketplace/nasi-campur-bali"), true);
  assert.equal(isCustomerRoute("/produk"), false);
});
