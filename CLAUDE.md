# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Savora** is a food rescue marketplace platform that helps UMKM (small businesses) sell surplus food at reduced prices while helping customers access affordable, quality food. The application includes a customer marketplace, UMKM dashboard, admin panel, and integrates with Xendit for cashless payments.

**Tech Stack:**
- **Frontend:** Next.js 16.2+ (React 19), TailwindCSS 4, Recharts
- **Backend:** Go 1.26.2, Fiber v2 (HTTP framework), GORM ORM
- **Database:** PostgreSQL (configured via environment variables)
- **Storage:** Supabase for image uploads
- **Payment:** Xendit (production) / Xendit Sandbox (development)
- **Architecture:** Monorepo with `/frontend` and `/backend` directories

## Development Commands

### Frontend (`cd frontend`)

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint
npm test             # Run Node tests (tests/*.test.js)
```

**Important:** The frontend uses Next.js 16 with webpack (specified in package.json). Building and running requires Node.js.

### Backend (`cd backend`)

```bash
go mod download      # Download dependencies
go run main.go       # Run backend server (localhost:8000)
go build             # Build binary
go test ./...        # Run all tests
go test ./services -v -run TestName  # Run specific test
```

**Environment setup:** Copy `.env.example` to `.env` and configure database credentials, Xendit keys, and Supabase details before running.

### Database

Database migrations are handled automatically by GORM's `AutoMigrate()` on backend startup (see `backend/services/database.go`). The system currently supports these tables:

**Core (Inti MVP):** users, customer_profiles, umkm_profiles, products, orders, payments, reviews, review_keywords, keyword_scores

**Extended (Perluasan):** mitra_donasi_profiles, advertisements, waste_logs, help_tickets, notifications

## Architecture Overview

### Frontend Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── marketplace/  # Customer marketplace
│   │   ├── dashboard/    # Customer dashboard
│   │   ├── akun/         # User account
│   │   └── orders/       # Order tracking
│   ├── components/       # Atomic design structure
│   │   ├── atoms/        # Button, Input, Badge, etc.
│   │   ├── molecules/    # FormGroup, SearchBar, SummaryCard
│   │   ├── organisms/    # DataTable, Sidebar, TopHeader
│   │   └── templates/    # DashboardLayout
│   ├── context/          # React Context (UmkmContext, NotificationContext)
│   ├── lib/              # Utility functions and API calls
│   │   ├── marketplace.js     # Product browsing logic
│   │   ├── orders.js          # Order management
│   │   ├── foodScore.js       # Food Score calculation
│   │   ├── pricing.js         # Dynamic discount calculation
│   │   └── [others].js
│   └── globals.css       # TailwindCSS globals
├── next.config.mjs       # Image remote patterns config
├── tailwind.config.js    # TailwindCSS configuration
└── package.json
```

**Key Patterns:**
- Components use atomic design (atoms → molecules → organisms → templates)
- Context providers wrap the app (UmkmContext for UMKM data, NotificationContext for real-time notifications)
- API calls go through utility functions in `/lib` (not direct fetch in components)
- DashboardLayout provides sidebar navigation and top header

### Backend Structure

```
backend/
├── main.go               # Entry point, Fiber app setup, route initialization
├── models/               # GORM models (User, Product, Order, Payment, etc.)
├── handlers/             # HTTP request handlers for each domain
│   ├── product.go        # Product CRUD and marketplace endpoints
│   ├── order.go          # Order creation and management
│   ├── payment.go        # Payment webhook handling
│   ├── review.go         # Review creation and keyword classification
│   ├── analytics.go      # UMKM analytics and insights
│   ├── ads.go            # Advertisement management
│   └── [others].go
├── services/             # Business logic layer
│   ├── database.go       # Database initialization and auto-migration
│   ├── xendit.go         # Xendit payment integration
│   ├── order.go          # Order processing and state transitions
│   ├── payment.go        # Payment status handling
│   ├── cron.go           # Scheduled tasks (payment expiry, no-show)
│   ├── scheduler.go      # Job scheduler
│   ├── keyword.go        # Keyword classification logic
│   └── [others].go
├── routes/
│   └── routes.go         # Route grouping and setup (products, ads, analytics, waste logs, etc.)
├── go.mod               # Go module definition
└── .env.example         # Environment template
```

**Key Patterns:**
- Models use GORM tags for database mapping and validation
- Handlers focus on HTTP request/response; business logic lives in services
- Transactions used for consistency (e.g., payment processing updates order + revenue + stock atomically)
- Xendit webhook signature verification uses `subtle.ConstantTimeCompare` for security
- Stock reservation is pessimistic (locked during payment pending, released if payment fails)

### API Routes Structure

**Product Routes** (`/api/products/*`):
- `GET /api/products/marketplace` — Browse active products with Food Score
- `GET /api/products/umkm/:umkm_id` — UMKM's own products
- `POST /api/products` — Create product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product

