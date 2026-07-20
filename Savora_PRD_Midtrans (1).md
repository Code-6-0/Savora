# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Savora — Food Rescue Marketplace untuk UMKM

**Versi:** 3.0 — Cashless + Fitur Batch 2  
**Tanggal:** 19 Juli 2026  
**Tim:** AmbaTeam — 5 orang (Himatif S4)  
**Deadline:** 25 Juli 2026  
**Lomba:** CODE 6.0 — Software Development (AMCC, Universitas Amikom Yogyakarta)

---

## 1. Ringkasan Produk

### 1.1 Nama Produk
**Savora**

### 1.2 Tagline
"Selamatkan Makanan, Hemat Biaya, Kurangi Limbah."

### 1.3 Deskripsi Singkat
Savora adalah platform web responsive/mobile-first yang membantu UMKM kuliner menjual makanan surplus yang masih layak konsumsi dengan harga lebih terjangkau. Customer dapat melihat daftar rescue deal, mengecek informasi kelayakan makanan melalui Food Trust Index, melihat Food Score yang menurun seiring waktu mendekati expired, membaca badge keamanan restoran berbasis keyword ulasan, melakukan pembayaran cashless via Midtrans sandbox, lalu mengambil makanan langsung ke lokasi UMKM dalam batas waktu yang ditentukan. Platform menerapkan service fee 5% dari setiap transaksi sebagai model pendapatan.

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
- Service fee 5% otomatis dipotong per transaksi.
- Order memiliki batas waktu pembayaran untuk Midtrans, batas waktu pickup, dan pickup code agar stok UMKM tidak tertahan terlalu lama.
- Waste management dibatasi sebagai pencatatan internal/Waste Log.
- Data UMKM, customer, produk, dan transaksi dapat menggunakan dummy data realistis untuk kebutuhan demo.
- Role Mitra Donasi terbatas pada registrasi dan verifikasi oleh admin.

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
Masalah ini relevan karena food waste berdampak pada ekonomi UMKM dan lingkungan. Solusi digital yang sederhana, mudah digunakan, dan sesuai kebiasaan pengguna lokal dapat membantu UMKM mengurangi makanan terbuang tanpa menambah beban operasional yang kompleks.

---

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
| Impact Tracking | Menampilkan estimasi jumlah makanan yang berhasil diselamatkan dan estimasi dampak lingkungan berbasis data transaksi. Estimasi ini bukan klaim karbon resmi. |
| Reward & Badge | Memberikan badge sederhana seperti Food Hero, Green Supporter, dan Eco Saver sebagai gamifikasi. |
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
| Food Rescue Score | Menampilkan performa UMKM berdasarkan listing, order selesai, no-show, review, dan waste log. |

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
   Skor kelayakan makanan (0-100) yang **menurun secara otomatis seiring waktu** mendekati expired, memberikan visualisasi real-time kepada customer tentang urgensi pembelian. Mengacu pada jurnal freshness index (MDPI Foods, 2020).

4. **Keyword Classification dari Ulasan**  
   Sistem mengklasifikasikan keyword dari review customer (rule-based) ke level **Aman** (enak, segar), **Warning** (bau), dan **Gawat** (basi, berjamur). Skor kegawatan dihitung per restoran berdasarkan akumulasi keyword.

5. **Cashless payment via Midtrans dengan service fee 5%**  
   Semua transaksi bersifat cashless melalui Midtrans sandbox, dengan service fee 5% otomatis dipotong sebagai model pendapatan platform. Pengambilan makanan tetap dilakukan self-pickup ke lokasi UMKM dengan validasi pickup code.

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
| Aspek | Savora | Too Good To Go | Garda Pangan | Olio | Marketplace Umum |
|---|---|---|---|---|---|
| Fokus makanan surplus | Ya | Ya | Ya | Ya | Tidak spesifik |
| Fokus UMKM lokal | Ya | Terbatas | Ya | Terbatas | Tidak spesifik |
| Food Trust Index transparan | Ya | Tidak | Tidak | Tidak | Tidak |
| Food Score Decay real-time | Ya | Tidak | Tidak | Tidak | Tidak |
| Keyword Classification dari review | Ya | Tidak | Tidak | Tidak | Tidak |
| Cashless payment gateway + service fee + pickup code | Ya | Tidak spesifik | Tidak spesifik | Tidak spesifik | Tergantung merchant |
| Slot Iklan untuk UMKM & pihak ketiga | Ya | Tidak spesifik | Tidak | Tidak | Tidak |
| Analitik & Insight UMKM | Ya | Terbatas | Tidak | Tidak | Terbatas |
| Help Center khusus food rescue | Ya | Ada secara umum | Tidak spesifik | Tidak spesifik | Ada secara umum |
| Waste Log untuk UMKM | Ya | Tidak | Tidak | Tidak | Tidak |
| Dynamic discount berbasis kelayakan | Ya, rule-based | Terbatas | Tidak | Tidak | Tidak |

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
- **Service Fee 5%:** dipotong otomatis dari setiap transaksi produk saat pembayaran cashless via Midtrans.
- **Iklan UMKM:** UMKM membayar untuk mengiklankan produknya (premium listing / slot iklan di marketplace).
- **Iklan Pihak Ketiga:** Aplikasi/brand luar memasang iklan pada platform; dikenakan service fee juga.
- **Partnership lokal future:** kerja sama promosi dengan kampus, komunitas, atau pelaku UMKM.

