# Admin Module Smoke Test Checklist

**Modul:** Admin Dashboard (Task 1-7 - Alia)  
**Acceptance Criteria:** PRD Section 24.3  
**Tanggal:** 22 Juli 2026

## Prerequisites

1. ✅ Backend running di `http://localhost:3001`
2. ✅ Frontend running di `http://localhost:3000`
3. ✅ Database seeded dengan `npm run seed` (di backend/)
4. ✅ Akun admin test tersedia (dari seed data)

---

## 1. Authentication & Authorization (Task 1)

### Login Admin
- [ ] Buka `http://localhost:3000/login`
- [ ] Login dengan kredensial admin dari seed data
- [ ] Verify: redirect ke `/admin/dashboard` setelah login sukses
- [ ] Verify: token JWT tersimpan dan valid

### RBAC Protection
- [ ] Akses `/admin/dashboard` tanpa login → redirect ke `/login` dengan 401
- [ ] Login sebagai customer → akses `/admin/dashboard` → 403 Forbidden
- [ ] Login sebagai UMKM → akses `/admin/dashboard` → 403 Forbidden
- [ ] Login sebagai admin → akses `/admin/dashboard` → 200 OK

**Expected Result:** ✅ Hanya admin yang bisa akses route `/admin/*`

---

## 2. Verifikasi UMKM (Task 2)

### List Pendaftaran UMKM
- [ ] Login sebagai admin
- [ ] Buka `/admin/users` atau `/admin/umkm` (sesuai implementasi)
- [ ] Verify: tampil list UMKM dengan status PENDING
- [ ] Verify: kolom: nama bisnis, email, status verifikasi, action buttons

### Approve UMKM
- [ ] Pilih UMKM dengan status PENDING
- [ ] Klik tombol "Approve" / "Verifikasi"
- [ ] Isi catatan admin: "Dokumen lengkap dan valid"
- [ ] Submit approval
- [ ] **Verify:**
  - Status UMKM berubah ke APPROVED
  - User status berubah ke ACTIVE
  - UMKM bisa login dan membuat listing produk
  - Audit log tercatat (cek di admin audit log atau database)

### Reject UMKM
- [ ] Pilih UMKM lain dengan status PENDING
- [ ] Klik tombol "Reject" / "Tolak"
- [ ] Isi catatan admin: "Dokumen tidak lengkap"
- [ ] Submit rejection
- [ ] **Verify:**
  - Status UMKM berubah ke REJECTED
  - User status tetap PENDING
  - UMKM tidak bisa membuat listing produk
  - Audit log tercatat

**Expected Result:** ✅ Admin bisa approve/reject UMKM; transisi status sesuai PRD; audit log tercatat

---

## 3. Moderasi User (Task 3)

### Warning User
- [ ] Buka list user (customer atau UMKM dengan status ACTIVE)
- [ ] Pilih user
- [ ] Klik "Warning" / "Beri Peringatan"
- [ ] Isi catatan: "Pelanggaran kecil: deskripsi produk menyesatkan"
- [ ] Submit warning
- [ ] **Verify:**
  - User status tetap ACTIVE (warning tidak mengubah status)
  - Audit log tercatat dengan action "WARNING"

### Suspend User
- [ ] Pilih user ACTIVE lainnya
- [ ] Klik "Suspend" / "Suspend Akun"
- [ ] Isi catatan: "Pelanggaran berat: produk kedaluwarsa dijual"
- [ ] Submit suspend
- [ ] **Verify:**
  - User status berubah ke SUSPENDED
  - User tidak bisa login (coba logout dan login kembali)
  - Jika UMKM: tidak bisa membuat listing baru
  - Audit log tercatat dengan action "SUSPEND"

### Reactivate User (Approve suspended user)
- [ ] Pilih user dengan status SUSPENDED
- [ ] Klik "Approve" / "Aktifkan Kembali"
- [ ] Isi catatan: "Peninjauan selesai, akun diaktifkan kembali"
- [ ] Submit approve
- [ ] **Verify:**
  - User status berubah ke ACTIVE
  - User bisa login kembali
  - Audit log tercatat

**Expected Result:** ✅ Admin bisa warning/suspend/reactivate user; audit log tercatat

---

## 4. Verifikasi Mitra Donasi (Task 4)

### List Pendaftaran Mitra
- [ ] Buka `/admin/mitra-donasi`
- [ ] Verify: tampil list pendaftaran mitra dengan status PENDING
- [ ] Verify: kolom: nama organisasi, deskripsi, dokumen URL, action buttons

### Approve Mitra
- [ ] Pilih mitra dengan status PENDING
- [ ] Klik "Approve" / "Verifikasi"
- [ ] Isi catatan: "Dokumen legalitas valid"
- [ ] Submit approval
- [ ] **Verify:**
  - Status mitra berubah ke APPROVED
  - `verified_at` timestamp terisi
  - User status berubah ke ACTIVE
  - Mitra bisa login
  - Audit log tercatat

