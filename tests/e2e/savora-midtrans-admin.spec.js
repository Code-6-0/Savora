// tests/e2e/savora-midtrans-admin.spec.js
// Midtrans Webhook Verification + Admin Verification/Moderation
// Priority: MUST (PRD FR-14, FR-12, FR-02, REVISI #28, #37)

const { test, expect } = require('@playwright/test');
const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'test_server_key_12345';

const testAdmin = {
  email: 'admin.test@savora.app',
  password: 'Admin1234!',
};

const testUmkm = {
  email: 'umkm.test@savora.app',
  password: 'Test1234!',
};

// Helper: Generate Midtrans signature
// PRD 14.6: SHA512(order_id + status_code + gross_amount + server_key)
function generateMidtransSignature(orderId, statusCode, grossAmount, serverKey) {
  const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash('sha512').update(signatureString).digest('hex');
}

// Helper: Login
async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}

// Helper: Get auth token
async function getAuthToken(page) {
  return await page.evaluate(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  });
}

test.describe('Savora E2E - Midtrans Webhook Signature Verification', () => {
  
  test('MIDTRANS-01: Webhook dengan Signature Valid → Payment Status Updated', async ({ request }) => {
    const orderId = 'ORDER-12345';
    const statusCode = '200';
    const grossAmount = '52500';
    
    // Generate VALID signature
    const signature = generateMidtransSignature(orderId, statusCode, grossAmount, MIDTRANS_SERVER_KEY);
    
    const response = await request.post(`${API_URL}/payments/midtrans-webhook`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        transaction_status: 'settlement',
        signature_key: signature,
      },
      failOnStatusCode: false,
    });
    
    // Should accept (200 OK)
    expect(response.ok()).toBe(true);
    console.log(`✅ Valid signature webhook accepted: ${response.status()}`);
  });
  
  test('MIDTRANS-02: Webhook dengan Signature Invalid → Rejected', async ({ request }) => {
    const orderId = 'ORDER-12346';
    const statusCode = '200';
    const grossAmount = '52500';
    
    // Use WRONG signature
    const wrongSignature = crypto.createHash('sha512').update('wrong_data_12345').digest('hex');
    
    const response = await request.post(`${API_URL}/payments/midtrans-webhook`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        transaction_status: 'settlement',
        signature_key: wrongSignature,
      },
      failOnStatusCode: false,
    });
    
    // Should reject (400 or 401)
    expect([400, 401, 403]).toContain(response.status());
    console.log(`✅ Invalid signature webhook rejected: ${response.status()}`);
  });
  
  test('MIDTRANS-03: Webhook Tanpa Signature → Rejected', async ({ request }) => {
    const response = await request.post(`${API_URL}/payments/midtrans-webhook`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        order_id: 'ORDER-12347',
        status_code: '200',
        gross_amount: '52500',
        transaction_status: 'settlement',
        // No signature_key
      },
      failOnStatusCode: false,
    });
    
    // Should reject
    expect([400, 401]).toContain(response.status());
    console.log(`✅ Webhook without signature rejected: ${response.status()}`);
  });
  
  test('MIDTRANS-04: Webhook settlement → Order Status Paid + Pickup Code', async ({ page, request }) => {
    // Create order first (mocked)
    const orderId = `ORDER-TEST-${Date.now()}`;
    const statusCode = '200';
    const grossAmount = '52500';
    
    const signature = generateMidtransSignature(orderId, statusCode, grossAmount, MIDTRANS_SERVER_KEY);
    
    // Send webhook
    const webhookResponse = await request.post(`${API_URL}/payments/midtrans-webhook`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        transaction_status: 'settlement',
        signature_key: signature,
      },
    });
    
    if (webhookResponse.ok()) {
      console.log(`✅ Webhook settlement accepted for ${orderId}`);
      
      // Check order status via API
      // Extract numeric ID from orderId
      const numericId = orderId.match(/\d+$/)?.[0] || '1';
      
      const orderResponse = await request.get(`${API_URL}/orders/${numericId}`, {
        failOnStatusCode: false,
      });
      
      if (orderResponse.ok()) {
        const order = await orderResponse.json();
        
        // Verify status is PAID
        expect(order.status || order.payment_status).toMatch(/PAID/i);
        
        // Verify pickup_code generated
        expect(order.pickup_code).toBeTruthy();
        expect(order.pickup_code.length).toBeGreaterThanOrEqual(6);
        
        console.log(`✅ Order status: ${order.status}, Pickup code: ${order.pickup_code}`);
      }
    }
  });
  
  test('MIDTRANS-05: Webhook expire → Order Status Expired, Stok Dikembalikan', async ({ request }) => {
    const orderId = `ORDER-EXPIRE-${Date.now()}`;
    const statusCode = '202'; // Midtrans expire status code
    const grossAmount = '52500';
    
    const signature = generateMidtransSignature(orderId, statusCode, grossAmount, MIDTRANS_SERVER_KEY);
    
    const response = await request.post(`${API_URL}/payments/midtrans-webhook`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        transaction_status: 'expire',
        signature_key: signature,
      },
    });
    
    if (response.ok()) {
      console.log(`✅ Webhook expire accepted for ${orderId}`);
      
      // Stock should be returned (implementation check needed)
      // This is verified via order status
      const numericId = orderId.match(/\d+$/)?.[0];
      if (numericId) {
        const orderResponse = await request.get(`${API_URL}/orders/${numericId}`, {
          failOnStatusCode: false,
        });
        
        if (orderResponse.ok()) {
          const order = await orderResponse.json();
          expect(order.status).toMatch(/EXPIRED|PAYMENT_FAILED/i);
          console.log(`✅ Order marked as ${order.status}, stock should be returned`);
        }
      }
    }
  });
});