### 8.5 Rencana Keberlanjutan
- **Tahap 1:** validasi MVP melalui demo lomba dengan data dummy realistis.
- **Tahap 2:** uji coba terbatas dengan beberapa UMKM lokal.
- **Tahap 3:** pengembangan fitur berdasarkan feedback customer dan UMKM.

---

## 9. Scope Produk

### 9.1 MVP — Wajib Berfungsi
1. Autentikasi dan role Customer, UMKM, Admin, Mitra Donasi.
2. Marketplace rescue deal dengan slot iklan.
3. Create/edit/delete listing oleh UMKM.
4. Food Trust Index berbasis input metadata.
5. Food Score Decay (skor menurun seiring waktu mendekati expired).
6. Dynamic discount rule-based.
7. Keyword Classification dari ulasan (Aman / Warning / Gawat).
8. Checkout cashless via Midtrans sandbox, dengan service fee 5%, pickup code, dan batas waktu pickup.
9. Order tracking.
10. Dashboard Customer.
11. Dashboard UMKM dengan analitik penjualan, insight, dan analitik pelacakan.
12. Dashboard Admin dengan keuangan platform, manajemen iklan, verifikasi mitra donasi, dan export laporan.
13. Rating dan review dengan input keyword.
14. Pengiklanan produk UMKM dan iklan pihak ketiga.
15. Help Center untuk laporan customer.
16. Waste Log untuk pencatatan makanan tidak layak jual.
17. Registrasi dan verifikasi Mitra Donasi.

### 9.2 Should Have
- Badge/gamifikasi sederhana.
- Notifikasi in-app.
- Filter dan sorting marketplace lebih lengkap.
- Export laporan sederhana untuk Admin.