### Reject Mitra
- [ ] Pilih mitra lain dengan status PENDING
- [ ] Klik "Reject" / "Tolak"
- [ ] Isi catatan: "Dokumen tidak valid"
- [ ] Submit rejection
- [ ] **Verify:**
  - Status mitra berubah ke REJECTED
  - User status tetap PENDING
  - Audit log tercatat

**Expected Result:** ✅ Admin bisa approve/reject mitra donasi; transisi status sesuai PRD

---

## 5. Help Center & Ticket Management (Task 5)

### List Help Tickets
- [ ] Buka `/admin/help-center`
- [ ] Verify: tampil list tiket dari customer
- [ ] Verify: kolom: order_id, kategori, deskripsi, status, reporter, created_at

### Update Ticket Status
- [ ] Pilih tiket dengan status OPEN atau IN_PROGRESS
- [ ] Ubah status ke RESOLVED
- [ ] Isi admin note: "Masalah telah diselesaikan, produk diganti"
- [ ] Submit update
- [ ] **Verify:**
  - Status tiket berubah ke RESOLVED
  - Admin note tersimpan
  - Audit log tercatat

### Verify Order Status Integration (jika orders table sudah migrated)
- [ ] Customer buat help ticket baru untuk order tertentu
- [ ] Verify: order status berubah ke HELP_REQUESTED
- [ ] Admin resolve ticket
- [ ] Verify: flow handling sesuai PRD Section 14.8

**Expected Result:** ✅ Admin bisa manage help tickets; status transitions sesuai PRD

---

## 6. Revenue & Keuangan Platform (Task 6)

### Dashboard Keuangan
- [ ] Buka `/admin/revenue` atau `/admin/keuangan`
- [ ] **Verify tampilan:**
  - Total revenue dari service fee (5%)
  - Breakdown per source: ORDER_SERVICE_FEE, ADVERTISEMENT
  - Filter by date range
  - Summary cards: total revenue, jumlah transaksi, rata-rata per transaksi

### Export Laporan
- [ ] Pilih date range (mis. last 7 days)
- [ ] Klik "Export CSV"
- [ ] **Verify:** file CSV terdownload dengan kolom: source_type, source_id, amount, service_fee_amount, description, created_at
- [ ] Klik "Export Excel"
- [ ] **Verify:** file Excel (.xlsx) terdownload dengan data yang sama
- [ ] Klik "Export PDF"
- [ ] **Verify:** file PDF terdownload dengan format laporan yang rapi

**Expected Result:** ✅ Admin bisa lihat revenue dashboard dan export dalam 3 format (CSV, Excel, PDF)

---

## 7. Advertisement Management (Task 6)

### List Iklan Pending
- [ ] Buka `/admin/advertisements` atau tab Ads
- [ ] Verify: tampil list iklan dengan status PENDING
- [ ] Verify: kolom: title, advertiser, advertiser_type (UMKM/EXTERNAL), price, service_fee, duration

### Approve Advertisement
- [ ] Pilih iklan dengan status PENDING
- [ ] Klik "Approve" / "Setujui"
- [ ] Isi catatan: "Konten sesuai guidelines"
- [ ] Submit approval
- [ ] **Verify:**
  - Status iklan berubah ke APPROVED
  - `approved_by` = admin user ID
  - `approved_at` timestamp terisi
  - `starts_at` dan `expires_at` terisi (starts_at = now, expires_at = now + duration_days)
  - **CRITICAL:** Record `platform_revenue` tercatat dengan:
    - source_type = "ADVERTISEMENT"
    - source_id = ad.id
    - amount = ad.price
    - service_fee_amount = ad.service_fee
  - Audit log tercatat

### Reject Advertisement
- [ ] Pilih iklan lain dengan status PENDING
- [ ] Klik "Reject" / "Tolak"
- [ ] Isi catatan: "Konten tidak sesuai guidelines"
- [ ] Submit rejection
- [ ] **Verify:**
  - Status iklan berubah ke REJECTED
  - TIDAK ada record platform_revenue (revenue hanya tercatat jika APPROVED)
  - Audit log tercatat

### Verify Advertisement Lifecycle
- [ ] Iklan yang APPROVED → otomatis jadi ACTIVE saat `now >= starts_at`
- [ ] Iklan yang ACTIVE → otomatis jadi EXPIRED saat `now >= expires_at`
- [ ] (Test ini bisa dilakukan dengan mengubah starts_at/expires_at di database untuk testing)

**Expected Result:** ✅ Admin bisa approve/reject iklan; platform_revenue tercatat HANYA saat approve; audit log tercatat

---

## 8. Audit Log Verification

