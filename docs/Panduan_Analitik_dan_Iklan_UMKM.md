# Panduan Analitik & Iklan UMKM (Savora)

Dokumen ini membantu pemilik UMKM membaca insight penjualan dan memasang iklan produk pada platform Savora. Melengkapi [Panduan Singkat Kelola Produk UMKM](Panduan_Kelola_Produk_UMKM.md).

## Bagian A — Membaca Insight & Analitik

### 1. Analitik Penjualan
Buka menu **Analitik** di bilah kiri. Pada tab **Penjualan** Anda dapat melihat:
- **Total Penjualan & Pendapatan:** akumulasi nilai transaksi produk food rescue Anda.
- **Jumlah Pesanan:** total pesanan yang masuk pada periode terpilih.
- **Rata-rata Nilai Transaksi:** pendapatan dibagi jumlah pesanan.
- **Pertumbuhan Penjualan:** tren dibanding periode sebelumnya.

### 2. Produk Terlaris & Tren
Pada tab **Produk**:
- **Produk Terlaris:** produk diurutkan berdasarkan jumlah unit terjual (Peringkat 1, 2, dst). Data ini dihitung langsung dari pesanan yang masuk.
- **Produk Kurang Laku:** produk dengan penjualan rendah yang perlu tindakan (diskon, bundling, atau kurangi produksi).
- **Ketersediaan Stok:** persentase produk yang masih ready stock.

Tren penjualan dapat dilihat per **hari, minggu, atau bulan** untuk mengenali pola permintaan (mis. lonjakan akhir pekan).

### 3. Insight Rating UMKM
Insight tingkat UMKM merangkum:
- **Rating rata-rata** dari seluruh ulasan customer (skala 1–5).
- **Jumlah ulasan** yang sudah masuk.
- **Total penjualan** (pendapatan & unit) serta **produk terlaris** Anda.

Gunakan rating untuk menjaga kualitas: rating tinggi meningkatkan kepercayaan customer dan posisi produk di marketplace.

### 4. Metrik Performa Listing
Metrik listing membantu melacak performa tiap produk:
- **Unit terjual & pendapatan** per produk.
- **Jumlah pesanan** yang memuat produk tersebut.
- **Sell-through:** rasio unit terjual dibanding total (terjual + sisa stok). Semakin tinggi, semakin cepat produk terserap.

> Catatan: metrik saat ini diturunkan dari data pesanan. Metrik views/klik listing belum dilacak dan akan ditambahkan bila pencatatan event tersedia.

## Bagian B — Memasang Iklan Produk

Iklan membuat produk Anda tampil di slot sponsor pada marketplace, sehingga menjangkau lebih banyak customer.

### 1. Memilih Paket Iklan
Buka menu **Iklan** di bilah kiri. Tersedia paket berdurasi tetap:

| Paket | Durasi Tayang | Harga |
|-------|---------------|-------|
| **Kilat** | 3 hari | Rp 15.000 |
| **Populer** | 7 hari | Rp 35.000 |
| **Sorotan** | 30 hari | Rp 99.000 |

Klik kartu paket untuk memilihnya (kartu terpilih ditandai hijau).

### 2. Membuat Iklan
Pada panel **Pasang Iklan Baru**:
1. Pilih **Produk** yang ingin diiklankan dari daftar produk Anda.
2. Tulis **Judul Iklan (Headline)**, contoh: "Nasi Kotak fresh, hemat 40%!".
3. Tulis **Teks Tombol (CTA)**, contoh: "Selamatkan sekarang".
4. Klik **Buat Iklan (Draft)**. Iklan tersimpan dengan status **Draft** dan belum tayang.

### 3. Mengaktifkan Iklan
1. Di panel **Iklan Saya**, temukan iklan berstatus **Draft**.
2. Klik **Aktifkan**. Iklan langsung tayang dan masa tayang dihitung sesuai durasi paket (mis. paket Populer berakhir 7 hari kemudian).
3. Status berubah menjadi **Aktif** dengan keterangan tanggal berakhir.

### 4. Status Iklan
- **Draft:** iklan sudah dibuat tapi belum tayang.
- **Aktif:** iklan sedang tayang di marketplace.
- **Kadaluarsa:** masa tayang habis (otomatis setelah melewati tanggal berakhir). Buat iklan baru untuk tayang kembali.

Dengan memantau analitik dan mengiklankan produk yang tepat, Anda dapat meningkatkan penjualan sekaligus mempercepat penyelamatan makanan dari food waste.

## Referensi API

Endpoint backend (base URL `NEXT_PUBLIC_API_BASE_URL`, default `http://localhost:3001`):

**Analitik**
- `GET /api/analytics/products/:umkm_id` — penjualan per produk.
- `GET /api/analytics/trend/:umkm_id?granularity=daily|weekly|monthly` — tren penjualan.
- `GET /api/analytics/top-products/:umkm_id?limit=5` — produk terlaris.
- `GET /api/analytics/insight/:umkm_id` — insight rating + produk terlaris.
- `GET /api/analytics/listing-metrics/:umkm_id` — metrik performa listing.

**Iklan**
- `GET /api/ads/packages` — katalog paket iklan.
- `POST /api/ads` — buat iklan (body: `umkm_id`, `product_id`, `package_id`, `headline`, `cta`). Harga & durasi diambil dari paket di server.
- `GET /api/ads/umkm/:umkm_id` — daftar iklan milik UMKM (status kadaluarsa dihitung otomatis).
- `PUT /api/ads/:id/status` — ubah status (body: `status` = `Aktif`/`Draft`/`Kadaluarsa`). Mengaktifkan mengisi jadwal tayang.
- `GET /api/ads/active` — iklan yang sedang tayang, dikonsumsi sisi customer marketplace.

Logika agregasi & iklan berupa fungsi murni di `backend/services/` (`analytics.go`, `ads.go`) sehingga akurasinya dapat diuji tanpa database.

## Verifikasi

```bash
# Backend
cd backend && go test ./services/

# Frontend
cd frontend && npm test
```
