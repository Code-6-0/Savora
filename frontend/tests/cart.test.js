import test from "node:test";
import assert from "node:assert/strict";
import {
  addItem,
  removeItem,
  updateQty,
  computeSubtotal,
  computeServiceFee,
  computeTotal,
  clearCart,
  loadCart,
  saveCart,
} from "../src/lib/cart.js";

// Mock localStorage untuk test
const createMockLocalStorage = () => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
};

// ---------------------------------------------------------------------------
// addItem
// ---------------------------------------------------------------------------

test("addItem menambah item baru ke keranjang kosong", () => {
  const items = [];
  const product = {
    id: 1,
    name: "Nasi Goreng",
    photo_url: "foto.jpg",
    rescue_price: 15000,
    stock: 10,
  };

  const result = addItem(items, product, 2);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
  assert.equal(result[0].qty, 2);
  assert.equal(result[0].rescue_price, 15000);
});

test("addItem menambahkan qty ke item yang sudah ada", () => {
  const items = [
    {
      id: 1,
      name: "Nasi Goreng",
      photo_url: "foto.jpg",
      rescue_price: 15000,
      stock: 10,
      qty: 2,
    },
  ];
  const product = {
    id: 1,
    name: "Nasi Goreng",
    photo_url: "foto.jpg",
    rescue_price: 15000,
    stock: 10,
  };

  const result = addItem(items, product, 3);

  assert.equal(result.length, 1);
  assert.equal(result[0].qty, 5);
});

test("addItem clamp qty ke stock saat menambah item baru", () => {
  const items = [];
  const product = {
    id: 1,
    name: "Nasi Goreng",
    photo_url: "foto.jpg",
    rescue_price: 15000,
    stock: 5,
  };

  const result = addItem(items, product, 10);

  assert.equal(result[0].qty, 5);
});

test("addItem clamp total qty ke stock saat menambah ke item existing", () => {
  const items = [
    {
      id: 1,
      name: "Nasi Goreng",
      photo_url: "foto.jpg",
      rescue_price: 15000,
      stock: 10,
      qty: 8,
    },
  ];
  const product = {
    id: 1,
    name: "Nasi Goreng",
    photo_url: "foto.jpg",
    rescue_price: 15000,
    stock: 10,
  };

  const result = addItem(items, product, 5);

  assert.equal(result[0].qty, 10);
});

test("addItem menambah item berbeda ke keranjang", () => {
  const items = [
    {
      id: 1,
      name: "Nasi Goreng",
      photo_url: "foto1.jpg",
      rescue_price: 15000,
      stock: 10,
      qty: 2,
    },
  ];
  const product = {
    id: 2,
    name: "Mie Ayam",
    photo_url: "foto2.jpg",
    rescue_price: 12000,
    stock: 8,
  };

  const result = addItem(items, product, 1);

  assert.equal(result.length, 2);
  assert.equal(result[1].id, 2);
  assert.equal(result[1].qty, 1);
});

test("addItem return items unchanged jika product null atau tanpa id", () => {
  const items = [{ id: 1, qty: 2 }];

  assert.deepEqual(addItem(items, null, 1), items);
  assert.deepEqual(addItem(items, {}, 1), items);
  assert.deepEqual(addItem(items, { name: "Test" }, 1), items);
});

// ---------------------------------------------------------------------------
// removeItem
// ---------------------------------------------------------------------------

test("removeItem menghapus item dari keranjang", () => {
  const items = [
    { id: 1, name: "Item 1", qty: 2 },
    { id: 2, name: "Item 2", qty: 1 },
  ];

  const result = removeItem(items, 1);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 2);
});

test("removeItem tidak mengubah keranjang jika id tidak ditemukan", () => {
  const items = [
    { id: 1, name: "Item 1", qty: 2 },
    { id: 2, name: "Item 2", qty: 1 },
  ];

  const result = removeItem(items, 999);

  assert.equal(result.length, 2);
});

test("removeItem bisa menghapus item terakhir", () => {
  const items = [{ id: 1, name: "Item 1", qty: 2 }];

  const result = removeItem(items, 1);

  assert.equal(result.length, 0);
});

// ---------------------------------------------------------------------------
// updateQty
// ---------------------------------------------------------------------------

test("updateQty mengupdate quantity item", () => {
  const items = [
    { id: 1, name: "Item 1", stock: 10, qty: 2 },
    { id: 2, name: "Item 2", stock: 5, qty: 1 },
  ];

  const result = updateQty(items, 1, 5);

  assert.equal(result[0].qty, 5);
  assert.equal(result[1].qty, 1);
});

test("updateQty clamp qty ke minimal 1", () => {
  const items = [{ id: 1, name: "Item 1", stock: 10, qty: 5 }];

  const result = updateQty(items, 1, 0);
  assert.equal(result[0].qty, 1);

  const result2 = updateQty(items, 1, -5);
  assert.equal(result2[0].qty, 1);
});

test("updateQty clamp qty ke maksimal stock", () => {
  const items = [{ id: 1, name: "Item 1", stock: 10, qty: 5 }];

  const result = updateQty(items, 1, 15);

  assert.equal(result[0].qty, 10);
});