### Check Audit Logs
- [ ] Setelah melakukan semua aksi di atas, buka `/admin/audit-logs` atau query database langsung
- [ ] **Verify semua aksi berikut tercatat di audit_logs:**
  - VERIFY_UMKM_APPROVED / VERIFY_UMKM_REJECTED (target_type=UMKM)
  - MODERATE_USER_WARNING / MODERATE_USER_SUSPEND / MODERATE_USER_APPROVE (target_type=USER)
  - VERIFY_MITRA_DONASI_APPROVED / VERIFY_MITRA_DONASI_REJECTED (target_type=MITRA_DONASI)
  - UPDATE_HELP_TICKET_RESOLVED (target_type=HELP_TICKET)
  - APPROVE_ADVERTISEMENT / REJECT_ADVERTISEMENT (target_type=ADVERTISEMENT)
- [ ] **Verify setiap log entry punya:**
  - actor_id (admin user ID)
  - action (action type)
  - target_type (entity type)
  - target_id (entity ID)
  - note (admin note/reason)
  - created_at (timestamp)

**Expected Result:** ✅ Semua aksi admin tercatat di audit_logs dengan lengkap

---

## 9. Integration Points (Cross-module)

### UMKM Gating Publish (Task 3)
- [ ] UMKM dengan status SUSPENDED coba buat listing baru
- [ ] **Verify:** ditolak dengan error "Akun Anda disuspend, tidak dapat membuat listing"
- [ ] UMKM dengan verification_status != APPROVED coba buat listing
- [ ] **Verify:** ditolak dengan error "Akun Anda belum diverifikasi"

### Service Fee Flow (Task 6)
- [ ] Customer checkout order → bayar via Midtrans sandbox
- [ ] Order selesai (status COMPLETED)
- [ ] **Verify di platform_revenue:**
  - Record baru dengan source_type = "ORDER_SERVICE_FEE"
  - amount = order.subtotal
  - service_fee_amount = order.service_fee (5% dari subtotal)

**Expected Result:** ✅ Gating publish works; service fee tercatat di platform_revenue

---

## 10. Error Handling & Edge Cases

### Validation Errors
- [ ] Coba approve UMKM tanpa isi catatan → error "Catatan wajib diisi"
- [ ] Coba approve iklan tanpa review dulu → error handling proper
- [ ] Coba akses admin endpoint dengan token expired → 401

### Concurrent Actions
- [ ] Admin A approve UMKM X
- [ ] Admin B coba reject UMKM X yang sama → verify handling race condition

### Missing Data
- [ ] Akses detail iklan yang tidak ada (ID invalid) → 404 Not Found
- [ ] Export revenue untuk date range tanpa data → file kosong atau pesan "No data"

**Expected Result:** ✅ Error handling proper; validasi input berfungsi; race condition handled

---

## Summary Checklist

**Task 1 - Auth & RBAC:**
- [ ] Login admin sukses
- [ ] RBAC protection works (401/403)
- [ ] JWT token valid

**Task 2 - Verifikasi UMKM:**
- [ ] List UMKM pending
- [ ] Approve UMKM → status APPROVED, user ACTIVE, audit log
- [ ] Reject UMKM → status REJECTED, user PENDING, audit log

**Task 3 - Moderasi User:**
- [ ] Warning user → status unchanged, audit log
- [ ] Suspend user → status SUSPENDED, audit log
- [ ] Reactivate user → status ACTIVE, audit log

**Task 4 - Verifikasi Mitra Donasi:**
- [ ] List mitra pending
- [ ] Approve mitra → status APPROVED, user ACTIVE, audit log
- [ ] Reject mitra → status REJECTED, user PENDING, audit log

**Task 5 - Help Center:**
- [ ] List help tickets
- [ ] Update ticket status → admin note saved, audit log

**Task 6 - Revenue & Advertisement:**
- [ ] Revenue dashboard tampil
- [ ] Export CSV/Excel/PDF works
- [ ] Approve ad → platform_revenue created, audit log
- [ ] Reject ad → NO platform_revenue, audit log

**Task 7 - Gating Publish:**
- [ ] Suspended UMKM tidak bisa publish
- [ ] Unverified UMKM tidak bisa publish

**Task 8 - Testing & Documentation:**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] This smoke test checklist complete

---

## Notes for Tester

1. **Database Seed:** Pastikan seed data mencakup:
   - 1 admin user
   - 2-3 UMKM pending verification
   - 2-3 mitra donasi pending verification
   - 1-2 advertisements pending approval
   - Sample orders dan help tickets

2. **Audit Log:** Gunakan query berikut untuk verify audit logs:
   ```sql
   SELECT * FROM audit_logs 
   WHERE actor_id = <admin_user_id> 
   ORDER BY created_at DESC 
   LIMIT 20;
   ```

3. **Platform Revenue:** Gunakan query berikut untuk verify revenue:
   ```sql
   SELECT source_type, COUNT(*), SUM(service_fee_amount) as total_fee
   FROM platform_revenue 
   GROUP BY source_type;
   ```

4. **Known Limitations:**
   - Help ticket integration tests skipped karena orders table belum migrated ke PRD schema
   - Test dengan Midtrans sandbox → gunakan test card numbers dari dokumentasi Midtrans

---

**Tester:** _______________  
**Date:** _______________  
**Result:** ☐ PASS  ☐ FAIL  ☐ PARTIAL  
**Notes:** _______________
