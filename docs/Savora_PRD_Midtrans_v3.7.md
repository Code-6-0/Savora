# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Savora — Food Rescue Marketplace untuk UMKM

**Versi:** 3.7 — Konsistensi Final & Presisi Teknis  
**Tanggal:** 20 Juli 2026  
**Tim:** AmbaTeam — 5 orang (Himatif S4)  
**Deadline:** 25 Juli 2026  
**Lomba:** CODE 6.0 — Software Development (AMCC, Universitas Amikom Yogyakarta)

> 📝 **Catatan Revisi v3.1 (20 Juli 2026):** Dokumen direvisi untuk konsistensi (hapus sisa COD, seragamkan model service fee, koreksi FR-06, batas waktu pembayaran 15 menit, RBAC + Mitra Donasi) dan penambahan spesifikasi (Food Score Decay, Keyword Classification, trigger Ready for Pickup, endpoint iklan, perbaikan data model). Setiap perubahan ditandai komentar 📝 **[REVISI #n]** sesuai nomor poin revisi.

> 📝 **Catatan Revisi v3.2 (20 Juli 2026):** Penyelarasan PRD dengan proposal Savora — (1) rumus Food Score Decay diubah dari linear menjadi power decay (γ=0,65) + band skor agar sama dengan proposal Bab 9.3; (2) bagian urgensi masalah dilengkapi data terukur beserta sumber; (3) data model dikelompokkan menjadi Inti MVP vs Perluasan agar ERD mencerminkan cakupan yang benar-benar dibangun. Perubahan ditandai 📝 **[REVISI #11–#13]**.

> 📝 **Catatan Revisi v3.3 (21 Juli 2026):** Sinkronisasi lanjutan PRD ↔ proposal — (1) Section 17 di-lock ke satu stack pasti (Next.js+React, Go+Fiber, PostgreSQL+GORM), bukan opsional lagi; (2) tabel kompetitor 8.1 diselaraskan ke pembanding lokal Indonesia (Surplus Indonesia, Garda Pangan) + Too Good To Go sebagai pembanding global; (3) aturan badge keyword 12.7 ditetapkan sebagai acuan tunggal (threshold, bukan worst-case); (4) checklist status implementasi ditambahkan di 18; (5) modul Reward & Badge ditetapkan sebagai Demo Only. Perubahan ditandai 📝 **[REVISI #14–#18]**.

> 📝 **Catatan Revisi v3.4 (21 Juli 2026):** (1) Scope MVP dijadikan **satu sumber kebenaran** — 9.1 disinkronkan dengan tabel Inti MVP (18) dan prioritas FR (11); fitur berbasis tabel Perluasan (iklan, mitra donasi, help center, waste log, keuangan/export, analitik lanjutan) dipindah eksplisit ke Should Have, termasuk penyesuaian di Acceptance Criteria (24) dan Testing Plan (23); (2) seluruh angka urgensi (Bappenas 2021, UNEP 2024) ditandai terverifikasi; sitasi placeholder "MDPI Foods 2020" dihapus, FreshTrack diberi judul lengkap + tautan, dan FR-15 dikoreksi dari "linear" ke power decay; (3) aturan Food Trust Index 12.4 dibuat presisi (if-else berbasis fraksi sisa masa layak); (4) skenario uji RBAC ditambahkan di 23. Perubahan ditandai 📝 **[REVISI #19–#22]**.

> 📝 **Catatan Revisi v3.5 (21 Juli 2026):** Polish konsistensi terakhir — (1) FR-09 (rating/review dengan keyword) dinaikkan P1 → P0 agar konsisten dengan 9.1, tabel Inti MVP (18), dan Acceptance Criteria (24); (2) FR-23 (dynamic discount) ditambahkan beserta skenario ujinya — sebelumnya fitur wajib ini dispesifikasikan penuh di Section 13 tetapi tidak punya jejak requirement → test; (3) status Impact Tracking diperjelas (FR-13 P1 = ringkasan data riil; grafik agregat & monthly story = Demo Only); (4) framing sitasi FreshTrack dipertegas (prinsip non-linear diadopsi secara heuristik berbasis waktu, bukan metodologi sensor IoT). Perubahan ditandai 📝 **[REVISI #23–#25]**.

> 📝 **Catatan Revisi v3.6 (21 Juli 2026):** Perbaikan konsistensi final hasil review menyeluruh — (1) sisa "Supabase" di Section 27 dihapus, stack sudah di-lock ke PostgreSQL sejak [REVISI #14]; (2) timeline W2 (21.3) disamakan dengan sinkronisasi scope [REVISI #19]: Help Center & Waste Log dikeluarkan dari core features; (3) rumus verifikasi signature webhook Midtrans ditulis eksplisit di FR-14 dan 14.6; (4) status order Created diperjelas sebagai status transien agar konsisten dengan flow 10.1; (5) field `reviews.keywords` ditetapkan sebagai denormalisasi — sumber kebenaran adalah tabel `review_keywords`; (6) hubungan color indicator (jam absolut) vs band skor (fraksi) dijelaskan eksplisit di 12.6; (7) atribusi angka 8–10% emisi GRK diperjelas (IPCC 2019 sebagaimana dikutip UNEP 2024). Perubahan ditandai 📝 **[REVISI #26–#32]**.

> 📝 **Catatan Revisi v3.7 (21 Juli 2026):** Perbaikan hasil review eksternal menyeluruh — (1) enum order_status dilengkapi `PAYMENT_FAILED` yang sudah dipakai di 14.1/14.2 tetapi tertinggal dari enum [REVISI #33]; (2) field `min_price` ditambahkan ke tabel products sebagai penopang guardrail harga minimum 13.3/FR-23 [REVISI #34]; (3) catatan implementasi expiry Midtrans ditambahkan di 14.5: batas 15 menit wajib diset via parameter `expiry` Snap token (default 24 jam) dan auto-expire order dilakukan scheduler Savora sendiri karena Midtrans tidak mengirim webhook saat halaman pembayaran expired [REVISI #35]; (4) ambiguitas FR-23 diputuskan mengikuti 5.2/13.1: sistem menghitung rekomendasi diskon otomatis, keputusan final tetap di UMKM dalam rentang aturan 13.2 + guardrail 13.3 [REVISI #36]; (5) Testing Plan: skenario webhook Midtrans dinaikkan Should → Must (konsisten dengan FR-14 P0) dan skenario moderasi listing (FR-12 P0) ditambahkan [REVISI #37]; (6) Food Rescue Score (5.2) diberi status Demo Only, metrik Help Ticket diberi label Should Have, dan catatan input FTI yang tidak memengaruhi aturan 12.4 ditambahkan di 12.2 [REVISI #38].

> 📝 **Catatan Revisi v3.8 (24 Juli 2026):** Penambahan fitur Keranjang Belanja Customer — (1) Customer dapat mengumpulkan beberapa produk ke dalam keranjang sebelum checkout; (2) implementasi frontend-only dengan persistence di localStorage; (3) checkout tetap melalui alur order existing (1 order per item); (4) validasi stok tetap di backend saat order dibuat; (5) service fee 5% ditampilkan di ringkasan keranjang. Fitur ini dikategorikan sebagai Should Have dan tidak mengubah happy path inti MVP. Perubahan ditandai 📝 **[REVISI #39]**.

---

## 1. Ringkasan Produk

### 1.1 Nama Produk
**Savora**

### 1.2 Tagline
"Selamatkan Makanan, Hemat Biaya, Kurangi Limbah."

### 1.3 Deskripsi Singkat
Savora adalah platform web responsive/mobile-first yang membantu UMKM kuliner menjual makanan surplus yang masih layak konsumsi dengan harga lebih terjangkau. Customer dapat melihat daftar rescue deal, mengecek informasi kelayakan makanan melalui Food Trust Index, melihat Food Score yang menurun seiring waktu mendekati expired, membaca badge keamanan restoran berbasis keyword ulasan, melakukan pembayaran cashless via Midtrans sandbox, lalu mengambil makanan langsung ke lokasi UMKM dalam batas waktu yang ditentukan. Platform menerapkan service fee 5% yang ditambahkan ke total pembayaran customer pada setiap transaksi sebagai model pendapatan.

> 📝 **[REVISI #2]** Model service fee diseragamkan: fee 5% DITAMBAHKAN ke total pembayaran customer (bukan dipotong dari pendapatan UMKM), mengikuti mayoritas bagian dokumen (5.1, FR-06, 14.3).

Savora juga menyediakan fitur iklan untuk UMKM (premium listing) dan iklan pihak ketiga, analitik penjualan & insight performa UMKM, serta dashboard admin untuk manajemen keuangan platform, verifikasi mitra donasi, dan manajemen iklan. Untuk makanan yang sudah tidak layak dijual, Savora menyediakan fitur Waste Log agar UMKM dapat mencatat makanan tidak terjual sebagai bahan evaluasi produksi. Pada MVP lomba, Savora tidak mencakup pengelolaan limbah eksternal, tidak menyediakan layanan delivery, dan tidak menyediakan pembayaran tunai (cashless only).

### 1.4 Visi Produk
Menjadi solusi digital sederhana dan realistis yang membantu UMKM mengurangi makanan terbuang sekaligus memberi customer akses makanan layak konsumsi dengan harga lebih hemat.

### 1.5 Nilai Utama Produk
- **Untuk UMKM:** mengurangi kerugian dari makanan surplus, membantu evaluasi stok, dan mengiklankan produk untuk meningkatkan visibilitas.
- **Untuk Customer:** mendapatkan makanan layak konsumsi dengan harga lebih terjangkau, dengan informasi kelayakan transparan melalui Food Score dan badge keyword ulasan.
- **Untuk Admin:** memantau listing, transaksi, keuangan platform, mengelola iklan, dan memverifikasi mitra donasi.
- **Untuk Mitra Donasi:** menerima makanan surplus dari UMKM yang tidak berhasil terjual untuk didistribusikan ke masyarakat yang membutuhkan.
- **Untuk Lingkungan:** membantu mengurangi potensi makanan terbuang melalui transaksi food rescue.

---

## 2. Konteks Lomba dan Batasan Dokumen

PRD ini disusun sebagai acuan internal tim dalam membangun Savora untuk lomba CODE 6.0. Struktur dan fokus dokumen disesuaikan dengan arahan RuleBook dan Template Proposal CODE 6.0, terutama pada aspek urgensi masalah, inovasi, business viability, metodologi pengembangan, arsitektur sistem, UI/UX, implementasi teknis, dan pengujian.

Sebagai karya lomba mahasiswa, Savora diposisikan sebagai pengembangan ide menjadi inovasi produk digital yang dapat diprototipekan dan diuji melalui MVP. Dokumen ini tidak mengklaim bahwa Savora sudah menjadi bisnis berjalan, sudah memiliki kerja sama resmi, atau sudah menyelesaikan masalah food waste secara menyeluruh.

Pendekatan inovasi Savora adalah menggabungkan beberapa fitur yang dapat didemonstrasikan secara realistis dalam konteks lomba mahasiswa: Food Trust Index rule-based, Food Score Decay, Keyword Classification, Smart Rescue Timer, Dynamic Pricing Recommendation, Cashless Payment via Midtrans Sandbox, Service Fee 5%, Pickup Code Verification, Slot Iklan, Analitik & Insight UMKM, Mitra Donasi, Help Center, Waste Log Insight, dan Impact Tracking estimatif.

### 2.1 Prinsip Penyusunan
- Fokus pada ide yang realistis untuk dikembangkan dalam durasi lomba.
- Menghindari klaim berlebihan seperti sertifikasi lingkungan, program pengolahan limbah skala besar, atau kerja sama besar yang belum tervalidasi.
- Menjelaskan fitur sebagai rancangan dan MVP yang dapat diuji, bukan sebagai klaim keberhasilan operasional.
- Menggunakan Midtrans sandbox sebagai payment gateway cashless yang dapat diuji tanpa transaksi uang asli, dengan service fee 5% per transaksi sebagai model pendapatan platform.

### 2.2 Batasan MVP
- Platform berbasis web responsive/PWA-ready, bukan native mobile app.
- Order menggunakan self-pickup, bukan delivery.
- Pembayaran cashless only melalui Midtrans sandbox (tidak ada pembayaran tunai/COD).
- Service fee 5% otomatis ditambahkan ke total pembayaran customer per transaksi.
- Order memiliki batas waktu pembayaran untuk Midtrans, batas waktu pickup, dan pickup code agar stok UMKM tidak tertahan terlalu lama.
- Waste management dibatasi sebagai pencatatan internal/Waste Log.
- Data UMKM, customer, produk, dan transaksi dapat menggunakan dummy data realistis untuk kebutuhan demo.
- Role Mitra Donasi terbatas pada registrasi dan verifikasi oleh admin.

> 📝 **[REVISI #2]** Kata "dipotong per transaksi" diubah menjadi "ditambahkan ke total pembayaran customer" untuk konsistensi model service fee.

---

## 3. Problem Statement

### 3.1 Latar Belakang Masalah
UMKM kuliner sering memiliki makanan yang masih layak konsumsi tetapi tidak habis terjual pada hari yang sama. Tanpa kanal penjualan alternatif, makanan tersebut berisiko dibuang sehingga menimbulkan kerugian ekonomi bagi UMKM dan meningkatkan jumlah makanan terbuang.

Di sisi lain, banyak customer seperti mahasiswa dan pekerja muda membutuhkan makanan dengan harga lebih terjangkau. Namun, makanan diskon sering menimbulkan keraguan terkait kualitas, waktu konsumsi, dan keamanan. Karena itu, dibutuhkan platform yang tidak hanya menjual makanan surplus, tetapi juga memberikan informasi kelayakan secara transparan.

### 3.2 Masalah Utama
1. UMKM belum memiliki kanal khusus untuk menjual makanan surplus yang masih layak konsumsi.
2. Customer membutuhkan makanan terjangkau, tetapi tetap memerlukan informasi kualitas dan batas waktu konsumsi.
3. Pemesanan online membutuhkan batas waktu pembayaran/pickup dan validasi pickup agar stok UMKM tidak tertahan.
4. Makanan yang tidak terjual sering tidak tercatat, sehingga UMKM sulit mengevaluasi jumlah produksi.
5. Admin membutuhkan sistem untuk memoderasi listing, menangani komplain, dan menjaga kepercayaan platform.

### 3.3 Urgensi Masalah
Masalah ini relevan karena food waste berdampak pada ekonomi UMKM dan lingkungan.

- **Skala nasional:** Berdasarkan kajian Bappenas (*Food Loss and Waste in Indonesia*, 2021), timbulan susut dan sisa pangan di Indonesia diperkirakan mencapai **23–48 juta ton per tahun** pada periode 2000–2019, dengan estimasi kerugian ekonomi ratusan triliun rupiah per tahun (sekitar 4–5% PDB). ✅ *Terverifikasi (21 Juli 2026): angka 23–48 juta ton (2000–2019), kerugian Rp213–551 triliun/tahun (4–5% PDB), dan atribusi ke **Bappenas 2021** telah dicek langsung ke sumber. Jangan atribusikan ke BPS — proposal yang masih menulis "BPS 2024" wajib dikoreksi.*
- **Konteks global:** *UNEP Food Waste Index Report 2024* memperkirakan lebih dari **1 miliar ton** makanan terbuang secara global per tahun, dan food loss & waste menyumbang sekitar **8–10% emisi gas rumah kaca global**. Catatan atribusi: angka 8–10% berasal dari **IPCC (2019)** dan dikutip dalam laporan UNEP 2024 — di daftar pustaka proposal tulis "IPCC 2019, sebagaimana dikutip dalam UNEP Food Waste Index Report 2024". 📝 *[REVISI #32]*
- **Relevansi kebijakan:** Target **SDG 12.3** menyerukan pengurangan separuh food waste per kapita di tingkat ritel dan konsumen pada 2030.
- **Sektor UMKM kuliner:** UMKM kuliner rentan menanggung kerugian dari makanan surplus harian yang tidak terjual, sementara kanal penjualan cepat untuk makanan surplus masih terbatas.

Solusi digital yang sederhana, mudah digunakan, dan sesuai kebiasaan pengguna lokal dapat membantu UMKM mengurangi makanan terbuang tanpa menambah beban operasional yang kompleks.

> 📝 **[REVISI #12]** Bagian urgensi dilengkapi data terukur beserta sumber (Bappenas 2021, UNEP Food Waste Index 2024, SDG 12.3) agar tidak menjadi klaim tanpa dasar. Setiap angka wajib dipastikan sitasinya sebelum submit; angka yang belum terverifikasi diberi penanda eksplisit.

> 📝 **[REVISI #20]** Verifikasi selesai (21 Juli 2026): Bappenas 2021 (23–48 juta ton/tahun periode 2000–2019; kerugian Rp213–551 triliun/tahun ≈ 4–5% PDB) dan UNEP Food Waste Index Report 2024 (1,05 miliar ton food waste global pada 2022; food loss & waste menyumbang 8–10% emisi GRK global) — semua angka akurat. Sitasi placeholder "MDPI Foods, 2020" di 7.1 dihapus karena tidak merujuk judul paper spesifik.

---

> 📝 **[REVISI #33 — 24 Jul 2026] Refactor Auth & Pivot Mitra**
> 1. **Register publik = Customer saja.** Halaman register TIDAK lagi menampilkan pilihan
>    role (menggantikan deskripsi Register/Login di Section 16). Endpoint register publik
>    hard-code role customer (menutup celah role injection — NFR 20.2).
> 2. **UMKM via upgrade akun.** Customer yang ingin berjualan mengajukan upgrade dari dalam
>    aplikasi (halaman /gabung-umkm) → profil usaha tersimpan ber-status PENDING → role tetap
>    customer selama ditinjau → saat Admin APPROVE, verification_status=APPROVED DAN user.role
>    berubah menjadi umkm (atomik). REJECT → role tetap customer + alasan. Gating publish
>    listing (FR-02) tidak berubah.
> 3. **Mitra Donasi → Mitra (pengolah limbah).** Role "mitra donasi" diganti konsep "Mitra"
>    dengan kategori: Bank Sampah, Daur Ulang, Kompos, Maggot (BSF), Pengangkutan Sampah,
>    Waste Management. Alasan: (a) menghindari isu martabat penerima donasi makanan ber-food-
>    score rendah; (b) jalur "feed people" sudah dipenuhi rescue deals; sisa tak terjual masuk
>    hierarki pengolahan limbah; (c) selaras Pergub DKI 102/2021 (kewajiban horeka mengelola
>    food waste mandiri) — Savora menjadi jalur kepatuhan UMKM kuliner.
> 4. **Implementasi bertahap.** Pendaftaran & dashboard Mitra berstatus "Segera hadir" pada
>    rilis lomba; verifikasi Admin memakai halaman existing. Nama teknis lama
>    (mitra_donasi_profiles, /mitra-donasi/*, role `mitra`) DIPERTAHANKAN dulu — rename adalah
>    utang refactor pasca-lomba. FR-19 dibaca sebagai "verifikasi Mitra".

### 34.9 (REVISI #35) — Jalur Donasi Surplus Acara
Mitra kategori "Donasi Makanan (Penyalur)" ditambahkan sebagai kategori ke-7.
Sumber donasi: surplus acara/katering/hajatan milik UMKM maupun Customer — BUKAN
produk tidak laku (produk tidak layak jual tetap ke jalur mitra pengolah via Waste Log).
Syarat kelayakan donasi (v2): makanan disiapkan < 4 jam & disimpan layak, bukan pangan
berisiko tinggi tanpa rantai dingin, porsi minimum, jendela waktu penjemputan.
Hierarki SAVORA: (1) jual berdiskon → (2) layak makan: donasikan → (3) tidak layak:
olah (kompos/maggot/daur ulang). Form donasi + matching mitra = backlog v2.
Dashboard: SATU dashboard mitra untuk semua kategori (tidak ada dashboard terpisah).

## 4. Target Pengguna

### 4.1 Customer
- **Profil:** mahasiswa, pekerja muda, keluarga hemat, atau pengguna yang mencari makanan terjangkau.
- **Kebutuhan:** mencari rescue deal, melihat informasi kelayakan makanan, memesan, dan mengambil makanan tepat waktu.
- **Pain point:** ragu terhadap kualitas makanan diskon, takut makanan tidak sesuai deskripsi, dan butuh kepastian pickup.

### 4.2 UMKM
- **Profil:** warung makan, kedai, restoran kecil-menengah, bakery, atau usaha makanan lokal.
- **Kebutuhan:** menjual makanan surplus, mengatur stok, mengelola pesanan, dan mengevaluasi makanan tidak terjual.
- **Pain point:** makanan tersisa menyebabkan kerugian, sulit mencari pembeli cepat, dan tidak punya data sisa makanan.

### 4.3 Admin
- **Profil:** pengelola platform atau tim operasional demo.
- **Kebutuhan:** memverifikasi UMKM, memverifikasi mitra donasi, mengelola keuangan platform, memoderasi listing dan iklan, memantau transaksi, dan menangani bantuan customer.
- **Pain point:** perlu menjaga kualitas platform, mengelola pendapatan (service fee + iklan), dan mengurangi risiko penyalahgunaan sistem.

### 4.4 Mitra Donasi
- **Profil:** yayasan, organisasi non-profit, lembaga sosial yang menyalurkan makanan ke masyarakat yang membutuhkan.
- **Kebutuhan:** mendaftar sebagai mitra donasi di platform, mendapatkan verifikasi dari admin.
- **Pain point:** belum memiliki kanal digital untuk menerima donasi makanan surplus dari UMKM secara terstruktur.

---

## 5. Modul Pengguna dan Fitur Utama

### 5.1 Customer sebagai Food Rescuer
Customer berperan sebagai Food Rescuer, yaitu pengguna yang membantu mengurangi potensi food waste dengan membeli makanan surplus yang masih layak konsumsi.

| Modul | Deskripsi Fitur |
|---|---|
| Marketplace | Menampilkan makanan surplus berdasarkan lokasi, kategori, harga, jarak terdekat, pencarian, dan filter. Menampilkan slot iklan UMKM premium dan iklan pihak ketiga. |
| Detail Produk | Menampilkan foto, deskripsi, harga, lokasi UMKM, waktu produksi, estimasi masa layak konsumsi, dan informasi kondisi makanan. |
| Food Trust Index | Menampilkan tingkat kepercayaan makanan berdasarkan Food Eligibility Assessment yang diinput oleh UMKM. |
| Food Score & Rescue Timer | Menampilkan Food Score (0-100) yang **menurun seiring waktu** mendekati expired, beserta hitung mundur sisa waktu makanan masih layak dijual dan batas waktu pickup. Dilengkapi **color indicator** (merah < 1 jam, kuning 1-3 jam, hijau > 3 jam). |
| Badge Keyword Safety | Menampilkan badge **Aman / Warning / Gawat** per restoran/UMKM berdasarkan akumulasi keyword dari review customer. |
| Checkout & Pembayaran | Customer melakukan pembelian dengan metode **cashless only** melalui Midtrans sandbox. Service fee 5% otomatis ditambahkan ke total pembayaran. |
| Tracking Pesanan | Customer melihat status pesanan, pickup code, dan instruksi pengambilan secara real-time. |
| Rating & Ulasan | Customer memberi penilaian dan ulasan terhadap produk/UMKM setelah transaksi selesai, dengan **input keyword** (enak, segar, basi, bau, dll) yang terhubung ke mesin klasifikasi. |
| Impact Tracking | Menampilkan estimasi jumlah makanan yang berhasil diselamatkan dan estimasi dampak lingkungan berbasis data transaksi. Estimasi ini bukan klaim karbon resmi. Status scope: ringkasan sederhana berbasis data riil = FR-13 (P1); grafik impact agregat & monthly impact story = Demo Only dengan data dummy (lihat 9.3). |
| Reward & Badge *(Demo Only)* | Memberikan badge sederhana seperti Food Hero, Green Supporter, dan Eco Saver sebagai gamifikasi. Status scope: Demo Only (lihat 9.3). |
| Help Center | Customer dapat meminta bantuan jika produk tidak tersedia, tidak sesuai deskripsi, UMKM tidak merespons, atau terjadi kendala pickup. |

### 5.2 UMKM sebagai Mitra Penjual Rescue Deal
UMKM berperan sebagai mitra yang menjual makanan surplus, mengelola pesanan, dan mencatat makanan yang tidak berhasil diselamatkan.

| Modul | Deskripsi Fitur |
|---|---|
| Dashboard | Menampilkan total penjualan, pendapatan, jumlah produk, makanan terjual, rating, dan makanan tercatat sebagai waste. |
| Kelola Produk | UMKM dapat menambah, mengubah, menghapus, dan mengatur stok produk. |
| Food Eligibility Assessment | UMKM mengisi jam produksi, estimasi masa simpan, kondisi kemasan, metode penyimpanan, dan kategori makanan. |
| Food Trust Index | Sistem menampilkan status Fresh, Layak Dijual, Segera Dijual, Tidak Disarankan Dijual, atau Tidak Layak Konsumsi. |
| Dynamic Pricing Recommendation | Sistem memberi saran diskon berdasarkan sisa masa kelayakan, tetapi keputusan harga tetap di UMKM. |
| Analitik Penjualan | Menampilkan **grafik penjualan** per produk, tren penjualan, dan **produk terlaris** dalam rentang waktu tertentu (7 hari / 30 hari / 3 bulan). |
| Insight UMKM | Menampilkan **rating UMKM**, review summary, **keyword safety badge** (Aman/Warning/Gawat) berdasarkan akumulasi keyword dari review customer, dan top keywords positif/negatif. |
| Analitik Pelacakan | Menampilkan metrik performa listing: total views produk, click-through rate, conversion rate, dan average order value. |
| Pengiklanan Produk | UMKM dapat **memasang/membeli iklan** untuk produknya (premium listing / slot iklan) agar produk lebih visible di marketplace. |
| Monitoring Food Waste | UMKM melihat jumlah makanan terjual dan makanan yang tercatat sebagai limbah. |
| Riwayat Penjualan | Menampilkan transaksi dan riwayat pembelian customer. |
| Tracking Pesanan | UMKM melihat status pesanan, memperbarui status, dan memvalidasi pickup code. |
| Rating & Ulasan | UMKM melihat penilaian dan ulasan customer, termasuk keyword yang digunakan. |
| Food Rescue Score *(Demo Only)* | Menampilkan performa UMKM berdasarkan listing, order selesai, no-show, review, dan waste log. Status scope: Demo Only (lihat 9.3). |

### 5.3 Admin sebagai Pengelola Platform
Admin bertugas menjaga kualitas ekosistem aplikasi, mengelola keuangan platform, memverifikasi mitra donasi, memoderasi aktivitas, mengelola iklan, dan menangani laporan pengguna.

| Modul | Deskripsi Fitur |
|---|---|
| Dashboard | Menampilkan ringkasan aktivitas, transaksi, food waste, pendapatan platform, dan statistik pengguna. |
| Manajemen UMKM | Admin menambah data, memverifikasi, mengubah data, atau menonaktifkan akun UMKM. |
| Manajemen Customer | Admin melihat daftar customer, menangani laporan pengguna, dan menonaktifkan akun customer jika diperlukan. |
| Verifikasi Mitra Donasi | Admin memverifikasi pendaftaran mitra donasi: **approve atau reject** kelayakan berdasarkan dokumen legalitas yang diunggah. |
| Keuangan Platform | Dashboard manajemen keuangan: **total pendapatan service fee 5%** dari transaksi + **pendapatan iklan** (UMKM & pihak ketiga). Dilengkapi chart trend revenue. |
| Export Laporan | Admin dapat **export laporan** transaksi, keuangan, UMKM, dan customer dalam format **CSV, Excel, atau PDF** dengan date range picker. |
| Manajemen Iklan | Admin **approve/reject iklan** dari UMKM dan iklan pihak ketiga sebelum ditayangkan di platform. Preview iklan dan detail advertiser tersedia. |
| Monitoring Produk | Admin melihat seluruh produk dan memastikan produk sesuai standar platform. |
| Monitoring Food Waste | Admin memantau makanan terjual dan menjadi limbah berdasarkan laporan UMKM. |
| Laporan | Admin melihat laporan transaksi, food waste, makanan terselamatkan, performa UMKM, dan dampak lingkungan estimatif. |

---

## 6. Tujuan, Manfaat, dan Dampak

### 6.1 Tujuan Produk
- Menyediakan marketplace makanan surplus yang mudah digunakan oleh UMKM dan customer.
- Membantu customer mendapatkan makanan layak konsumsi dengan harga lebih hemat.
- Memberikan informasi Food Trust Index agar customer dapat mengambil keputusan dengan lebih percaya diri.
- Mengurangi risiko stok tertahan melalui batas waktu pembayaran untuk Midtrans, batas waktu pickup, pickup code, dan pencatatan riwayat order.
- Membantu UMKM mencatat makanan tidak layak jual melalui Waste Log.

### 6.2 Manfaat Langsung
| Pengguna | Manfaat |
|---|---|
| Customer | Mendapat makanan dengan harga lebih terjangkau dan informasi kelayakan yang jelas. |
| UMKM | Mendapat peluang pendapatan tambahan dari makanan surplus. |
| Admin | Dapat memantau user, listing, transaksi, dan komplain dalam satu dashboard. |

### 6.3 Dampak yang Diharapkan
- Makanan surplus yang masih layak memiliki peluang lebih besar untuk terjual.
- UMKM dapat memahami pola makanan tidak terjual melalui Waste Log.
- Customer memiliki alternatif pembelian makanan yang lebih hemat.
- Platform dapat menjadi contoh solusi teknologi sederhana untuk masalah food waste lokal.

### 6.4 Metrik Dampak MVP
- Jumlah listing rescue deal yang dibuat UMKM.
- Jumlah order yang berhasil completed.
- Estimasi berat makanan yang terselamatkan dari order completed.
- Jumlah Waste Log yang dicatat UMKM.
- Conversion rate dari product detail ke checkout.
- Jumlah komplain valid yang masuk melalui Help Center.

---

## 7. Nilai Inovasi dan Orisinalitas

### 7.1 Inovasi Utama
1. **Marketplace khusus makanan surplus UMKM**  
   Savora tidak menjadi marketplace makanan umum, tetapi fokus pada makanan surplus yang masih layak konsumsi.

2. **Food Trust Index berbasis metadata**  
   Sistem memberi indikator kelayakan berdasarkan input seperti jenis makanan, waktu masak, metode penyimpanan, kemasan, dan kondisi makanan. Food Trust Index bersifat transparan dan explainable.

3. **Food Score Decay**  
   Skor kelayakan makanan (0-100) yang **menurun secara otomatis seiring waktu** mendekati expired, memberikan visualisasi real-time kepada customer tentang urgensi pembelian. Rumus mengikuti spesifikasi 12.6 (power decay, γ=0,65); pendekatan non-linear ini sejalan dengan literatur estimasi kesegaran/shelf-life makanan, a.l. *FreshTrack: an innovative IoT-sensor-driven food freshness estimation framework integrating blockchain* (Scientific Reports, 2026 — nature.com/articles/s41598-026-44579-1). Catatan: FreshTrack memodelkan kesegaran berbasis **sensor IoT** (suhu/kelembapan, kinetika Arrhenius); Savora mengadopsi prinsip non-linear tersebut secara **heuristik berbasis waktu, tanpa sensor** — sitasi ini mendukung klaim umum non-linearitas, bukan kesamaan metodologi. 📝 *[REVISI #20: sitasi placeholder "MDPI Foods, 2020" dihapus dan diganti referensi spesifik; REVISI #25: pembeda metodologi ditambahkan.]*

4. **Keyword Classification dari Ulasan**  
   Sistem mengklasifikasikan keyword dari review customer (rule-based) ke level **Aman** (enak, segar), **Warning** (bau), dan **Gawat** (basi, berjamur). Skor kegawatan dihitung per restoran berdasarkan akumulasi keyword.

5. **Cashless payment via Midtrans dengan service fee 5%**  
   Semua transaksi bersifat cashless melalui Midtrans sandbox, dengan service fee 5% otomatis ditambahkan ke total pembayaran customer sebagai model pendapatan platform. Pengambilan makanan tetap dilakukan self-pickup ke lokasi UMKM dengan validasi pickup code.

   > 📝 **[REVISI #2]** Kata "dipotong" diubah menjadi "ditambahkan ke total pembayaran customer" untuk konsistensi model service fee di seluruh dokumen.

6. **Slot Iklan untuk UMKM dan Pihak Ketiga**  
   UMKM dapat memasang iklan premium listing untuk produknya, dan pihak ketiga (brand luar) dapat memasang iklan di platform. Semua iklan di-review dan di-approve oleh admin.

7. **Analitik & Insight UMKM**  
   UMKM mendapatkan dashboard analitik penjualan, insight rating & keyword, analitik pelacakan (views, CTR, conversion rate), dan produk terlaris.

8. **Help Center untuk proteksi customer**  
   Customer dapat melaporkan masalah seperti produk tidak tersedia, makanan tidak sesuai deskripsi, atau UMKM tidak merespons.

9. **Waste Log untuk evaluasi UMKM**  
   UMKM dapat mencatat makanan yang tidak layak dijual agar memiliki data evaluasi produksi.

10. **Mitra Donasi**  
    Platform menyediakan role Mitra Donasi untuk yayasan/organisasi non-profit yang dapat mendaftar dan diverifikasi oleh admin untuk menerima makanan surplus.

### 7.2 Keunggulan Dibanding Solusi Umum
- Fokus pada UMKM lokal, bukan restoran besar saja.
- Informasi kelayakan makanan ditampilkan secara transparan melalui Food Trust Index dan Food Score Decay.
- Food Score yang menurun seiring waktu memberikan urgensi visual yang mendorong customer segera membeli.
- Keyword classification dari review memberikan informasi keamanan restoran secara crowdsourced.
- Flow pembayaran cashless via Midtrans sandbox dengan service fee 5% menunjukkan kesiapan model bisnis.
- Ada fitur bantuan customer untuk menjaga trust.
- Slot iklan dan analitik menunjukkan model bisnis yang sustainable.
- Scope MVP realistis untuk dibangun dalam waktu lomba.

### 7.3 Batas Klaim Inovasi
Savora tidak mengklaim sebagai sistem sertifikasi keamanan pangan, tidak mengklaim menghilangkan food waste sepenuhnya, dan tidak mengklaim memiliki kerja sama pengelolaan limbah. Fokus inovasi adalah pada digitalisasi rescue deal, transparansi informasi makanan melalui Food Score Decay dan keyword classification, model pendapatan platform via service fee dan iklan, serta pencatatan sederhana untuk evaluasi UMKM.

---

## 8. Analisis Kompetitor dan Business Viability

### 8.1 Tabel Kompetitor
| Aspek | Savora | Surplus Indonesia | Garda Pangan | Too Good To Go (global) |
|---|---|---|---|---|
| Fokus makanan surplus | Ya | Ya | Ya | Ya |
| Fokus UMKM lokal | Ya | Sebagian (retail/hotel/resto) | Terbatas (donasi) | Terbatas |
| Food Trust Index transparan | Ya | Tidak | Tidak | Tidak |
| Food Score Decay real-time | Ya | Tidak | Tidak | Tidak |
| Keyword Classification dari review | Ya | Tidak | Tidak | Tidak |
| Cashless payment gateway + service fee + pickup code | Ya | Ya (in-app) | Tidak (donasi) | Ya |
| Slot Iklan untuk UMKM & pihak ketiga | Ya | Tidak | Tidak | Tidak |
| Analitik & Insight UMKM | Ya | Terbatas | Tidak | Terbatas |
| Help Center khusus food rescue | Ya | Ada secara umum | Tidak spesifik | Ada secara umum |
| Waste Log untuk UMKM | Ya | Tidak | Tidak | Tidak |
| Dynamic discount berbasis kelayakan | Ya, rule-based | Diskon manual/tetap | Tidak | Terbatas |

> 📝 **[REVISI #15]** Tabel kompetitor diselaraskan dengan riset proposal (Bab 4.1): pembanding lokal Indonesia adalah **Surplus Indonesia** (aplikasi food rescue pertama di Indonesia) dan **Garda Pangan**. **Too Good To Go** dipertahankan hanya sebagai **pembanding global** dan diberi label karena belum beroperasi di Indonesia; Olio dan "Marketplace Umum" dihapus agar tabel akurat dan tidak menyesatkan juri.

### 8.2 Diferensiasi Produk
Savora berbeda karena menggabungkan marketplace makanan surplus, Food Trust Index, Food Score Decay, Keyword Classification, cashless payment via Midtrans sandbox dengan service fee 5%, pickup code, slot iklan, analitik & insight UMKM, mitra donasi, Help Center, dan Waste Log dalam satu flow yang sederhana. Diferensiasi ini relevan untuk konteks UMKM lokal yang membutuhkan solusi ringan, bukan sistem operasional besar.

### 8.3 SWOT Singkat
**Strengths:**
- Fokus masalah jelas dan lokal.
- Fitur MVP realistis untuk lomba.
- Food Trust Index transparan dan mudah dijelaskan.
- Food Score Decay memberikan urgensi visual real-time.
- Keyword Classification dari review memberikan crowdsourced safety information.
- Model pendapatan jelas: service fee 5% + iklan.
- Cashless via Midtrans sandbox menunjukkan kesiapan integrasi payment gateway secara realistis.

**Weaknesses:**
- Bergantung pada kejujuran input data UMKM.
- Integrasi Midtrans masih sandbox.
- Validasi data real masih terbatas pada demo/pilot.

**Opportunities:**
- Kesadaran terhadap food waste dan belanja hemat semakin meningkat.
- Banyak UMKM belum memiliki kanal khusus untuk menjual makanan surplus.
- Dapat dikembangkan menjadi PWA yang mudah diakses tanpa instalasi aplikasi native.
- Mitra donasi membuka peluang kerjasama dengan organisasi sosial.

**Threats:**
- Marketplace besar dapat menambahkan fitur serupa.
- Trust issue terhadap makanan surplus dapat menghambat adopsi.
- Customer no-show dapat merugikan UMKM jika tidak dimitigasi.

### 8.4 Model Bisnis (Model Pendapatan Platform)
- **Service Fee 5%:** ditambahkan otomatis ke total pembayaran customer pada setiap transaksi produk saat pembayaran cashless via Midtrans; UMKM menerima subtotal harga produk secara penuh.
- **Iklan UMKM:** UMKM membayar untuk mengiklankan produknya (premium listing / slot iklan di marketplace).
- **Iklan Pihak Ketiga:** Aplikasi/brand luar memasang iklan pada platform; dikenakan service fee juga.
- **Partnership lokal future:** kerja sama promosi dengan kampus, komunitas, atau pelaku UMKM.

> 📝 **[REVISI #2]** Model bisnis diselaraskan: service fee ditambahkan ke pembayaran customer, bukan dipotong dari pendapatan UMKM.

### 8.5 Rencana Keberlanjutan
- **Tahap 1:** validasi MVP melalui demo lomba dengan data dummy realistis.
- **Tahap 2:** uji coba terbatas dengan beberapa UMKM lokal.
- **Tahap 3:** pengembangan fitur berdasarkan feedback customer dan UMKM.

---

## 9. Scope Produk

### 9.1 MVP — Wajib Berfungsi (Happy Path Inti)
Cakupan wajib = fitur yang didukung 10 tabel **"Inti MVP"** di Section 18 dan FR berprioritas **P0** di Section 11 (satu sumber kebenaran).
1. Autentikasi dan role Customer, UMKM, Admin (role Mitra Donasi tersedia di sistem auth).
2. Marketplace rescue deal.
3. Create/edit/delete listing oleh UMKM.
4. Food Trust Index berbasis input metadata.
5. Food Score Decay (skor menurun seiring waktu mendekati expired, power decay sesuai 12.6).
6. Dynamic discount rule-based.
7. Keyword Classification dari ulasan (Aman / Warning / Gawat).
8. Checkout cashless via Midtrans sandbox, dengan service fee 5%, pickup code, dan batas waktu pickup.
9. Order tracking.
10. Dashboard Customer.
11. Dashboard UMKM dasar (kelola listing, kelola pesanan, ringkasan penjualan sederhana).
12. Dashboard Admin dasar (verifikasi UMKM, moderasi listing/user, monitoring transaksi).
13. Rating dan review dengan input keyword.

### 9.2 Should Have (Perluasan — dikerjakan setelah happy path inti stabil)
- Keranjang belanja customer (frontend-only dengan localStorage, checkout tetap per item via alur order existing). 📝 *[REVISI #39]*
- Pengiklanan produk UMKM dan iklan pihak ketiga (slot iklan + approval admin).
- Registrasi dan verifikasi Mitra Donasi (alur lengkap).
- Help Center untuk laporan customer.
- Waste Log untuk pencatatan makanan tidak layak jual.
- Keuangan platform dan export laporan untuk Admin.
- Analitik & insight UMKM lanjutan (grafik penjualan, produk terlaris, tracking metrics).
- Notifikasi in-app.
- Filter dan sorting marketplace lebih lengkap.

> 📝 **[REVISI #19]** Scope disinkronkan menjadi **satu sumber kebenaran**: sebelumnya tiga section memberi status berbeda untuk fitur yang sama (9.1 bilang "wajib", tabel FR di 11 bilang P1, data model di 18 bilang "Perluasan"). Kini 9.1 hanya berisi happy path inti yang didukung 10 tabel Inti MVP; fitur bertabel "Perluasan" (iklan, mitra donasi, help center, waste log, keuangan/export, analitik lanjutan) dipindah eksplisit ke Should Have. Should Have tetap ditargetkan ikut demo bila waktu memungkinkan, tetapi kegagalannya tidak boleh menggagalkan happy path inti. Item "Badge/gamifikasi" dihapus dari Should Have karena sudah berstatus Demo Only (lihat [REVISI #18]).

### 9.3 Demo Only
- Grafik impact dengan data dummy (tampilan agregat dari modul Impact Tracking 5.1).
- Dashboard analytics visual.
- Monthly impact story.
- Reward & Badge gamifikasi (Food Hero, Green Supporter, Eco Saver).
- Food Rescue Score UMKM (lihat 5.2).

> 📝 **[REVISI #18]** Modul Reward & Badge (sebelumnya muncul di 5.1 tanpa status scope) ditetapkan sebagai **Demo Only** agar tidak menjadi scope creep pada MVP.
> 📝 **[REVISI #24]** Status Impact Tracking diperjelas: **ringkasan aktivitas sederhana** berbasis data transaksi riil = FR-13 (P1/Should Have), sedangkan **grafik impact agregat & monthly impact story** = Demo Only (data dummy). Keduanya adalah dua level tampilan dari modul Impact Tracking yang sama di 5.1.

### 9.4 Tidak Termasuk MVP
- Delivery/logistik.
- Live tracking kurir.
- Native Android/iOS.
- AI/ML forecasting sungguhan.
- Pengelolaan limbah eksternal.
- Sertifikasi keamanan pangan otomatis.

---

## 10. User Flow Utama

### 10.1 Flow Customer — Cashless via Midtrans Sandbox
1. Customer membuka marketplace.
2. Customer mencari/filter rescue deal, melihat Food Score, Rescue Time, dan badge keyword safety.
3. Customer membuka detail produk.
4. Customer membaca Food Trust Index, Food Score, keyword safety, waktu pickup, harga (termasuk service fee 5%), dan informasi UMKM.
5. Customer checkout dengan metode cashless via Midtrans sandbox.
6. Sistem membuat order dengan status Payment Pending, reserve stok sementara, dan menambahkan service fee 5%.
7. Customer menyelesaikan simulasi pembayaran melalui Midtrans sandbox.
8. Jika payment status menjadi Paid, sistem membuat pickup code dan batas waktu pickup.
9. UMKM menekan tombol "Siapkan Pesanan" di dashboard; status order berubah dari Paid menjadi Ready for Pickup.
10. Customer datang ke lokasi UMKM.
11. UMKM memvalidasi pickup code.
12. Order menjadi completed.
13. Customer memberi rating/review dengan input keyword (enak, segar, basi, bau, dll).

> 📝 **[REVISI #8]** Trigger status Ready for Pickup diperjelas: perubahan Paid → Ready for Pickup dilakukan manual oleh UMKM melalui tombol "Siapkan Pesanan" di dashboard.

### 10.2 Flow UMKM
1. UMKM login ke dashboard.
2. UMKM membuat listing makanan surplus.
3. UMKM mengisi metadata Food Trust Index.
4. Sistem menampilkan hasil Food Trust Index dan rekomendasi harga.
5. UMKM publish listing.
6. UMKM menerima order.
7. UMKM menyiapkan pesanan.
8. UMKM memvalidasi pickup code saat customer datang.
9. Jika customer tidak datang, UMKM menandai no-show.
10. UMKM mencatat makanan tidak layak jual melalui Waste Log jika diperlukan.

### 10.3 Flow Admin
1. Admin login ke dashboard.
2. Admin memverifikasi akun UMKM.
3. Admin memverifikasi pendaftaran mitra donasi (approve/reject).
4. Admin memantau listing aktif dan order.
5. Admin mengelola iklan (approve/reject iklan UMKM dan pihak ketiga).
6. Admin melihat laporan/komplain customer.
7. Admin memberi keputusan: valid, ditolak, warning, suspend listing, atau suspend user.
8. Admin melihat dashboard keuangan platform (service fee + pendapatan iklan).
9. Admin export laporan (CSV/Excel/PDF).
10. Admin melihat ringkasan impact dan aktivitas platform.

---

## 11. Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-01 | User dapat register dan login | P0 | Customer dan UMKM dapat membuat akun dan masuk aplikasi; role Mitra Donasi tersedia di sistem auth (alur verifikasinya P1) |
| FR-02 | Admin dapat memverifikasi UMKM | P0 | UMKM hanya dapat publish listing setelah diverifikasi |
| FR-03 | UMKM dapat membuat listing | P0 | Listing berisi nama, foto, kategori, harga, stok, berat, lokasi pickup, dan metadata kelayakan |
| FR-04 | Sistem menghitung Food Trust Index | P0 | Badge Fresh/Layak Dijual/Segera Dijual/Tidak Disarankan Dijual/Tidak Layak Konsumsi muncul berdasarkan input metadata |
| FR-05 | Customer dapat browse marketplace | P0 | Produk aktif, belum expired, dan stok tersedia tampil di marketplace dengan Food Score, Rescue Time, dan badge keyword |
| FR-06 | Customer dapat checkout cashless via Midtrans | P0 | Sistem Savora membuat pickup code setelah payment status Paid; service fee 5% otomatis ditambahkan ke total pembayaran customer |
| FR-07 | UMKM dapat validasi pickup code | P0 | Order berubah menjadi completed jika pickup code valid |
| FR-08 | UMKM dapat menandai no-show | P0 | Order menjadi expired/no-show jika customer tidak datang |
| FR-09 | Customer dapat memberi rating/review dengan keyword | P0 | Review hanya dapat diberikan setelah order completed; keyword terdeteksi dan diklasifikasikan |
| FR-10 | Customer dapat membuat help ticket | P1 | Tiket masuk ke dashboard Admin |
| FR-11 | UMKM dapat membuat Waste Log | P1 | Catatan makanan tidak layak tersimpan dan tampil di dashboard |
| FR-12 | Admin dapat moderasi listing/user | P0 | Admin dapat approve, reject, suspend, atau memberi warning |
| FR-13 | Dashboard menampilkan impact sederhana | P1 | Customer, UMKM, dan Admin dapat melihat ringkasan aktivitas |
| FR-14 | Sistem menerima webhook Midtrans sandbox | P0 | Status pembayaran hanya diperbarui setelah signature valid — `SHA512(order_id + status_code + gross_amount + server_key)` sesuai 14.6 — dan status transaksi terverifikasi |
| FR-15 | Food Score menurun seiring waktu (decay) | P0 | Skor 0-100 berkurang mengikuti power decay (γ=0,65) berdasarkan sisa waktu menuju expired sesuai spesifikasi 12.6 |
| FR-16 | Sistem mengklasifikasikan keyword ulasan | P0 | Keyword dari review dipetakan ke level Aman/Warning/Gawat per restoran sesuai spesifikasi 12.7 |
| FR-17 | UMKM dapat memasang iklan produk | P1 | Iklan di-submit dan menunggu approval admin sebelum tayang |
| FR-18 | Admin dapat mengelola iklan | P1 | Admin approve/reject iklan UMKM dan pihak ketiga |
| FR-19 | Admin dapat memverifikasi mitra donasi | P1 | Pendaftaran mitra donasi di-review dan di-approve/reject oleh admin |
| FR-20 | Admin dapat melihat keuangan platform | P1 | Dashboard menampilkan total service fee + pendapatan iklan |
| FR-21 | Admin dapat export laporan | P1 | Export CSV/Excel/PDF dengan date range picker |
| FR-22 | UMKM dapat melihat analitik & insight | P1 | Grafik penjualan, produk terlaris, rating summary, keyword safety, tracking metrics |
| FR-23 | Sistem menghitung dynamic discount rule-based | P0 | Sistem otomatis menghitung rekomendasi diskon sesuai aturan per status kelayakan (13.2); UMKM menetapkan diskon final dalam rentang tersebut dan harga tidak pernah melanggar guardrail harga minimum (13.3) 📝 *[REVISI #36]* |
| FR-24 | Customer dapat mengelola keranjang belanja | P1 | Customer dapat menambah produk ke keranjang, mengubah kuantitas item (dibatasi stok tersedia), menghapus item dari keranjang, melihat ringkasan total harga termasuk service fee 5%, dan melakukan checkout dari keranjang; data keranjang persisten di localStorage (frontend-only); checkout tetap melalui alur order existing (1 order per item) dengan validasi stok di backend 📝 *[REVISI #39]* |

> 📝 **[REVISI #3]** FR-06: pembuat pickup code dikoreksi dari "Midtrans" menjadi "Sistem Savora"; Midtrans hanya mengirim status pembayaran.
> 📝 **[REVISI #6 & #7]** FR-15 dan FR-16 kini merujuk ke spesifikasi baru di subbab 12.6 dan 12.7.
> 📝 **[REVISI #19]** Prioritas disinkronkan dengan 9.1 dan Section 18: **P0 = happy path inti** (didukung tabel Inti MVP), **P1 = perluasan/Should Have**. FR-10 (help ticket) dan FR-19 (verifikasi mitra donasi) diturunkan dari P0 ke P1 karena tabel pendukungnya (help_tickets, mitra_donasi_profiles) berstatus Perluasan. FR-15 dikoreksi: acceptance criteria masih menulis "linear" padahal 12.6 sudah power decay.
> 📝 **[REVISI #23]** FR-09 dinaikkan P1 → P0: rating/review dengan keyword adalah bagian happy path inti (9.1 poin 13), tabel pendukungnya (reviews, review_keywords, keyword_scores) berstatus Inti MVP, dan FR-16 (P0) bergantung padanya. FR-23 ditambahkan: dynamic discount sebelumnya wajib di 9.1 dan dispesifikasikan penuh di Section 13, tetapi tidak punya FR maupun skenario uji.

---

## 12. Spesifikasi Food Trust Index, Food Score Decay, dan Keyword Classification

### 12.1 Tujuan Food Trust Index
Food Trust Index membantu customer memahami tingkat kelayakan makanan berdasarkan informasi yang diberikan UMKM. Food Trust Index bukan sertifikasi laboratorium dan tidak menggantikan pemeriksaan langsung oleh customer saat pickup.

### 12.2 Input Food Trust Index
- Kategori makanan.
- Waktu masak/produksi.
- Metode penyimpanan.
- Kondisi kemasan.
- Ada/tidaknya kuah atau saus.
- Foto makanan.

> Catatan: aturan penilaian 12.4 hanya memakai fraksi sisa masa layak (f), kondisi kemasan, dan metode penyimpanan. Input lain (kategori, kuah/saus, foto) bersifat informatif untuk customer dan tidak memengaruhi hasil penilaian pada MVP. 📝 *[REVISI #38]*

### 12.3 Output Food Trust Index
| Status | Makna | Aksi Sistem |
|---|---|---|
| Fresh | Kondisi makanan masih baik berdasarkan input UMKM | Dapat dipublikasikan |
| Layak Dijual | Masih layak dijual dengan informasi konsumsi yang jelas | Dapat dipublikasikan |
| Segera Dijual | Mendekati batas waktu konsumsi | Dapat dipublikasikan dengan urgency dan diskon lebih tinggi |
| Tidak Disarankan Dijual | Kurang ideal untuk dijual berdasarkan input UMKM | Tidak dipublikasikan dan diarahkan ke evaluasi internal UMKM |
| Tidak Layak Konsumsi | Tidak disarankan dijual atau dikonsumsi | Tidak tampil di marketplace dan diarahkan ke Waste Log |

### 12.4 Aturan Penilaian MVP
Food Trust Index pada MVP menggunakan aturan sederhana berbasis input UMKM. Aturan ini dibuat agar dapat dijelaskan kepada juri dan diimplementasikan oleh tim mahasiswa tanpa mengklaim akurasi laboratorium.

Aturan dievaluasi **berurutan dari atas** (aturan pertama yang cocok menang). Input: `f` = fraksi sisa masa layak (perhitungan sama dengan 12.6), `kemasan` (Baik/Standar/Rusak) dan `penyimpanan` (Sesuai/Tidak Sesuai) dari input UMKM saat membuat listing.

| Urutan | Kondisi (if-else) | Output Sistem |
|---|---|---|
| 1 | `f <= 0` ATAU `kemasan = Rusak` | Tidak Layak Konsumsi |
| 2 | `f < 0,15` ATAU `penyimpanan = Tidak Sesuai` | Tidak Disarankan Dijual |
| 3 | `f < 0,40` | Segera Dijual |
| 4 | `f < 0,75` ATAU `kemasan = Standar` | Layak Dijual |
| 5 | `f >= 0,75` DAN `kemasan = Baik` DAN `penyimpanan = Sesuai` | Fresh |

> 📝 **[REVISI #21]** Aturan penilaian diubah dari deskriptif ("risiko sedang", "kurang ideal") menjadi kondisi if-else terukur berbasis fraksi sisa masa layak (f) yang sama dengan 12.6, agar benar-benar rule-based, mudah diimplementasikan, dan mudah dijelaskan ke juri. Threshold (0,15 / 0,40 / 0,75) adalah keputusan produk MVP dan boleh dikalibrasi, tetapi nilainya wajib sama antara PRD, kode, dan proposal.

### 12.5 Disclaimer Wajib
Setiap detail produk wajib menampilkan disclaimer:

> Food Trust Index dihitung berdasarkan informasi yang diberikan UMKM dan aturan platform. Customer tetap disarankan memeriksa kondisi makanan saat pickup dan mengonsumsi sesuai batas waktu yang ditampilkan.

### 12.6 Food Score Decay Specification

> 📝 **[REVISI #6]** Subbab baru: rumus Food Score Decay sebelumnya belum dispesifikasikan padahal FR-15 berprioritas P0 dan ada anggota tim yang ditugaskan khusus.

**Skor awal** ditentukan dari status Food Trust Index saat listing dipublikasikan:

| Status Food Trust Index | Skor Awal |
|---|---:|
| Fresh | 100 |
| Layak Dijual | 85 |
| Segera Dijual | 70 |
| Tidak Disarankan Dijual / Tidak Layak Konsumsi | Tidak tayang (tanpa skor) |

**Rumus decay (power decay terhadap sisa waktu):**

Rasio sisa waktu (0–1):

`f = max(0, min(sisa_waktu, total_masa_layak)) / total_masa_layak`

Skor akhir:

`food_score = round(skor_awal × f^γ)`, dengan `γ = 0,65`

- `sisa_waktu` = `expires_at` − waktu sekarang; `total_masa_layak` = `expires_at` − waktu publish listing.
- Eksponen `γ = 0,65` membuat kurva **cekung (concave)**: skor bertahan relatif tinggi di awal masa jual, lalu menurun lebih cepat saat mendekati kedaluwarsa — sesuai perilaku degradasi kualitas makanan yang umumnya bersifat non-linear (kinetika deteriorasi).
- Skor dihitung ulang setiap kali halaman dimuat dan di-refresh berkala (per menit) di sisi client; nilai tersimpan di field `food_score` pada tabel products.

**Band skor → indikator kelayakan** (untuk badge dan urutan tampilan):

| Rentang food_score | Indikator | Aksi Sistem |
|---|---|---|
| 80–100 | Sangat Layak | Tampil normal di marketplace |
| 60–79 | Layak | Tampil normal |
| 35–59 | Segera Ambil | Tampil dengan urgency + rekomendasi diskon lebih tinggi |
| 1–34 | Kritis | Tampil dengan penanda urgensi tinggi; diprioritaskan untuk donasi |
| 0 | Kedaluwarsa | Listing otomatis berstatus Expired dan disembunyikan dari marketplace |

- Color indicator mengikuti sisa waktu, konsisten dengan bagian 5.1: merah < 1 jam, kuning 1-3 jam, hijau > 3 jam. Color indicator (jam absolut) dan band skor (fraksi sisa masa layak) adalah **dua indikator paralel yang memang bisa berbeda**: color indicator menjawab "berapa jam lagi harus diambil", band skor menjawab "seberapa layak produk relatif terhadap masa jualnya". Contoh: produk bermasa layak 24 jam dengan sisa 5 jam berwarna hijau (> 3 jam) tetapi band-nya "Segera Ambil" (f ≈ 0,21) — ini by design, bukan bug. 📝 *[REVISI #31]*
- Rumus dan band skor ini disamakan dengan proposal Savora (Bab 9.3) agar PRD dan proposal tidak berbeda.

**Implementasi (siap kode — PRD ini adalah sumber kebenaran):**

Tim mengimplementasikan langsung dari pseudocode berikut tanpa perlu menunggu konfirmasi antar-anggota. Kode backend dan proposal WAJIB mengikuti spesifikasi ini.

```
fungsi hitungFoodScore(skorAwal, publishAt, expiresAt, now):
    total = expiresAt - publishAt          # durasi total masa layak
    if total <= 0: return 0                # data tidak valid (expires <= publish)
    f = (expiresAt - now) / total          # rasio sisa waktu
    f = clamp(f, 0, 1)                      # jaga tetap di rentang 0..1
    return round(skorAwal * pow(f, 0.65))
```

Contoh Go (stack backend):

```go
func HitungFoodScore(skorAwal float64, publishAt, expiresAt, now time.Time) int {
    total := expiresAt.Sub(publishAt).Seconds()
    if total <= 0 {
        return 0
    }
    f := expiresAt.Sub(now).Seconds() / total
    f = math.Max(0, math.Min(1, f))
    return int(math.Round(skorAwal * math.Pow(f, 0.65)))
}
```

Contoh TypeScript (frontend):

```ts
function hitungFoodScore(skorAwal: number, publishAt: Date, expiresAt: Date, now: Date): number {
  const total = expiresAt.getTime() - publishAt.getTime();
  if (total <= 0) return 0;
  let f = (expiresAt.getTime() - now.getTime()) / total;
  f = Math.min(1, Math.max(0, f));
  return Math.round(skorAwal * Math.pow(f, 0.65));
}
```

**Test case wajib** (skor_awal = 100, masa layak = 8 jam) — gunakan untuk memverifikasi implementasi:

| Sisa waktu | f | food_score | Band |
|---|---|---:|---|
| 8 jam | 1,00 | 100 | Sangat Layak |
| 6 jam | 0,75 | 83 | Sangat Layak |
| 4 jam | 0,50 | 64 | Layak |
| 2 jam | 0,25 | 41 | Segera Ambil |
| 1 jam | 0,125 | 26 | Kritis |
| 0 jam | 0,00 | 0 | Kedaluwarsa |

**Edge case yang wajib ditangani:**
- `skor_awal` dikunci saat publish (mengikuti status Food Trust Index saat itu) dan TIDAK berubah setelahnya, walau status FTI berubah.
- `f` selalu di-clamp ke [0, 1] untuk mengantisipasi selisih jam server/client.
- Jika `total_masa_layak <= 0` (expires_at ≤ waktu publish), listing ditolak / skor 0.
- Skor dihitung ulang di client tiap load + tiap menit; simpan snapshot terakhir ke `products.food_score` untuk sorting di server (boleh di-refresh via cron/scheduler).

> 📝 **[REVISI #11]** Rumus Food Score Decay diubah dari **linear** menjadi **power decay (γ=0,65) + band skor**, disamakan dengan proposal (Bab 9.3) dan lebih sesuai dengan model kinetika degradasi kualitas makanan yang umumnya non-linear. **Ditetapkan:** karena tim membangun aplikasi mengikuti PRD, dokumen ini adalah **sumber kebenaran tunggal** untuk rumus ini — kode backend dan proposal mengikuti pseudocode + test case di atas, tanpa perlu konfirmasi antar-anggota. Effort implementasi power decay vs linear praktis sama (hanya beda `pow(f, 0.65)` vs `f`), sehingga power decay dipilih demi konsistensi dengan proposal. Referensi pendukung: *FreshTrack: an innovative IoT-sensor-driven food freshness estimation framework integrating blockchain* (*Scientific Reports*, 2026 — nature.com/articles/s41598-026-44579-1) dan literatur kinetic shelf-life (*Food Chemistry*, 2023). Cantumkan judul lengkap + tautan/DOI ini di daftar pustaka proposal agar juri dapat memeriksa langsung. Framing ke juri: indikator tampilan berbasis **heuristik waktu, tanpa sensor** — referensi di atas mendukung klaim umum bahwa degradasi kualitas makanan bersifat non-linear, bukan klaim bahwa metodologi Savora identik dengan paper tersebut (FreshTrack memakai sensor IoT), dan bukan pengukuran laboratorium.

### 12.7 Keyword Classification Specification

> 📝 **[REVISI #7]** Subbab baru: kamus keyword, threshold badge, format input, dan mitigasi review bombing sebelumnya belum dispesifikasikan.

**Format input:** kombinasi **chip preset** (utama) dan **free-text** opsional. Free-text dicocokkan secara rule-based (case-insensitive, substring match) ke kamus keyword di bawah. Keyword yang tidak dikenali tetap disimpan tetapi tidak memengaruhi badge.

**Kamus keyword awal:**

| Level | Contoh Keyword |
|---|---|
| Aman (positif) | enak, segar, fresh, hangat, bersih, layak, sesuai deskripsi |
| Warning | kurang segar, dingin, keras, agak asam, bau kurang sedap, kemasan rusak, porsi kurang |
| Gawat | basi, bau busuk, berjamur, berlendir, sakit perut, keracunan |

**Threshold badge per UMKM** (rolling window 30 hari, minimal 3 review agar badge tampil):

| Badge | Kondisi |
|---|---|
| Gawat | ≥ 3 keyword Gawat dari ≥ 2 customer berbeda |
| Warning | ≥ 3 keyword Warning, atau 1-2 keyword Gawat |
| Aman | Selain kondisi di atas |

**Mitigasi review bombing:**
- Review hanya dapat dibuat dari order berstatus Completed (1 review per order), sehingga keyword tidak dapat di-spam tanpa transaksi nyata.
- Keyword Gawat memicu flag otomatis ke dashboard Admin untuk verifikasi sebelum badge UMKM diturunkan ke Gawat.
- Admin dapat menganulir keyword yang terbukti tidak valid; tindakan anulir dicatat di audit log.
- Lonjakan keyword negatif yang anomali (banyak review negatif dalam waktu singkat) ditandai otomatis di dashboard Admin.

> 📝 **[REVISI #16]** Aturan badge versi PRD ini (**threshold**: ≥3 keyword Gawat dari ≥2 customer berbeda + verifikasi admin, rolling 30 hari) ditetapkan sebagai **acuan tunggal**, menggantikan aturan *worst-case* (1 keyword Gawat langsung menjatuhkan badge ke Gawat) di proposal Bab 9.4.2. Alasan: worst-case mudah di-abuse dan tidak adil bagi UMKM — satu review keliru atau jahat bisa langsung menghancurkan reputasi. **Proposal Bab 9.4.2 perlu disamakan ke aturan ini.**

---

## 13. Dynamic Discount

### 13.1 Konsep
Dynamic discount digunakan untuk memberi rekomendasi harga rescue deal berdasarkan status Food Trust Index. Tujuannya adalah membantu UMKM menjual makanan lebih cepat sebelum batas waktu konsumsi berakhir.

### 13.2 Aturan Diskon MVP
| Status | Rekomendasi Diskon | Catatan |
|---|---:|---|
| Fresh | 10-20% | UMKM dapat memilih diskon dalam rentang aman |
| Layak Dijual | 20-35% | Diskon menyesuaikan stok dan waktu pickup |
| Segera Dijual | 35-50% | Sistem menyarankan diskon lebih tinggi karena waktu konsumsi lebih dekat |
| Tidak Disarankan Dijual | Tidak diprioritaskan dijual | Produk diarahkan ke evaluasi internal UMKM |
| Tidak Layak Konsumsi | Tidak dijual | Produk diarahkan ke Waste Log |

### 13.3 Guardrail
- UMKM dapat menetapkan harga minimum agar tidak merugi terlalu besar.
- Sistem tidak boleh menjual produk dengan status Tidak Disarankan Dijual atau Tidak Layak Konsumsi.
- Harga final harus jelas sebelum customer checkout.

---

## 14. Order, Pembayaran Cashless, dan Customer Protection

### 14.1 Order Status
| Status | Penjelasan |
|---|---|
| Created | Order dibuat oleh customer — status transien; sistem langsung memindahkannya ke Payment Pending begitu transaksi Midtrans dibuat (konsisten dengan flow 10.1 langkah 6) 📝 *[REVISI #29]* |
| Payment Pending | Customer belum menyelesaikan pembayaran online |
| Paid | Pembayaran berhasil berdasarkan status Midtrans sandbox |
| Payment Failed | Pembayaran gagal atau melewati batas waktu |
| Ready for Pickup | UMKM menekan "Siapkan Pesanan" di dashboard setelah order Paid |
| Completed | Pickup code valid dan transaksi selesai |
| No Show | Customer tidak datang sampai batas waktu habis |
| Cancelled | Order dibatalkan oleh pihak terkait |
| Expired | Order/listing melewati batas waktu |
| Help Requested | Customer membuat tiket bantuan |

### 14.2 Transisi Status Order
| Metode | Alur Status Utama |
|---|---|
| Midtrans Sandbox Berhasil | Created -> Payment Pending -> Paid -> Ready for Pickup -> Completed atau No Show |
| Midtrans Sandbox Gagal/Expired | Created -> Payment Pending -> Payment Failed atau Expired |

### 14.3 Metode Pembayaran
Savora menggunakan **cashless only** pada MVP. Tidak ada pembayaran tunai/COD.

| Metode | Penggunaan | Catatan MVP |
|---|---|---|
| Midtrans Sandbox (Cashless) | Customer membayar secara online melalui simulasi payment gateway | Digunakan untuk demo integrasi payment gateway, bukan transaksi uang asli. Service fee 5% otomatis ditambahkan ke total pembayaran. |

### 14.4 Service Fee 5%
- Service fee 5% otomatis ditambahkan ke total pembayaran customer pada setiap transaksi produk (`total_price = subtotal + service_fee`).
- UMKM menerima subtotal harga produk secara penuh; service fee menjadi pendapatan platform.
- Service fee juga berlaku untuk transaksi iklan UMKM dan iklan pihak ketiga.
- Breakdown service fee ditampilkan secara transparan di halaman checkout.
- Total pendapatan service fee tercatat di dashboard keuangan admin.

> 📝 **[REVISI #2]** Sebelumnya tertulis "dipotong dari setiap transaksi" yang kontradiksi dengan 5.1/FR-06/14.3; ditetapkan model fee ditambahkan ke pembayaran customer.

### 14.5 Aturan Reservasi Stok
- Stok di-reserve sementara saat Payment Pending dengan batas waktu pembayaran 15 menit.
- Jika pembayaran Midtrans berhasil, stok tetap dikunci sampai batas waktu pickup.
- Jika pembayaran Midtrans gagal atau expired, stok dikembalikan agar dapat dipesan customer lain.
- **Catatan implementasi Midtrans:** batas 15 menit TIDAK otomatis — default expiry Snap adalah 24 jam, sehingga wajib diset melalui parameter `expiry` saat membuat Snap token (atau via Snap Preference di dashboard; minimum 5 menit). Midtrans juga tidak mengirim webhook saat halaman pembayaran expired, sehingga transisi order ke Expired dan pengembalian stok dilakukan oleh scheduler/cron Savora sendiri. 📝 *[REVISI #35]*

> 📝 **[REVISI #4]** Batas waktu pembayaran ditetapkan satu angka pasti (15 menit); sebelumnya rentang 10-15 menit yang ambigu untuk implementasi.

### 14.6 Aturan Pembayaran Midtrans (Cashless)
- Customer memilih Midtrans saat checkout dan sistem membuat transaksi pembayaran melalui Midtrans sandbox.
- Status awal order adalah Payment Pending sampai Midtrans mengirim status pembayaran berhasil atau gagal.
- Jika pembayaran berhasil, sistem membuat pickup code dan mengunci stok sampai batas waktu pickup.
- Jika pembayaran tidak selesai sampai batas waktu pembayaran, order otomatis expired dan stok dikembalikan.
- Pickup code divalidasi oleh UMKM saat customer datang mengambil pesanan.
- Sistem memverifikasi notifikasi/webhook Midtrans sandbox sebelum memperbarui status pembayaran. Verifikasi menggunakan signature key resmi Midtrans: `SHA512(order_id + status_code + gross_amount + server_key)`; notifikasi dengan signature tidak cocok diabaikan dan dicatat di payment log. 📝 *[REVISI #28: rumus verifikasi ditulis eksplisit sesuai dokumentasi resmi Midtrans agar implementasi backend tidak perlu menebak.]*
- Jika produk tidak tersedia setelah pembayaran sandbox berhasil, order masuk ke Help Requested untuk simulasi penyelesaian/refund manual oleh Admin.
- Pada MVP lomba, integrasi Midtrans menggunakan mode sandbox untuk kebutuhan demo dan pengujian, bukan transaksi uang asli.

### 14.7 Help Center
Customer dapat membuat laporan jika:
- Produk tidak tersedia saat pickup.
- Produk tidak sesuai deskripsi/foto.
- UMKM tidak merespons.
- Terjadi kendala saat pickup.
- Order dibatalkan sepihak.
- Pembayaran Midtrans sandbox berhasil tetapi pickup code tidak muncul.
- Pembayaran Midtrans sandbox gagal/expired atau status tidak berubah.

### 14.8 Penanganan Help Ticket
| Kondisi | Penanganan |
|---|---|
| Produk tidak tersedia | Admin meninjau laporan dan dapat memberi warning ke UMKM |
| Produk tidak sesuai deskripsi | Admin meminta bukti foto dan mengecek riwayat listing |
| UMKM tidak merespons | Admin dapat membatalkan order atau memberi peringatan |
| Customer no-show | UMKM menandai no-show dan sistem mencatat riwayat |
| Status pembayaran bermasalah | Admin mengecek payment log sandbox dan memperbarui catatan penyelesaian |
| Komplain tidak valid | Admin menutup tiket dengan catatan alasan |

---

## 15. Waste Log

### 15.1 Tujuan
Waste Log membantu UMKM mencatat makanan yang tidak layak dijual atau tidak berhasil terjual. Fitur ini digunakan sebagai insight internal, bukan sebagai layanan pengelolaan limbah.

### 15.2 Data yang Dicatat
- Nama/kategori makanan.
- Estimasi berat atau jumlah porsi.
- Alasan tidak dijual.
- Tanggal dan waktu pencatatan.
- Foto opsional.
- Catatan evaluasi UMKM.

### 15.3 Output Waste Log
- Riwayat makanan tidak terjual.
- Ringkasan jumlah makanan tercatat.
- Insight sederhana untuk evaluasi stok dan waktu publish listing.

---

## 16. Screen List

| Screen | Role | Tujuan |
|---|---|---|
| Landing Page | Guest | Mengenalkan Savora dan value proposition |
| Register/Login | Guest | Autentikasi pengguna dengan pilihan role Customer, UMKM, atau Mitra Donasi |
| Customer Marketplace | Customer | Browse rescue deal dengan Food Score, Rescue Time, badge keyword, dan slot iklan |
| Product Detail | Customer | Melihat detail makanan, Food Trust Index, Food Score Decay, keyword safety, dan harga |
| Cart | Customer | Mengelola keranjang belanja: menambah produk, mengubah kuantitas, menghapus item, melihat ringkasan total termasuk service fee 5%, dan checkout 📝 *[REVISI #39]* |
| Checkout & Pembayaran | Customer | Membuat order cashless via Midtrans sandbox dengan service fee 5% |
| Order Tracking | Customer | Melihat status order, pickup code, batas waktu, dan memberi review dengan keyword |
| Customer Impact | Customer | Melihat riwayat dan dampak personal |
| UMKM Dashboard | UMKM | Melihat listing, order, analitik penjualan, insight, keyword safety, dan pasang iklan |
| Create/Edit Listing | UMKM | Membuat atau mengubah listing makanan |
| UMKM Order Detail | UMKM | Mengelola order dan validasi pickup code |
| Waste Log | UMKM | Mencatat makanan tidak layak jual |
| Admin Dashboard | Admin | Monitoring platform, keuangan, dan statistik |
| Admin Verification | Admin | Verifikasi UMKM dan Mitra Donasi |
| Admin Help Center | Admin | Menangani laporan customer |
| Admin Listing Moderation | Admin | Moderasi listing bermasalah |
| Admin Keuangan | Admin | Dashboard pendapatan service fee + iklan, export laporan CSV/Excel/PDF |
| Admin Manajemen Iklan | Admin | Approve/reject iklan UMKM dan pihak ketiga |

---

## 17. Teknologi yang Digunakan

| Komponen | Teknologi MVP | Alasan Pemilihan |
|---|---|---|
| Frontend | **Next.js (React)** | Web responsive/mobile-first, routing cepat, cocok untuk demo lomba |
| Backend | **Go + Fiber v2** | API REST, autentikasi, order flow, dan integrasi Midtrans sandbox (versi persis mengikuti `go.mod`, mis. v2.52) |
| ORM | **GORM** | Mapping model ke PostgreSQL |
| Database | **PostgreSQL** | Relasional, cocok untuk user, produk, order, payment, review, dan waste log |
| Payment Gateway | **Midtrans Snap (Sandbox)** | Mendemonstrasikan alur payment gateway tanpa transaksi uang asli |
| Deployment | Vercel (frontend) + Railway/Render (backend) + PostgreSQL managed | Mudah dipakai untuk MVP dan demo juri |
| Design & Documentation | Figma, GitHub, README | Mendukung desain UI, dokumentasi teknis, dan kolaborasi tim |

> 📝 **[REVISI #14]** Stack di-**lock** ke satu pilihan pasti (bukan "A atau B") agar konsisten dengan proposal dan basis kode: Next.js+React, Go+Fiber v2, GORM, PostgreSQL, Midtrans Snap sandbox. Versi framework pasti mengikuti `go.mod` / `package.json` di repo — samakan angka versi di proposal dengan yang benar-benar terpasang. Midtrans tetap mode sandbox untuk demo, bukan klaim sistem pembayaran production-ready.

---

## 18. Data Model Ringkas

| Entity | Field Minimum |
|---|---|
| users | id, name, email, password_hash, role, status, created_at |
| customer_profiles | id, user_id, phone, address, avatar |
| umkm_profiles | id, user_id, business_name, address, geo_location, verification_status, rating, keyword_safety_level |
| mitra_donasi_profiles | id, user_id, org_name, phone, address, description, document_url, verification_status, verified_at, created_at |
| products | id, umkm_id, name, category, description, photo_url, original_price, rescue_price, min_price, stock, weight_per_portion, pickup_address, food_trust_status, food_score, expires_at, status |
| food_trust_logs | id, product_id, input_payload, food_trust_status, food_score, reason, created_at |
| orders | id, product_id, customer_id, quantity, subtotal, service_fee, total_price, payment_method, payment_status, pickup_code, reserved_until, pickup_deadline, status, cancel_reason, created_at, paid_at, completed_at |
| payments | id, order_id, provider, provider_order_id, amount, service_fee_amount, payment_status, payment_url, signature_verified, paid_at, expired_at, created_at |
| reviews | id, order_id, reviewer_id, target_id, rating, comment, keywords, created_at |
| review_keywords | id, review_id, keyword, level, created_at |
| keyword_scores | id, umkm_id, total_aman, total_warning, total_gawat, safety_level, updated_at |
| advertisements | id, advertiser_id, advertiser_type, title, image_url, target_url, duration_days, price, service_fee, status, approved_by, approved_at, starts_at, expires_at, created_at |
| ad_metrics | id, ad_id, impressions, clicks, ctr, date |
| umkm_analytics | id, umkm_id, total_views, total_clicks, ctr, conversion_rate, avg_order_value, period_start, period_end |
| platform_revenue | id, source_type, source_id, amount, service_fee_amount, description, created_at |
| help_tickets | id, order_id, reporter_id, category, description, proof_url, status, admin_note, created_at |
| waste_logs | id, umkm_id, food_name, category, estimated_weight, reason, photo_url, created_at |
| notifications | id, user_id, title, message, is_read, created_at |
| audit_logs | id, actor_id, action, target_type, target_id, note, created_at |

**Perhitungan harga order:** `subtotal = rescue_price × quantity`; `service_fee = 5% × subtotal` (dibayar customer); `total_price = subtotal + service_fee`. UMKM menerima `subtotal` penuh; `service_fee` tercatat sebagai pendapatan platform di `platform_revenue`.

> 📝 **[REVISI #2]** Rumus perhitungan subtotal/service_fee/total_price ditambahkan agar model service fee (ditambahkan ke pembayaran customer) eksplisit di data model.
> 📝 **[REVISI #10]** Field `umkm_id` pada umkm_profiles diganti menjadi `user_id` (foreign key ke tabel users), konsisten dengan customer_profiles dan mitra_donasi_profiles.
> 📝 **[REVISI #30]** Field `keywords` pada tabel reviews ditetapkan sebagai **denormalisasi untuk tampilan** (snapshot keyword mentah yang diinput customer). Sumber kebenaran untuk klasifikasi dan badge adalah tabel `review_keywords` (plus agregat `keyword_scores`); jika keduanya berbeda, `review_keywords` yang menang.

**Status cakupan tabel (untuk penyusunan ERD & diagram arsitektur):**
- **Inti MVP (wajib untuk demo):** users, customer_profiles, umkm_profiles, products, food_trust_logs, orders, payments, reviews, review_keywords, keyword_scores.
- **Perluasan (mendukung fitur lomba — konfirmasi status implementasi ke tim backend):** mitra_donasi_profiles, advertisements, ad_metrics, umkm_analytics, platform_revenue, help_tickets, waste_logs, notifications, audit_logs.

> 📝 **[REVISI #13]** Tabel dikelompokkan menjadi "Inti MVP" dan "Perluasan" agar ERD dan diagram arsitektur mencerminkan cakupan yang benar-benar dibangun. **Catatan tim:** tandai tabel Perluasan mana yang sudah ada di kode vs masih rencana, agar dokumen tidak mengklaim fitur yang belum terbangun (ini akar inkonsistensi "sudah jadi vs belum" yang perlu dihindari).

**Checklist status implementasi** (WAJIB diisi tim backend sebelum submit — samakan dengan Tabel 7 proposal; ganti ⬜ menjadi ✅ Sudah ada / 🔧 Rencana):

| Tabel | Kelompok | Status |
|---|---|---|
| users | Inti MVP | ⬜ |
| customer_profiles | Inti MVP | ⬜ |
| umkm_profiles | Inti MVP | ⬜ |
| products | Inti MVP | ⬜ |
| food_trust_logs | Inti MVP | ⬜ |
| orders | Inti MVP | ⬜ |
| payments | Inti MVP | ⬜ |
| reviews | Inti MVP | ⬜ |
| review_keywords | Inti MVP | ⬜ |
| keyword_scores | Inti MVP | ⬜ |
| mitra_donasi_profiles | Perluasan | ⬜ |
| advertisements | Perluasan | ⬜ |
| ad_metrics | Perluasan | ⬜ |
| umkm_analytics | Perluasan | ⬜ |
| platform_revenue | Perluasan | ⬜ |
| help_tickets | Perluasan | ⬜ |
| waste_logs | Perluasan | ⬜ |
| notifications | Perluasan | ⬜ |
| audit_logs | Perluasan | ⬜ |

> 📝 **[REVISI #17]** Checklist status implementasi ditambahkan agar klaim "sudah jadi vs rencana" bisa direkonsiliasi dengan Tabel 7 proposal sebelum submit (mitigasi risiko overclaim fitur).

### 18.1 Enum Penting
| Field | Nilai MVP |
|---|---|
| user_role | CUSTOMER, UMKM, ADMIN, MITRA_DONASI |
| payment_method | MIDTRANS_SANDBOX |
| payment_status | UNPAID, PENDING, PAID, FAILED, EXPIRED |
| order_status | CREATED, PAYMENT_PENDING, PAID, PAYMENT_FAILED, READY_FOR_PICKUP, COMPLETED, NO_SHOW, CANCELLED, EXPIRED, HELP_REQUESTED |
| keyword_level | AMAN, WARNING, GAWAT |
| ad_status | PENDING, APPROVED, REJECTED, ACTIVE, EXPIRED |
| verification_status | PENDING, APPROVED, REJECTED |

> 📝 **[REVISI #33]** `PAYMENT_FAILED` ditambahkan ke enum order_status; status ini sudah dipakai di 14.1 dan 14.2 tetapi sebelumnya tertinggal dari enum.

---

## 19. API Requirements Ringkas

| Method | Endpoint | Deskripsi | Role |
|---|---|---|---|
| POST | /auth/register | Registrasi user | Public |
| POST | /auth/login | Login user | Public |
| GET | /me | Ambil profil aktif | All |
| PATCH | /me | Update profil | All |
| GET | /products | Browse marketplace | Public/Customer |
| POST | /products | Buat listing | UMKM |
| GET | /products/{id} | Detail produk | Public/Customer |
| PATCH | /products/{id} | Edit listing | UMKM/Admin |
| DELETE | /products/{id} | Hapus listing | UMKM/Admin |
| POST | /food-trust/calculate | Hitung Food Trust Index | UMKM |
| POST | /orders | Buat order cashless via Midtrans | Customer |
| POST | /payments/midtrans-token | Membuat token pembayaran Midtrans sandbox | Customer |
| POST | /payments/midtrans-webhook | Menerima notifikasi status pembayaran Midtrans | System |
| GET | /orders | List order user | Customer/UMKM/Admin |
| GET | /orders/{id} | Detail order | Related user/Admin |
| PATCH | /orders/{id}/status | Update status order | UMKM/Admin |
| POST | /orders/{id}/validate-pickup | Validasi pickup code | UMKM |
| POST | /reviews | Buat review dengan keyword | Customer |
| GET | /reviews/keywords/{umkm_id} | Get keyword safety score per UMKM | Public |
| POST | /help-tickets | Buat laporan bantuan | Customer |
| GET | /help-tickets | List laporan bantuan | Admin |
| PATCH | /help-tickets/{id}/status | Update status bantuan | Admin |
| POST | /waste-logs | Buat Waste Log | UMKM |
| GET | /waste-logs | List Waste Log | UMKM/Admin |
| POST | /advertisements | Submit iklan baru | UMKM/External |
| GET | /advertisements | List iklan | UMKM/Admin |
| PATCH | /advertisements/{id}/status | Approve/reject iklan | Admin |
| GET | /advertisements/active | Get iklan aktif untuk marketplace | Public |
| POST | /advertisements/{id}/impression | Catat impression iklan (untuk ad_metrics) | System |
| POST | /advertisements/{id}/click | Catat klik iklan (untuk ad_metrics) | System |
| GET | /analytics/umkm/ads | Get performa iklan UMKM (impressions, clicks, CTR) | UMKM |
| GET | /analytics/umkm | Get analitik penjualan UMKM | UMKM |
| GET | /analytics/umkm/tracking | Get analitik pelacakan UMKM | UMKM |
| GET | /analytics/umkm/insight | Get insight rating & keyword | UMKM |
| POST | /mitra-donasi/register | Register sebagai mitra donasi | Public |
| GET | /admin/mitra-donasi | List pendaftaran mitra donasi | Admin |
| PATCH | /admin/mitra-donasi/{id}/verify | Verifikasi mitra donasi | Admin |
| GET | /admin/users | Manajemen user | Admin |
| GET | /admin/customers | List semua customer | Admin |
| PATCH | /admin/umkm/{id}/verification | Verifikasi UMKM | Admin |
| GET | /admin/revenue | Dashboard keuangan platform | Admin |
| GET | /admin/revenue/export | Export laporan keuangan (CSV/Excel/PDF) | Admin |
| GET | /admin/reports/summary | Ringkasan platform | Admin |

> 📝 **[REVISI #9]** Menambahkan endpoint tracking impression/klik iklan dan performa iklan UMKM agar konsisten dengan entity ad_metrics dan acceptance criteria 24.2 ("UMKM dapat melihat performa iklan").

---

## 20. Non-Functional Requirements

### 20.1 Performance
- Halaman utama dapat dimuat kurang dari 3 detik pada koneksi normal.
- API utama merespons dalam waktu wajar untuk skala demo/pilot.
- Marketplace mendukung pagination atau lazy loading.

### 20.2 Security
- Password disimpan menggunakan hashing.
- Autentikasi menggunakan JWT/session token.
- Role-based access control diterapkan untuk Customer, UMKM, Admin, dan Mitra Donasi.
- Input form divalidasi di client dan server.
- Admin action dicatat pada audit log.

> 📝 **[REVISI #5]** Role Mitra Donasi ditambahkan ke daftar RBAC yang sebelumnya tertinggal (role ini sudah ada di FR-01 dan enum user_role).

### 20.3 Accessibility
- Kontras warna minimal mengikuti prinsip WCAG AA.
- Semua tombol utama memiliki label yang jelas.
- Form memiliki label dan pesan error.
- Navigasi utama dapat digunakan dengan keyboard.
- Gambar produk memiliki alt text.

### 20.4 Compatibility
- Responsive untuk mobile, tablet, dan desktop.
- Mendukung browser modern seperti Chrome, Firefox, Edge, dan Safari.
- PWA-ready untuk penggunaan mobile tanpa native app.

---

## 21. Metodologi Pengembangan

### 21.1 Metode
Pengembangan menggunakan pendekatan **Agile/Scrum sederhana** karena durasi lomba terbatas dan tim perlu melakukan iterasi cepat. Metode ini memungkinkan tim membagi pekerjaan ke dalam sprint pendek, melakukan evaluasi harian, dan memprioritaskan fitur MVP.

### 21.2 Tahapan
| Tahap | Fokus | Output |
|---|---|---|
| Discovery & Scope Lock | Menentukan masalah, fitur, user flow, dan batasan MVP | PRD final dan backlog |
| Design Sprint | Membuat wireframe, design system, dan prototype | Figma dan design spec |
| Development Sprint | Implementasi frontend, backend, database, dan integrasi API | MVP berjalan end-to-end |
| Testing & Refinement | Pengujian, bug fixing, dan perbaikan UX | Demo stabil |
| Submission Preparation | Proposal, video demo, deployment, dan README | Paket submission lengkap |

### 21.3 Timeline 22 Hari
| Minggu | Tanggal | Fokus | Deliverable |
|---|---|---|---|
| W1 | 4-10 Jul | Setup, desain, backend awal | Repo, database, auth, API skeleton, design system |
| W2 | 11-17 Jul | Core features | Marketplace, Food Trust Index, Food Score Decay, cashless payment via Midtrans sandbox, rating/review dengan keyword |
| W3 | 18-22 Jul | Polish dan deployment | Dashboard, rating, testing, deploy, video demo |
| Deadline | 25 Jul | Submission | Proposal PDF, video, GitHub, deployed app |

> 📝 **[REVISI #1]** Menghapus sisa referensi "COD" dari versi dokumen lama; seluruh dokumen sudah cashless-only via Midtrans sandbox.
> 📝 **[REVISI #27]** Deliverable W2 disamakan dengan sinkronisasi scope [REVISI #19]: Help Center dan Waste Log dikeluarkan dari core features (keduanya Should Have, dikerjakan setelah happy path inti stabil) dan diganti fitur P0 yang sebelumnya tidak tercantum (Food Score Decay, rating/review dengan keyword).

---

## 22. Pembagian Tugas Tim

| Anggota | Role | Tanggung Jawab |
|---|---|---|
| Wa Ode Nur Alia | Auth, Admin, Keuangan, Mitra Donasi, Iklan | Auth & role user, admin dashboard, keuangan platform, verifikasi mitra donasi, manajemen iklan, export laporan |
| Richard Firmansyah | Marketplace Customer, Detail Produk, Slot Iklan | Beranda Food Score/Rescue Time, badge keyword safety, slot iklan marketplace, detail produk |
| Muhammad Rifaidi | Dashboard UMKM, Analitik, Insight, Iklan UMKM | Dashboard UMKM, analitik penjualan, insight rating & keyword, analitik pelacakan, pengiklanan produk |
| Ridwan Hakim Ramadhan | Food Score Decay, Keyword Classification | Rumus Food Score decay, mesin klasifikasi keyword ulasan, API score & keyword |
| Nadi Azzada Akbar | Cashless, Service Fee, Order, Review Keyword | Sistem cashless Midtrans, service fee 5%, checkout, order tracking, input review keyword |

---

## 23. Testing Plan

| Area | Scenario | Expected Result | Priority |
|---|---|---|---|
| Auth | User register sebagai Customer | Akun berhasil dibuat | Must |
| Auth | User register sebagai Mitra Donasi | Akun dibuat, status pending verifikasi | Should |
| Auth | Login dengan password salah | Error tampil dan session tidak dibuat | Must |
| RBAC | UMKM mencoba akses endpoint admin (mis. approve iklan, moderasi user) | Request ditolak 403 dan tidak ada perubahan data | Must |
| RBAC | Customer mencoba akses dashboard/endpoint UMKM | Request ditolak 403 | Must |
| RBAC | User tanpa login mengakses endpoint terproteksi | Request ditolak 401 | Must |
| UMKM | UMKM membuat listing lengkap | Listing tersimpan dan Food Trust Index tampil | Must |
| Food Trust Index | Produk Tidak Layak Konsumsi | Produk tidak tampil di marketplace | Must |
| Food Score Decay | Skor menurun seiring waktu mendekati expired | Food Score berkurang otomatis | Must |
| Dynamic Discount | Produk berstatus Segera Dijual | Rekomendasi diskon tampil sesuai aturan 13.2 dan harga final tidak pernah di bawah guardrail 13.3 | Must |
| Keyword | Review dengan keyword "basi" | Keyword diklasifikasikan sebagai Gawat | Must |
| Keyword | Akumulasi keyword per restoran | Badge safety restoran berubah sesuai akumulasi | Must |
| Marketplace | Customer filter produk | Produk sesuai filter tampil dengan Food Score dan badge keyword | Must |
| Checkout Cashless | Customer membuat order via Midtrans sandbox | Service fee 5% ditambahkan, payment pending | Must |
| Checkout Midtrans Paid | Customer menyelesaikan pembayaran Midtrans sandbox | Payment status menjadi Paid dan pickup code dibuat | Must |
| Checkout Midtrans Expired | Customer tidak menyelesaikan pembayaran Midtrans sandbox | Order menjadi expired dan stok dikembalikan | Must |
| Midtrans Webhook | Sistem menerima notifikasi pembayaran sandbox | Signature/status diverifikasi sebelum order diperbarui | Must |
| Pickup | UMKM input pickup code valid | Order menjadi completed | Must |
| No Show | Customer tidak datang | Order menjadi no-show/expired | Must |
| Review Keyword | Customer submit review dengan keyword | Keyword terdeteksi dan diklasifikasikan | Must |
| Iklan UMKM | UMKM submit iklan produk | Iklan pending approval admin | Should |
| Iklan Admin | Admin approve iklan | Iklan tayang di marketplace | Should |
| Mitra Donasi | Admin verifikasi mitra donasi | Status berubah menjadi approved/rejected | Should |
| Keuangan | Admin lihat dashboard keuangan | Total service fee + iklan tampil | Should |
| Export | Admin export laporan CSV/PDF | File terdownload dengan data yang benar | Should |
| Analitik | UMKM lihat analitik penjualan | Grafik dan insight tampil | Should |
| Help Center | Customer membuat laporan | Tiket tampil di Admin dashboard | Should |
| Waste Log | UMKM mencatat makanan tidak layak | Data tersimpan di dashboard | Should |
| Review | Customer review sebelum completed | Sistem menolak review | Must |
| Admin | Admin verifikasi UMKM | UMKM dapat publish listing | Must |
| Moderasi | Admin suspend listing bermasalah | Listing tidak lagi tampil di marketplace | Must |
| Accessibility | Navigasi keyboard | Aksi utama dapat dijangkau | Should |
| Error State | API marketplace gagal | UI menampilkan retry state | Must |

> 📝 **[REVISI #22]** Ditambahkan 3 skenario uji RBAC (sebelumnya tidak ada padahal NFR 20.2 eksplisit menyebut RBAC). Prioritas skenario Mitra Donasi, Help Center, dan register Mitra Donasi disesuaikan Must → Should mengikuti sinkronisasi scope [REVISI #19].

---

## 24. Acceptance Criteria MVP

Kriteria mengikuti sinkronisasi scope [REVISI #19]: tanpa tanda = happy path inti (wajib); *(Should Have)* = kriteria perluasan, berlaku hanya bila fiturnya jadi dikerjakan.

### 24.1 Customer
- Customer dapat register, login, browse produk dengan Food Score dan badge keyword, melihat detail produk, checkout cashless via Midtrans sandbox (dengan service fee 5%), melihat order tracking, dan memberi review dengan keyword setelah order selesai.
- Customer dapat melihat Food Trust Index, Food Score yang menurun seiring waktu, badge keyword safety, batas waktu pickup, pickup code, dan status order.
- *(Should Have)* Customer dapat membuat Help Ticket jika terjadi masalah.

### 24.2 UMKM
- UMKM dapat register, login, melengkapi profil, dan menunggu verifikasi Admin.
- UMKM terverifikasi dapat membuat listing makanan surplus.
- UMKM dapat mengelola order, memvalidasi pickup code, menandai no-show, dan melihat ringkasan penjualan sederhana.
- *(Should Have)* UMKM dapat membuat Waste Log.
- *(Should Have)* UMKM dapat melihat analitik penjualan lanjutan, insight rating & keyword, analitik pelacakan, dan produk terlaris.
- *(Should Have)* UMKM dapat memasang iklan produk dan melihat performa iklan.

### 24.3 Admin
- Admin dapat memverifikasi UMKM.
- Admin dapat melihat user, customer, listing, order, dan ringkasan platform.
- *(Should Have)* Admin dapat memverifikasi mitra donasi.
- *(Should Have)* Admin dapat melihat dan menangani Help Ticket.
- *(Should Have)* Admin dapat mengelola keuangan platform (service fee + iklan) dan export laporan.
- *(Should Have)* Admin dapat approve/reject iklan UMKM dan pihak ketiga.
- Admin dapat memberi warning, menolak laporan tidak valid, atau melakukan moderasi listing/user.

### 24.4 Demo Readiness
- Aplikasi dapat diakses melalui URL deployment.
- Demo account tersedia untuk Customer, UMKM, dan Admin.
- Happy path utama berjalan tanpa crash.
- Data dummy realistis tersedia untuk kebutuhan presentasi.
- README menjelaskan cara menjalankan dan menggunakan aplikasi.

---

## 25. Risks and Mitigation

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope terlalu besar | Fitur tidak selesai | Prioritaskan MVP dan jadikan fitur tambahan sebagai demo-only |
| Customer no-show setelah order dibuat | Stok tertahan dan pengalaman UMKM terganggu | Pickup deadline, pickup code, status no-show, dan Help Center |
| Trust issue terhadap makanan surplus | Customer ragu membeli | Food Trust Index, foto wajib, jam produksi, rating, dan Help Center |
| UMKM salah input data | Informasi kelayakan tidak akurat | Validasi form, disclaimer, audit Admin, dan komplain customer |
| Integrasi Midtrans masih sandbox | Pembayaran belum menggunakan uang asli | Midtrans sandbox untuk demo payment gateway cashless; jelaskan batasan MVP |
| Status pembayaran tidak sinkron | Order tidak berubah sesuai hasil pembayaran sandbox | Verifikasi webhook, cek payment log, dan sediakan fallback admin note |
| Data real terbatas | Dampak sulit dibuktikan | Gunakan dummy data realistis dan jelaskan sebagai validasi awal |
| Waktu lomba terbatas | Testing kurang mendalam | Fokus pada happy path, edge case utama, dan bug hunter readiness |

---

## 26. Success Metrics

| Metric | Definisi | Target MVP/Demo |
|---|---|---:|
| Listing Created | Jumlah listing rescue deal dibuat | 50+ data demo/pilot |
| Order Completed | Jumlah order selesai | 30+ data demo/pilot |
| No-show Rate | Order no-show dibanding total order | Ditampilkan sebagai metrik |
| Food Rescued Estimate | Estimasi makanan terselamatkan dari order completed | Ditampilkan di dashboard |
| Help Ticket Resolution *(Should Have)* | Tiket bantuan yang ditangani Admin | 100% untuk data demo, berlaku bila Help Center dikerjakan |
| UMKM Activation | UMKM verified yang membuat listing | Ditampilkan di dashboard |
| Usability Flow | Core flow dapat dijalankan juri | Berhasil tanpa crash |

---

## 27. Mapping ke Template Proposal CODE 6.0

| Bagian Proposal CODE 6.0 | Materi dari PRD Savora |
|---|---|
| Cover | Nama aplikasi, nama tim, anggota, universitas, program studi |
| Abstrak | Ringkasan masalah, solusi Savora, teknologi utama, dan dampak |
| Latar Belakang & Urgensi | Problem statement, data food waste, UMKM, dan kebutuhan customer |
| Tujuan, Manfaat, & Dampak | Tujuan produk, manfaat per user, metrik dampak MVP |
| Nilai Inovasi & Orisinalitas | Food Trust Index, Food Score Decay, Keyword Classification, Cashless via Midtrans sandbox, Service Fee 5%, Slot Iklan, Analitik UMKM, Mitra Donasi, Pickup code, Help Center, Waste Log |
| Analisis Kompetitor & Business Viability | Tabel kompetitor, SWOT, model bisnis realistis |
| Teknologi yang Digunakan | Next.js, Go, PostgreSQL, deployment, tools 📝 *[REVISI #26: sisa "Supabase" dihapus, konsisten dengan stack yang di-lock di Section 17]* |
| Batasan Perangkat Lunak | MVP, Should Have, Demo Only, dan fitur yang tidak dicakup |
| Metodologi Pengembangan | Agile/Scrum sederhana, tahapan, timeline, pembagian tugas |
| Arsitektur Sistem & Desain | Data model, API ringkas, user flow, diagram yang akan dibuat |
| Implementasi Teknis | Fitur yang diimplementasikan dan screenshot aplikasi |
| Analisis UI/UX & Accessibility | Design spec, wireframe, persona, accessibility checklist |
| Pengujian | Testing plan dan acceptance criteria |
| Dokumentasi Penggunaan | URL, akun demo, langkah penggunaan utama, troubleshooting |
| Daftar Pustaka & Referensi | Sumber data, framework, library, dan referensi pendukung |

---

## 28. Future Enhancement

Fitur berikut dapat dikembangkan setelah MVP tervalidasi:
- Mode production Midtrans dan perluasan channel pembayaran sesuai kebutuhan pengguna.
- Sistem voucher atau promo untuk customer loyal.
- Notifikasi WhatsApp/email untuk reminder pickup.
- Insight stok dan rekomendasi waktu publish listing.
- PWA offline shell dan push notification.
- Integrasi POS sederhana untuk UMKM yang sudah memiliki sistem kasir.
- Native mobile app jika kebutuhan pengguna sudah terbukti.

---

## 29. Kesimpulan PRD

Savora adalah ide produk yang realistis untuk lomba CODE 6.0 karena menyelesaikan masalah yang dekat dengan UMKM dan customer, memiliki scope MVP yang jelas, serta dapat didemonstrasikan dalam bentuk aplikasi web. Fokus utama Savora adalah food rescue marketplace dengan Food Trust Index, Food Score Decay, Keyword Classification, cashless payment via Midtrans sandbox, service fee 5%, slot iklan, analitik & insight UMKM, mitra donasi, pickup code, Help Center, dan Waste Log sederhana. Seluruh fitur dirancang agar tidak overclaim, tetap relevan dengan kebutuhan lomba, dan dapat dikembangkan oleh tim AmbaTeam dalam waktu terbatas.
