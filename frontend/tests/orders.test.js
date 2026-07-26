/**
 * Tests for orders.js
 * Testing API functions, status mapping, and state machine validation
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { 
  normalizeUMKMOrder, 
  canTransition, 
  allowedUmkmTransitions 
} from '../src/lib/orders.js';

// Mock data untuk testing
const mockBackendOrder = {
  id: 123,
  status: 'PAID',
  quantity: 2,
  total_price: 50000,
  created_at: '2026-07-25T10:30:00Z',
  payment_method: 'GoPay',
  product: {
    id: 1,
    name: 'Nasi Goreng',
    rescue_price: 25000
  },
  user: {
    name: 'John Doe',
    phone: '081234567890'
  }
};

// Test normalizeUMKMOrder
test('normalizeUMKMOrder should include original_id and backend_status', () => {
  const normalized = normalizeUMKMOrder(mockBackendOrder);
  
  assert.strictEqual(normalized.original_id, 123, 'Should preserve original numeric ID');
  assert.strictEqual(normalized.backend_status, 'PAID', 'Should preserve backend status');
  assert.strictEqual(normalized.id, 'SVR-0123', 'Should format display ID');
  assert.strictEqual(normalized.status, 'Diproses', 'Should map status to Indonesian');
});

test('normalizeUMKMOrder should extract payment method correctly', () => {
  const order1 = { ...mockBackendOrder, payment_method: 'OVO' };
  const normalized1 = normalizeUMKMOrder(order1);
  assert.strictEqual(normalized1.payment, 'OVO', 'Should use payment_method field');
  
  const order2 = { ...mockBackendOrder, payment_method: null, payment: { method: 'DANA' } };
  const normalized2 = normalizeUMKMOrder(order2);
  assert.strictEqual(normalized2.payment, 'DANA', 'Should use payment.method field');
  
  const order3 = { ...mockBackendOrder, payment_method: null, payment: null };
  const normalized3 = normalizeUMKMOrder(order3);
  assert.strictEqual(normalized3.payment, 'Belum Tersedia', 'Should fallback to "Belum Tersedia"');
});

test('normalizeUMKMOrder should handle missing product gracefully', () => {
  const orderNoProduct = { ...mockBackendOrder, product: null };
  const normalized = normalizeUMKMOrder(orderNoProduct);
  
  assert.strictEqual(normalized.items[0].name, 'Produk Makanan', 'Should use fallback product name');
  assert.strictEqual(normalized.items[0].price, 0, 'Should use fallback price');
});

// Test State Machine
test('canTransition should allow PAID -> READY_FOR_PICKUP', () => {
  assert.strictEqual(canTransition('PAID', 'READY_FOR_PICKUP'), true);
});

test('canTransition should allow READY_FOR_PICKUP -> COMPLETED', () => {
  assert.strictEqual(canTransition('READY_FOR_PICKUP', 'COMPLETED'), true);
});

test('canTransition should reject PAID -> COMPLETED (illegal transition)', () => {
  assert.strictEqual(canTransition('PAID', 'COMPLETED'), false);
});

test('canTransition should reject CREATED -> PAID (not UMKM responsibility)', () => {
  assert.strictEqual(canTransition('CREATED', 'PAID'), false);
});

test('canTransition should reject PAYMENT_PENDING -> PAID', () => {
  assert.strictEqual(canTransition('PAYMENT_PENDING', 'PAID'), false);
});

test('canTransition should return false for unknown statuses', () => {
  assert.strictEqual(canTransition('UNKNOWN', 'PAID'), false);
  assert.strictEqual(canTransition('PAID', 'UNKNOWN'), false);
});

// Test allowedUmkmTransitions structure
test('allowedUmkmTransitions should only contain UMKM-allowed transitions', () => {
  const allowedStatuses = Object.keys(allowedUmkmTransitions);
  assert.deepStrictEqual(allowedStatuses, ['PAID', 'READY_FOR_PICKUP'], 'Only PAID and READY_FOR_PICKUP should have transitions');
  
  assert.deepStrictEqual(allowedUmkmTransitions.PAID, ['READY_FOR_PICKUP']);
  assert.deepStrictEqual(allowedUmkmTransitions.READY_FOR_PICKUP, ['COMPLETED']);
});

// Test status mapping completeness
test('normalizeUMKMOrder should map all backend statuses correctly', () => {
  const statuses = {
    'CREATED': 'Menunggu Pembayaran',
    'PAYMENT_PENDING': 'Menunggu Pembayaran',
    'PAID': 'Diproses',
    'PAYMENT_FAILED': 'Gagal Bayar',
    'READY_FOR_PICKUP': 'Siap Diambil',
    'COMPLETED': 'Selesai',
    'NO_SHOW': 'Tidak Diambil',
    'CANCELLED': 'Dibatalkan',
    'EXPIRED': 'Kedaluwarsa',
    'HELP_REQUESTED': 'Butuh Bantuan',
    'DONATED': 'Didonasikan'
  };
  
  for (const [backendStatus, expectedUIStatus] of Object.entries(statuses)) {
    const order = { ...mockBackendOrder, status: backendStatus };
    const normalized = normalizeUMKMOrder(order);
    assert.strictEqual(
      normalized.status, 
      expectedUIStatus, 
      `Status ${backendStatus} should map to ${expectedUIStatus}`
    );
  }
});

console.log('✅ All orders tests passed!');