### 9.3 Demo Only
- Grafik impact dengan data dummy.
- Dashboard analytics visual.
- Monthly impact story.

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
9. Customer datang ke lokasi UMKM.
10. UMKM memvalidasi pickup code.
11. Order menjadi completed.
12. Customer memberi rating/review dengan input keyword (enak, segar, basi, bau, dll).

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
| FR-01 | User dapat register dan login | P0 | Customer, UMKM, dan Mitra Donasi dapat membuat akun dan masuk aplikasi |
| FR-02 | Admin dapat memverifikasi UMKM | P0 | UMKM hanya dapat publish listing setelah diverifikasi |
| FR-03 | UMKM dapat membuat listing | P0 | Listing berisi nama, foto, kategori, harga, stok, berat, lokasi pickup, dan metadata kelayakan |
| FR-04 | Sistem menghitung Food Trust Index | P0 | Badge Fresh/Layak Dijual/Segera Dijual/Tidak Disarankan Dijual/Tidak Layak Konsumsi muncul berdasarkan input metadata |
| FR-05 | Customer dapat browse marketplace | P0 | Produk aktif, belum expired, dan stok tersedia tampil di marketplace dengan Food Score, Rescue Time, dan badge keyword |
| FR-06 | Customer dapat checkout cashless via Midtrans | P0 | Midtrans membuat pickup code setelah payment status Paid; service fee 5% otomatis ditambahkan |
| FR-07 | UMKM dapat validasi pickup code | P0 | Order berubah menjadi completed jika pickup code valid |
| FR-08 | UMKM dapat menandai no-show | P0 | Order menjadi expired/no-show jika customer tidak datang |
| FR-09 | Customer dapat memberi rating/review dengan keyword | P1 | Review hanya dapat diberikan setelah order completed; keyword terdeteksi dan diklasifikasikan |
| FR-10 | Customer dapat membuat help ticket | P0 | Tiket masuk ke dashboard Admin |
| FR-11 | UMKM dapat membuat Waste Log | P1 | Catatan makanan tidak layak tersimpan dan tampil di dashboard |
| FR-12 | Admin dapat moderasi listing/user | P0 | Admin dapat approve, reject, suspend, atau memberi warning |
| FR-13 | Dashboard menampilkan impact sederhana | P1 | Customer, UMKM, dan Admin dapat melihat ringkasan aktivitas |
| FR-14 | Sistem menerima webhook Midtrans sandbox | P0 | Status pembayaran hanya diperbarui setelah signature/status valid |
| FR-15 | Food Score menurun seiring waktu (decay) | P0 | Skor 0-100 berkurang berdasarkan sisa waktu menuju expired |
| FR-16 | Sistem mengklasifikasikan keyword ulasan | P0 | Keyword dari review dipetakan ke level Aman/Warning/Gawat per restoran |
| FR-17 | UMKM dapat memasang iklan produk | P1 | Iklan di-submit dan menunggu approval admin sebelum tayang |
| FR-18 | Admin dapat mengelola iklan | P1 | Admin approve/reject iklan UMKM dan pihak ketiga |
| FR-19 | Admin dapat memverifikasi mitra donasi | P0 | Pendaftaran mitra donasi di-review dan di-approve/reject oleh admin |
| FR-20 | Admin dapat melihat keuangan platform | P1 | Dashboard menampilkan total service fee + pendapatan iklan |
| FR-21 | Admin dapat export laporan | P1 | Export CSV/Excel/PDF dengan date range picker |
| FR-22 | UMKM dapat melihat analitik & insight | P1 | Grafik penjualan, produk terlaris, rating summary, keyword safety, tracking metrics |

---

## 12. Food Trust Index Specification

### 12.1 Tujuan Food Trust Index
Food Trust Index membantu customer memahami tingkat kelayakan makanan berdasarkan informasi yang diberikan UMKM. Food Trust Index bukan sertifikasi laboratorium dan tidak menggantikan pemeriksaan langsung oleh customer saat pickup.

### 12.2 Input Food Trust Index
- Kategori makanan.
- Waktu masak/produksi.
- Metode penyimpanan.
- Kondisi kemasan.
- Ada/tidaknya kuah atau saus.
- Foto makanan.

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

| Kondisi Input | Output Sistem |
|---|---|
| Makanan baru diproduksi, kemasan baik, dan metode penyimpanan sesuai | Fresh |
| Makanan masih dalam estimasi masa simpan dan tidak ada indikasi risiko dari input UMKM | Layak Dijual |
| Makanan mendekati batas waktu konsumsi, tetapi input kemasan dan penyimpanan masih memadai | Segera Dijual |
| Input menunjukkan risiko sedang, misalnya penyimpanan kurang ideal atau waktu konsumsi terlalu dekat | Tidak Disarankan Dijual |
| Input menunjukkan risiko tinggi, misalnya melewati estimasi masa konsumsi atau kondisi kemasan buruk | Tidak Layak Konsumsi |

### 12.5 Disclaimer Wajib
Setiap detail produk wajib menampilkan disclaimer:

> Food Trust Index dihitung berdasarkan informasi yang diberikan UMKM dan aturan platform. Customer tetap disarankan memeriksa kondisi makanan saat pickup dan mengonsumsi sesuai batas waktu yang ditampilkan.

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
| Created | Order dibuat oleh customer |
| Payment Pending | Customer belum menyelesaikan pembayaran online |
| Paid | Pembayaran berhasil berdasarkan status Midtrans sandbox |
| Payment Failed | Pembayaran gagal atau melewati batas waktu |
| Ready for Pickup | UMKM menyiapkan pesanan |
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
- Service fee 5% otomatis dipotong dari setiap transaksi produk.
- Service fee juga berlaku untuk transaksi iklan UMKM dan iklan pihak ketiga.
- Breakdown service fee ditampilkan secara transparan di halaman checkout.
- Total pendapatan service fee tercatat di dashboard keuangan admin.

