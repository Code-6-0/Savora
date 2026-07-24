# Savora — Admin Dashboard Design Spec

> **Status:** Disepakati (sesi desain 23 Jul 2026) · **Branch:** `alia` · **Deadline submission:** 25 Jul 2026
> **Dokumen ini adalah turunan dari `docs/SAVORA_PRD.md` (v3.7)** — khususnya **Section 5.3** (modul Admin), **FR-12/FR-13/FR-20/FR-21**, **Section 16** (Screen List), **Section 18** (Data Model), **Section 19** (API). PRD TIDAK diubah; jika ada konflik, PRD yang menang untuk *requirement*, dokumen ini yang menang untuk *tampilan & struktur UI*.
>
> **Aturan keras implementasi:**
> 1. Semua angka WAJIB dari database — tidak ada nilai hardcode/dummy.
> 2. Skema tabel `orders` / `products` / `payments` milik anggota lain: boleh DIBACA (query agregat), HARAM diubah.
> 3. Tidak menulis kode sampai ada perintah eksplisit "eksekusi" per fase.
> 4. Dilarang install library baru (termasuk chart) tanpa persetujuan — pakai yang sudah ada di `package.json`.

---

## 1. Struktur Sidebar (final)

```
SAVORA ADMIN PANEL
│
├── UTAMA
│   └── Dashboard
│
├── MANAJEMEN
│   ├── Verifikasi                  [badge: total pending]     (PRD 16: Admin Verification)
│   ├── Moderasi Listing            [badge: perlu ditinjau]    (PRD 16: Admin Listing Moderation; FR-12 P0)
│   ├── Kelola UMKM                                            (PRD 5.3: Manajemen UMKM)
│   ├── Kelola Customer                                        (PRD 5.3: Manajemen Customer)
│   └── Kelola Mitra Donasi                                    (PRD 5.3: Verifikasi Mitra Donasi)
│
├── PLATFORM
│   ├── Keuangan Platform                                      (PRD 16: Admin Keuangan; FR-20)
│   └── Manajemen Iklan             [badge: iklan menunggu]    (PRD 16: Admin Manajemen Iklan; FR-18)
│
├── LAINNYA
│   ├── Help Center / Laporan Customer  [badge: tiket baru]    (PRD 16: Admin Help Center; FR-10, 14.7–14.8)
│   └── Pengaturan                                             (pelengkap — bukan screen PRD 16, lihat §9)
│
└── FOOTER (sticky)
    └── Profil Admin (avatar + nama + role)
        └─ Dropdown: Lihat Profil · Pengaturan Akun · Keluar (merah + dialog konfirmasi)
```

- **Moderasi Listing WAJIB ada** — temuan verifikasi PRD: Section 16 punya screen `Admin Listing Moderation` dan FR-12 (approve/reject/suspend/warning listing & user) berprioritas **P0**. Sebelumnya tidak ada di draft sidebar.
- Tidak ada menu "Laporan" terpisah — modul "Laporan" & "Export Laporan" PRD 5.3 dipenuhi lewat: ringkasan di Dashboard + tombol Download per screen (§5).
- Item "Keluar" hanya di dropdown profil footer, tidak di menu tengah.
- Badge sidebar mengambil count dari query yang sama dengan panel Moderasi Prioritas (satu sumber angka).
- State interaksi: active = pill hijau solid; hover = hijau sangat muda; focus ring; kontras teks inactive min. WCAG AA.

---

## 2. Dashboard — urutan seksi

(data utama: `GET /admin/reports/summary` — PRD 19; dasar: PRD 5.3 baris Dashboard + FR-13)

| # | Seksi | Isi |
|---|-------|-----|
| 1 | Platform Overview | 4 stat card: Total UMKM Aktif, Total Customer, Transaksi Hari Ini, Revenue Platform (bulan berjalan) — masing-masing + delta vs periode sebelumnya |
| 2 | Aktivitas Hari Ini | strip ringkas: transaksi berjalan (per status order) + pendaftaran baru hari ini |
| 3 | Moderasi Prioritas | panel antrean (INFORMASI, bukan aksi): UMKM pending, mitra pending, iklan pending, listing perlu moderasi, tiket help baru — tiap baris tombol "Lihat" → screen terkait |
| 4 | Quick Actions | grid shortcut navigasi (§3) |
| 5 | Platform Health | 5 mini-card: Makanan Diselamatkan (kg), Produk Rescue Aktif, Pickup Sukses (%), Listing Kedaluwarsa, Waste Log Tercatat |
| 6 | Top UMKM Paling Aktif | ranking bulanan (§4) |
| 7 | Environmental Impact | banner hijau — FR-13 versi sederhana (§2.1) |
| 8 | Aktivitas Terbaru | feed 5–8 event + "Lihat Semua" |

