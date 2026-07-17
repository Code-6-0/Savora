# Modul Customer Marketplace — Richard Firmansyah

Route customer:

- `/marketplace`: daftar rescue deal, search, filter kategori/Food Trust Index, sorting, slot iklan sponsor, dan Food Score yang menurun secara live.
- `/marketplace/[id]`: detail produk, Food Eligibility Assessment, Food Score panel + Smart Rescue Timer yang meluruh bersama, badge keamanan keyword, highlight keyword pada ulasan, jumlah porsi, lokasi pickup, dan handoff checkout.

## Batch 2 — fitur tambahan

1. **Food Score decay (`src/lib/foodScore.js`)** — skor kelayakan 0–100 yang menurun mengikuti sisa Rescue Time menuju batas expired. Skor awal diplafon oleh Skor Trust UMKM lalu meluruh dengan kurva sedikit konveks (bertahan di awal, turun cepat menjelang batas). Dipakai di kartu marketplace dan panel detail; keduanya memakai satu sumber hitung mundur agar skor dan timer selalu sinkron.
2. **Rescue Time** — hitung mundur ditampilkan sebagai chip di kartu (mis. `2j 15m`) dan Smart Rescue Timer di detail (jam/menit/detik). Chip dan timer berubah "panas" saat sisa waktu ≤ 15 menit; tombol rescue nonaktif saat waktu habis.
3. **Keamanan keyword ulasan (`src/lib/reviews.js`)** — mengklasifikasikan ulasan menjadi `Gawat` (mis. basi, berjamur), `Warning` (mis. bau, asam), atau `Aman` (mis. enak, segar). Level per restoran diturunkan dari ulasan (level terburuk menang) dan ditampilkan sebagai badge + highlight keyword pada teks ulasan. Bila backend sudah mengirim `safety_level`, nilai itu diprioritaskan.
4. **Slot iklan (`src/lib/ads.js`)** — rail sponsor di atas grid produk, mendukung iklan `umkm` (promoted listing internal) dan `eksternal` (pihak ketiga, membuka tab baru dengan `rel="nofollow sponsored noopener"`). Fallback demo lokal dipakai bila API iklan belum tersedia.

## Alur customer

1. Customer mencari produk atau UMKM, lalu memakai filter kategori, Food Trust Index, atau urutan.
2. Customer melihat Food Score live, Rescue Time, dan badge keamanan keyword pada tiap kartu.
3. Customer membuka detail dan memeriksa Food Score panel, assessment, serta ulasan dengan keyword yang disorot.
4. Customer memilih jumlah porsi dan menekan **Selamatkan sekarang** selagi Rescue Time masih berjalan.
5. Handoff berikutnya adalah modul Checkout/Order Tracking untuk pembayaran cashless via Midtrans Sandbox.

## Kontrak API

Frontend membaca `GET ${NEXT_PUBLIC_API_BASE_URL:-http://localhost:3001}/api/products/marketplace` untuk produk dan `GET .../api/ads/active` untuk iklan.

Field produk yang digunakan: `id`, `name`, `category`, `description`, `photo_url`, `original_price`, `rescue_price`, `stock`, `pickup_address`, `food_trust_status`, `expires_at`. Field opsional yang dihormati bila tersedia: `safety_level` (level keamanan keyword yang sudah dihitung backend).

Field iklan yang digunakan: `id`/`ad_id`, `type` (`umkm`|`eksternal`), `sponsor`/`vendor`, `headline`/`title`, `cta`, `href`, `photo_url`/`image_url`.

Field presentasi yang belum tersedia dari API (nama UMKM, jarak, skor, metadata eligibility, review, dan iklan) memakai fallback demo lokal agar UI lomba tetap dapat diperagakan. Saat backend memperluas responsnya, field API otomatis mengambil prioritas.

## Catatan model Food Score

Food Score bersifat rule-based dan mengacu pada konsep freshness/shelf-life index serta dynamic pricing perishable food (mis. MDPI Foods 2020, POMS/Wiley). Ini indikator kelayakan berbasis waktu, **bukan** sertifikasi laboratorium — customer tetap diminta memeriksa kondisi makanan saat pickup.

## Verifikasi

```bash
npm test
npm run build
```

`npm run lint` saat ini masih gagal karena error pre-existing pada `src/app/dashboard/page.js` dan `src/app/pesanan/page.js` (setState sinkron di dalam effect). Modul marketplace Richard tidak menambah error lint.