**Order Routes** (`/orders/*` in main.go):
- `POST /orders` — Create order (from customer checkout)
- `GET /orders` — List orders (customer/UMKM/admin)
- `GET /orders/:id` — Order detail
- `PATCH /orders/:id/status` — Update status (Ready for Pickup, Completed)
- `POST /orders/:id/validate-pickup` — Validate pickup code

**Payment Routes** (`/payments/*` in main.go):
- `POST /payments/xendit-webhook` — Xendit callback handler

**Other Routes** (in `routes/routes.go`):
- Analytics, ads, notifications, waste logs, discount calculation

## Key Features & Implementation Details

### 1. Food Trust Index & Food Score Decay

**Location:** `frontend/src/lib/foodScore.js` and `backend/services/*.go`

The Food Score (0-100) decreases as a product approaches expiration using **power decay** (γ=0.65):

```
f = (expires_at - now) / (expires_at - published_at)  [clamped to 0..1]
food_score = round(initial_score × f^0.65)
```

Initial scores:
- Fresh: 100
- Layak Dijual: 85
- Segera Dijual: 70

**Color indicator** (independent of band score):
- Green: > 3 hours remaining
- Yellow: 1-3 hours
- Red: < 1 hour

### 2. Keyword Classification

**Location:** `backend/services/keyword.go`

Reviews include keywords classified into three levels:
- **Aman (Safe):** enak, segar, fresh, bersih, sesuai deskripsi
- **Warning:** kurang segar, dingin, keras, bau kurang sedap, kemasan rusak
- **Gawat (Critical):** basi, bau busuk, berjamur, berlendir, keracunan

Per-UMKM safety badge calculated over 30-day rolling window:
- **Gawat badge:** ≥3 Gawat keywords from ≥2 different customers
- **Warning badge:** ≥3 Warning keywords, or 1-2 Gawat keywords
- **Aman badge:** Otherwise

Review bombing mitigation: reviews only created from Completed orders (1 per order).

### 3. Xendit Payment Integration

**Location:** `backend/services/xendit.go` and `backend/handlers/payment.go`

**Flow:**
1. Customer clicks checkout → `POST /orders` creates order with status `PAYMENT_PENDING`
2. Frontend gets Xendit invoice URL and redirects customer
3. Customer completes payment in Xendit
4. Xendit sends webhook to `POST /payments/xendit-webhook`
5. Backend verifies callback token, processes status (PAID/EXPIRED/FAILED)
6. On PAID: generate pickup code, lock stock until pickup deadline (24 hours)
7. On EXPIRED/FAILED: return stock to available

**Payment Expiry:** Set via `PAYMENT_EXPIRY_SECONDS` env var (default 900 = 15 minutes). Scheduler auto-expires unpaid orders.

**Webhook Verification:** Token comparison using constant-time compare (`subtle.ConstantTimeCompare`) to prevent timing attacks.

### 4. Service Fee Model

Service fee (5%) is **added to customer's total** at checkout:
- `subtotal = rescue_price × quantity`
- `service_fee = 0.05 × subtotal`
- `total_price = subtotal + service_fee`

UMKM receives `subtotal` only; `service_fee` becomes platform revenue. Recorded in `platform_revenue` table for admin reporting.

### 5. Dynamic Discount

**Location:** `backend/handlers/discount.go`

Recommendation based on Food Trust Index status (UMKM chooses final price):
- Fresh (f ≥ 0.75): 10-20% discount
- Layak Dijual (0.40 ≤ f < 0.75): 20-35%
- Segera Dijual (f < 0.40): 35-50%

Guardrail: `min_price` field on products prevents selling below cost.

### 6. Order Status Flow

```
CREATED → PAYMENT_PENDING → [
  PAID → READY_FOR_PICKUP → COMPLETED (via pickup code validation)
       → NO_SHOW (timeout)
  PAYMENT_FAILED
  EXPIRED
]
```

State transitions handled in `backend/services/payment.go` (payment status changes) and `backend/handlers/order.go` (pickup validation).

## Environment Configuration

Create `.env` in both `frontend` and `backend` directories:

**Backend `.env`:**
```
PORT=8000
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=savora
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
SUPABASE_BUCKET_NAME=savora_img
XENDIT_SECRET_KEY=xnd_development_... or xnd_live_...
XENDIT_CALLBACK_TOKEN=your-webhook-token
FRONTEND_BASE_URL=http://localhost:3000 (or production URL)
PAYMENT_EXPIRY_SECONDS=900
```

**Frontend `.env` (if needed):**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Important Coding Patterns

### Database Transactions in Backend

Use `db.Transaction()` for atomic operations involving multiple tables:

```go
return db.Transaction(func(tx *gorm.DB) error {
  // Update payment, order, stock, and revenue all together
  // If any fails, everything rolls back
  return nil
})
```

Example: `backend/services/payment.go` — `processPaymentStatus()` updates payment, order, stock, and revenue atomically.

### Stock Reservation

Stock is locked pessimistically:
1. **Payment Pending:** Reserve quantity with 15-minute timeout
2. **Payment Success:** Lock until pickup deadline (24 hours)
3. **Payment Fail/Expire:** Release immediately via `ReleaseReservedStock()`

Location: `backend/services/order.go`

### Real-time Updates (Frontend)

Use React Context + polling or WebSocket:
- `NotificationContext` manages unread notification count
- `UmkmProvider` maintains UMKM dashboard state
- Polling interval typically 30-60 seconds for non-critical updates

Location: `frontend/src/context/*.js`

### API Error Handling

Backend returns consistent error format:
```json
{
  "error": "Error message here"
}
```

Frontend checks HTTP status codes and displays user-friendly messages via toast or modal.

## Testing

### Backend Tests

Located in `backend/services/*_test.go`:

```bash
go test ./services -v                      # All service tests
go test ./services -v -run TestCalculateFoodScore
go test -cover ./...                       # With coverage
```

Key test files:
- `services/analytics_test.go.skip` — Analytics tests (currently skipped)
- `services/order_test.go` — Order processing
- `services/ads_test.go` — Advertisement logic

### Frontend Tests

Located in `frontend/tests/*.test.js`:

```bash
npm test                    # Run all tests
npm test -- tests/specific.test.js  # Specific test
```

Currently uses Node test runner (no Jest/Vitest configured yet).

## Deployment

**Frontend:** Deploy to Vercel, Netlify, or similar (Next.js hosting)
- Set environment variables (API base URL, Supabase keys)
- Build command: `npm run build`
- Start command: `npm start`

**Backend:** Deploy to Railway, Render, AWS EC2, or similar
- Set all environment variables from `.env.example`
- Build: `go build -o savora-backend main.go`
- Run: `./savora-backend`
- Health check: `GET /` (basic endpoint if available)

**Database:** Use managed PostgreSQL (Supabase, AWS RDS, Railway Postgres)

**Storage:** Configure Supabase bucket for image uploads

## Important Notes

### Discrepancy: Xendit vs Midtrans in Documentation

The PRD references Midtrans, but the actual implementation uses **Xendit**. Ignore Midtrans references when reading older documentation; the code uses Xendit exclusively (see `backend/services/xendit.go`).

### Current Status

Based on recent commits, the system has:
- ✅ Xendit payment integration (CreateInvoice, webhook handling)
- ✅ Product marketplace with Food Score real-time decay
- ✅ Order creation and checkout flow
- ✅ Payment webhook verification and order status transitions
- ✅ Keyword classification for reviews
- ✅ Admin dashboard (basic)
- 🔧 Some features still in Should Have: Waste Log refinement, advanced Analytics, Help Center ticketing

Check `backend/services/database.go` for table status (Inti MVP vs Perluasan).

### Common Pitfalls

1. **Stock Release:** If you modify payment failure handling, ensure `ReleaseReservedStock()` is always called so stock becomes available again.
2. **Pickup Code Generation:** Currently uses Unix nanoseconds modulo. If you need more randomness, consider UUID or crypto.Rand.
3. **Food Score:** Calculated client-side for real-time updates; backend stores a snapshot. Both must use identical `γ=0.65` exponent.
4. **Timezone Issues:** All timestamps should use UTC. Verify backend and database are UTC-aware.
5. **Service Fee:** Always verify fee is **added** to customer total, not subtracted from UMKM amount.

### Git Workflow

- Main branch: `main` (stable, production)
- Feature branches: `feature/name` or `<initials>-description` (e.g., `nadi-lagi`)
- When ready: push to feature branch, create PR to `main`
- Do NOT force-push to `main`

Recent commits show work on Xendit integration and product detail pages. Check git log for ongoing work.

## Quick Links

- **PRD (Product Requirements):** `frontend/docs/PRD.md` — Comprehensive specification (note: references Midtrans in places, but code uses Xendit)
- **Existing Frontend CLAUDE.md:** `frontend/CLAUDE.md` (minimal, references "@AGENTS.md")
- **Database Schema:** Auto-generated by GORM from `backend/models/*.go`
- **API Documentation:** Not auto-generated; refer to route definitions in `backend/routes/routes.go` and `backend/main.go`

## Contact & Context

This is a student competition project (CODE 6.0, Universitas Amikom Yogyakarta) with a team of 5. For questions on design decisions or feature specifications, refer to the PRD first, then check git history for rationale behind recent changes.

---

**Last Updated:** 2026-07-24 based on commit `41556d1` (route refactor). Backend uses Xendit, not Midtrans from PRD.
