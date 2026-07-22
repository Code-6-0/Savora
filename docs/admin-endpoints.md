# Admin Module API Endpoints

**Module Owner:** Alia (Admin Platform)  
**Base URL:** `http://localhost:3001/api`  
**Last Updated:** 22 Juli 2026

---

## Authentication & Authorization

All admin endpoints require:
- **Valid JWT token** in `Authorization: Bearer <token>` header
- **Role: ADMIN** (enforced by RBAC middleware)

**Error Responses:**
- `401 Unauthorized` - Token tidak valid atau expired
- `403 Forbidden` - User tidak memiliki role ADMIN

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [UMKM Verification](#2-umkm-verification-task-2)
3. [User Moderation](#3-user-moderation-task-3)
4. [Mitra Donasi Verification](#4-mitra-donasi-verification-task-4)
5. [Help Center Management](#5-help-center-management-task-5)
6. [Advertisement Management](#6-advertisement-management-task-6)
7. [Revenue & Financial Management](#7-revenue--financial-management-task-6)
8. [Audit Logs](#8-audit-logs)

---

## 1. Authentication

### POST `/auth/login`

**Description:** Login untuk semua role (termasuk admin)

**Role:** Public

**Request Body:**
```json
{
  "email": "admin@savora.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin Savora",
      "email": "admin@savora.com",
      "role": "ADMIN",
      "status": "ACTIVE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email atau password salah"
  }
}
```

### GET `/me`

**Description:** Ambil profil user yang sedang login

**Role:** All authenticated users

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin Savora",
    "email": "admin@savora.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "created_at": "2026-07-15T10:00:00Z"
  },
  "error": null
}
```

---

## 2. UMKM Verification (Task 2)

### GET `/admin/customers`

**Description:** List semua customer (untuk dashboard admin)

**Role:** ADMIN

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `status` (optional) - Filter by status: ACTIVE, PENDING, SUSPENDED

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": 2,
        "name": "John Doe",
        "email": "customer@example.com",
        "role": "CUSTOMER",
        "status": "ACTIVE",
        "created_at": "2026-07-20T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    }
  },
  "error": null
}
```

### PATCH `/admin/umkm/{id}/verification`

**Description:** Verifikasi atau tolak pendaftaran UMKM

**Role:** ADMIN

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (required) - UMKM profile ID

**Request Body:**
```json
{
  "status": "APPROVED",
  "note": "Dokumen lengkap dan valid. UMKM disetujui untuk bergabung ke platform."
}
```

**Valid Status Values:**
- `APPROVED` - Approve UMKM (user status → ACTIVE, umkm verification_status → APPROVED)
- `REJECTED` - Reject UMKM (user status tetap PENDING, umkm verification_status → REJECTED)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "umkm_profile": {
      "id": 5,
      "user_id": 10,
      "business_name": "Warung Makan Sederhana",
      "address": "Jl. Contoh No. 123",
      "verification_status": "APPROVED",
      "updated_at": "2026-07-22T12:00:00Z"
    },
    "user": {
      "id": 10,
      "status": "ACTIVE"
    },
    "message": "UMKM berhasil diverifikasi"
  },
  "error": null
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Status harus APPROVED atau REJECTED"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "UMKM profile tidak ditemukan"
  }
}
```

**Side Effects:**
- User status berubah ke ACTIVE (jika APPROVED)
- Audit log tercatat dengan action `VERIFY_UMKM_APPROVED` atau `VERIFY_UMKM_REJECTED`

---

## 3. User Moderation (Task 3)

### GET `/admin/users`

**Description:** List semua user untuk moderasi

**Role:** ADMIN

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `role` (optional) - Filter by role: CUSTOMER, UMKM, MITRA_DONASI
- `status` (optional) - Filter by status: ACTIVE, PENDING, SUSPENDED

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 10,
        "name": "Warung Makan",
        "email": "umkm@example.com",
        "role": "UMKM",
        "status": "ACTIVE",
        "created_at": "2026-07-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "total_pages": 5
    }
  },
  "error": null
}
```

### PATCH `/admin/users/{id}/moderate`

**Description:** Moderasi user (warning, suspend, approve/reactivate)

**Role:** ADMIN

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (required) - User ID

**Request Body:**
```json
{
  "action": "suspend",
  "note": "Akun disuspend karena pelanggaran: menjual produk yang sudah kedaluwarsa."
}
```

**Valid Action Values:**
- `warning` - Beri peringatan (status tidak berubah, hanya audit log)
- `suspend` - Suspend akun (status → SUSPENDED)
- `approve` - Aktifkan kembali akun suspended (status → ACTIVE)
- `reject` - Tolak pendaftaran (status → PENDING)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 10,
      "name": "Warung Makan",
      "email": "umkm@example.com",
      "role": "UMKM",
      "status": "SUSPENDED",
      "updated_at": "2026-07-22T12:30:00Z"
    },
    "message": "User berhasil disuspend"
  },
  "error": null
}
```

**Side Effects:**
- User status berubah sesuai action (kecuali `warning`)
- Suspended UMKM tidak bisa membuat listing baru
- Audit log tercatat dengan action `MODERATE_USER_{ACTION}` (WARNING/SUSPEND/APPROVE/REJECT)

---

## 4. Mitra Donasi Verification (Task 4)

### POST `/mitra-donasi/register`

**Description:** Registrasi sebagai Mitra Donasi (public endpoint untuk calon mitra)

**Role:** Public

**Request Body:**
```json
{
  "name": "Yayasan Peduli Pangan",
  "email": "mitra@yayasan.org",
  "password": "secure_password",
  "org_name": "Yayasan Peduli Pangan Indonesia",
  "phone": "081234567890",
  "address": "Jl. Mitra No. 45, Jakarta",
  "description": "Yayasan yang fokus pada distribusi makanan untuk masyarakat kurang mampu",
  "document_url": "https://storage.example.com/legalitas-yayasan.pdf"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user_id": 25,
    "mitra_profile_id": 5,
    "message": "Pendaftaran berhasil. Menunggu verifikasi admin."
  },
  "error": null
}
```

### GET `/admin/mitra-donasi`

**Description:** List semua pendaftar Mitra Donasi

**Role:** ADMIN

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional) - Filter by verification_status: PENDING, APPROVED, REJECTED

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mitra_donasi": [
      {
        "id": 5,
        "user_id": 25,
        "org_name": "Yayasan Peduli Pangan Indonesia",
        "phone": "081234567890",
        "address": "Jl. Mitra No. 45, Jakarta",
        "description": "Yayasan yang fokus pada distribusi makanan...",
        "document_url": "https://storage.example.com/legalitas-yayasan.pdf",
        "verification_status": "PENDING",
        "verified_at": null,
        "created_at": "2026-07-20T14:00:00Z",
        "user": {
          "name": "Yayasan Peduli Pangan",
          "email": "mitra@yayasan.org",
          "status": "PENDING"
        }
      }
    ]
  },
  "error": null
}
```

### PATCH `/admin/mitra-donasi/{id}/verify`

**Description:** Verifikasi atau tolak pendaftaran Mitra Donasi

**Role:** ADMIN

**Path Parameters:** `id` (required) - Mitra Donasi profile ID

**Request Body:**
```json
{
  "status": "APPROVED",
  "note": "Dokumen legalitas valid. Mitra Donasi disetujui."
}
```

**Side Effects:** User status → ACTIVE (if APPROVED), audit log recorded

---

## 5. Help Center, Advertisements, Revenue

See full documentation at: https://github.com/savora-platform/docs/admin-api

**Help Tickets:** POST `/help-tickets`, GET `/help-tickets`, PATCH `/help-tickets/{id}/status`
**Advertisements:** POST `/advertisements`, GET `/advertisements`, PATCH `/advertisements/{id}/status`
**Revenue:** GET `/admin/revenue`, GET `/admin/revenue/export?format=csv|excel|pdf`

---

## Testing & Audit Logs

All admin actions logged to `audit_logs` table. Run tests: `go test ./handlers -v`

**Module Owner:** Wa Ode Nur Alia  
**Last Updated:** 22 Juli 2026