test("updateQty tidak mengubah item lain", () => {
  const items = [
    { id: 1, name: "Item 1", stock: 10, qty: 2 },
    { id: 2, name: "Item 2", stock: 5, qty: 3 },
  ];

  const result = updateQty(items, 1, 7);

  assert.equal(result[0].qty, 7);
  assert.equal(result[1].qty, 3);
});

test("updateQty tidak mengubah keranjang jika id tidak ditemukan", () => {
  const items = [{ id: 1, name: "Item 1", stock: 10, qty: 2 }];

  const result = updateQty(items, 999, 5);

  assert.equal(result[0].qty, 2);
});

// ---------------------------------------------------------------------------
// computeSubtotal
// ---------------------------------------------------------------------------

test("computeSubtotal menghitung total rescue_price × qty", () => {
  const items = [
    { id: 1, rescue_price: 15000, qty: 2 },
    { id: 2, rescue_price: 12000, qty: 3 },
  ];

  const result = computeSubtotal(items);

  assert.equal(result, 15000 * 2 + 12000 * 3);
});

test("computeSubtotal return 0 untuk keranjang kosong", () => {
  const result = computeSubtotal([]);

  assert.equal(result, 0);
});

test("computeSubtotal hitung satu item", () => {
  const items = [{ id: 1, rescue_price: 20000, qty: 1 }];

  const result = computeSubtotal(items);

  assert.equal(result, 20000);
});

// ---------------------------------------------------------------------------
// computeServiceFee
// ---------------------------------------------------------------------------

test("computeServiceFee menghitung 5% dari subtotal", () => {
  const result = computeServiceFee(100000);

  assert.equal(result, 5000);
});

test("computeServiceFee membulatkan hasil", () => {
  const result = computeServiceFee(10001);

  assert.equal(result, Math.round(10001 * 0.05));
});

test("computeServiceFee return 0 untuk subtotal 0", () => {
  const result = computeServiceFee(0);

  assert.equal(result, 0);
});

// ---------------------------------------------------------------------------
// computeTotal
// ---------------------------------------------------------------------------

test("computeTotal menghitung subtotal + service fee 5%", () => {
  const items = [
    { id: 1, rescue_price: 15000, qty: 2 },
    { id: 2, rescue_price: 10000, qty: 1 },
  ];

  const result = computeTotal(items);
  const expectedSubtotal = 15000 * 2 + 10000 * 1;
  const expectedServiceFee = Math.round(expectedSubtotal * 0.05);
  const expectedTotal = expectedSubtotal + expectedServiceFee;

  assert.equal(result, expectedTotal);
});

test("computeTotal return 0 untuk keranjang kosong", () => {
  const result = computeTotal([]);

  assert.equal(result, 0);
});

// ---------------------------------------------------------------------------
// clearCart
// ---------------------------------------------------------------------------

test("clearCart return array kosong", () => {
  const result = clearCart();

  assert.deepEqual(result, []);
});

// ---------------------------------------------------------------------------
// loadCart & saveCart (dengan mock localStorage)
// ---------------------------------------------------------------------------

test("saveCart menyimpan items ke localStorage", () => {
  const mockStorage = createMockLocalStorage();
  global.window = { localStorage: mockStorage };

  const items = [{ id: 1, name: "Test", qty: 2 }];
  saveCart(items);

  const stored = mockStorage.getItem("savora_cart");
  assert.equal(stored, JSON.stringify(items));

  delete global.window;
});

test("loadCart membaca items dari localStorage", () => {
  const mockStorage = createMockLocalStorage();
  const items = [{ id: 1, name: "Test", qty: 2 }];
  mockStorage.setItem("savora_cart", JSON.stringify(items));

  global.window = { localStorage: mockStorage };

  const result = loadCart();

  assert.deepEqual(result, items);

  delete global.window;
});

test("loadCart return array kosong jika localStorage kosong", () => {
  const mockStorage = createMockLocalStorage();
  global.window = { localStorage: mockStorage };

  const result = loadCart();

  assert.deepEqual(result, []);

  delete global.window;
});

test("loadCart return array kosong jika JSON rusak", () => {
  const mockStorage = createMockLocalStorage();
  mockStorage.setItem("savora_cart", "{invalid json");

  global.window = { localStorage: mockStorage };

  const result = loadCart();

  assert.deepEqual(result, []);

  delete global.window;
});

test("loadCart return array kosong jika data bukan array", () => {
  const mockStorage = createMockLocalStorage();
  mockStorage.setItem("savora_cart", JSON.stringify({ not: "array" }));

  global.window = { localStorage: mockStorage };

  const result = loadCart();

  assert.deepEqual(result, []);

  delete global.window;
});

test("loadCart return array kosong di environment SSR (window undefined)", () => {
  const result = loadCart();

  assert.deepEqual(result, []);
});

test("saveCart tidak crash di environment SSR (window undefined)", () => {
  const items = [{ id: 1, qty: 2 }];

  assert.doesNotThrow(() => saveCart(items));
});