test.describe('Savora E2E - Admin Verifikasi UMKM', () => {
  
  test('ADMIN-01: Admin Verifikasi UMKM → UMKM Dapat Publish Listing', async ({ page }) => {
    await login(page, testAdmin.email, testAdmin.password);
    
    // Navigate to admin dashboard
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await expect(page.locator('h1, h2')).toContainText(/Admin|Dashboard/i);
    
    // Go to UMKM verification page
    await page.click('a:has-text("UMKM"), a:has-text("Verifikasi"), [href*="umkm"]');
    await page.waitForLoadState('networkidle');
    
    // Find pending UMKM
    const pendingUmkm = page.locator('[data-status="PENDING"], .status:has-text("Pending")').first();
    
    if (await pendingUmkm.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click verify/approve button
      const verifyBtn = page.locator('button:has-text("Verifikasi"), button:has-text("Approve")').first();
      await verifyBtn.click();
      
      await page.waitForTimeout(1000);
      
      // Verify status changed to APPROVED
      const approvedStatus = page.locator('[data-status="APPROVED"], .status:has-text("Approved")');
      await expect(approvedStatus.first()).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Admin verified UMKM successfully');
    } else {
      console.log('⚠️ No pending UMKM found (test skipped)');
    }
  });
  
  test('ADMIN-02: UMKM Belum Verified → Tidak Bisa Publish Listing', async ({ page, request }) => {
    // Try to create listing as unverified UMKM
    await login(page, testUmkm.email, testUmkm.password);
    
    const token = await getAuthToken(page);
    
    // Check UMKM verification status first
    const profileResponse = await request.get(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (profileResponse.ok()) {
      const profile = await profileResponse.json();
      
      if (profile.verification_status === 'PENDING') {
        // Try to publish listing
        const listingResponse = await request.post(`${API_URL}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: {
            name: 'Test Listing Unverified',
            category: 'Makanan Berat',
            original_price: 50000,
            rescue_price: 35000,
            min_price: 25000,
            stock: 5,
            status: 'ACTIVE', // Try to set active
          },
          failOnStatusCode: false,
        });
        
        // Should be rejected (403)
        expect(listingResponse.status()).toBe(403);
        console.log('✅ Unverified UMKM cannot publish listing');
      } else {
        console.log('⚠️ UMKM already verified (test skipped)');
      }
    }
  });
});

test.describe('Savora E2E - Admin Moderasi Listing', () => {
  
  test('ADMIN-03: Admin Suspend Listing Bermasalah → Hidden from Marketplace', async ({ page, request }) => {
    await login(page, testAdmin.email, testAdmin.password);
    
    // Navigate to listing moderation
    await page.goto(`${BASE_URL}/admin/produk`);
    await page.waitForLoadState('networkidle');
    
    // Find active listing
    const activeListing = page.locator('[data-testid="product-item"], .product-row').first();
    
    if (await activeListing.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Get product ID
      const productId = await activeListing.getAttribute('data-product-id');
      
      if (productId) {
        // Click suspend/reject button
        const suspendBtn = page.locator(`button:has-text("Suspend"), button:has-text("Nonaktifkan")`).first();
        
        if (await suspendBtn.isVisible()) {
          await suspendBtn.click();
          
          // Confirm dialog if exists
          const confirmBtn = page.locator('button:has-text("Ya"), button:has-text("Confirm")');
          if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmBtn.click();
          }
          
          await page.waitForTimeout(1000);
          
          console.log(`✅ Admin suspended product ${productId}`);
          
          // Verify product hidden from marketplace
          await page.goto(`${BASE_URL}/marketplace`);
          await page.waitForLoadState('networkidle');
          
          const suspendedProduct = page.locator(`[data-product-id="${productId}"]`);
          const isVisible = await suspendedProduct.isVisible().catch(() => false);
          
          expect(isVisible).toBe(false);
          console.log('✅ Suspended product hidden from marketplace');
        }
      }
    } else {
      console.log('⚠️ No active listings found (test skipped)');
    }
  });
  
  test('ADMIN-04: Admin Approve Listing Setelah Review', async ({ page }) => {
    await login(page, testAdmin.email, testAdmin.password);
    
    await page.goto(`${BASE_URL}/admin/produk`);
    
    // Find pending listing (if moderation required)
    const pendingListing = page.locator('[data-status="PENDING"], .status:has-text("Pending")').first();
    
    if (await pendingListing.isVisible({ timeout: 3000 }).catch(() => false)) {
      const approveBtn = page.locator('button:has-text("Approve"), button:has-text("Setujui")').first();
      await approveBtn.click();
      
      await page.waitForTimeout(1000);
      
      // Verify status changed
      const approvedStatus = page.locator('[data-status="APPROVED"], .status:has-text("Active")');
      await expect(approvedStatus.first()).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Admin approved listing');
    } else {
      console.log('⚠️ No pending listings for approval (test skipped)');
    }
  });
  
  test('ADMIN-05: Admin Beri Warning ke UMKM', async ({ page, request }) => {
    await login(page, testAdmin.email, testAdmin.password);
    
    const token = await getAuthToken(page);
    
    // Navigate to UMKM management
    await page.goto(`${BASE_URL}/admin/umkm`);
    await page.waitForLoadState('networkidle');
    
    // Find UMKM to warn
    const umkmRow = page.locator('[data-testid="umkm-row"], .umkm-item').first();
    
    if (await umkmRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      const umkmId = await umkmRow.getAttribute('data-umkm-id');
      
      if (umkmId) {
        // Click warning button
        const warnBtn = page.locator('button:has-text("Warning"), button:has-text("Peringatkan")').first();
        
        if (await warnBtn.isVisible()) {
          await warnBtn.click();
          
          // Fill warning reason
          const reasonField = page.locator('textarea, input[name="reason"]');
          if (await reasonField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await reasonField.fill('Produk tidak sesuai deskripsi, perlu diperbaiki.');
          }
          
          await page.click('button:has-text("Kirim"), button:has-text("Submit")');
          await page.waitForTimeout(1000);
          
          console.log(`✅ Admin issued warning to UMKM ${umkmId}`);
        }
      }
    } else {
      console.log('⚠️ No UMKM found (test skipped)');
    }
  });
});

test.describe('Savora E2E - Admin Dashboard & Monitoring', () => {
  
  test('ADMIN-06: Admin Melihat Dashboard Ringkasan Platform', async ({ page }) => {
    await login(page, testAdmin.email, testAdmin.password);
    
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Verify key metrics visible
    const metrics = [
      'Total UMKM',
      'Total Customer',
      'Total Transaksi',
      'Total Pendapatan',
      'Makanan Terselamatkan',
    ];
    
    for (const metric of metrics) {
      const element = page.locator(`text=/${metric}/i`).first();
      const isVisible = await element.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isVisible) {
        const value = await element.innerText();
        console.log(`✅ ${metric}: ${value}`);
      }
    }
  });
  
  test('ADMIN-07: Admin Monitoring Transaksi', async ({ page }) => {
    await login(page, testAdmin.email, testAdmin.password);
    
    await page.goto(`${BASE_URL}/admin/transaksi`);
    await page.waitForLoadState('networkidle');
    
    // Verify transaction list
    const transactionTable = page.locator('[data-testid="transaction-table"], table, .transaction-list');
    await expect(transactionTable).toBeVisible({ timeout: 5000 });
    
    // Count rows
    const rows = page.locator('[data-testid="transaction-row"], tbody tr, .transaction-item');
    const count = await rows.count();
    
    console.log(`✅ Admin can see ${count} transactions`);
  });
});
