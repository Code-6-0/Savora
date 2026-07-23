// tests/e2e/test-helpers.js
// Reusable test helpers and setup
// Shared across all Playwright test suites

const { expect } = require('@playwright/test');
const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'test_server_key_12345';

// Test accounts
const TEST_ACCOUNTS = {
  customer: {
    email: 'customer.test@savora.app',
    password: 'Test1234!',
  },
  umkm: {
    email: 'umkm.test@savora.app',
    password: 'Test1234!',
  },
  admin: {
    email: 'admin.test@savora.app',
    password: 'Admin1234!',
  },
  mitra_donasi: {
    email: 'mitra.test@savora.app',
    password: 'Mitra1234!',
  },
};

// Login helper
async function login(page, role = 'customer') {
  const account = TEST_ACCOUNTS[role];
  if (!account) throw new Error(`Unknown role: ${role}`);
  
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', account.email);
  await page.fill('input[name="password"]', account.password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  
  return account;
}

// Get auth token
async function getAuthToken(page) {
  return await page.evaluate(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  });
}

// Generate Midtrans signature (PRD 14.6)
function generateMidtransSignature(orderId, statusCode, grossAmount, serverKey = MIDTRANS_SERVER_KEY) {
  const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash('sha512').update(signatureString).digest('hex');
}

// Trigger Midtrans webhook
async function triggerMidtransWebhook(request, orderId, statusCode = '200', grossAmount = '52500') {
  const signature = generateMidtransSignature(orderId, statusCode, grossAmount);
  
  return await request.post(`${API_URL}/payments/midtrans-webhook`, {
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      transaction_status: statusCode === '200' ? 'settlement' : 'expire',
      signature_key: signature,
    },
    failOnStatusCode: false,
  });
}

// Wait for element with retry
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.locator(selector).first().waitFor({ timeout });
    return true;
  } catch {
    return false;
  }
}

// Get element text safely
async function getElementText(page, selector) {
  try {
    return await page.locator(selector).first().innerText();
  } catch {
    return null;
  }
}

// Click and wait for navigation
async function clickAndWait(page, selector, timeout = 5000) {
  await page.click(selector);
  await page.waitForLoadState('networkidle');
}

// Verify element visible with optional text
async function expectVisible(page, selector, text = null) {
  const locator = page.locator(selector);
  await expect(locator.first()).toBeVisible({ timeout: 5000 });
  
  if (text) {
    await expect(locator.first()).toContainText(text);
  }
}

// API helper: GET request with auth
async function apiGet(request, endpoint, token) {
  return await request.get(`${API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    failOnStatusCode: false,
  });
}

// API helper: POST request with auth
async function apiPost(request, endpoint, data, token) {
  return await request.post(`${API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
    failOnStatusCode: false,
  });
}

// API helper: PATCH request with auth
async function apiPatch(request, endpoint, data, token) {
  return await request.patch(`${API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
    failOnStatusCode: false,
  });
}

module.exports = {
  TEST_ACCOUNTS,
  login,
  getAuthToken,
  generateMidtransSignature,
  triggerMidtransWebhook,
  waitForElement,
  getElementText,
  clickAndWait,
  expectVisible,
  apiGet,
  apiPost,
  apiPatch,
  BASE_URL,
  API_URL,
  MIDTRANS_SERVER_KEY,
};
