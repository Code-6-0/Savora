// tests/e2e/savora-xendit-transaction.spec.js
// End-to-End Testing: Complete Xendit Transaction Flow
// Covers: Checkout → Payment → Webhook → Paid → Pickup Code

const { test, expect } = require('@playwright/test');
const {
  login,
  waitForElement,
  generateXenditInvoice,
  triggerXenditWebhook,
  verifyOrderPending,
  verifyOrderPaid,
  waitForOrderStatus,
} = require('./test-helpers');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Xendit Transaction Flow', () => {
  test('Happy Path: Checkout → Payment → Paid → Pickup Code', async ({ page, request }) => {
    // Step 1: Login as customer
    await login(page, 'customer');
    await expect(page).toHaveURL(/\/marketplace|\/dashboard/);

    // Step 2: Navigate to marketplace and select product
    await page.goto(`${BASE_URL}/marketplace`);
    await page.waitForLoadState('networkidle');

    // Find first product and get its ID
    const productLink = await page.locator('a[href*="/marketplace/"]').first();
    const href = await productLink.getAttribute('href');
    const productId = href.split('/').pop();

    // Step 3: Open product detail
    await page.goto(`${BASE_URL}/marketplace/${productId}`);
    await page.waitForLoadState('networkidle');

    // Verify product detail loads
    const productName = await page.locator('h1, h2').first().textContent();
    expect(productName).toBeTruthy();

    // Step 4: Select quantity and click checkout
    const quantityInput = await page.locator('input[name="quantity"], #quantity');
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('2');
    }

    // Click "Selamatkan Sekarang" or checkout button
    const checkoutButton = await page.locator(
      'button:has-text("Selamatkan"), button:has-text("Beli"), button:has-text("Checkout")'
    );
    await checkoutButton.click();

    // Step 5: Verify redirect to checkout page
    await page.waitForURL(/\/marketplace\/checkout/);
    expect(page.url()).toContain('product_id=');
    expect(page.url()).toContain('qty=');

    // Step 6: Verify checkout page loads with product summary
    await waitForElement(page, '.savora-checkout-summary, .savora-product-thumb');
    
    // Verify price breakdown
    const subtotalText = await page.locator('text=Subtotal').textContent();
    expect(subtotalText).toBeTruthy();

    const serviceFeeText = await page.locator('text=Service Fee').textContent();
    expect(serviceFeeText).toContain('5%');

    // Step 7: Fill billing form
    await page.fill('input[name="billingName"]', 'Test Customer Xendit');
    await page.fill('input[name="billingEmail"]', `test.xendit+${Date.now()}@example.com`);
    await page.fill('input[name="billingPhone"]', '08123456789');

    // Step 8: Submit checkout form
    const submitButton = await page.locator('button:has-text("Buat Pesanan"), button[type="submit"]');
    await submitButton.click();

    // Wait for order creation
    await page.waitForLoadState('networkidle');

    // Step 9: Verify redirect to payment page
    await page.waitForURL(/\/orders\/\d+\/pay/);
    const paymentPageUrl = page.url();
    const orderId = parseInt(paymentPageUrl.split('/')[4]);
    expect(orderId).toBeGreaterThan(0);

    // Step 10: Verify payment page loads with pending status
    await waitForElement(page, '.savora-payment-state, text=Menunggu Pembayaran');

    // Verify "Bayar Sekarang" button exists
    const payButton = await page.locator('button:has-text("Bayar"), a:has-text("Bayar")');
    await expect(payButton).toBeVisible();

    // Step 11: Verify order is in PAYMENT_PENDING state
    const isPending = await verifyOrderPending(page, orderId);
    expect(isPending).toBeTruthy();

    // Step 12: Simulate Xendit webhook - order PAID
    const webhookResponse = await triggerXenditWebhook(request, orderId, 'PAID', 52500);
    expect(webhookResponse.status()).toBe(200);

    // Step 13: Wait for order status to update to PAID
    const paidOrder = await waitForOrderStatus(page, orderId, 'PAID', 30000);
    expect(paidOrder.status).toBe('PAID');
    expect(paidOrder.payment_status).toBe('PAID');
    expect(paidOrder.pickup_code).toBeTruthy();

    // Step 14: Reload payment page and verify pickup code displayed
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify success state
    await waitForElement(page, 'text=Pembayaran Berhasil, text=Kode Pickup');

    // Verify pickup code is visible
    const pickupCodeElement = await page.locator('.savora-code-display, text=/^[0-9]{6,8}$/');
    const pickupCode = await pickupCodeElement.textContent();
    expect(pickupCode).toMatch(/^[0-9]{6,8}$/);

    // Verify pickup instructions
    const pickupInstructions = await page.locator('text=Tunjukkan kode ini');
    await expect(pickupInstructions).toBeVisible();

    console.log(`✅ Happy Path Complete: Order ${orderId}, Pickup Code: ${pickupCode}`);
  });

  test('Payment Expired: Order auto-expires after 15 minutes', async ({ page, request }) => {
    // Step 1: Login and complete checkout
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/marketplace`);

    const productLink = await page.locator('a[href*="/marketplace/"]').first();
    const href = await productLink.getAttribute('href');
    const productId = href.split('/').pop();

    await page.goto(`${BASE_URL}/marketplace/${productId}`);
    await page.locator('button:has-text("Selamatkan"), button:has-text("Beli")').click();

    await page.waitForURL(/\/marketplace\/checkout/);

    await page.fill('input[name="billingName"]', 'Test Expired Order');
    await page.fill('input[name="billingEmail"]', `test.expired+${Date.now()}@example.com`);
    await page.fill('input[name="billingPhone"]', '08123456789');

    await page.locator('button:has-text("Buat Pesanan")').click();
    await page.waitForLoadState('networkidle');

    const paymentPageUrl = page.url();
    const orderId = parseInt(paymentPageUrl.split('/')[4]);

    // Step 2: Verify order is PAYMENT_PENDING
    const isPending = await verifyOrderPending(page, orderId);
    expect(isPending).toBeTruthy();

    // Step 3: Simulate payment expiry via scheduler or webhook
    const expiredWebhookResponse = await triggerXenditWebhook(request, orderId, 'EXPIRED', 52500);
    expect(expiredWebhookResponse.status()).toBe(200);

    // Step 4: Verify order status changes to EXPIRED
    const expiredOrder = await waitForOrderStatus(page, orderId, 'EXPIRED', 30000);
    expect(expiredOrder.status).toBe('EXPIRED');
    expect(expiredOrder.payment_status).toBe('EXPIRED');

    // Step 5: Reload payment page and verify expired message
    await page.reload();
    await page.waitForLoadState('networkidle');

    await waitForElement(page, 'text=Pembayaran Kedaluwarsa, text=Waktu pembayaran telah habis');

    console.log(`✅ Payment Expired: Order ${orderId} expired as expected`);
  });

  test('Webhook Security: Invalid callback token rejected', async ({ page, request }) => {
    // Step 1: Create order
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/marketplace`);

    const productLink = await page.locator('a[href*="/marketplace/"]').first();
    const href = await productLink.getAttribute('href');
    const productId = href.split('/').pop();

    await page.goto(`${BASE_URL}/marketplace/${productId}`);
    await page.locator('button:has-text("Selamatkan")').click();

    await page.waitForURL(/\/marketplace\/checkout/);
    await page.fill('input[name="billingName"]', 'Test Security');
    await page.fill('input[name="billingEmail"]', `test.security+${Date.now()}@example.com`);
    await page.fill('input[name="billingPhone"]', '08123456789');

    await page.locator('button:has-text("Buat Pesanan")').click();
    await page.waitForLoadState('networkidle');

    const paymentPageUrl = page.url();
    const orderId = parseInt(paymentPageUrl.split('/')[4]);

    // Step 2: Send webhook with WRONG token
    const invalidWebhookResponse = await triggerXenditWebhook(
      request,
      orderId,
      'PAID',
      52500,
      'WRONG_TOKEN_12345' // Invalid token
    );
    expect(invalidWebhookResponse.status()).toBe(200); // Still 200 for security

    // Step 3: Verify order is STILL PENDING (not updated)
    const stillPending = await verifyOrderPending(page, orderId);
    expect(stillPending).toBeTruthy();

    // Step 4: Verify no pickup code generated
    const response = await request.get(`${API_URL}/orders/${orderId}`);
    const order = await response.json();
    expect(order.pickup_code).toBeFalsy();

    console.log(`✅ Security Test: Invalid token rejected, order ${orderId} unchanged`);
  });

  test('Idempotency: Duplicate paid webhook does not double revenue', async ({ page, request }) => {
    // Step 1: Create order and trigger payment
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/marketplace`);

    const productLink = await page.locator('a[href*="/marketplace/"]').first();
    const href = await productLink.getAttribute('href');
    const productId = href.split('/').pop();

    await page.goto(`${BASE_URL}/marketplace/${productId}`);
    await page.locator('button:has-text("Selamatkan")').click();

    await page.waitForURL(/\/marketplace\/checkout/);
    await page.fill('input[name="billingName"]', 'Test Idempotency');
    await page.fill('input[name="billingEmail"]', `test.idempotent+${Date.now()}@example.com`);
    await page.fill('input[name="billingPhone"]', '08123456789');

    await page.locator('button:has-text("Buat Pesanan")').click();
    await page.waitForLoadState('networkidle');

    const paymentPageUrl = page.url();
    const orderId = parseInt(paymentPageUrl.split('/')[4]);

    // Step 2: Send first paid webhook
    const webhook1 = await triggerXenditWebhook(request, orderId, 'PAID', 52500);
    expect(webhook1.status()).toBe(200);

    // Wait for first webhook processing
    await page.waitForTimeout(1000);

    // Get pickup code after first webhook
    let orderAfterFirstWebhook = await waitForOrderStatus(page, orderId, 'PAID');
    const pickupCode1 = orderAfterFirstWebhook.pickup_code;
    expect(pickupCode1).toBeTruthy();

    // Get initial revenue count
    const revenueResponse1 = await request.get(`${API_URL}/admin/revenue?orderId=${orderId}`);
    const revenue1Count = (await revenueResponse1.json()).data.length || 1;

    // Step 3: Send DUPLICATE paid webhook with same data
    const webhook2 = await triggerXenditWebhook(request, orderId, 'PAID', 52500);
    expect(webhook2.status()).toBe(200);

    // Wait for second webhook processing
    await page.waitForTimeout(1000);

    // Step 4: Verify pickup code UNCHANGED
    const orderAfterSecondWebhook = await waitForOrderStatus(page, orderId, 'PAID');
    const pickupCode2 = orderAfterSecondWebhook.pickup_code;
    expect(pickupCode2).toBe(pickupCode1);

    // Step 5: Verify revenue NOT doubled
    const revenueResponse2 = await request.get(`${API_URL}/admin/revenue?orderId=${orderId}`);
    const revenue2Count = (await revenueResponse2.json()).data.length || 1;
    expect(revenue2Count).toBe(revenue1Count); // Should be same, not doubled

    console.log(`✅ Idempotency Test: Duplicate webhook safe, order ${orderId}`);
  });

  test('Stock Management: Reserved and Released correctly', async ({ page, request }) => {
    // Get initial product stock
    const productsResponse = await request.get(`${API_URL}/products?limit=1`);
    const products = await productsResponse.json();
    const product = products.data[0];
    const initialStock = product.stock;

    // Step 1: Create order with qty=2
    await login(page, 'customer');
    await page.goto(`${BASE_URL}/marketplace/${product.id}`);
    await page.locator('button:has-text("Selamatkan")').click();

    await page.waitForURL(/\/marketplace\/checkout/);
    await page.fill('input[name="billingName"]', 'Test Stock');
    await page.fill('input[name="billingEmail"]', `test.stock+${Date.now()}@example.com`);
    await page.fill('input[name="billingPhone"]', '08123456789');

    await page.locator('button:has-text("Buat Pesanan")').click();
    await page.waitForLoadState('networkidle');

    const orderId = parseInt(page.url().split('/')[4]);

    // Step 2: Verify stock is reserved
    const reservedProduct = await request.get(`${API_URL}/products/${product.id}`);
    const reservedData = await reservedProduct.json();
    expect(reservedData.stock).toBe(initialStock - 2);

    // Step 3: Trigger payment expiry
    await triggerXenditWebhook(request, orderId, 'EXPIRED', 52500);

    // Wait for scheduler
    await page.waitForTimeout(2000);

    // Step 4: Verify stock is released
    const releasedProduct = await request.get(`${API_URL}/products/${product.id}`);
    const releasedData = await releasedProduct.json();
    expect(releasedData.stock).toBe(initialStock);

    console.log(`✅ Stock Test: Reserved 2, Released 2, Total back to ${initialStock}`);
  });
});