- Pembagian peran tegas: **Moderasi Prioritas = informasi antrean**, **Quick Actions = navigasi**. Tidak ada aksi approve/reject di Dashboard.
- Detail revenue (chart + rincian sumber) hidup di screen Keuangan Platform — tidak didobel di Dashboard.
- Mini-card "Waste Log Tercatat" memenuhi modul **Monitoring Food Waste** (PRD 5.3) — data dari `waste_logs` (`GET /waste-logs`, role Admin — PRD 19).

### 2.1 Environmental Impact (FR-13 — P1)

Sesuai metrik dampak MVP (PRD 6.4) — semua dihitung dari DB:

- **Total makanan diselamatkan (kg)** = Σ `products.weight_per_portion × orders.quantity` untuk `orders.status = COMPLETED`.
- **Porsi diselamatkan** = Σ `orders.quantity` (COMPLETED).
- **Order completed** (count) + **Waste Log tercatat** (count).
- **Estimasi reduksi CO2**: PRD TIDAK mendefinisikan formula CO2 (5.3 hanya menyebut "dampak lingkungan estimatif"). → Opsional; jika ditampilkan, faktor konversi disimpan sebagai konfigurasi di DB (§9) + label "estimasi". Fallback aman: tampilkan impact tanpa CO2.

---

## 3. Quick Actions (Model A — shortcut navigasi murni)

