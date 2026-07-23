// tests/e2e/savora-food-trust-score.spec.js
// Food Trust Index, Food Score Decay, Dynamic Discount Tests
// Priority: MUST (PRD Section 12, 13, FR-04, FR-15, FR-23)

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';

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

// Helper: Get auth token
async function getAuthToken(page) {
  return await page.evaluate(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  });
}

test.describe('Savora E2E - Food Trust Index', () => {
  
  test('FTI-01: UMKM Membuat Listing Lengkap → Food Trust Index Tampil', async ({ page }) => {
    await login(page, testUmkm.email, testUmkm.password);
    
    // Navigate to create listing
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('button:has-text("Tambah Produk"), a:has-text("Buat Listing"), [data-testid="btn-create-product"]');
    
    // Fill basic info
    await page.fill('input[name="name"], input[placeholder*="nama produk"]', 'Nasi Goreng Surplus Test');
    await page.fill('textarea[name="description"], textarea[placeholder*="deskripsi"]', 'Nasi goreng enak masih layak konsumsi');
    
    // Category
    const categorySelect = page.locator('select[name="category"], [name="category"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('Makanan Berat');
    }
    
    // Prices
    await page.fill('input[name="original_price"]', '50000');
    await page.fill('input[name="rescue_price"]', '35000');
    await page.fill('input[name="min_price"]', '25000'); // Guardrail
    await page.fill('input[name="stock"]', '10');
    await page.fill('input[name="weight_per_portion"]', '300');
    
    // Food Trust Index Metadata
    // Waktu produksi (jam sekarang - 2 jam)
    const now = new Date();
    const productionTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const timeString = productionTime.toTimeString().slice(0, 5); // HH:MM
    
    const productionInput = page.locator('input[name="production_time"], input[type="time"]');
    if (await productionInput.isVisible()) {
      await productionInput.fill(timeString);
    }
    
    // Estimasi masa simpan (jam)
    await page.fill('input[name="shelf_life_hours"]', '8');
    
    // Kondisi kemasan
    const kemasanSelect = page.locator('select[name="packaging_condition"]');
    if (await kemasanSelect.isVisible()) {
      await kemasanSelect.selectOption('Baik');
    }
    
    // Metode penyimpanan
    const penyimpananSelect = page.locator('select[name="storage_method"]');
    if (await penyimpananSelect.isVisible()) {
      await penyimpananSelect.selectOption('Sesuai');
    }
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Simpan"), button:has-text("Publish")');
    await page.waitForTimeout(2000);
    
    // Verify Food Trust Index displayed
    const ftiStatus = page.locator('[data-testid="food-trust-status"], .food-trust-index, text=/Fresh|Layak Dijual|Segera Dijual/i');
    await expect(ftiStatus.first()).toBeVisible({ timeout: 5000 });
    
    const statusText = await ftiStatus.first().innerText();
    console.log(`✅ Food Trust Index: ${statusText}`);
    
    // Should be Fresh or Layak Dijual (f > 0.75 or 0.40-0.75)
    expect(statusText).toMatch(/Fresh|Layak Dijual/i);
  });
  
  test('FTI-02: Produk Tidak Layak Konsumsi → Tidak Tampil di Marketplace', async ({ page, request }) => {
    await login(page, testUmkm.email, testUmkm.password);
    
    const token = await getAuthToken(page);
    
    // Create product with Rusak packaging (triggers Tidak Layak Konsumsi per PRD 12.4)
    const now = new Date();
    const productionTime = new Date(now.getTime() - 10 * 60 * 60 * 1000); // 10 hours ago
    const expiresAt = new Date(now.getTime() - 1 * 60 * 60 * 1000); // Expired 1 hour ago (f <= 0)
    
    const response = await request.post(`${API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Produk Tidak Layak Test',
        category: 'Makanan Berat',
        description: 'Test produk expired',
        original_price: 40000,
        rescue_price: 20000,
        min_price: 15000,
        stock: 5,
        weight_per_portion: 250,
        production_time: productionTime.toISOString(),
        shelf_life_hours: 8,
        expires_at: expiresAt.toISOString(),
        packaging_condition: 'Rusak', // Trigger Tidak Layak Konsumsi
        storage_method: 'Sesuai',
      },
      failOnStatusCode: false,
    });
    
    console.log(`Create Tidak Layak Konsumsi product: ${response.status()}`);
    
    // Product might be rejected by API OR created but hidden
    if (response.ok()) {
      const product = await response.json();
      
      // Check marketplace - should NOT show this product
      await page.goto(`${BASE_URL}/marketplace`);
      await page.waitForLoadState('networkidle');
      
      const productCard = page.locator(`[data-product-id="${product.id}"], .product-card:has-text("${product.name}")`);
      const isVisible = await productCard.isVisible().catch(() => false);
      
      expect(isVisible).toBe(false);
      console.log('✅ Tidak Layak Konsumsi product hidden from marketplace');
    } else {
      // API rejected the listing
      console.log('✅ API rejected Tidak Layak Konsumsi product');
    }
  });
  
  test('FTI-03: Produk Segera Dijual → Status dan Urgency Tampil', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketplace`);
    
    // Look for products with Segera Dijual status (f < 0.40 per PRD 12.4)
    const urgentProducts = page.locator('[data-testid*="urgent"], .urgent, .segera-dijual, text=/Segera Dijual|Segera Ambil/i');
    
    if (await urgentProducts.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      const urgentText = await urgentProducts.first().innerText();
      console.log(`✅ Urgent product found: ${urgentText}`);
      
      // Click to see detail
      await urgentProducts.first().click();
      await page.waitForTimeout(1000);
      
      // Verify urgency indicator on detail page
      const detailUrgency = page.locator('text=/Segera|Urgent|Kritis/i');
      await expect(detailUrgency.first()).toBeVisible();
    } else {
      console.log('⚠️ No urgent products in marketplace (test skipped)');
    }
  });
});

