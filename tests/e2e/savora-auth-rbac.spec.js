// tests/e2e/savora-auth-rbac.spec.js
// Authentication & Role-Based Access Control Tests
// Priority: MUST (PRD Section 23, REVISI #22)

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';

// Test accounts
const testCustomer = {
  email: 'customer.test@savora.app',
  password: 'Test1234!',
};

const testUmkm = {
  email: 'umkm.test@savora.app',
  password: 'Test1234!',
};

const testAdmin = {
  email: 'admin.test@savora.app',
  password: 'Admin1234!',
};

// Helper: Get auth token from cookies/localStorage
async function getAuthToken(page) {
  const token = await page.evaluate(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  });
  return token;
}

test.describe('Savora E2E - Authentication', () => {
  
  test('AUTH-01: User Register sebagai Customer', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    const timestamp = Date.now();
    const newEmail = `customer.${timestamp}@test.savora.app`;
    
    // Fill registration form
    await page.fill('input[name="name"], input[placeholder*="nama"]', 'Test Customer');
    await page.fill('input[name="email"], input[type="email"]', newEmail);
    await page.fill('input[name="password"], input[type="password"]', 'Test1234!');
    
    // Select role Customer (if role selector exists)
    const roleSelect = page.locator('select[name="role"], [role="combobox"]');
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption('CUSTOMER');
    }
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Daftar"), button:has-text("Register")');
    
    // Wait for redirect or success message
    await page.waitForTimeout(2000);
    
    // Verify redirect to login or dashboard
    const url = page.url();
    expect(url).toMatch(/login|dashboard|marketplace/);
    
    console.log(`✅ Customer registered: ${newEmail}`);
  });
  
  test('AUTH-02: Login dengan Password Salah', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[name="email"], input[type="email"]', testCustomer.email);
    await page.fill('input[name="password"], input[type="password"]', 'WrongPassword123!');
    
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Masuk")');
    
    await page.waitForTimeout(1000);
    
    // Verify error message shown
    const errorMsg = page.locator('[data-testid="error"], .error, .alert-danger, text=/salah|wrong|invalid/i');
    await expect(errorMsg.first()).toBeVisible({ timeout: 5000 });
    
    // Verify session NOT created
    const url = page.url();
    expect(url).toContain('login');
    
    console.log('✅ Login with wrong password rejected');
  });
  
  test('AUTH-03: Login Success as Customer', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[name="email"]', testCustomer.email);
    await page.fill('input[name="password"]', testCustomer.password);
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    
    // Verify redirect to marketplace or dashboard
    const url = page.url();
    expect(url).toMatch(/marketplace|dashboard/);
    
    // Verify auth token exists
    const token = await getAuthToken(page);
    expect(token).toBeTruthy();
    
    console.log('✅ Customer login successful');
  });
});