```
[grid 4×2 — 7 tombol aktif + 1 Soon]
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ ✓ Verifikasi     │ ♥ Setujui Mitra  │ ◉ Review Iklan   │ ! Laporan        │
│   UMKM  [badge]  │         [badge]  │         [badge]  │   Customer [bdg] │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ ⏱ Listing        │ ★ Top UMKM       │ ↓ Download       │ ✈ Broadcast      │
│   Expired [bdg]  │   Paling Aktif   │   Laporan        │   Notif  ⟨Soon⟩  │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

| Tombol | Tujuan (deep-link) |
|---|---|
| ✓ Verifikasi UMKM | Verifikasi, tab UMKM |
| ♥ Setujui Mitra | Verifikasi, tab Mitra Donasi |
| ◉ Review Iklan | Manajemen Iklan, tab Menunggu (`ad_status = PENDING`) |
| ! Laporan Customer | Help Center, tab Baru |
| ⏱ Listing Expired | Moderasi Listing, filter `products.expires_at < now()` |
| ★ Top UMKM Paling Aktif | Kelola UMKM, sort orders completed + periode bulan ini |
| ↓ Download Laporan | Keuangan Platform |
| ✈ Broadcast Notif ⟨Soon⟩ | disabled, abu-abu muted, chip `Soon`, tooltip "Segera hadir", tanpa badge & tanpa logika backend; posisi selalu terakhir; mudah dicabut |

- Semua badge count dari query DB yang sama dengan Moderasi Prioritas — angka tidak boleh beda antar seksi.
- Di-drop: **Lihat Dispute** (tidak ada dasar di PRD 5.3/16).

---

## 4. Seksi "Top UMKM Paling Aktif"

- Definisi "paling aktif" = **jumlah `orders` berstatus `COMPLETED` pada periode berjalan** (enum `order_status` — PRD 18.1). Bukan rating/jumlah produk.
- Header: pemilih periode (Bulan ini / 30 hari) + tombol "Lihat Semua" → Kelola UMKM.
- Isi per kartu (rank #1–4): nama + kategori · orders completed · revenue kotor UMKM (Σ `orders.subtotal`) · food rescued (kg).
- Data = agregasi read-only `orders` (`COUNT/SUM ... GROUP BY umkm`) — tidak menyentuh skema milik anggota lain.
- Framing UI: "**UMKM Paling Aktif**" (statistik pengguna — PRD 5.3), bukan klaim "terlaris".

---

## 5. Laporan & Ekspor

Dua makna "laporan" dipisah tegas:

1. **Laporan customer (aduan)** → rumahnya **Help Center** — memakai tabel `help_tickets` yang SUDAH ada di data model PRD 18 (kategori aduan sesuai PRD 14.7; penanganan sesuai matriks PRD 14.8; endpoint `GET /help-tickets`, `PATCH /help-tickets/{id}/status` — PRD 19). **Tidak perlu tabel `reports` baru.**
2. **Laporan data/analitik** → tombol **Download per screen**, bukan screen khusus.

Ketentuan ekspor (hasil verifikasi PRD 5.3 "Export Laporan" + FR-21):

- Format yang dituntut PRD: **CSV, Excel, atau PDF** + **date range picker**. (PDF ternyata disebut eksplisit — minimal CSV/Excel dulu, PDF menyusul jika sempat.)
- Cakupan yang disebut PRD: laporan **transaksi, keuangan, UMKM, customer**.
- Endpoint yang SUDAH ada di PRD 19: hanya `GET /admin/revenue/export`. Ekspor UMKM/customer butuh endpoint baru → prioritas: **#1 Keuangan** (endpoint sudah ada), **#2 Kelola UMKM**, sisanya nice-to-have. Jangan pasang tombol yang endpoint-nya belum ada.
- Komponen seragam: `Download ⌄ (CSV/Excel)` kanan-atas tabel/seksi, **mengikuti filter aktif**.
- **Report akun**: disimpan & ditindak HANYA di Help Center; halaman detail akun hanya menampilkan "Riwayat Laporan" read-only → klik lompat ke Help Center. Dashboard hanya menampilkan count.

---

## 6. Screen Kelola (3 entitas)

### 6.1 Kelola UMKM (PRD 5.3: admin menambah data, memverifikasi, mengubah, menonaktifkan)

- Toolbar: search · filter (kategori / status / verifikasi) · Download CSV/Excel (prioritas #2).
- Tabel: nama + kategori · status · `verification_status` (PENDING/APPROVED/REJECTED — PRD 18.1) · jumlah produk · orders completed · **rating** (tersedia: field `umkm_profiles.rating` + tabel `reviews` berstatus Inti MVP — PRD 18).
- Kolom "Customer" dari mockup: **dibuang** (query mahal, kurang actionable).
- Detail: profil usaha (`umkm_profiles`), status verifikasi + dokumen, statistik agregat, produk rescue aktif (read-only), keyword safety level (`keyword_scores` — bonus, data sudah ada), Riwayat Laporan (read-only → Help Center), aksi: Nonaktifkan/Aktifkan (+alasan) · Cabut verifikasi.
- Catatan PRD: 5.3 menyebut admin juga bisa **menambah data UMKM** — sediakan tombol "Tambah UMKM" (form dasar) bila waktu cukup; kalau tidak, catat sebagai known-gap.

### 6.2 Kelola Customer

- Toolbar: search (nama/email) · filter status · Download (nice-to-have).
- Tabel: nama + avatar · email · tanggal daftar · total transaksi · transaksi terakhir · status akun. (Data: `users` + `customer_profiles` + agregat `orders`; endpoint `GET /admin/customers` — PRD 19.)
- Detail: profil, riwayat transaksi ringkas (read-only), Riwayat Laporan (read-only), aksi: Tangguhkan (+alasan, konfirmasi) / Pulihkan (FR-12: suspend user).
- Tidak ditampilkan: password/data sensitif.

### 6.3 Kelola Mitra Donasi

- Toolbar: search · filter `verification_status`.
- Tabel: nama org + jenis · kontak PIC (`mitra_donasi_profiles.phone`) · status verifikasi · tanggal verifikasi.
- **Koreksi hasil verifikasi PRD:** data model TIDAK punya tabel transaksi donasi → kolom "donasi diterima / donasi terakhir / tingkat donasi sukses" **dibuang** (tidak ada sumbernya). Scope PRD untuk mitra donasi = registrasi + verifikasi dokumen legalitas (5.3, FR-19, `mitra_donasi_profiles`).
- Detail: profil + `document_url` (dokumen legalitas), status + `verified_at`, Riwayat Laporan (read-only), aksi: Nonaktifkan/Aktifkan (+alasan).

### 6.4 Aturan lintas ketiganya

1. Approval akun baru HANYA di screen Verifikasi.
2. Aksi destruktif seragam: dialog konfirmasi + alasan wajib; reversible; tidak ada delete permanen. Catat ke `audit_logs` (tabel sudah ada di PRD 18 — Perluasan).
3. Badge status satu palet: hijau = aktif/approved, kuning = pending/review, merah = rejected, abu = nonaktif/suspended.
4. Kolom agregat wajib dari query DB; jika datanya tidak ada → kolom di-skip, bukan diisi dummy.

---

## 7. Screen Verifikasi (PRD 16: Admin Verification; FR-02 P0, FR-19 P1)

- Badge sidebar = total pending (UMKM + mitra).
- Tab **UMKM**: tabel (nama, kategori, dokumen, tanggal daftar) → Lihat detail / Setujui / Tolak (+alasan). Endpoint: `PATCH /admin/umkm/{id}/verification` (PRD 19). Efek: UMKM hanya bisa publish listing setelah APPROVED (FR-02).
- Tab **Mitra Donasi**: tabel (nama org, kontak, tanggal pengajuan) → Lihat detail (+ preview `document_url`) / Setujui / Tolak. Endpoint: `GET /admin/mitra-donasi`, `PATCH /admin/mitra-donasi/{id}/verify` (PRD 19).
- *(Alur detail setujui/tolak + tampilan dokumen: agenda diskusi berikutnya.)*

---

## 8. Screen Moderasi Listing (BARU — PRD 16: Admin Listing Moderation; FR-12 P0)

- Memenuhi modul **Monitoring Produk** (PRD 5.3): admin melihat seluruh produk & memastikan sesuai standar.
- Toolbar: search · filter (kategori / `food_trust_status` / status / expired).
- Tabel: produk + foto · UMKM · `food_trust_status` + `food_score` · harga rescue · stok · `expires_at` · status.
- Aksi (FR-12): Suspend listing / Aktifkan kembali / Beri warning ke UMKM (+alasan wajib). Endpoint tersedia: `PATCH /products/{id}` (role Admin — PRD 19).
- Sumber antrean "perlu ditinjau": listing expired masih aktif, listing dengan laporan customer, food_trust "Tidak Disarankan Dijual".

---

## 9. Keuangan Platform (PRD 16: Admin Keuangan; FR-20 P1)

- Data: `GET /admin/revenue` + tabel `platform_revenue` (`source_type`, `amount`, `service_fee_amount` — PRD 18).
- Komposisi revenue sesuai PRD 8.4 + 14.4: **service fee 5% transaksi produk** + **iklan UMKM** + **iklan pihak ketiga** (iklan juga kena service fee).
- Isi screen: date range picker · Revenue Chart (trend, 6 bulan — pakai library chart yang SUDAH ada di `package.json`, cek dulu) · rincian per `source_type` (progress bar) · total + delta vs bulan lalu · tombol **Download CSV/Excel (PDF nice-to-have)** via `GET /admin/revenue/export`, mengikuti rentang terpilih.

---

## 10. Pengaturan

> Catatan: screen Pengaturan TIDAK ada di PRD Section 16 — statusnya pelengkap standar admin panel, bukan requirement. Jaga tetap tipis.

- **Profil Admin** (wajib): nama, email, foto, ganti password; role read-only.
- **Parameter Platform** (opsional & tipis):
  - ~~Service fee %~~ → **DIBUANG**: PRD 14.4/18 menetapkan service fee **fix 5%** — tampilkan read-only saja jika perlu, bukan input.
  - ~~Ambang listing kedaluwarsa~~ → **DIBUANG**: kedaluwarsa per-produk via `products.expires_at`, bukan parameter global.
  - Faktor konversi CO2 (hanya jika Environmental Impact menampilkan CO2 — §2.1) — disimpan di DB, anti hardcode.
- **Manajemen Admin**: **SKIP** — PRD tidak menyebut multi-admin.
- **Tentang Aplikasi**: versi + link PRD/dokumentasi.

---

## 11. Fitur di-drop / ditunda

| Item | Status | Alasan |
|---|---|---|
| Menu "Laporan" terpisah | Drop | Dipenuhi Dashboard + Download per screen |
| Lihat Dispute | Drop | Tidak ada dasar PRD 5.3/16 |
| Broadcast Notif | Soon (disabled) | Belum ada dasar PRD; tanpa logika, mudah dicabut |
| Kolom "Customer" di tabel UMKM | Drop | Query mahal, kurang actionable |
| Kolom donasi diterima/terakhir di Kelola Mitra | Drop | Tidak ada tabel transaksi donasi di PRD 18 |
| Parameter service fee & ambang expired | Drop | Fee fix 5% (PRD 14.4); expiry per produk |
| Quick Actions model B (aksi via modal) | Drop | Dobel implementasi, minim konteks |
| Manajemen Admin (multi-admin) | Skip | PRD tidak menyebut multi-admin |
| Mode sidebar collapsed | Tunda | Nice-to-have |
| Tema/dark mode, notif email, backup | Drop | Di luar PRD |
| Ekspor PDF | Tunda | Disebut PRD (FR-21) tapi CSV/Excel didahulukan |

---

## 12. Hasil verifikasi PRD (delta vs draft desain awal)

| Temuan dari PRD v3.7 | Dampak ke desain |
|---|---|
| Section 16 punya screen **Admin Listing Moderation**; FR-12 **P0** | Tambah menu + screen Moderasi Listing (§8) — sebelumnya tidak ada |
| Export = **CSV/Excel/PDF** + date range, cakupan transaksi/keuangan/UMKM/customer | PDF masuk backlog; endpoint baru hanya untuk yang diprioritaskan |
| Satu-satunya endpoint export di PRD 19: `/admin/revenue/export` | Konfirmasi prioritas #1 Keuangan |
| `help_tickets` sudah ada di data model (kategori 14.7, matriks penanganan 14.8) | Tidak perlu tabel `reports` baru — Help Center pakai `help_tickets` |
| `umkm_profiles.rating` + `reviews` = Inti MVP | Kolom rating di Kelola UMKM aman ditampilkan |
| Tidak ada tabel transaksi donasi | Kolom statistik donasi di Kelola Mitra dibuang |
| Service fee **fix 5%** (14.4, 18) | Parameter fee dibuang dari Pengaturan |
| PRD tidak punya formula CO2 (hanya "estimatif") | CO2 opsional + faktor di konfigurasi; fallback tanpa CO2 |
| PRD 5.3: admin bisa **menambah data UMKM** | Tombol "Tambah UMKM" masuk backlog Kelola UMKM |
| `audit_logs` ada di data model (Perluasan) | Aksi destruktif dicatat ke audit_logs bila tabelnya terpasang |
| Enum `order_status` punya `COMPLETED` | Metrik Top UMKM & impact terkonfirmasi queryable |
| `notifications` ada di data model | Broadcast tetap Soon (tidak ada requirement admin broadcast) |

---

## 13. Checklist sisa verifikasi (di repo, sebelum eksekusi) — ✅ SELESAI

Item PRD sudah terjawab (lihat §12). Sisa yang hanya bisa dicek di kode:

- [x] **CLAUDE.md** — ✅ Sudah dibaca (ada di context system-reminder). Panduan lengkap, stack & business rules jelas.
- [x] **Library chart** — ✅ `recharts` v3.9.2 sudah terpasang di `package.json`. Siap pakai untuk Revenue Chart (§9).
- [x] **Tabel Perluasan (PRD 18):**
  - ✅ `mitra_donasi_profiles`, `advertisements` + `ad_metrics`, `help_tickets`, `platform_revenue` — ADA, struktur sesuai PRD
  - ❌ `waste_logs` — BELUM ADA → **Waste Log metrics skip Fase 1** (Platform Health §2.5, Environmental Impact §2.7)
  - ⚠️ `audit_logs` — inline struct ada di `admin.go` line 27-35, model file belum → **gunakan inline struct existing**
  - ❌ `notifications` — BELUM ADA → **Broadcast Notif tetap Soon** (sesuai §11)
- [x] **GetAdminSummaryHandler** (`backend/handlers/admin.go` line 364-442):
  - ✅ Field existing: user counts, umkm verification, products, orders per status (Bahasa Indonesia), transaction, recent data (5 terbaru)
  - ❌ Field belum ada untuk Dashboard §2: delta periode, aktivitas hari ini, moderasi counts, platform health metrics, top UMKM ranking, environmental impact → **perlu ditambah 30+ field di Fase 2**
- [x] **Token warna/font/radius** — ✅ `globals.css` lengkap sesuai CLAUDE.md Section 4. CSS variables `--primary-color: #16A34A`, font Inter, border-radius 8px/12px konsisten.
- [x] **Struktur frontend admin:**
  - ✅ Halaman: `dashboard`, `help-center`, `iklan`, `keuangan`, `listings`, `mitra-donasi`, `moderasi`, `verifikasi-umkm` — semua ada
  - ✅ Komponen: `SummaryCard`, `AdminSidebar`, `DataTable`, `DashboardLayout` — semua ada
  - ⚠️ Dashboard existing (`/admin/dashboard/page.js`) jauh lebih sederhana dari spec §2 → **akan diganti total dengan struktur 8 seksi (minus Aktivitas Terbaru)**
