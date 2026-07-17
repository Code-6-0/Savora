# Modul Customer Marketplace — Richard Firmansyah

Route customer:

- `/marketplace`: daftar rescue deal, search, filter kategori/Food Trust Index, dan sorting.
- `/marketplace/[id]`: detail produk, Food Eligibility Assessment, Smart Rescue Timer, jumlah porsi, lokasi pickup, dan handoff checkout.

## Alur customer

1. Customer mencari produk atau UMKM, lalu memakai filter kategori, Food Trust Index, atau urutan.
2. Customer membuka kartu produk dan memeriksa harga, batas waktu, stok, serta Food Trust Index.
3. Customer memilih jumlah porsi dan menekan **Selamatkan sekarang**.
4. Handoff berikutnya adalah modul Checkout/Order Tracking untuk metode COD atau Midtrans Sandbox.

## Kontrak API

Frontend membaca `GET ${NEXT_PUBLIC_API_BASE_URL:-http://localhost:3001}/api/products/marketplace`.

Field backend yang digunakan: `id`, `name`, `category`, `description`, `photo_url`, `original_price`, `rescue_price`, `stock`, `pickup_address`, `food_trust_status`, dan `expires_at`.

Field presentasi yang belum tersedia dari API saat ini (nama UMKM, jarak, skor, metadata eligibility, dan review) memakai fallback demo secara lokal agar UI lomba tetap dapat diperagakan. Saat backend memperluas responsnya, field API otomatis mengambil prioritas.

## Verifikasi

```bash
npm test
npm run build
```

`npm run lint` saat ini masih gagal karena error pre-existing pada `src/app/dashboard/page.js` dan `src/app/pesanan/page.js` (setState sinkron di dalam effect). Modul marketplace Richard tidak menambah error lint.