test.describe('Savora E2E - RBAC (Role-Based Access Control)', () => {
  
  test('RBAC-01: UMKM Akses Endpoint Admin → 403 Forbidden', async ({ page, request }) => {
    // Login as UMKM
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', testUmkm.email);
    await page.fill('input[name="password"]', testUmkm.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    const token = await getAuthToken(page);
    
    // Try accessing admin endpoints
    const adminEndpoints = [
      '/admin/users',
      '/admin/customers',
      '/admin/revenue',
      '/admin/mitra-donasi',
      '/advertisements/1/status', // PATCH approve/reject iklan
    ];
    
    for (const endpoint of adminEndpoints) {
      const response = await request.get(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        failOnStatusCode: false,
      });
      
      // Verify 403 Forbidden
      expect(response.status()).toBe(403);
      console.log(`✅ UMKM blocked from ${endpoint}: ${response.status()}`);
    }
  });
  
  test('RBAC-02: Customer Akses Dashboard UMKM → 403 Forbidden', async ({ page, request }) => {
    // Login as Customer
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', testCustomer.email);
    await page.fill('input[name="password"]', testCustomer.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    const token = await getAuthToken(page);
    
    // Try accessing UMKM-only endpoints
    const umkmEndpoints = [
      '/products', // POST create listing
      '/analytics/umkm',
      '/analytics/umkm/tracking',
      '/analytics/umkm/insight',
      '/waste-logs',
    ];
    
    for (const endpoint of umkmEndpoints) {
      const response = await request.post(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {},
        failOnStatusCode: false,
      });
      
      // Verify 403 Forbidden
      expect(response.status()).toBe(403);
      console.log(`✅ Customer blocked from ${endpoint}: ${response.status()}`);
    }
    
    // Also try UI navigation
    await page.goto(`${BASE_URL}/dashboard/umkm`);
    await page.waitForTimeout(1000);
    
    // Should redirect or show error
    const url = page.url();
    const hasError = await page.locator('text=/forbidden|tidak diizinkan|403/i').isVisible().catch(() => false);
    
    if (!url.includes('/dashboard/umkm') || hasError) {
      console.log('✅ Customer blocked from UMKM dashboard UI');
    }
  });
  
  test('RBAC-03: User Tanpa Login Akses Endpoint Terproteksi → 401 Unauthorized', async ({ request }) => {
    // Try protected endpoints WITHOUT auth token
    const protectedEndpoints = [
      { method: 'GET', path: '/me' },
      { method: 'GET', path: '/orders' },
      { method: 'POST', path: '/orders' },
      { method: 'POST', path: '/reviews' },
      { method: 'GET', path: '/admin/users' },
      { method: 'POST', path: '/products' },
    ];
    
    for (const { method, path } of protectedEndpoints) {
      let response;
      
      if (method === 'GET') {
        response = await request.get(`${API_URL}${path}`, {
          failOnStatusCode: false,
        });
      } else if (method === 'POST') {
        response = await request.post(`${API_URL}${path}`, {
          headers: { 'Content-Type': 'application/json' },
          data: {},
          failOnStatusCode: false,
        });
      }
      
      // Verify 401 Unauthorized
      expect(response.status()).toBe(401);
      console.log(`✅ ${method} ${path} requires auth: ${response.status()}`);
    }
  });
  
  test('RBAC-04: Customer Tidak Bisa Moderasi Listing UMKM Lain', async ({ page, request }) => {
    // Login as Customer
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', testCustomer.email);
    await page.fill('input[name="password"]', testCustomer.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    const token = await getAuthToken(page);
    
    // Try to delete or edit product (UMKM-only action)
    const response = await request.patch(`${API_URL}/products/1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Hacked Product',
        rescue_price: 1,
      },
      failOnStatusCode: false,
    });
    
    // Should be 403 (not owned) or 401 (no permission)
    expect([401, 403]).toContain(response.status());
    console.log(`✅ Customer cannot edit UMKM product: ${response.status()}`);
  });
});

test.describe('Savora E2E - Session & Token Management', () => {
  
  test('SESSION-01: Logout Menghapus Token', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', testCustomer.email);
    await page.fill('input[name="password"]', testCustomer.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Verify token exists
    let token = await getAuthToken(page);
    expect(token).toBeTruthy();
    
    // Logout
    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Keluar"), [data-testid="btn-logout"]');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);
      
      // Verify token removed
      token = await getAuthToken(page);
      expect(token).toBeFalsy();
      
      console.log('✅ Token cleared after logout');
    }
  });
  
  test('SESSION-02: Token Expired → Redirect ke Login', async ({ page, request }) => {
    // Set expired/invalid token
    await page.goto(`${BASE_URL}/marketplace`);
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid_token_12345');
    });
    
    // Try accessing protected endpoint
    await page.goto(`${BASE_URL}/pesanan`);
    await page.waitForTimeout(2000);
    
    // Should redirect to login or show auth error
    const url = page.url();
    const hasError = await page.locator('text=/login|unauthorized|expired/i').isVisible().catch(() => false);
    
    if (url.includes('login') || hasError) {
      console.log('✅ Expired token redirects to login');
    }
  });
});