- [x] **Kapabilitas export backend** — ✅ `backend/handlers/revenue.go` sudah lengkap:
  - CSV, Excel (library `excelize/v2`), PDF (library `gofpdf`) tersedia
  - Endpoint: `GET /api/admin/revenue/export?format=csv|excel|pdf&start=YYYY-MM-DD&end=YYYY-MM-DD`
  - Date range filtering + summary footer semua format
  - ⚠️ Hanya untuk Keuangan; export UMKM/Customer iterasi Fase 4 (sesuai prioritas §5)

**Ringkasan audit lengkap:** lihat [`docs/design/PROGRESS.md`](docs/design/PROGRESS.md)

**Penurunan scope Fase 1:**
- ⏭️ **Waste Log metrics** (tabel belum ada) → skip atau "0 / Coming soon"
- ⏭️ **Estimasi CO2** (opsional, formula belum ada) → skip
- ⏭️ **Aktivitas Terbaru feed** (kompleks, tidak kritikal) → skip Fase 1
- ✅ **Broadcast Notif** → tetap Soon/disabled (sesuai spec)

---

## 14. Rencana eksekusi (tiap fase = 1 perintah "eksekusi" terpisah)

1. **Sesi 0 — Verifikasi repo (bukan koding):** kerjakan checklist §13; update spec ini jika ada temuan.
2. **Fase 1 — Fondasi:** struktur sidebar baru + routing screen kosong + token warna dari `globals.css`.
3. **Fase 2 — Backend:** perluas endpoint summary (`GET /admin/reports/summary`) agar menyuplai SEMUA angka Dashboard dari DB — satu endpoint, semua badge & stat konsisten.
4. **Fase 3 — Dashboard:** bangun seksi per seksi sesuai urutan §2.
5. **Fase 4 — Screen lain:** Verifikasi → Moderasi Listing → Keuangan → Kelola (UMKM/Customer/Mitra) → Help Center → Pengaturan.

