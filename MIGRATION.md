# Database Migration Guide

## Product Status Standardization

**Context**: Standardisasi nilai status produk di database dari "Aktif" ke "Active" untuk konsistensi lintas backend-frontend.

**Timeline**: Jalankan SETELAH deploy kode commit `fix(produk): standarkan status produk ke "Active"` ke production.

### Migration SQL

Jalankan query berikut di Supabase SQL Editor:

```sql
-- Update status produk dari "Aktif" ke "Active"
UPDATE products 
SET status = 'Active' 
WHERE status = 'Aktif';

-- Verifikasi hasil
SELECT status, COUNT(*) as count 
FROM products 
GROUP BY status;
```

### Expected Results

Sebelum migration:
- status = "Aktif": X produk
- status = "Active": Y produk

Setelah migration:
- status = "Aktif": 0 produk
- status = "Active": X+Y produk

### Rollback (jika diperlukan)

Jika terjadi masalah, rollback dengan:

```sql
UPDATE products 
SET status = 'Aktif' 
WHERE status = 'Active';
```

**Note**: Rollback hanya diperlukan jika code rollback ke versi lama. Jangan rollback jika code baru sudah jalan.

### Post-Migration Verification

1. Buka /marketplace - produk harus tampil normal
2. Dashboard admin - hitungan "Active Products" harus benar
3. Form tambah/edit produk - produk baru/update tersimpan dengan status "Active"
4. Tab halaman Produk (Semua/Aktif/Habis) - filter harus bekerja
5. Checkout - produk dengan status "Active" bisa dibeli

### Technical Notes

- UI tetap menampilkan "Aktif" (handled by `normalizeProduct` di `frontend/src/lib/products.js`)
- Status lain tidak berubah: "Habis", "Kedaluwarsa", "Limbah"
- Seeder (`cmd/seed/main.go`) sudah menggunakan "Active" sejak awal
