/**
 * Unit tests for product date validation and API functions
 * Using Node.js native test runner
 */

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { validateProductDates, isoToDatetimeLocal, datetimeLocalToISO, detectExpiryExtension } from '../src/lib/dateValidation.js';

describe('Date Validation Helpers', () => {
  describe('validateProductDates', () => {
    it('should reject empty expires_at', () => {
      const result = validateProductDates(null, null);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('kedaluwarsa wajib diisi')));
    });

    it('should reject expires_at in the past', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const result = validateProductDates(null, yesterday);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('harus di masa depan')));
    });

    it('should reject expires_at before production_time', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      
      const result = validateProductDates(dayAfter, tomorrow);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('setelah waktu produksi')));
    });

    it('should accept valid future expires_at', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const result = validateProductDates(null, tomorrow);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should accept expires_at after production_time', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      
      const result = validateProductDates(tomorrow, dayAfter);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });
  });

  describe('isoToDatetimeLocal', () => {
    it('should convert ISO string to datetime-local format', () => {
      const iso = '2026-07-26T10:30:00.000Z';
      const result = isoToDatetimeLocal(iso);
      assert.match(result, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('should return empty string for null input', () => {
      assert.strictEqual(isoToDatetimeLocal(null), '');
      assert.strictEqual(isoToDatetimeLocal(''), '');
    });

    it('should return empty string for invalid ISO string', () => {
      assert.strictEqual(isoToDatetimeLocal('invalid-date'), '');
    });
  });

  describe('datetimeLocalToISO', () => {
    it('should convert datetime-local to ISO string', () => {
      const datetimeLocal = '2026-07-26T10:30';
      const result = datetimeLocalToISO(datetimeLocal);
      assert.match(result, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return null for empty input', () => {
      assert.strictEqual(datetimeLocalToISO(null), null);
      assert.strictEqual(datetimeLocalToISO(''), null);
    });
  });

  describe('detectExpiryExtension', () => {
    it('should detect when expires_at is extended', () => {
      const original = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const extended = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      
      const result = detectExpiryExtension(original, extended);
      assert.strictEqual(result.extended, true);
    });

    it('should not detect extension when expires_at is shortened', () => {
      const original = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const shortened = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const result = detectExpiryExtension(original, shortened);
      assert.strictEqual(result.extended, false);
    });

    it('should handle null values', () => {
      const result = detectExpiryExtension(null, null);
      assert.strictEqual(result.extended, false);
    });
  });
});
