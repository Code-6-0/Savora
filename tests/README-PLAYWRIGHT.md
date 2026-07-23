# Playwright E2E Testing Guide - Savora

## Setup

```bash
# Install dependencies
npm install -D @playwright/test

# Install browsers
npx playwright install
```

## Run Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/savora-happy-path.spec.js

# Run with headed browser (visible)
npx playwright test --headed

# Run single test
npx playwright test --grep "E2E-01"

# Debug mode
npx playwright test --debug
```

## Environment Variables

```bash
# .env.test atau export
export BASE_URL=http://localhost:3000
export API_URL=http://localhost:8000
export XENDIT_CALLBACK_TOKEN=your_test_token
```

## Test Files & Scenarios

### File: savora-happy-path.spec.js (MUST Priority)
**Owner:** Nadi Azzada Akbar
- **E2E-01:** Customer Checkout → Midtrans Payment → Order Paid
  - Marketplace browse, select product, checkout
  - Service fee 5% verified in breakdown
  - Midtrans webhook payment (settlement)
  - Pickup code generated

- **E2E-02:** UMKM Prepare Order → Validate Pickup Code
  - UMKM dashboard order list
  - "Siapkan Pesanan" button → Ready for Pickup
  - Customer validates pickup code
  - Order → Completed

- **E2E-03:** Customer Submit Review with Keywords
  - Completed order review form
  - 5-star rating + text comment
  - Keyword selection (enak, segar, dll)
  - Keywords classified & badge updated

### File: savora-edge-cases.spec.js (MUST Priority)
- **E2E-04:** Payment EXPIRED → Stock Returned
  - Order created, Payment Pending
  - 15+ minutes pass / expire webhook
  - Order → Expired, stock restored

- **E2E-05:** Invalid Pickup Code Rejected
  - Order Ready for Pickup
  - Input wrong code → Error message
  - Order status unchanged

- **E2E-06:** Webhook Invalid Token Ignored
  - Webhook with wrong signature_key
  - Payment NOT updated
  - Logged to audit/payment logs

- **E2E-07:** Customer Create Help Ticket
  - Order detail page
  - Click "Butuh Bantuan" → Help form
  - Category: produk_tidak_tersedia / tidak_sesuai_deskripsi
  - Description filled, submitted
  - Order → Help Requested

- **E2E-08:** Review GAWAT Keywords → Admin Flag
  - Review with negative keywords (basi, bau busuk)
  - Keywords classified as GAWAT (level)
  - Admin dashboard shows flag for moderation
  - UMKM badge downgrade pending admin verification

### File: savora-auth-rbac.spec.js (MUST Priority - PRD REVISI #22)
**Authentication & Role-Based Access Control Tests**
- **AUTH-01:** User Register as Customer → Account Created
- **AUTH-02:** Login with Wrong Password → Error & No Session
- **AUTH-03:** Login Success → Token Created & Redirect
- **RBAC-01:** UMKM Access Admin Endpoint → 403 Forbidden
  - Tested endpoints: /admin/users, /admin/revenue, etc.
- **RBAC-02:** Customer Access UMKM Endpoint → 403 Forbidden
  - Tested endpoints: /products POST, /analytics/umkm, etc.
- **RBAC-03:** Unauthenticated User → 401 Unauthorized
  - All protected endpoints without token
- **RBAC-04:** Customer Cannot Edit Other UMKM Product → 403
- **SESSION-01:** Logout Clears Token
- **SESSION-02:** Expired Token Redirects to Login

### File: savora-food-trust-score.spec.js (MUST Priority - PRD Section 12, 13)
**Food Trust Index, Food Score Decay, Dynamic Discount**
- **FTI-01:** UMKM Create Listing → Food Trust Index Calculated
  - Metadata: production time, shelf life, packaging, storage
  - System calculates status: Fresh/Layak Dijual/Segera Dijual/Tidak Layak
  - Display on marketplace

- **FTI-02:** Tidak Layak Konsumsi → Hidden from Marketplace
  - Broken packaging or expired → Food Trust Index rejects
  - Product not visible in marketplace

- **FTI-03:** Segera Dijual Status → Urgency Display
  - f < 0.40 → Segera Dijual status
  - Urgent indicator shown on product card

- **FSD-01:** Food Score Decay (Power γ=0.65)
  - Score decreases over time as product nears expiry
  - Formula: food_score = skor_awal × (sisa_waktu/masa_layak)^0.65

- **FSD-02:** Food Score = 0 → Product Expired & Hidden
  - Product automatically removed from marketplace
  - Listed as Expired in inventory

- **FSD-03:** Color Indicator per Time Remaining
  - Red: < 1 jam, Yellow: 1-3 jam, Green: > 3 jam
  - Matches band skor (Kritis/Segera Ambil/Layak/Sangat Layak)

- **DD-01:** Segera Dijual → Discount Recommendation 35-50%
  - System suggests discount based on FTI status
  - Display in dashboard

- **DD-02:** Guardrail: rescue_price ≥ min_price
  - API rejects if rescue_price < min_price
  - Or auto-adjusts to min_price

- **DD-03:** UMKM Set Final Price within Aturan + Guardrail
  - UMKM chooses diskon in recommended range
  - Price always ≥ min_price guardrail

### File: savora-midtrans-admin.spec.js (MUST Priority - PRD FR-14, #37)
**Midtrans Webhook Signature Verification + Admin Verification/Moderation**
- **MIDTRANS-01:** Valid Signature Webhook → Payment Status Updated
  - SHA512(order_id + status_code + gross_amount + server_key) verified
  - Order status updated to PAID

- **MIDTRANS-02:** Invalid Signature → Webhook Rejected (400/401)
  - Wrong signature_key rejected
  - Payment NOT updated

- **MIDTRANS-03:** No Signature → Rejected
  - Webhook without signature_key

- **MIDTRANS-04:** Webhook Settlement → Pickup Code Generated
  - Order PAID, pickup_code created

- **MIDTRANS-05:** Webhook Expire → Order Expired, Stock Returned
  - status_code 202 or transaction_status = expire
  - Order → EXPIRED, stock reserved released

- **ADMIN-01:** Admin Verify UMKM → UMKM Can Publish
  - Admin approves pending UMKM
  - Status: PENDING → APPROVED
  - UMKM now can publish listings

- **ADMIN-02:** Unverified UMKM Cannot Publish → 403
  - UMKM with PENDING status blocked from POST /products

- **ADMIN-03:** Admin Suspend Listing → Hidden from Marketplace
  - Admin marks listing inactive/suspended
  - Product removed from marketplace visibility

- **ADMIN-04:** Admin Approve Pending Listing
  - Admin reviews & approves new listing
  - Status: PENDING → APPROVED → visible in marketplace

- **ADMIN-05:** Admin Issue Warning to UMKM
  - Admin dashboard → UMKM management
  - Issue warning with reason
  - Logged in audit trail

- **ADMIN-06:** Admin Dashboard Metrics
  - Total UMKM, Customer, Transactions, Revenue, Food Rescued

- **ADMIN-07:** Admin Monitor Transactions
  - Transaction list with filters
  - Payment status, order status, amount, etc.

### File: savora-marketplace-review.spec.js (MUST Priority - FR-05, FR-09, FR-16)
**Marketplace Filter, Review Validation, Keyword Classification**
- **MKT-01:** Browse Marketplace → Products with Food Score & Badges
- **MKT-02:** Filter by Category → Products Filtered Correctly
- **MKT-03:** Filter by Price Range → Products Filtered
- **MKT-04:** Filter by Location → Proximity Filter
- **MKT-05:** Search by Keyword → Search Results
- **MKT-06:** Sort Products → Food Score / Price / Rating

- **REVIEW-01:** Cannot Review Before Completed → 403
  - Order status NOT COMPLETED → review blocked

- **REVIEW-02:** Submit Review with Keywords
  - Customer fills rating, comment, keyword chips
  - Submitted successfully

- **REVIEW-03:** Keywords Classified (AMAN/WARNING/GAWAT)
  - Positive keywords (enak, segar) → AMAN
  - Mild negative (dingin, keras) → WARNING
  - Strong negative (basi, bau busuk) → GAWAT

- **REVIEW-04:** GAWAT Keywords → Admin Flag Auto
  - GAWAT review triggers notification
  - Admin sees flag for verification

- **REVIEW-05:** 3+ GAWAT Keywords from 2+ Customers → Badge Downgraded
  - PRD 12.7 threshold: ≥3 GAWAT from ≥2 different customers
  - UMKM badge → Gawat (requires integration test)

- **BADGE-01:** Product Card Shows Keyword Safety Badge
  - Aman/Warning/Gawat visible per UMKM

- **BADGE-02:** Product Detail Shows UMKM Rating & Badge
  - UMKM info section with rating + keyword badge

### File: savora-comprehensive.spec.js (MUST Priority - FR-10, FR-11)
**Complete Order Flow, Help Tickets, Waste Log**
- **FLOW-01:** Order → Payment → Pickup Code Generated
  - Full customer checkout flow
  - Service fee 5% displayed
  - Midtrans webhook → Order PAID
  - Pickup code generated & visible

- **FLOW-02:** Customer Create Help Ticket
  - Order page → Click "Bantuan"
  - Fill category (produk_tidak_tersedia / tidak_sesuai_deskripsi)
  - Fill description
  - Submit → Order → HELP_REQUESTED

- **FLOW-03:** Admin View Help Ticket Dashboard
  - Admin login
  - Navigate to help tickets
  - List of all help tickets visible

- **FLOW-04:** Admin Resolve Help Ticket
  - Open ticket, fill resolution
  - Mark as resolved
  - Close ticket

- **WASTE-01:** UMKM Create Waste Log Entry
  - UMKM dashboard → Waste Log section
  - Fill form: food_name, category, weight, reason
  - Submit entry saved

- **WASTE-02:** UMKM View Waste Log Summary
  - Dashboard shows total waste summary
  - Stats visible

- **WASTE-03:** Admin Monitor Platform Food Waste
  - Admin reports → Waste section
  - Total waste from platform visible

## Page Element Selectors

```javascript
// Product
[data-testid="product-card"]
[data-testid="food-score"]
[data-testid="rescue-timer"]
[data-testid="keyword-safety-badge"]

