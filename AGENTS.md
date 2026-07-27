# Savora — Agent Instructions

Food rescue marketplace. Competition project for CODE 6.0, deadline Jul 25 2026.

## Critical path quirks

**Working directory with spaces:** Project root is `/home/ridwan/Documents/Belajar/Lomba/WEB APP/fixkancuy/Savora/`. Always use `workdir` parameter or quote paths in bash.

**Two sources of truth:**
1. `Savora_PRD_Midtrans_v3.7.md` — business rules, formulas, requirements (REVISI #33-#41 dated Jul 24-25)
2. `CLAUDE.md` — tech stack, architecture, coding standards

**Priority:** PRD v3.7 > executable config (package.json, go.mod) > code > comments.

## Commands that must succeed before task complete

Run from Savora/ directory:

```bash
# Frontend (127 tests, includes mandatory Food Score Decay test cases)
npm test
npm run build

# Backend (60 Go files)
go build -o savora-backend

# Lint (70+ pre-existing warnings OK, don't add new ones)
npm run lint
```

## Dev servers

```bash
# Frontend :3000
npm run dev

# Backend :8000
go run main.go

# Seeder (run from backend/)
go run cmd/seed/main.go
```

## Non-negotiable business rules

### Food Score Decay (PRD 12.6)
Power decay γ=0.65, NOT linear. Test cases in `frontend/tests/foodScore.test.js` MUST pass.

```js
function hitungFoodScore(skorAwal, publishAt, expiresAt, now) {
  const total = expiresAt.getTime() - publishAt.getTime();
  if (total <= 0) return 0;
  let f = (expiresAt.getTime() - now.getTime()) / total;
  f = Math.min(1, Math.max(0, f));
  return Math.round(skorAwal * Math.pow(f, 0.65));
}
```

Initial scores: Fresh=100, Layak Dijual=85, Segera Dijual=70.

### Service Fee
5% added to customer payment, NOT deducted from UMKM revenue.  
`total_price = subtotal + (subtotal * 0.05)`

### Payment Timeout
15 minutes exact. Midtrans Snap default is 24hrs — MUST explicitly set `expiry: { duration: 15, unit: 'minute' }`. No webhook on expiry; scheduler must auto-expire orders.

### Order Status Flow
`CREATED` (transient) → `PAYMENT_PENDING` → `PAID` → `READY_FOR_PICKUP` → `COMPLETED` or `NO_SHOW`.

Full enum: `CREATED, PAYMENT_PENDING, PAID, PAYMENT_FAILED, READY_FOR_PICKUP, COMPLETED, NO_SHOW, CANCELLED, EXPIRED, HELP_REQUESTED`.

### Auth & Registration (REVISI #41)
- Public register = Customer only (no role selection)
- Backend MUST hard-code `role=CUSTOMER`; reject any `role` field in payload
- UMKM upgrade: `/gabung-umkm` → PENDING → Admin APPROVE → role changes atomically
- Login redirects fail-closed: unknown role → delete session → `/login`
- Backend sends role/status in UPPERCASE; frontend compares case-insensitive

### Keyword Classification (PRD 12.7)
Threshold-based, NOT worst-case. Badge requires ≥3 reviews in 30-day rolling window:
- **Gawat**: ≥3 "Gawat" keywords from ≥2 customers
- **Warning**: ≥3 "Warning" keywords, or 1-2 "Gawat"
- **Aman**: everything else

Do NOT change to "1 bad keyword = instant red badge".

## Tech stack (locked)

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Next.js 16.2.11, React 19.2.4, Tailwind v4 | JavaScript `.js`, NOT TypeScript |
| Backend | Go 1.26.2, Fiber v2.52.14, GORM 1.31.2 | Flat structure (no clean architecture) |
| Database | PostgreSQL via Supabase | GORM + `DATABASE_URL` only, NO Supabase SDK |
| Payment | Midtrans Snap Sandbox | Legacy Xendit service exists (main.go:36) |
| Auth | JWT + bcrypt | `golang.org/x/crypto`, `github.com/golang-jwt/jwt/v5` |

## Architecture quirks

**Backend dual routing:**
- Inline routes in `main.go` setupRoutes(): `/api/products/*`, `/orders`, `/payments`, `/reviews` (legacy, other team members)
- Centralized routes in `routes/routes.go`: `/api/auth/*`, `/api/admin/*`, `/api/me` (newer, auth/admin modules)
- All new routes MUST go through `routes/routes.go` with `/api` prefix
- DO NOT restructure or move files owned by other team members

**Frontend atomic design:**
- Use existing components before creating new: atoms (Badge, Button, Input), molecules (SearchBar, FormGroup), organisms (DataTable, Sidebar, TopHeader), templates (DashboardLayout)
- JavaScript only; Next.js 16 + React 19 have breaking changes — read `node_modules/next/dist/docs/` if unsure
- See `frontend/AGENTS.md` for Next.js 16/React 19 quirks

**Design tokens:** Single source = `frontend/src/app/globals.css` (1417 lines).
- Primary: `--primary: #1D6840` (Tailwind v4), legacy: `--primary-color: #0d8a4d`
- Always use CSS variables, never hardcode hex
- Don't install new UI libraries

## Module ownership (do not modify without coordinating)

- **Richard**: `/marketplace`, `/marketplace/[id]`, landing, `src/lib/{foodScore,marketplace,reviews,ads}.js`
- **UMKM/Order team**: `/dashboard`, `/produk`, `/pesanan`, `/analitik`, `/insight`, `/profil`
- **Alia (Admin)**: `/admin/*`, `/mitra-donasi`, auth system, revenue dashboard

## Known schema mismatches

**Team decision (21 Jul 2026):** Schema FOLLOWS PRD Section 18. Migrate ONLY when task requires it.

- `orders`: uses `customer_name` string (PRD: `customer_id` FK), `total_amount` (PRD: `subtotal`/`service_fee`/`total_price`), missing `pickup_code`/`reserved_until`, Indonesian status (PRD: English enum)
- `reviews`: uses `sentiment` (Positif/Netral/Negatif) instead of `review_keywords` + `keyword_scores` tables
- `products`: missing `min_price` (dynamic discount guardrails) and `food_score` (locked initial score)
- `umkm_profiles`: missing `keyword_safety_level` (Aman/Warning/Gawat badge)

**Migration rules:**
1. ADD columns first (AutoMigrate), don't drop data
2. Update affected handlers minimally
3. Report changes to file owners

## Common mistakes to avoid

1. **Food Score**: Power decay γ=0.65, NOT linear
2. **Service fee**: Added to customer (× 1.05), NOT deducted from UMKM
3. **Payment timeout**: 15 minutes, not 10 or 20
4. **Midtrans expiry**: MUST set `expiry: { duration: 15, unit: 'minute' }` explicitly
5. **Order status**: English enum (`PAID`, `COMPLETED`), not Indonesian
6. **Register endpoint**: Hard-code `role=CUSTOMER`; reject role injection
7. **Database access**: GORM only, NO Supabase SDK
8. **Keyword badge**: Threshold-based, NOT worst-case

## Platform quirk

Linux system, but `playwright.config.js:32` expects `./savora-backend.exe`. Edit or symlink before E2E tests.

## Test locations

- Frontend: `frontend/tests/*.test.js` (12 files, Node test runner)
- Backend: `backend/handlers/*_test.go`
- E2E: `tests/e2e/*.spec.js` (9 spec files)

## Environment setup

Copy `.env.example` files:
- `backend/.env.example` → `backend/.env` (DB_*, JWT_SECRET, Midtrans keys, Supabase storage)
- `frontend/.env.example` → `frontend/.env.local` (NEXT_PUBLIC_API_URL)

**Database access:** `main.go` requires individual `DB_*` variables. Seeder supports both `DATABASE_URL` and `DB_*` with `DATABASE_URL` as priority.

## Response format

Backend API: `{ "success": bool, "data": ..., "error": { "code", "message" } }`  
Error messages: Indonesian for users, English for codes (`UNAUTHORIZED`, `VALIDATION_ERROR`).

All admin actions MUST be logged to `audit_logs` (actor_id, action, target_type, target_id, note).

## References

- Full requirements: `Savora_PRD_Midtrans_v3.7.md`
- Tech details: `CLAUDE.md`
- Frontend: `frontend/AGENTS.md`
- Visual refs: `docs/design/01-Beranda.png` through `08-Pick-up.png`
