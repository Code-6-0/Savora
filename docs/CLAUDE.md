CLAUDE.md — Savora
> **Versi: sinkron dengan PRD v3.7 + disesuaikan kondisi repo nyata** (update 21 Jul 2026 malam — struktur backend flat, prefix `/api`, tema `globals.css`, Next.js 16; **keputusan tim: skema data mengikuti PRD**, lihat Section 13).
Panduan wajib bagi siapa pun/apa pun (termasuk Claude) yang mengerjakan kode di repo ini. Acuan tunggal adalah `docs/SAVORA_PRD.md`. Semua keputusan stack, business rules, dan scope di bawah ini diambil langsung dari PRD — tidak ada penyimpangan. Jika ada bagian PRD yang direvisi di masa depan, dokumen ini harus di-update mengikuti nomor revisi terbaru.
---
1. Project Overview
Savora — food rescue marketplace yang menghubungkan UMKM kuliner (penjual makanan surplus masih layak konsumsi) dengan customer (pencari makanan terjangkau). Dibangun untuk lomba CODE 6.0 — Software Development (AMCC, Universitas Amikom Yogyakarta) oleh AmbaTeam (5 orang), deadline 25 Juli 2026.
Fitur inti: Food Trust Index, Food Score Decay (urgensi real-time), Keyword Classification (badge keamanan dari review), checkout cashless via Midtrans sandbox, service fee 5%, pickup code + self-pickup.
Batasan mendasar: self-pickup only (bukan delivery), cashless only via Midtrans sandbox (bukan uang asli, bukan COD), web responsive/PWA-ready (bukan native mobile app pada MVP).
---
2. Tech Stack (sesuai PRD Section 17 — dikunci, bukan opsi)
Komponen	Teknologi
Frontend	Next.js (React)
Backend	Go + Fiber v2
ORM	GORM
Database	PostgreSQL — saat ini di-host di Supabase sebagai managed Postgres, diakses HANYA via GORM + `DATABASE_URL`. Jangan pakai Supabase client SDK/fitur BaaS
Payment Gateway	Midtrans Snap (Sandbox) — bukan production
Deployment	Vercel (frontend, sudah ada vercel.json) + Railway/Render (backend); database: Supabase managed Postgres
Tools	Figma, GitHub, README
Versi persis tiap framework/library ikuti `go.mod` / `package.json` yang nyata di repo — jangan hardcode nomor versi dari dokumen ini.
Jangan mengganti komponen manapun di tabel ini (mis. ke Vite, Supabase, Node.js/Express) kecuali ada keputusan tim baru yang sekaligus mengupdate PRD Section 17 — supaya tidak terjadi lagi ketidaksesuaian PRD vs implementasi.
---
3. Arsitektur & Struktur Kode
Frontend — Atomic Design (di atas Next.js App Router)
```
src/
  app/            # Next.js App Router — routing & page composition
  components/
    atoms/        # Button, Input, Badge, Icon, Label — tanpa logic bisnis
    molecules/    # SearchBar, PriceTag, FoodScoreIndicator — kombinasi atoms
    organisms/     # ProductCard, Navbar, CheckoutForm — unit UI mandiri
    templates/    # Layout halaman (skeleton tanpa data nyata)
  lib/            # Utilitas murni & API client (fetch ke NEXT_PUBLIC_API_BASE_URL)
```
Aturan komponen:
Setiap komponen reusable — jangan hardcode data spesifik satu halaman di dalam atom/molecule/organism.
Kode frontend existing memakai JavaScript (.js) — ikuti; jangan mengkonversi file lama ke TypeScript.
WAJIB pakai komponen existing sebelum membuat baru: atoms (Badge, Button, Input, Select, Typography), molecules (FormGroup, SearchBar, SummaryCard, ProgressTargetBar), organisms (DataTable, Sidebar, TopHeader), templates (DashboardLayout).
Halaman existing di route root (`/`, `/dashboard`, `/analitik`, `/insight`, `/pesanan`, `/produk`, `/profil`, `/marketplace`) milik anggota lain — jangan diubah. Halaman baru modul Admin WAJIB di bawah `/admin/*`; auth di `/login` & `/register`; pendaftaran mitra di `/mitra-donasi/register`.
Next.js 16 + React 19: konvensinya bisa berbeda dari pengetahuanmu — baca panduan di `node_modules/next/dist/docs/` sebelum menulis kode Next yang tidak kamu yakini (lihat frontend/AGENTS.md).
Atom/molecule tidak boleh memanggil API langsung — data masuk lewat props; pemanggilan API terjadi di level page/feature.
Styling: pakai CSS variables & class yang sudah ada di `globals.css`; Tailwind v4 tersedia via PostCSS — ikuti pola file yang sedang diedit. Hindari inline style kecuali nilai dinamis (mis. warna berdasarkan Food Score).
Backend — struktur flat yang sudah berjalan (Go + Fiber v2 + GORM)
```
backend/
  main.go         # Entry point: Fiber + CORS + routes.SetupRoutes
  database/       # database.go — koneksi GORM Postgres (DATABASE_URL / DB_HOST)
  models/         # Struct GORM per domain (product.go, order.go, umkm.go, ...)
  handlers/       # HTTP handler Fiber per domain (product.go, order.go, analytics.go, ...)
  routes/         # routes.go — semua route didaftarkan di app.Group("/api")
  middleware/     # (BARU — dibuat di task Auth) JWT, RBAC, audit log
```
Aturan: IKUTI struktur flat di atas — JANGAN merestrukturisasi ke clean architecture (`internal/`, `pkg/`) atau memindahkan file milik anggota lain. File baru mengikuti pola satu file per domain. Business logic yang butuh unit test dipisahkan sebagai fungsi murni di package terkait.
---
4. Design System
Sumber tema NYATA dan satu-satunya: CSS custom properties di `frontend/src/app/globals.css`. Nilai terkini (update 22 Jul 2026): `--primary-color: #16A34A`, `--primary-dark: #0B7A3B`, `--secondary-color: #e5f5eb`, `--text-main: #111827`, `--text-muted: #6b7280`, `--bg-color: #ffffff`, `--card-bg: #ffffff`, `--border-color: #e5e7eb`, `--warning-color: #f59e0b`, `--danger-color: #ef4444`, `--success-color: #2eb228`; font Inter. Jika globals.css berubah lagi, globals.css yang menang — jangan "mengoreksi" warna kembali ke nilai lama dari dokumen mana pun.
WAJIB pakai token ini (`var(--...)`) — jangan hardcode hex baru, jangan membuat palet/tema baru, jangan memasang UI library baru.
Referensi visual: `docs/design/01-Beranda.png` s.d. `08-Pick-up.png` (semua layar customer). Halaman tanpa file design (admin & mitra donasi): tiru tema + pola layout dari referensi dan komponen existing (Sidebar, TopHeader, DataTable, SummaryCard, DashboardLayout) — sederhana, konsisten, user-friendly.
Konsistensi dengan kode yang ada > preferensi pribadi.

