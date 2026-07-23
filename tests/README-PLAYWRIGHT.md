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

## Test Scenarios

### E2E-01: Happy Path — Order → Payment → Completed
- Customer checkout
- Service fee 5% verified
- Xendit webhook payment (PAID)
- Pickup code generated
- Status: Paid

### E2E-02: UMKM Prepare & Pickup
- UMKM dashboard order list
- "Siapkan Pesanan" button → Ready for Pickup
- Customer validates pickup code
- Order → Completed

### E2E-03: Review with Keywords
- Customer submits rating (1-5 stars)
- Keywords selected (enak, segar, basi, etc)
- Keywords classified (Aman/Warning/Gawat)
- UMKM badge updated

### E2E-04: Payment Expired
- Order created, Payment Pending
- 15+ minutes pass (mocked)
- Webhook `invoice.expired` OR scheduler detects
- Order → Expired
- Stock returned to product

### E2E-05: Invalid Pickup Code
- Order Ready for Pickup
- Input wrong code → Error shown
- Status unchanged

### E2E-06: Invalid Webhook Token
- Webhook received with wrong `x-callback-token`
- Payment NOT updated
- Logged to payment_logs

### E2E-07: Help Ticket
- Customer clicks "Butuh Bantuan"
- Category: produk_tidak_tersedia / tidak_sesuai_deskripsi
- Description: custom issue
- Order → Help Requested

### E2E-08: Keyword GAWAT → Admin Flag
- Review submitted with "basi", "bau busuk"
- Keywords classified as GAWAT
- Admin dashboard shows flag
- UMKM badge not downgraded yet (pending verification)

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
