# 🌿 Savora - Food Rescue Marketplace

> **Menyelamatkan makanan, menghemat biaya, mengurangi limbah.**

Savora adalah platform marketplace yang menghubungkan UMKM kuliner dengan customer untuk menyelamatkan makanan surplus yang masih layak konsumsi dengan harga terjangkau.

**Dibangun untuk:** CODE 6.0 — Software Development Competition (AMCC, Universitas Amikom Yogyakarta)  
**Tim:** AmbaTeam (5 orang)  
**Deadline:** 25 Juli 2026

---

## 🚀 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 16 (React 19) |
| **Backend** | Go + Fiber v2 |
| **ORM** | GORM |
| **Database** | PostgreSQL (Supabase managed) |
| **Payment** | Midtrans Snap (Sandbox) |
| **Deployment** | Vercel (frontend) + Railway/Render (backend) |

---

## ✨ Fitur Utama (MVP)

### Core Features (P0)
- ✅ **Autentikasi 4 Role**: Customer, UMKM, Admin, Mitra Donasi
- ✅ **Food Trust Index**: Klasifikasi keamanan makanan berdasarkan metadata
- ✅ **Food Score Decay**: Urgensi real-time dengan power decay (γ = 0.65)
- ✅ **Dynamic Discount**: Rule-based discount berdasarkan status Food Trust Index
- ✅ **Keyword Classification**: Badge keamanan UMKM dari analisis review
- ✅ **Cashless Checkout**: Midtrans Snap sandbox + service fee 5%
- ✅ **Self-Pickup**: Pickup code + batas waktu pickup
- ✅ **Order Tracking**: Status order real-time
- ✅ **Dashboard Customer**: Riwayat order, review
- ✅ **Dashboard UMKM**: Kelola listing, order, analitik sederhana
- ✅ **Dashboard Admin**: Verifikasi UMKM, moderasi listing/user, monitoring transaksi

### Should Have (P1)
- ✅ **Iklan UMKM & Pihak Ketiga**: Submit iklan + persetujuan admin
- ✅ **Verifikasi Mitra Donasi**: Registrasi + verifikasi admin
- ✅ **Dashboard Keuangan Platform**: Revenue tracking + export CSV
- ✅ **Help Center**: Laporan kendala customer + penanganan admin

---

## 📋 Prerequisites

- **Node.js** >= 18.x
- **Go** >= 1.21
- **PostgreSQL** >= 14 (atau akses ke Supabase)
- **Git**
- **Midtrans Sandbox Account** (untuk payment gateway)

---

## 🛠️ Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd Savora-1
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
go mod download

# Copy environment template
cp .env.example .env

# Edit .env dengan kredensial Anda:
# - DATABASE_URL: PostgreSQL connection string
# - JWT_SECRET: Generate random string untuk production
# - MIDTRANS_SERVER_KEY: Dari Midtrans Dashboard
# - MIDTRANS_CLIENT_KEY: Dari Midtrans Dashboard

# Run database migration (otomatis saat start)
# Seed data otomatis termasuk 4 demo user

# Run backend
go run main.go

# (Optional) Seed database dengan data testing
# Jalankan perintah ini untuk membuat sample data:
# - 1 admin user (admin@savora.com / admin123)
# - 2-3 UMKM users (beberapa PENDING, beberapa ACTIVE)
# - 2-3 Mitra Donasi users (PENDING)
# - Sample products, orders, advertisements
go run cmd/seed/main.go
```

Backend akan berjalan di **http://localhost:3001**

**PENTING:** Database akan di-migrate otomatis saat backend pertama kali jalan. Seed data opsional tapi sangat direkomendasikan untuk development & testing.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local dengan nilai Anda:
# - NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
# - NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=<your-client-key>

# Run frontend development server
npm run dev
```

Frontend akan berjalan di **http://localhost:3000**

---

## 👤 Default Users (Seed Data)

Setelah backend pertama kali dijalankan, database akan di-seed dengan 4 demo user:

| Role | Email | Password | Status |
|------|-------|----------|--------|
| **Admin** | admin@savora.com | admin123 | ACTIVE |
| **Customer** | customer@savora.com | customer123 | ACTIVE |
| **UMKM** | umkm@savora.com | umkm123 | ACTIVE (APPROVED) |
| **Mitra Donasi** | mitra@savora.com | mitra123 | PENDING |

---

## 📁 Project Structure

```
Savora-1/
├── backend/                 # Go + Fiber backend
│   ├── main.go             # Entry point
│   ├── database/           # Database connection & migration
│   ├── models/             # GORM models
│   ├── handlers/           # HTTP handlers
│   ├── middleware/         # Auth, RBAC, audit log
│   └── routes/             # Route definitions
├── frontend/               # Next.js frontend
│   └── src/
│       ├── app/            # Next.js App Router
│       ├── components/     # Atomic Design components
│       │   ├── atoms/      # Button, Input, Badge, etc.
│       │   ├── molecules/  # SearchBar, FormGroup, etc.
│       │   └── organisms/  # DataTable, Sidebar, etc.
│       └── lib/            # API client, auth utils
├── docs/
│   ├── SAVORA_PRD.md      # Product Requirements (sumber kebenaran)
│   └── design/            # UI references (PNG)
├── CLAUDE.md              # Panduan development
└── README.md              # This file
```

---

## 🔗 API Endpoints

**Base URL:** `http://localhost:3001/api`

### Authentication
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login user
- `GET /me` - Get profil user (protected)
- `PATCH /me` - Update profil user (protected)

