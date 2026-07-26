-- Cleanup script untuk BUG 1: Ubah pickup_code empty string menjadi NULL
--
-- Context: Sebelum fix, field PickupCode bertipe string dan saat scheduler/webhook
-- meng-expire order, GORM menulis '' (empty string) ke database alih-alih NULL.
-- Ini menyebabkan duplicate key violation pada idx_orders_pickup_code karena
-- unique index menganggap semua '' sebagai nilai yang sama.
--
-- Setelah fix, PickupCode menjadi *string sehingga GORM menulis NULL untuk zero value.
-- Script ini membersihkan data lama yang masih punya pickup_code = ''.
--
-- Run sekali saja setelah deploy fix BUG 1.

BEGIN;

-- Update semua order dengan pickup_code = '' menjadi NULL
UPDATE orders
SET pickup_code = NULL
WHERE pickup_code = '';

-- Verifikasi: tidak boleh ada lagi order dengan pickup_code = ''
-- (query ini harus return 0)
SELECT COUNT(*) as remaining_empty_codes
FROM orders
WHERE pickup_code = '';

COMMIT;