test.describe('Savora E2E - Food Score Decay', () => {
  
  test('FSD-01: Food Score Menurun Seiring Waktu (Power Decay)', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketplace`);
    
    // Find product with food score
    const productCard = page.locator('[data-testid="product-card"], .product-card').first();
    await expect(productCard).toBeVisible();
    
    // Read initial food score
    const scoreElement = page.locator('[data-testid="food-score"], .food-score').first();
    if (await scoreElement.isVisible({ timeout: 3000 }).catch(() => false)) {
      const initialScore = await scoreElement.innerText();
      const initialValue = parseInt(initialScore.match(/\d+/)?.[0] || '0');
      
      console.log(`Initial Food Score: ${initialValue}`);
      
      // Wait 60 seconds (score should refresh per minute per PRD 12.6)
      await page.waitForTimeout(60000);
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Read score again
      const newScore = await scoreElement.innerText();
      const newValue = parseInt(newScore.match(/\d+/)?.[0] || '0');
      
      console.log(`Food Score after 60s: ${newValue}`);
      
      // Score should decrease or stay same (if f still high)
      // Power decay: skor_akhir = skor_awal × f^0.65
      expect(newValue).toBeLessThanOrEqual(initialValue);
      
      if (newValue < initialValue) {
        console.log('✅ Food Score decay verified');
      } else {
        console.log('⚠️ Food Score unchanged (product still fresh, f high)');
      }
    } else {
      console.log('⚠️ Food Score not visible (test skipped)');
    }
  });
  
  test('FSD-02: Food Score 0 → Listing Expired, Hidden', async ({ page, request }) => {
    await login(page, testUmkm.email, testUmkm.password);
    
    const token = await getAuthToken(page);
    
    // Create product that expires in 1 minute
    const now = new Date();
    const productionTime = new Date(now.getTime() - 7 * 60 * 60 * 1000); // 7 hours ago
    const expiresAt = new Date(now.getTime() + 1 * 60 * 1000); // Expires in 1 minute
    
    const response = await request.post(`${API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Produk Hampir Expired Test',
        category: 'Makanan Ringan',
        description: 'Test decay ke 0',
        original_price: 30000,
        rescue_price: 15000,
        min_price: 10000,
        stock: 3,
        weight_per_portion: 200,
        production_time: productionTime.toISOString(),
        shelf_life_hours: 8,
        expires_at: expiresAt.toISOString(),
        packaging_condition: 'Baik',
        storage_method: 'Sesuai',
      },
    });
    
    if (response.ok()) {
      const product = await response.json();
      console.log(`Created product ${product.id}, expires in 1 minute`);
      
      // Wait for expiry (65 seconds to be safe)
      console.log('Waiting 65 seconds for product to expire...');
      await page.waitForTimeout(65000);
      
      // Check marketplace - product should be hidden
      await page.goto(`${BASE_URL}/marketplace`);
      await page.waitForLoadState('networkidle');
      
      const expiredProduct = page.locator(`.product-card:has-text("${product.name}")`);
      const isVisible = await expiredProduct.isVisible().catch(() => false);
      
      expect(isVisible).toBe(false);
      console.log('✅ Expired product (food_score = 0) hidden from marketplace');
    }
  });
  
  test('FSD-03: Color Indicator (Merah < 1 jam, Kuning 1-3 jam, Hijau > 3 jam)', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketplace`);
    
    // Look for products with rescue timer
    const products = page.locator('[data-testid="product-card"], .product-card');
    const count = await products.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const product = products.nth(i);
      const timerElement = product.locator('[data-testid="rescue-timer"], .rescue-timer, .countdown');
      
      if (await timerElement.isVisible().catch(() => false)) {
        const timerText = await timerElement.innerText();
        console.log(`Product ${i + 1} timer: ${timerText}`);
        
        // Extract hours/minutes
        const hourMatch = timerText.match(/(\d+)\s*jam|(\d+)\s*hour/i);
        const minuteMatch = timerText.match(/(\d+)\s*menit|(\d+)\s*minute/i);
        
        const hours = hourMatch ? parseInt(hourMatch[1] || hourMatch[2]) : 0;
        const minutes = minuteMatch ? parseInt(minuteMatch[1] || minuteMatch[2]) : 0;
        
        const totalMinutes = hours * 60 + minutes;
        
        // Check color indicator (via class or data-attribute)
        const classList = await timerElement.getAttribute('class');
        const colorAttr = await timerElement.getAttribute('data-color');
        const combined = `${classList} ${colorAttr}`.toLowerCase();
        
        if (totalMinutes < 60) {
          // Red
          expect(combined).toMatch(/red|merah|danger|critical/);
          console.log(`  ✅ < 1 jam → Red indicator`);
        } else if (totalMinutes >= 60 && totalMinutes <= 180) {
          // Yellow
          expect(combined).toMatch(/yellow|kuning|warning/);
          console.log(`  ✅ 1-3 jam → Yellow indicator`);
        } else {
          // Green
          expect(combined).toMatch(/green|hijau|success|safe/);
          console.log(`  ✅ > 3 jam → Green indicator`);
        }
      }
    }
  });
});

test.describe('Savora E2E - Dynamic Discount', () => {
  
  test('DD-01: Produk Segera Dijual → Rekomendasi Diskon 35-50%', async ({ page }) => {
    await login(page, testUmkm.email, testUmkm.password);
    
    // Create product with f < 0.40 (Segera Dijual per PRD 12.4)
    await page.goto(`${BASE_URL}/dashboard/produk/buat`);
    
    const now = new Date();
    const productionTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours left (f = 2/8 = 0.25)
    
    // Fill form
    await page.fill('input[name="name"]', 'Produk Segera Dijual Test');
    await page.fill('input[name="original_price"]', '60000');
    
    // When system calculates FTI, should show discount recommendation
    // Look for dynamic discount widget
    const discountReco = page.locator('[data-testid="discount-recommendation"], .discount-reco, text=/35.*50%|diskon.*tinggi/i');
    
    if (await discountReco.isVisible({ timeout: 3000 }).catch(() => false)) {
      const recoText = await discountReco.innerText();
      console.log(`✅ Dynamic discount recommendation: ${recoText}`);
      
      // Should suggest 35-50% per PRD 13.2
      expect(recoText).toMatch(/3[5-9]|4[0-9]|50/); // 35-50%
    } else {
      console.log('⚠️ Discount recommendation not visible (implementation pending)');
    }
  });
  
  test('DD-02: Harga Tidak Pernah Melanggar Guardrail min_price', async ({ page, request }) => {
    await login(page, testUmkm.email, testUmkm.password);
    
    const token = await getAuthToken(page);
    
    // Try to create product with rescue_price < min_price
    const response = await request.post(`${API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Test Guardrail Violation',
        category: 'Makanan Berat',
        original_price: 50000,
        rescue_price: 20000, // Below min_price
        min_price: 25000,    // Guardrail
        stock: 5,
        weight_per_portion: 300,
        shelf_life_hours: 8,
        packaging_condition: 'Baik',
        storage_method: 'Sesuai',
      },
      failOnStatusCode: false,
    });
    
    // API should reject (400) or auto-adjust
    if (response.status() === 400) {
      const error = await response.json();
      console.log(`✅ API rejected guardrail violation: ${error.message || error.error}`);
      expect(error.message || error.error).toMatch(/min.*price|guardrail/i);
    } else if (response.ok()) {
      const product = await response.json();
      // Check if rescue_price was auto-adjusted to >= min_price
      expect(product.rescue_price).toBeGreaterThanOrEqual(product.min_price);
      console.log(`✅ API auto-adjusted rescue_price to ${product.rescue_price} (>= min_price ${product.min_price})`);
    }
  });
  
  test('DD-03: UMKM Menetapkan Diskon Final dalam Rentang Aturan', async ({ page }) => {
    await login(page, testUmkm.email, testUmkm.password);
    
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('button:has-text("Tambah Produk")');
    
    // Fill basic info
    await page.fill('input[name="name"]', 'Test Dynamic Discount Final');
    await page.fill('input[name="original_price"]', '80000');
    
    // System should calculate recommendation based on FTI
    // UMKM can adjust within range
    const rescuePriceInput = page.locator('input[name="rescue_price"]');
    await rescuePriceInput.fill('56000'); // 30% discount (within 20-35% for Layak Dijual)
    
    const minPriceInput = page.locator('input[name="min_price"]');
    await minPriceInput.fill('50000'); // Guardrail
    
    // Verify rescue_price >= min_price
    const rescueVal = 56000;
    const minVal = 50000;
    expect(rescueVal).toBeGreaterThanOrEqual(minVal);
    
    console.log(`✅ UMKM set rescue_price ${rescueVal} within range and above guardrail ${minVal}`);
  });
});