Untuk dashboard admin, ikuti docs/design/admin-dashboard-spec.md (turunan PRD 5.3/FR-12/FR-13/16/19). Update docs/design/PROGRESS.md di akhir setiap sesi.
---
5. Business Rules — Sumber Kebenaran Tunggal (PRD)
Detail lengkap ada di `docs/SAVORA_PRD.md`. Aturan kritis berikut wajib diimplementasikan persis — jangan diubah:
5.1 Food Score Decay (power decay, γ = 0,65)
```ts
function hitungFoodScore(skorAwal: number, publishAt: Date, expiresAt: Date, now: Date): number {
  const total = expiresAt.getTime() - publishAt.getTime();
  if (total <= 0) return 0;
  let f = (expiresAt.getTime() - now.getTime()) / total;
  f = Math.min(1, Math.max(0, f));
  return Math.round(skorAwal * Math.pow(f, 0.65));
}
```
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
`skor_awal` dikunci saat publish (mengikuti status Food Trust Index saat itu), tidak berubah setelahnya walau status FTI berubah.
`f` selalu di-clamp ke [0, 1].
Jika `total_masa_layak <= 0`, listing ditolak / skor 0.
Color indicator (jam absolut: merah <1 jam, kuning 1-3 jam, hijau >3 jam) dan band skor (fraksi `f`: Sangat Layak/Layak/Segera Ambil/Kritis/Kedaluwarsa) adalah dua indikator paralel berbeda yang bisa tidak sinkron — ini by design, bukan bug.
Test case wajib (skor_awal=100, masa layak 8 jam): 8 jam→100, 6 jam→83, 4 jam→64, 2 jam→41, 1 jam→26, 0 jam→0.
5.2 Service Fee 5%
Ditambahkan ke pembayaran customer, bukan dipotong dari UMKM.
`subtotal = rescue_price × quantity`; `service_fee = 5%    subtotal`; `total_price = subtotal + service_fee`.
UMKM menerima `subtotal` penuh; `service_fee` masuk ke `platform_revenue`. Berlaku juga untuk transaksi iklan.
5.3 Order Status & Transisi
Enum: `CREATED, PAYMENT_PENDING, PAID, PAYMENT_FAILED, READY_FOR_PICKUP, COMPLETED, NO_SHOW, CANCELLED, EXPIRED, HELP_REQUESTED`.
Sukses: `Created (transien) → Payment Pending → Paid → Ready for Pickup → Completed` atau `No Show`.
Gagal/expired: `Created → Payment Pending → Payment Failed` atau `Expired`.
`Created` adalah status transien — langsung berpindah ke `Payment Pending` begitu transaksi Midtrans dibuat.
5.4 Reservasi Stok
Batas waktu pembayaran 15 menit (angka pasti). Stok dirilis otomatis jika gagal/expired; tetap terkunci sampai batas waktu pickup jika sukses.
5.5 Verifikasi Webhook Midtrans
```
signature = SHA512(order_id + status_code + gross_amount + server_key)
```
Notifikasi dengan signature tidak cocok diabaikan dan dicatat di payment log — jangan update status order dari webhook tanpa verifikasi ini.
5.6 Keyword Classification & Badge
Kamus keyword: Aman (enak, segar, fresh, hangat, bersih, layak, sesuai deskripsi), Warning (kurang segar, dingin, keras, agak asam, bau kurang sedap, kemasan rusak, porsi kurang), Gawat (basi, bau busuk, berjamur, berlendir, sakit perut, keracunan).
Threshold badge per UMKM (rolling 30 hari, minimal 3 review):
Gawat: ≥3 keyword Gawat dari ≥2 customer berbeda.
Warning: ≥3 keyword Warning, atau 1-2 keyword Gawat.
Aman: selain kondisi di atas.
Ini acuan tunggal (threshold-based) — bukan worst-case (1 keyword Gawat langsung menjatuhkan badge). Mitigasi review bombing: review hanya dari order `Completed` (1 review/order); keyword Gawat memicu flag ke Admin sebelum badge diturunkan; Admin bisa menganulir keyword tidak valid (tercatat di audit log).
5.7 Dynamic Discount
Rule-based berdasarkan status Food Trust Index: Fresh 10-20%, Layak Dijual 20-35%, Segera Dijual 35-50%, Tidak Disarankan Dijual/Tidak Layak Konsumsi = tidak dijual. Keputusan harga final tetap di UMKM; sistem tidak boleh menjual produk berstatus dua kategori terakhir.
---
6. Scope Boundaries
MVP — wajib jalan (happy path inti, PRD 9.1)
Autentikasi + role Customer, UMKM, Admin (role Mitra Donasi tersedia di sistem auth).
Marketplace rescue deal.
Create/edit/delete listing oleh UMKM.
Food Trust Index berbasis input metadata.
Food Score Decay.
Dynamic discount rule-based.
Keyword Classification dari ulasan.
Checkout cashless via Midtrans sandbox + service fee 5% + pickup code + batas waktu pickup.
Order tracking.
Dashboard Customer.
Dashboard UMKM dasar (kelola listing, kelola pesanan, ringkasan penjualan sederhana).
Dashboard Admin dasar (verifikasi UMKM, moderasi listing/user, monitoring transaksi).
Rating & review dengan input keyword.
Should Have (PRD 9.2 — setelah happy path inti stabil)
Iklan UMKM & pihak ketiga, registrasi & verifikasi Mitra Donasi, Help Center, Waste Log, keuangan platform + export laporan, analitik & insight UMKM lanjutan, notifikasi in-app, filter/sorting marketplace lebih lengkap. Kegagalannya tidak boleh mengganggu happy path inti.
Demo Only (PRD 9.3 — data dummy, bukan requirement nyata)
Grafik impact agregat, monthly impact story, Reward & Badge gamifikasi (Food Hero, Green Supporter, Eco Saver).
Catatan Impact Tracking: ringkasan sederhana berbasis data riil = FR-13 (P1, nyata); grafik agregat & monthly story = Demo Only (dummy) — dua level tampilan dari modul yang sama, jangan dicampur.
Di luar scope MVP (PRD 9.4)
Delivery/logistik, live tracking kurir, native Android/iOS, AI/ML forecasting sungguhan, pengelolaan limbah eksternal, sertifikasi keamanan pangan otomatis, pembayaran cash/COD.
---
7. Data Model Ringkas (PRD Section 18)
Inti MVP: `users, customer_profiles, umkm_profiles, products, food_trust_logs, orders, payments, reviews, review_keywords, keyword_scores`
Perluasan (Should Have): `mitra_donasi_profiles, advertisements, ad_metrics, umkm_analytics, platform_revenue, help_tickets, waste_logs, notifications, audit_logs`
Entity	Field Minimum
users	id, name, email, password_hash, role, status, created_at
customer_profiles	id, user_id, phone, address, avatar
umkm_profiles	id, user_id, business_name, address, geo_location, verification_status, rating, keyword_safety_level
mitra_donasi_profiles	id, user_id, org_name, phone, address, description, document_url, verification_status, verified_at, created_at
products	id, umkm_id, name, category, description, photo_url, original_price, rescue_price, min_price, stock, weight_per_portion, pickup_address, food_trust_status, food_score, expires_at, status
food_trust_logs	id, product_id, input_payload, food_trust_status, food_score, reason, created_at
orders	id, product_id, customer_id, quantity, subtotal, service_fee, total_price, payment_method, payment_status, pickup_code, reserved_until, pickup_deadline, status, cancel_reason, created_at, paid_at, completed_at
payments	id, order_id, provider, provider_order_id, amount, service_fee_amount, payment_status, payment_url, signature_verified, paid_at, expired_at, created_at
reviews	id, order_id, reviewer_id, target_id, rating, comment, keywords, created_at
review_keywords	id, review_id, keyword, level, created_at
keyword_scores	id, umkm_id, total_aman, total_warning, total_gawat, safety_level, updated_at
advertisements	id, advertiser_id, advertiser_type, title, image_url, target_url, duration_days, price, service_fee, status, approved_by, approved_at, starts_at, expires_at, created_at
ad_metrics	id, ad_id, impressions, clicks, ctr, date
umkm_analytics	id, umkm_id, total_views, total_clicks, ctr, conversion_rate, avg_order_value, period_start, period_end
platform_revenue	id, source_type, source_id, amount, service_fee_amount, description, created_at
help_tickets	id, order_id, reporter_id, category, description, proof_url, status, admin_note, created_at
waste_logs	id, umkm_id, food_name, category, estimated_weight, reason, photo_url, created_at
notifications	id, user_id, title, message, is_read, created_at
audit_logs	id, actor_id, action, target_type, target_id, note, created_at
Catatan: `reviews.keywords` = denormalisasi tampilan; source of truth klasifikasi/badge = `review_keywords` + `keyword_scores`. `umkm_profiles` pakai `user_id` (FK ke `users`), bukan `umkm_id`.
Enum penting:
Field	Nilai MVP
user_role	CUSTOMER, UMKM, ADMIN, MITRA_DONASI
payment_method	MIDTRANS_SANDBOX
payment_status	UNPAID, PENDING, PAID, FAILED, EXPIRED
order_status	CREATED, PAYMENT_PENDING, PAID, PAYMENT_FAILED, READY_FOR_PICKUP, COMPLETED, NO_SHOW, CANCELLED, EXPIRED, HELP_REQUESTED
keyword_level	AMAN, WARNING, GAWAT
ad_status	PENDING, APPROVED, REJECTED, ACTIVE, EXPIRED
verification_status	PENDING, APPROVED, REJECTED
---
8. API Endpoints Ringkas (PRD Section 19)
> **Prefix nyata:** semua route di-mount di `app.Group("/api")` — baca setiap path di tabel ini sebagai `/api/<path>` saat implementasi dan saat dipanggil frontend. Endpoint lama milik anggota lain memakai `PUT` dan pola path sendiri (mis. `/api/products/marketplace`, `PUT /api/orders/:id/status`) — biarkan apa adanya; endpoint BARU wajib mengikuti tabel ini (method PATCH dsb.) dengan prefix `/api`.
Method	Endpoint	Deskripsi	Role
POST	/auth/register	Registrasi user	Public
POST	/auth/login	Login user	Public
GET	/me	Ambil profil aktif	All
PATCH	/me	Update profil	All
GET	/products	Browse marketplace	Public/Customer
POST	/products	Buat listing	UMKM
GET	/products/{id}	Detail produk	Public/Customer
PATCH	/products/{id}	Edit listing	UMKM/Admin
DELETE	/products/{id}	Hapus listing	UMKM/Admin
POST	/food-trust/calculate	Hitung Food Trust Index	UMKM
POST	/orders	Buat order cashless via Midtrans	Customer
POST	/payments/midtrans-token	Token pembayaran Midtrans sandbox	Customer
POST	/payments/midtrans-webhook	Notifikasi status pembayaran	System
GET	/orders	List order user	Customer/UMKM/Admin
GET	/orders/{id}	Detail order	Related user/Admin
PATCH	/orders/{id}/status	Update status order	UMKM/Admin
POST	/orders/{id}/validate-pickup	Validasi pickup code	UMKM
POST	/reviews	Buat review dengan keyword	Customer
GET	/reviews/keywords/{umkm_id}	Get keyword safety score	Public
POST	/help-tickets	Buat laporan bantuan	Customer
GET	/help-tickets	List laporan bantuan	Admin
PATCH	/help-tickets/{id}/status	Update status bantuan	Admin
POST	/waste-logs	Buat Waste Log	UMKM
GET	/waste-logs	List Waste Log	UMKM/Admin
POST	/advertisements	Submit iklan baru	UMKM/External
GET	/advertisements	List iklan	UMKM/Admin
PATCH	/advertisements/{id}/status	Approve/reject iklan	Admin
GET	/advertisements/active	Get iklan aktif marketplace	Public
POST	/advertisements/{id}/impression	Catat impression iklan (ad_metrics)	System
POST	/advertisements/{id}/click	Catat klik iklan (ad_metrics)	System
GET	/analytics/umkm/ads	Performa iklan UMKM (impressions, clicks, CTR)	UMKM
GET	/analytics/umkm	Analitik penjualan UMKM	UMKM
GET	/analytics/umkm/tracking	Analitik pelacakan UMKM	UMKM
GET	/analytics/umkm/insight	Insight rating & keyword	UMKM
POST	/mitra-donasi/register	Register sebagai mitra donasi	Public
GET	/admin/mitra-donasi	List pendaftaran mitra donasi	Admin
PATCH	/admin/mitra-donasi/{id}/verify	Verifikasi mitra donasi (approve/reject)	Admin
GET	/admin/users	Manajemen user (moderasi)	Admin
GET	/admin/customers	List semua customer	Admin
PATCH	/admin/umkm/{id}/verification	Verifikasi UMKM	Admin
GET	/admin/revenue	Dashboard keuangan platform	Admin
GET	/admin/revenue/export	Export laporan keuangan (CSV/Excel/PDF)	Admin
GET	/admin/reports/summary	Ringkasan platform	Admin
Endpoint baru di luar daftar ini harus ditambahkan ke PRD dulu sebelum implementasi.
---
9. Coding Standards
Bahasa: semua variable, function, class, file name pakai English — komentar boleh Bahasa Indonesia untuk konteks domain (istilah "Food Trust Index" tetap dipakai apa adanya).
Readability: nama deskriptif, hindari singkatan ambigu, fungsi pendek dan fokus satu tanggung jawab.
Production-ready: setiap endpoint/komponen wajib punya error handling eksplisit, validasi input di boundary (FE form validation + BE request validation), loading & empty state di UI.
Testing: business logic kritis (Food Score, service fee, dynamic discount, signature verification) wajib punya unit test dengan test case dari Section 5. Konvensi test: FE pakai `node --test` (`frontend/tests/*.test.js`, jalankan `npm test`); BE pakai `go test` standar per package.
Type safety: frontend existing memakai JavaScript (.js) — ikuti pola ini. Go: struct bertipe eksplisit untuk request/response, jangan `map[string]interface{}` di boundary API.
---
10. Larangan Eksplisit untuk AI
Jangan mengganti stack apa pun di Section 2 (mis. ke Vite, Node.js/Express) dan jangan memakai Supabase client SDK/fitur BaaS — akses database hanya via GORM. Perubahan stack harus update PRD Section 17 dulu.
Jangan mengganti model Food Score Decay dengan model lain (linear, step-based, dst.).
Jangan mengubah threshold badge keyword ke worst-case.
Jangan menambah status order di luar enum yang sudah ditetapkan.
Jangan menambah metode pembayaran cash/COD atau payment gateway lain di luar Midtrans sandbox.
Jangan update status order dari webhook tanpa verifikasi signature.
Jangan menaikkan status fitur Demo Only jadi requirement resmi tanpa keputusan tim.
Jangan menambah fitur di luar scope (Section 6) tanpa update PRD terlebih dahulu.
Jika ada konflik antara PRD dan kode yang sudah ada di repo, tandai sebagai pertanyaan ke tim — jangan berasumsi salah satu otomatis benar.
---
11. Referensi
Requirement lengkap: `docs/SAVORA_PRD.md`. Setiap perubahan business rule atau stack harus disertai update PRD (nomor revisi baru) agar dokumen tetap sinkron dengan sumber kebenaran.
---
12. Struktur Repo & Konvensi Sesi
Struktur folder (tetap — jangan buat folder root baru)
```
savora/
├── docs/
│   ├── SAVORA_PRD.md      # sumber kebenaran requirement
│   └── design/            # referensi tampilan per modul (01-login-register.png, dst.)
├── frontend/              # Next.js
├── backend/               # Go + Fiber v2 + GORM
└── CLAUDE.md
```
Referensi tampilan di `docs/design/` diikuti bersama token warna `globals.css` (Section 4) — jangan membuat style baru yang menyimpang atau memasang UI library baru.
Konvensi API & keamanan
Format response seragam: `{ "success": bool, "data": ..., "error": { "code", "message" } | null }`.
Pesan error untuk user dalam Bahasa Indonesia; `error.code` dalam English (mis. `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`).
Proteksi endpoint: 401 jika tanpa login, 403 jika login tapi lintas role.
Semua aksi admin yang mengubah data (verify, approve, reject, warning, suspend, export) WAJIB dicatat ke `audit_logs` (actor_id, action, target_type, target_id, note).
Kolaborasi tabel antar anggota
Tabel milik modul anggota lain (`products`, `orders`, `payments`, `reviews`, dst.): boleh dibaca (SELECT/JOIN), jangan ubah skemanya.
Jika tabel yang dibutuhkan belum ada di kode, buat migration minimal persis sesuai Section 7 / PRD Section 18, lalu laporkan di ringkasan akhir agar pemilik modul tahu.
Cara kerja per sesi (untuk Claude Code)
Kerjakan hanya scope prompt yang sedang dikirim — jangan menyicil task berikutnya.
Selesai satu task: pastikan build lolos + test hijau, tampilkan ringkasan perubahan + saran pesan commit, lalu BERHENTI dan tunggu prompt berikutnya.
Konflik antara prompt dan PRD/kode yang sudah ada: berhenti dan tanya, jangan berasumsi.
---
13. Kondisi Kode Saat Ini & Penyimpangan yang Diketahui (snapshot 21 Jul 2026)
Yang sudah ada (milik anggota lain — JANGAN diubah)
Endpoint (semua di bawah `/api`, belum ada auth): CRUD products + `GET /api/products/marketplace`, `GET /api/orders/umkm/:umkm_id`, `PUT /api/orders/:id/status`, `GET /api/analytics/dashboard/:umkm_id`, `GET /api/analytics/sales/:umkm_id`.
Frontend: dashboard UMKM (`/dashboard`, `/analitik`, `/insight`, `/pesanan`, `/produk`, `/profil`) + `/marketplace`.
Penyimpangan model existing vs PRD Section 18 — KEPUTUSAN TIM (21 Jul 2026): skema MENGIKUTI PRD
Model berikut menyimpang dan harus diselaraskan ke PRD Section 18. Aturan migrasi:
Selaraskan HANYA saat task yang sedang dikerjakan benar-benar membutuhkannya — jangan migrasi massal di luar scope task.
Migrasi aman: TAMBAH kolom/nilai baru dulu (AutoMigrate), jangan drop kolom atau hapus data existing dalam satu langkah.
Setelah mengubah model, perbarui handler existing yang memakainya supaya tetap compile & berfungsi — perubahan seminimal mungkin.
Laporkan setiap perubahan pada file/tabel milik anggota lain secara eksplisit di ringkasan akhir sesi (untuk dikomunikasikan ke pemiliknya).
Daftar penyimpangan yang diketahui:
`orders`: pakai `customer_name` string (bukan `customer_id` FK), `total_amount` (belum ada subtotal/service_fee/total_price/pickup_code/reserved_until), punya `order_items` (PRD: 1 order = 1 produk), status Bahasa Indonesia ("Menunggu", "Diproses", "Siap Diambil", "Selesai", "Dibatalkan") — bukan enum PRD 14.1.
`reviews`: pakai `sentiment` (Positif/Netral/Negatif), bukan keyword classification (`review_keywords` + `keyword_scores`).
`products`: belum ada `min_price` dan `food_score`.
`umkm_profiles`: belum ada `keyword_safety_level`.
Yang belum ada (dibuat oleh modul Admin — PERSIS PRD Section 18)
Model/tabel: `users`, `mitra_donasi_profiles`, `advertisements`, `platform_revenue`, `help_tickets`, `audit_logs` (+ `notifications` bila dibutuhkan).
Auth: belum ada JWT/bcrypt di go.mod — tambahkan `golang.org/x/crypto/bcrypt` + `github.com/golang-jwt/jwt/v5` di task Auth.
Saat memasang RBAC: proteksi dulu route BARU (`/api/admin/*`, `/api/me`, dst.). JANGAN langsung membungkus route lama anggota lain dengan middleware — koordinasikan dulu dengan pemiliknya.
Housekeeping
`savora.db` sudah dihapus (21 Jul). Repo BELUM punya `.gitignore` — buat di root berisi minimal: `.env`, `*.db`, `node_modules/`, `.next/`.
`backend/.env` berisi kredensial database nyata — JANGAN pernah di-commit; sediakan `backend/.env.example` (isi: `PORT=3001` dan `DATABASE_URL=` kosong).