### 14.5 Aturan Reservasi Stok
- Stok di-reserve sementara saat Payment Pending dengan batas waktu pembayaran 10-15 menit.
- Jika pembayaran Midtrans berhasil, stok tetap dikunci sampai batas waktu pickup.
- Jika pembayaran Midtrans gagal atau expired, stok dikembalikan agar dapat dipesan customer lain.

### 14.6 Aturan Pembayaran Midtrans (Cashless)
- Customer memilih Midtrans saat checkout dan sistem membuat transaksi pembayaran melalui Midtrans sandbox.
- Status awal order adalah Payment Pending sampai Midtrans mengirim status pembayaran berhasil atau gagal.
- Jika pembayaran berhasil, sistem membuat pickup code dan mengunci stok sampai batas waktu pickup.
- Jika pembayaran tidak selesai sampai batas waktu pembayaran, order otomatis expired dan stok dikembalikan.
- Pickup code divalidasi oleh UMKM saat customer datang mengambil pesanan.
- Sistem memverifikasi notifikasi/webhook Midtrans sandbox sebelum memperbarui status pembayaran.
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
| Frontend | Next.js atau React-based framework | Cocok untuk web responsive, routing cepat, dan mudah dibuat sebagai demo lomba |
| Backend | Go atau Node.js/Express | Mendukung API REST, autentikasi, order flow, dan integrasi Midtrans sandbox |
| Database | PostgreSQL atau Supabase | Relasional, cocok untuk user, produk, order, payment, review, dan waste log |
| Payment Gateway | Midtrans Sandbox | Mendemonstrasikan alur payment gateway tanpa transaksi uang asli |
| Deployment | Vercel, Railway, Render, atau Supabase | Mudah dipakai untuk MVP dan demo juri |
| Design & Documentation | Figma, GitHub, README | Mendukung desain UI, dokumentasi teknis, dan kolaborasi tim |

Catatan: pilihan teknologi final mengikuti kemampuan tim dan kebutuhan implementasi. Midtrans digunakan dalam mode sandbox untuk demo dan pengujian, bukan sebagai klaim sistem pembayaran production-ready.

---

## 18. Data Model Ringkas

| Entity | Field Minimum |
|---|---|
| users | id, name, email, password_hash, role, status, created_at |
| customer_profiles | id, user_id, phone, address, avatar |
| umkm_profiles | id, umkm_id, business_name, address, geo_location, verification_status, rating, keyword_safety_level |
| mitra_donasi_profiles | id, user_id, org_name, phone, address, description, document_url, verification_status, verified_at, created_at |
| products | id, umkm_id, name, category, description, photo_url, original_price, rescue_price, stock, weight_per_portion, pickup_address, food_trust_status, food_score, expires_at, status |
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

### 18.1 Enum Penting
| Field | Nilai MVP |
|---|---|
| user_role | CUSTOMER, UMKM, ADMIN, MITRA_DONASI |
| payment_method | MIDTRANS_SANDBOX |
| payment_status | UNPAID, PENDING, PAID, FAILED, EXPIRED |
| order_status | CREATED, PAYMENT_PENDING, PAID, READY_FOR_PICKUP, COMPLETED, NO_SHOW, CANCELLED, EXPIRED, HELP_REQUESTED |
| keyword_level | AMAN, WARNING, GAWAT |
| ad_status | PENDING, APPROVED, REJECTED, ACTIVE, EXPIRED |
| verification_status | PENDING, APPROVED, REJECTED |

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

---

## 20. Non-Functional Requirements

### 20.1 Performance
- Halaman utama dapat dimuat kurang dari 3 detik pada koneksi normal.
- API utama merespons dalam waktu wajar untuk skala demo/pilot.
- Marketplace mendukung pagination atau lazy loading.

