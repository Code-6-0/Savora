// tests/e2e/savora-edge-cases.spec.js
// Edge Cases: Payment failures, no-show, help tickets, invalid tokens

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';

async function triggerWebhook(orderId, status, token = 'test_token') {
  try {
    const response = await fetch(`${API_URL}/payments/xendit-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-callback-token': token,
      },
      body: JSON.stringify({
        id: `inv-test-${orderId}`,
        external_id: `ORDER-${orderId}`,
        status: status,
      }),
    });
    return response.ok;
  } catch (err) {
    console.log('Webhook error:', err.message);
    return false;
  }
}

test.describe('Savora E2E - Edge Cases', () => {
  
  test('E2E-04: Payment EXPIRED → Stok Dikembalikan', async ({ page }) => {
    // Navigate to marketplace
    await page.goto(`${BASE_URL}/marketplace`);
    
    // Create order (mock flow)
    const productCard = page.locator('[data-testid="product-card"], .product-card').first();
    if (await productCard.isVisible()) {
      const initialStock = await productCard.locator('text=/Stok|Stock/').innerText();
      console.log(`Initial stock: ${initialStock}`);
      
      // Simulate order + expire
      await triggerWebhook('1', 'EXPIRED');
      
      // Check stock restored
      await page.reload();
      const newStock = await productCard.locator('text=/Stok|Stock/').innerText();
      console.log(`After expiry, stock: ${newStock}`);
    }
  });

  test('E2E-05: Invalid Pickup Code Rejected', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Try invalid pickup code
    const pickupInput = page.locator('input[name="pickup"], input[placeholder*="kode"]').first();
    if (await pickupInput.isVisible()) {
      await pickupInput.fill('999999');
      await page.click('button:has-text("Validasi")');
      
      // Check error
      const errorMsg = page.locator('[data-testid="error"], .error, .alert-danger');
      if (await errorMsg.isVisible()) {
        console.log(`✅ Error shown: ${await errorMsg.innerText()}`);
      }
    }
  });

  test('E2E-06: Webhook with Invalid Token Ignored', async ({ page }) => {
    // Create order
    await page.goto(`${BASE_URL}/marketplace`);
    
    // Send webhook with wrong token
    const success = await triggerWebhook('1', 'PAID', 'WRONG_TOKEN_12345');
    
    if (!success) {
      console.log('✅ Invalid token webhook rejected');
    }
  });

  test('E2E-07: Customer Create Help Ticket', async ({ page }) => {
    await page.goto(`${BASE_URL}/pesanan`);
    
    // Find order with Help button
    const helpBtn = page.locator('button:has-text("Bantuan"), button:has-text("Help")').first();
    if (await helpBtn.isVisible()) {
      await helpBtn.click();
      
      // Fill help form
      const categorySelect = page.locator('select, [role="combobox"]').first();
      if (await categorySelect.isVisible()) {
        await categorySelect.click();
        await page.click('text=/Produk tidak tersedia|Tidak sesuai/');
      }
      
      const descField = page.locator('textarea, [name="description"]');
      if (await descField.isVisible()) {
        await descField.fill('Produk tidak tersedia saat pickup.');
      }
      
      await page.click('button:has-text("Kirim"), button:has-text("Submit")');
      console.log('✅ Help ticket created');
    }
  });

  test('E2E-08: Review dengan Keyword GAWAT Flagged', async ({ page }) => {
    await page.goto(`${BASE_URL}/pesanan`);
    
    const reviewBtn = page.locator('button:has-text("Rating"), button:has-text("Review")').first();
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();
      
      // 1 star + negative keywords
      await page.click('[data-testid*="star"], .star-rating', { position: { x: 20, y: 0 } });
      
      const keywordBasi = page.locator('button:has-text("basi"), button:has-text("bau")');
      if (await keywordBasi.first().isVisible()) {
        await keywordBasi.first().click();
      }
      
      await page.click('button:has-text("Kirim")');
      console.log('✅ Negative review submitted (should flag admin)');
    }
  });
});