// Checkout
[data-testid="subtotal"]
[data-testid="service-fee"]
[data-testid="total-price"]
[data-testid="btn-pay-xendit"]

// Order
[data-testid="order-status"]
[data-testid="pickup-code"]
[data-testid="btn-validate-pickup"]

// Review
[data-testid="star-5"]
[data-testid="keyword-chip-enak"]
[data-testid="btn-submit-review"]

// Help
[data-testid="btn-need-help"]
[data-testid="help-form"]
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm install -D @playwright/test
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000
          API_URL: http://localhost:8000
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Test times out | Increase timeout: `page.waitForLoadState('networkidle', { timeout: 30000 })` |
| Selector not found | Use `page.locator()` with flexible text search: `page.locator('button:has-text("Pesan")')` |
| Webhook not received | Check backend running, verify `XENDIT_CALLBACK_TOKEN` env var |
| Order ID not found | Parse from URL: `page.url().match(/pesanan\/(\d+)/)?.[1]` |
| Login fails | Verify test user account exists in database |

## Reports

After tests run:
- HTML report: `test-results/html/index.html`
- JSON results: `test-results/results.json`
- Screenshots: `test-results/` (on failure)
- Videos: `test-results/` (on failure, if enabled)

Open HTML report:
```bash
npx playwright show-report
```
