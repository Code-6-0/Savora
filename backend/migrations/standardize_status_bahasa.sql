-- ==================================================================================
-- SQL Migration: Standardisasi Status Produk ke Bahasa Indonesia + Perbaikan Ejaan
-- ==================================================================================
--
-- Tujuan:
-- 1. Perbaiki typo ejaan: "Kadaluwarsa"/"Kadaluarsa" → "Kedaluwarsa" (KBBI benar)
-- 2. Migrasi nilai English → Indonesian (jika masih ada data lama)
-- 3. Verifikasi konsistensi data
--
-- Jalankan SETELAH deploy kode baru (backend + frontend)
-- Urutan: Deploy → SQL ini → Restart → Test
--
-- ==================================================================================

BEGIN;

-- ============================================
-- PRIORITAS UTAMA: Perbaikan Typo Ejaan
-- ============================================
-- User sudah menjalankan SQL dengan typo "Kadaluwarsa"
-- Perbaiki semua varian typo ke ejaan KBBI yang benar: "Kedaluwarsa"

UPDATE products
SET status = 'Kedaluwarsa'
WHERE status IN ('Kadaluwarsa', 'Kadaluarsa', 'Kadal Warsa');

-- Log: Berapa produk yang diperbaiki ejaannya
SELECT
  'Perbaikan ejaan selesai' as step,
  COUNT(*) as products_affected
FROM products
WHERE status = 'Kedaluwarsa';


-- ============================================
-- Mapping Backward Compatibility (English → Indonesian)
-- ============================================
-- Jika masih ada data English tersisa dari sebelum migration user

UPDATE products SET status = 'Aktif'       WHERE status = 'Active';
UPDATE products SET status = 'Habis'       WHERE status IN ('Sold Out', 'Terjual');
UPDATE products SET status = 'Kedaluwarsa' WHERE status = 'Expired';

-- Status lain yang sudah benar (Draft, Limbah, Suspended) tidak diubah


-- ============================================
-- Verifikasi: Distribusi Status Setelah Migration
-- ============================================
-- Semua produk harus punya status Indonesian
-- Expected values: Aktif, Habis, Kedaluwarsa, Limbah, Draft, Suspended

SELECT
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM products
GROUP BY status
ORDER BY total DESC;

-- Validasi: Tidak boleh ada status English tersisa
SELECT
  'PERINGATAN: Status English masih ada!' as warning,
  status,
  COUNT(*) as count
FROM products
WHERE status IN ('Active', 'Sold Out', 'Expired', 'Terjual')
GROUP BY status;

COMMIT;


-- ============================================
-- OPSIONAL: Produk Tanpa expires_at
-- ============================================
-- Produk dengan expires_at IS NULL tidak akan tayang di marketplace
-- (disaring oleh backend: GetActiveMarketplaceProducts + client filter)
--
-- Uncomment blok ini jika ingin set otomatis (8 jam dari sekarang):

-- BEGIN;
--
-- UPDATE products
-- SET expires_at = NOW() + INTERVAL '8 hours'
-- WHERE expires_at IS NULL
--   AND status = 'Aktif'
--   AND stock > 0;
--
-- SELECT
--   'expires_at otomatis diset' as step,
--   COUNT(*) as products_updated
-- FROM products
-- WHERE expires_at > NOW()
--   AND status = 'Aktif';
--
-- COMMIT;


-- ============================================
-- Post-Migration Checklist
-- ============================================
-- [ ] Jalankan SQL ini di DB production
-- [ ] Restart backend (agar cron.go pakai konstanta baru)
-- [ ] Test: Buka landing page & /marketplace → produk Aktif muncul
-- [ ] Test: Edit produk di dashboard UMKM → kirim status "Aktif"
-- [ ] Test: Produk expired otomatis jadi "Kedaluwarsa" (tunggu cron 5 menit)
-- [ ] Test: Admin moderasi listing → filter "Aktif" bekerja