### 20.2 Security
- Password disimpan menggunakan hashing.
- Autentikasi menggunakan JWT/session token.
- Role-based access control diterapkan untuk Customer, UMKM, dan Admin.
- Input form divalidasi di client dan server.
- Admin action dicatat pada audit log.

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
| W2 | 11-17 Jul | Core features | Marketplace, Food Trust Index, COD/Midtrans payment, Help Center, Waste Log |
| W3 | 18-22 Jul | Polish dan deployment | Dashboard, rating, testing, deploy, video demo |
| Deadline | 25 Jul | Submission | Proposal PDF, video, GitHub, deployed app |

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
| Auth | User register sebagai Mitra Donasi | Akun dibuat, status pending verifikasi | Must |
| Auth | Login dengan password salah | Error tampil dan session tidak dibuat | Must |
| UMKM | UMKM membuat listing lengkap | Listing tersimpan dan Food Trust Index tampil | Must |
| Food Trust Index | Produk Tidak Layak Konsumsi | Produk tidak tampil di marketplace | Must |
| Food Score Decay | Skor menurun seiring waktu mendekati expired | Food Score berkurang otomatis | Must |
| Keyword | Review dengan keyword "basi" | Keyword diklasifikasikan sebagai Gawat | Must |
| Keyword | Akumulasi keyword per restoran | Badge safety restoran berubah sesuai akumulasi | Must |
| Marketplace | Customer filter produk | Produk sesuai filter tampil dengan Food Score dan badge keyword | Must |
| Checkout Cashless | Customer membuat order via Midtrans sandbox | Service fee 5% ditambahkan, payment pending | Must |
| Checkout Midtrans Paid | Customer menyelesaikan pembayaran Midtrans sandbox | Payment status menjadi Paid dan pickup code dibuat | Must |
| Checkout Midtrans Expired | Customer tidak menyelesaikan pembayaran Midtrans sandbox | Order menjadi expired dan stok dikembalikan | Must |
| Midtrans Webhook | Sistem menerima notifikasi pembayaran sandbox | Signature/status diverifikasi sebelum order diperbarui | Should |
| Pickup | UMKM input pickup code valid | Order menjadi completed | Must |
| No Show | Customer tidak datang | Order menjadi no-show/expired | Must |
| Review Keyword | Customer submit review dengan keyword | Keyword terdeteksi dan diklasifikasikan | Must |
| Iklan UMKM | UMKM submit iklan produk | Iklan pending approval admin | Should |
| Iklan Admin | Admin approve iklan | Iklan tayang di marketplace | Should |
| Mitra Donasi | Admin verifikasi mitra donasi | Status berubah menjadi approved/rejected | Must |
| Keuangan | Admin lihat dashboard keuangan | Total service fee + iklan tampil | Should |
| Export | Admin export laporan CSV/PDF | File terdownload dengan data yang benar | Should |
| Analitik | UMKM lihat analitik penjualan | Grafik dan insight tampil | Should |
| Help Center | Customer membuat laporan | Tiket tampil di Admin dashboard | Must |
| Waste Log | UMKM mencatat makanan tidak layak | Data tersimpan di dashboard | Should |
| Review | Customer review sebelum completed | Sistem menolak review | Must |
| Admin | Admin verifikasi UMKM | UMKM dapat publish listing | Must |
| Accessibility | Navigasi keyboard | Aksi utama dapat dijangkau | Should |
| Error State | API marketplace gagal | UI menampilkan retry state | Must |

---

## 24. Acceptance Criteria MVP

### 24.1 Customer
- Customer dapat register, login, browse produk dengan Food Score dan badge keyword, melihat detail produk, checkout cashless via Midtrans sandbox (dengan service fee 5%), melihat order tracking, dan memberi review dengan keyword setelah order selesai.
- Customer dapat melihat Food Trust Index, Food Score yang menurun seiring waktu, badge keyword safety, batas waktu pickup, pickup code, dan status order.
- Customer dapat membuat Help Ticket jika terjadi masalah.

### 24.2 UMKM
- UMKM dapat register, login, melengkapi profil, dan menunggu verifikasi Admin.
- UMKM terverifikasi dapat membuat listing makanan surplus.
- UMKM dapat mengelola order, memvalidasi pickup code, menandai no-show, dan membuat Waste Log.
- UMKM dapat melihat analitik penjualan, insight rating & keyword, analitik pelacakan, dan produk terlaris.
- UMKM dapat memasang iklan produk dan melihat performa iklan.

### 24.3 Admin
- Admin dapat memverifikasi UMKM dan mitra donasi.
- Admin dapat melihat user, customer, listing, order, Help Ticket, dan ringkasan platform.
- Admin dapat mengelola keuangan platform (service fee + iklan) dan export laporan.
- Admin dapat approve/reject iklan UMKM dan pihak ketiga.
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
| Help Ticket Resolution | Tiket bantuan yang ditangani Admin | 100% untuk data demo |
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
| Teknologi yang Digunakan | Next.js, Go, PostgreSQL/Supabase, deployment, tools |
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