---

## 15. Peta Fitur Lengkap (format tree)

> Tree ini SUDAH disinkronkan dengan hasil verifikasi PRD v3.7 (§12): ada Moderasi Listing, kolom donasi mitra dibuang, parameter fee/expired dibuang, dan metrik health/impact mengikuti data yang benar-benar ada di data model PRD 18.

```
SAVORA ADMIN PANEL
│
├── UTAMA
│   └── Dashboard                                  (PRD 5.3 + FR-13; data: GET /admin/reports/summary — PRD 19)
│       ├─ Platform Overview                       [4 stat card, grid 4 kolom]
│       │   ├─ Total UMKM Aktif                    (angka + delta % vs bulan lalu)
│       │   ├─ Total Customer                      (angka + pendaftar baru)
│       │   ├─ Transaksi Hari Ini                  (angka + vs kemarin)
│       │   └─ Revenue Platform                    (Rp, bulan berjalan + delta %)
│       ├─ Aktivitas Hari Ini                      [strip ringkas di bawah overview]
│       │   ├─ Transaksi berjalan                  (count + status order)
│       │   └─ Pendaftaran baru hari ini           (UMKM / customer)
│       ├─ Moderasi Prioritas                      [panel antrean + badge total — INFORMASI, bukan aksi]
│       │   ├─ UMKM menunggu verifikasi            (count + Lihat → Verifikasi, tab UMKM)
│       │   ├─ Mitra donasi menunggu persetujuan   (count + Lihat → Verifikasi, tab Mitra)
│       │   ├─ Iklan menunggu tinjauan             (count + Lihat → Manajemen Iklan)
│       │   ├─ Listing perlu moderasi              (count + Lihat → Moderasi Listing)
│       │   └─ Laporan customer baru               (count + Lihat → Help Center)
│       ├─ Quick Actions                           [grid 4×2 — Model A: shortcut NAVIGASI murni]
│       │   ├─ ✓ Verifikasi UMKM       [badge]     → Verifikasi, tab UMKM
│       │   ├─ ♥ Setujui Mitra         [badge]     → Verifikasi, tab Mitra Donasi
│       │   ├─ ◉ Review Iklan          [badge]     → Manajemen Iklan, tab Menunggu
│       │   ├─ ! Laporan Customer      [badge]     → Help Center, tab Baru
│       │   ├─ ⏱ Listing Expired       [badge]     → Moderasi Listing, filter expires_at < now()
│       │   ├─ ★ Top UMKM Paling Aktif             → Kelola UMKM, sort orders completed + bulan ini
│       │   ├─ ↓ Download Laporan                  → Keuangan Platform
│       │   └─ ✈ Broadcast Notif      ⟨Soon⟩       (disabled, tanpa logika backend, posisi terakhir)
│       ├─ Platform Health                         [5 mini-card — PRD 5.3: food waste + monitoring]
│       │   ├─ Makanan Diselamatkan (kg)           (Σ weight_per_portion × qty, orders COMPLETED)
│       │   ├─ Produk Rescue Aktif                 (products aktif & belum expired)
│       │   ├─ Tingkat Pickup Sukses (%)           (COMPLETED vs NO_SHOW/EXPIRED)
│       │   ├─ Listing Rescue Kedaluwarsa          (products.expires_at < now())
│       │   └─ Waste Log Tercatat                  (Monitoring Food Waste — waste_logs, PRD 5.3)
│       ├─ Top UMKM Paling Aktif                   [4 kartu ranking + periode: Bulan ini / 30 hari]
│       │   ├─ Rank #1–4: nama UMKM + kategori
│       │   ├─ Orders completed                    (metrik utama "paling aktif")
│       │   ├─ Revenue kotor UMKM                  (Σ orders.subtotal)
│       │   ├─ Food rescued (kg)
│       │   └─ Klik kartu → detail UMKM di Kelola UMKM
│       ├─ Environmental Impact                    [banner hijau — FR-13 sederhana; metrik PRD 6.4]
│       │   ├─ Total Makanan Diselamatkan (kg)     (kumulatif, orders COMPLETED)
│       │   ├─ Porsi Makanan Diselamatkan          (Σ quantity)
│       │   ├─ Order Completed + Waste Log         (count)
│       │   └─ Estimasi Reduksi CO2                (OPSIONAL — faktor dari konfigurasi DB; PRD tanpa formula, label "estimasi")
│       └─ Aktivitas Terbaru                       [feed 5–8 item + "Lihat Semua"]
│           ├─ Ikon per tipe event                 (verifikasi/mitra/iklan/laporan/moderasi)
│           ├─ Deskripsi singkat + relative time   ("2 menit lalu")
│           └─ Klik item → detail entitas terkait
│
├── MANAJEMEN
│   ├── Verifikasi                                 (PRD 16: Admin Verification) [badge: total pending]
│   │   ├─ Tab: UMKM Menunggu Verifikasi           (FR-02 P0 · PATCH /admin/umkm/{id}/verification)
│   │   │   ├─ Tabel: nama, kategori, dokumen, tanggal daftar
│   │   │   └─ Aksi: Lihat detail / Setujui / Tolak (+ alasan)
│   │   └─ Tab: Mitra Donasi Menunggu Persetujuan  (FR-19 P1 · PATCH /admin/mitra-donasi/{id}/verify)
│   │       ├─ Tabel: nama org, kontak PIC, tanggal pengajuan
│   │       └─ Aksi: Lihat detail (+ preview document_url) / Setujui / Tolak
│   ├── Moderasi Listing                           (PRD 16: Admin Listing Moderation; FR-12 P0) [badge]
│   │   ├─ Toolbar: search · filter (kategori / food_trust_status / status / expired)
│   │   ├─ Tabel: produk + foto, UMKM, food_trust_status + food_score,
│   │   │         harga rescue, stok, expires_at, status
│   │   └─ Aksi: Suspend / Aktifkan / Warning ke UMKM (+ alasan wajib) — PATCH /products/{id}
│   ├── Kelola UMKM                                (PRD 5.3: Manajemen UMKM)
│   │   ├─ Toolbar: search · filter (kategori/status/verifikasi) · Download CSV/Excel (prioritas #2)
│   │   ├─ Tabel: nama + kategori, status, verification_status,
│   │   │         jumlah produk, orders completed, rating (umkm_profiles.rating — tersedia)
│   │   ├─ Aksi baris: Lihat · Edit status · Nonaktifkan
│   │   ├─ Tombol "Tambah UMKM"                    (backlog — PRD 5.3: admin menambah data)
│   │   └─ Detail UMKM
│   │       ├─ Profil usaha: nama, pemilik, kontak, alamat, kategori
│   │       ├─ Status verifikasi + dokumen yang disubmit
│   │       ├─ Statistik: produk aktif, orders, food rescued
│   │       ├─ Keyword safety level                (keyword_scores — bonus, data sudah ada)
│   │       ├─ Daftar produk rescue aktif          (read-only)
│   │       ├─ Riwayat Laporan                     (read-only → lompat ke Help Center)
│   │       └─ Aksi: Nonaktifkan/Aktifkan (+ alasan) · Cabut verifikasi
│   ├── Kelola Customer                            (PRD 5.3 · GET /admin/customers)
│   │   ├─ Toolbar: search (nama/email) · filter status · Download (nice-to-have)
│   │   ├─ Tabel: nama + avatar, email, tanggal daftar,
│   │   │         total transaksi, transaksi terakhir, status akun
│   │   ├─ Aksi baris: Lihat detail · Tangguhkan/Pulihkan (FR-12: suspend user)
│   │   └─ Detail customer
│   │       ├─ Profil: nama, email, no. HP, tanggal daftar
│   │       ├─ Riwayat transaksi ringkas           (5–10 terakhir, read-only)
│   │       ├─ Riwayat Laporan                     (read-only → lompat ke Help Center)
│   │       └─ Aksi: Tangguhkan (+ alasan, konfirmasi) / Pulihkan
│   └── Kelola Mitra Donasi                        (data: mitra_donasi_profiles — PRD 18)
│       ├─ Toolbar: search · filter verification_status (PENDING/APPROVED/REJECTED)
│       ├─ Tabel: nama org + jenis, kontak PIC, status verifikasi, tanggal verifikasi
│       │         (kolom donasi diterima/terakhir DIBUANG — tidak ada tabel donasi di PRD 18)
│       ├─ Aksi baris: Lihat · Nonaktifkan
│       └─ Detail mitra
│           ├─ Profil: nama org, alamat, PIC, kontak, deskripsi
│           ├─ Dokumen legalitas (document_url) + verified_at
│           ├─ Riwayat Laporan                     (read-only → lompat ke Help Center)
│           └─ Aksi: Nonaktifkan/Aktifkan (+ alasan)
│
├── PLATFORM
│   ├── Keuangan Platform                          (PRD 16: Admin Keuangan; FR-20 · GET /admin/revenue)
│   │   ├─ Date range picker
│   │   ├─ Revenue Chart                           [trend 6 bulan — lib chart yang SUDAH ada di package.json]
│   │   ├─ Rincian Sumber Revenue                  [progress bar per platform_revenue.source_type:
│   │   │                                          service fee 5% · iklan UMKM · iklan pihak ketiga — PRD 8.4]
│   │   ├─ Total + delta vs bulan lalu
│   │   └─ Download CSV/Excel                      (PDF nice-to-have — FR-21; GET /admin/revenue/export; prioritas #1)
│   └── Manajemen Iklan                            (PRD 16; FR-18 · PATCH /advertisements/{id}/status)
│       ├─ Tab: Menunggu Tinjauan [badge] / Aktif / Ditolak    (ad_status — PRD 18.1)
│       ├─ Tabel: pengiklan (advertiser_type), konten + preview, periode, harga, status
│       └─ Aksi: Setujui / Tolak (+ alasan)        (preview iklan + detail advertiser — PRD 5.3)
│
├── LAINNYA
│   ├── Help Center / Laporan Customer             (PRD 16: Admin Help Center; data: help_tickets — PRD 18)
│   │   ├─ Tab: Baru [badge] / Diproses / Selesai
│   │   ├─ Tabel: pelapor, kategori aduan (PRD 14.7), order/entitas terkait,
│   │   │         bukti (proof_url), tanggal, status
│   │   └─ Detail aduan → Aksi sesuai matriks PRD 14.8:
│   │       warning UMKM / batalkan order / cek payment log / tutup tiket (+ admin_note)
│   └── Pengaturan                                 (pelengkap — bukan screen PRD 16; jaga tipis)
│       ├─ Profil Admin                            [WAJIB]
│       │   ├─ Nama, email, foto profil
│       │   ├─ Ganti password (lama + baru + konfirmasi)
│       │   └─ Role: Admin                         (read-only)
│       ├─ Parameter Platform                      [tipis — hanya jika CO2 ditampilkan]
│       │   ├─ Faktor konversi CO2                 (disimpan di DB — anti hardcode)
│       │   └─ Service fee 5%                      (read-only — fix per PRD 14.4, BUKAN input)
│       └─ Tentang Aplikasi
│           ├─ Versi aplikasi
│           └─ Link dokumentasi / PRD
│           (Manajemen Admin multi-admin: SKIP — tidak disebut PRD)
│
└── FOOTER (sticky di dasar sidebar)
    └── Profil Admin                               [avatar + nama + role]
        └─ Dropdown
            ├─ Lihat Profil
            ├─ Pengaturan Akun                     (shortcut ke Pengaturan)
            └─ Keluar                              (merah, divider, dialog konfirmasi)
```

---

## 16. Referensi Desain

- **Gambar referensi desain ada di `docs/design/referensi-admin-dashboard.png`** (mockup dashboard admin).
- Gambar tersebut **HANYA referensi desain**: layout, gaya visual, palet warna, nuansa kartu/chart.
- **Isi/struktur TIDAK mengikuti gambar** — struktur seksi, fitur, dan kolom mengikuti dokumen ini; semua angka wajib dari database.
- Jika ada konflik antara gambar dan dokumen ini, **dokumen ini yang menang**. Contoh: Broadcast Notif di gambar → status Soon; "Lihat Dispute" → di-drop; kolom Customer di tabel UMKM → dibuang.
- Token warna, font, radius, spacing mengikuti `frontend/src/app/globals.css` + tema referensi customer di `docs/design/01–08`.