### Products (Marketplace)
- `GET /products/marketplace` - Browse rescue deals
- `POST /products` - Create listing (UMKM)
- `GET /products/{id}` - Detail produk
- `PATCH /products/{id}` - Edit listing (UMKM/Admin)
- `DELETE /products/{id}` - Hapus listing (UMKM/Admin)

### Orders
- `POST /orders` - Buat order (Customer)
- `GET /orders` - List order (role-based)
- `GET /orders/{id}` - Detail order
- `PATCH /orders/{id}/status` - Update status (UMKM/Admin)
- `POST /orders/{id}/validate-pickup` - Validasi pickup code (UMKM)

### Reviews
- `POST /reviews` - Buat review dengan keyword (Customer)
- `GET /reviews/keywords/{umkm_id}` - Keyword safety score (Public)

### Admin - Verifikasi & Moderasi
- `GET /admin/users` - List semua user
- `PATCH /admin/users/{id}/moderate` - Moderasi user (warning/suspend/approve)
- `PATCH /admin/umkm/{id}/verification` - Verifikasi UMKM (approve/reject)

### Admin - Mitra Donasi
- `GET /admin/mitra-donasi` - List pendaftar mitra donasi
- `PATCH /admin/mitra-donasi/{id}/verify` - Verifikasi mitra (approve/reject)

### Admin - Iklan
- `POST /advertisements` - Submit iklan (UMKM/External)
- `GET /advertisements` - List iklan (Admin/UMKM)
- `PATCH /advertisements/{id}/status` - Approve/reject iklan (Admin)
- `GET /advertisements/active` - Iklan aktif untuk marketplace (Public)

### Admin - Keuangan
- `GET /admin/revenue` - Dashboard revenue platform
- `GET /admin/revenue/export?format={csv|excel|pdf}&start=YYYY-MM-DD&end=YYYY-MM-DD` - Export laporan

### Help Center
- `POST /help-tickets` - Buat ticket bantuan (Customer)
- `GET /help-tickets` - List tickets (Admin)
- `PATCH /help-tickets/{id}/status` - Update status ticket (Admin)

**Detail lengkap:** 
- **PRD Section 19:** [docs/SAVORA_PRD.md](docs/SAVORA_PRD.md) Section 19
- **Admin Endpoints:** [docs/admin-endpoints.md](docs/admin-endpoints.md)

---

## 🚢 Deployment

### Frontend (Vercel)

1. Push repo ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
   - `NEXT_PUBLIC_MIDTRANS_SNAP_URL`
4. Deploy

### Backend (Railway/Render)

1. Push repo ke GitHub
2. Create new service di [railway.app](https://railway.app) atau [render.com](https://render.com)
3. Connect GitHub repo
4. Set environment variables (semua dari `.env.example`)
5. Provision PostgreSQL database (managed)
6. Set `DATABASE_URL` dari database credentials
7. Deploy

**PENTING:** Ganti `JWT_SECRET` dengan random string di production!

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests (unit + integration)
go test ./... -v

# Run specific package tests
go test ./handlers -v        # Handler integration tests
go test ./middleware -v      # Auth & RBAC tests
go test ./tests -v           # Business logic tests
```

**Integration Tests Coverage:**
- ✅ Auth & RBAC middleware (JWT validation, role-based access)
- ✅ UMKM verification flow (approve/reject + audit log)
- ✅ User moderation (warning/suspend/approve + audit log)
- ✅ Mitra Donasi verification (approve/reject + audit log)
- ✅ Advertisement approval/rejection + platform_revenue creation
- ⏭️ Help ticket management (skipped - requires orders table migration)

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual Smoke Testing

Comprehensive end-to-end smoke test checklist untuk admin module:

📋 **[docs/admin-smoke-test.md](docs/admin-smoke-test.md)**

Checklist mencakup:
- Login & RBAC protection
- Verifikasi UMKM (approve/reject)
- Moderasi user (warning/suspend/reactivate)
- Verifikasi Mitra Donasi
- Help Center & ticket management
- Revenue dashboard & export (CSV/Excel/PDF)
- Advertisement approval & platform_revenue
- Audit log verification

### Critical Business Logic Tests

Lihat test files untuk:
- Food Score Decay calculation ([backend/tests/food_score_test.go](backend/tests/food_score_test.go))
- Service Fee 5% calculation
- Dynamic Discount rules
- Midtrans signature verification
- UMKM verification flow ([backend/handlers/admin_umkm_test.go](backend/handlers/admin_umkm_test.go))
- User moderation flow ([backend/handlers/admin_moderation_test.go](backend/handlers/admin_moderation_test.go))
- Advertisement approval flow ([backend/handlers/advertisement_test.go](backend/handlers/advertisement_test.go))

---

## 📚 Dokumentasi Lengkap

- **PRD (Product Requirements):** [docs/SAVORA_PRD.md](docs/SAVORA_PRD.md)
- **Development Guide:** [CLAUDE.md](CLAUDE.md)
- **UI Design References:** [docs/design/](docs/design/)

---

## 👥 Tim AmbaTeam

- **Member 1** - Wa Ode Nur Alia (Admin Platform)
- **Member 2** - ...
- **Member 3** - ...
- **Member 4** - ...
- **Member 5** - ...

---

## 📄 License

Copyright © 2026 AmbaTeam. All rights reserved.

Dibangun untuk CODE 6.0 Competition - AMCC, Universitas Amikom Yogyakarta.

---

## 🙏 Acknowledgments

- **Universitas Amikom Yogyakarta** - Penyelenggara CODE 6.0
- **Midtrans** - Payment gateway sandbox
- **Supabase** - Managed PostgreSQL database
- **Vercel & Railway** - Deployment platform
