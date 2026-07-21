<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Savora — Frontend (Customer Marketplace)

Marketplace food rescue untuk lomba CODE 6.0. Deadline submission: 25 Juli 2026.

## Sumber kebenaran

- `docs/PRD.md` adalah SUMBER KEBENARAN TUNGGAL untuk semua rumus dan aturan
  produk. Jika kode/komentar bertentangan dengan PRD, PRD yang menang.
- Spesifikasi paling sering dipakai modul ini:
  - Section 12.6 — Food Score Decay (power decay γ=0,65, skor awal dari status
    Food Trust Index: Fresh=100, Layak Dijual=85, Segera Dijual=70; test case
    wajib ada di PRD dan HARUS lolos di tests/foodScore.test.js).
  - Section 12.7 — kamus keyword & threshold badge (DILARANG aturan worst-case:
    1 keyword Gawat tidak boleh langsung menjatuhkan badge).
  - Section 13.3 — harga final (termasuk service fee 5%) wajib jelas sebelum checkout.
  - Section 5.1 — color indicator timer: merah < 1 jam, kuning 1–3 jam, hijau > 3 jam
    (indikator PARALEL dengan band skor, boleh berbeda — REVISI #31).

## Batas modul (pembagian tugas tim)

- Modul ini (Richard): halaman customer — `/marketplace`, `/marketplace/[id]`,
  landing, dashboard customer, plus `src/lib/{foodScore,marketplace,reviews,ads}.js`.
- JANGAN mengubah file milik modul lain tanpa diminta:
  `src/app/{dashboard,pesanan,produk,analitik,insight,profil}/**` (UMKM/Order),
  komponen `src/components/**` boleh dipakai tapi ubah seminimal mungkin.
- Mesin klasifikasi keyword & score yang sebenarnya ada di backend (Go);
  frontend hanya konsumsi API + fallback demo lokal.

## Konvensi

- JavaScript (bukan TypeScript), App Router, path alias `@/` → `src/`.
- Styling: Tailwind v4 + kelas CSS `savora-*` di `globals.css`.
- Data API selalu dinormalisasi lewat `normalize*` di `src/lib/` dengan
  fallback demo lokal agar UI tetap jalan tanpa backend.
- Bahasa UI dan komentar: Indonesia.

## Verifikasi (jalankan sebelum menganggap selesai)

- `npm test` — harus hijau, termasuk test case wajib Food Score dari PRD 12.6.
- `npm run build` — harus sukses.
- `npm run lint` punya error pre-existing di `src/app/dashboard/page.js` dan
  `src/app/pesanan/page.js` (modul lain) — JANGAN memperbaikinya kecuali diminta;
  cukup pastikan tidak menambah error baru.