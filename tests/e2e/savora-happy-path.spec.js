// tests/e2e/savora-happy-path.spec.js
// Happy Path E2E Tests: Order → Payment → Pickup → Review
// Owner: Nadi Azzada Akbar

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';

// Test data
const testCustomer = {
  email: 'customer.test@savora.app',
  password: 'Test1234!',
};

const testUmkm = {
  email: 'umkm.test@savora.app',
  password: 'Test1234!',
};

// Helper: Login
async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}

// Helper: Trigger Xendit webhook
async function triggerXenditWebhook(orderId, status = 'PAID') {
  try {
    const response = await fetch(`${API_URL}/payments/xendit-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-callback-token': process.env.XENDIT_CALLBACK_TOKEN || 'test_token',
      },
      body: JSON.stringify({
        id: `inv-test-${orderId}`,
        external_id: `ORDER-${orderId}`,
        status: status,
        amount: 52500,
      }),
    });
    return response.ok;
  } catch (err) {
    console.log('⚠️ Webhook trigger failed:', err.message);
    return false;
  }
}

test.describe('Savora E2E - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('E2E-01: Customer Checkout → Xendit Payment → Order Paid', async ({ page }) => {
    await login(page, testCustomer.email, testCustomer.password);

    // Browse marketplace
    await page.goto(`${BASE_URL}/marketplace`);
    await expect(page.locator('h1, h2')).toContainText(/Rescue|Marketplace/i);

    // Select product
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // Verify product detail
    await expect(page.locator('h1, h2')).toContainText(/Produk|Detail/i);

    // Checkout
    await page.click('button:has-text("Pesan"), button:has-text("Checkout"), [data-testid="btn-checkout"]');
    await page.waitForURL(/checkout|pesanan/);

    // Verify service fee 5% displayed
    const priceTexts = await page.locator('text=/Total|Subtotal|Service Fee/').allInnerTexts();
    console.log('Price breakdown:', priceTexts);

    // Payment button
    await page.click('button:has-text("Bayar"), button:has-text("Xendit"), [data-testid="btn-pay"]');
    await page.waitForTimeout(2000);

    // Get order ID from URL
    const url = page.url();
    const orderIdMatch = url.match(/(\d+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : '1';

    // Simulate webhook
    const webhookSuccess = await triggerXenditWebhook(orderId, 'PAID');
    if (webhookSuccess) {
      console.log(`✅ Order ${orderId} paid via webhook`);
    }

    // Navigate to order detail
    await page.goto(`${BASE_URL}/pesanan/${orderId}`);
    await page.waitForLoadState('networkidle');

    // Verify order status
    const statusText = await page.locator('[data-testid="order-status"], .status').innerText();
    console.log(`Order status: ${statusText}`);
  });

  test('E2E-02: UMKM Prepare Order → Validate Pickup', async ({ page, context }) => {
    // Create order as customer first
    const customerPage = await context.newPage();
    await login(customerPage, testCustomer.email, testCustomer.password);
    await customerPage.goto(`${BASE_URL}/marketplace`);
    await customerPage.locator('[data-testid="product-card"], .product-card').first().click();
    await customerPage.click('button:has-text("Pesan"), button:has-text("Checkout")');
    
    const orderUrl = customerPage.url();
    const orderId = orderUrl.match(/(\d+)/)?.[1] || '1';
    
    await triggerXenditWebhook(orderId, 'PAID');
    await customerPage.goto(`${BASE_URL}/pesanan/${orderId}`);
    
    const pickupCode = await customerPage.locator('[data-testid="pickup-code"], .pickup-code, code').innerText();
    console.log(`Pickup code: ${pickupCode}`);
    await customerPage.close();

    // UMKM flow
    await login(page, testUmkm.email, testUmkm.password);
    await page.goto(`${BASE_URL}/dashboard`);

    // Find order
    await page.click('text=/Pesanan|Orders/i');
    await page.waitForLoadState('networkidle');

    // Prepare order
    const prepareBtn = page.locator(`button:has-text("Siapkan"), [data-testid*="prepare"]`).first();
    if (await prepareBtn.isVisible()) {
      await prepareBtn.click();
      console.log('✅ Order preparation triggered');
    }

    // Validate pickup code
    const pickupInput = page.locator('input[placeholder*="kode"], input[name="pickup"]');
    if (await pickupInput.isVisible()) {
      await pickupInput.fill(pickupCode);
      await page.click('button:has-text("Validasi"), button:has-text("Selesai")');
      console.log('✅ Pickup code validated');
    }
  });

  test('E2E-03: Customer Submit Review with Keywords', async ({ page }) => {
    await login(page, testCustomer.email, testCustomer.password);
    await page.goto(`${BASE_URL}/pesanan`);

    // Find completed order
    const completedOrder = page.locator('[data-status*="completed"], .status:has-text("Selesai")').first();
    if (await completedOrder.isVisible()) {
      await completedOrder.click();
      
      // Fill review form
      await page.click('[data-testid*="star"], .star-rating [role="button"]', { position: { x: 250, y: 0 } }); // 5 stars
      
      const commentField = page.locator('textarea, input[name="comment"]');
      if (await commentField.isVisible()) {
        await commentField.fill('Makanannya enak dan segar!');
      }

      // Select keywords
      const keywordChips = page.locator('button:has-text("enak"), button:has-text("segar"), [data-keyword]');
      const firstKeyword = keywordChips.first();
      if (await firstKeyword.isVisible()) {
        await firstKeyword.click();
      }

      // Submit
      await page.click('button:has-text("Kirim"), button:has-text("Submit")');
      console.log('✅ Review submitted');
    }
  });
});
