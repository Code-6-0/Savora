/**
 * API Helper — satu sumber kebenaran untuk semua pemanggilan backend
 *
 * Backend: Go + Fiber v2 di port 8000
 * Semua route backend berada di bawah prefix /api
 *
 * Konvensi:
 * - Base URL TANPA suffix /api (contoh: http://localhost:8000)
 * - Helper menambahkan prefix /api otomatis
 * - Path endpoint selalu diawali "/" (contoh: "/orders", "/products/123")
 */

import { getToken, removeToken } from './auth.js';

// Base API URL dari environment variable atau default (TANPA /api)
// Konvensi: env berisi host polos, apiRequest menambahkan /api sendiri
let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Penjagaan: kalau env terlanjur diakhiri /api, jangan dobel jadi /api/api
if (API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.slice(0, -4);
}

/**
 * Buat URL lengkap untuk endpoint backend dengan prefix /api
 * @param {string} path - Path endpoint TANPA prefix /api (contoh: "/orders", "/products/123")
 * @returns {string} URL lengkap dengan prefix /api
 *
 * @example
 * apiUrl('/orders') → 'http://localhost:8000/api/orders'
 * apiUrl('/products/123') → 'http://localhost:8000/api/products/123'
 */
export function apiUrl(path) {
  // Pastikan path diawali "/"
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}/api${cleanPath}`;
}

/**
 * Fetch wrapper dengan error handling standar dan JWT token otomatis
 * @param {string} path - Path endpoint TANPA prefix /api
 * @param {object} options - Fetch options (method, headers, body, dll.)
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} Jika response tidak OK atau network error
 *
 * @example
 * // GET request
 * const orders = await apiFetch('/orders');
 *
 * // POST request
 * const newOrder = await apiFetch('/orders', {
 *   method: 'POST',
 *   body: { product_id: 1, quantity: 2 }
 * });
 *
 * // PATCH request
 * await apiFetch('/orders/123/status', {
 *   method: 'PATCH',
 *   body: { status: 'READY_FOR_PICKUP' }
 * });
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach JWT token jika tersedia
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Convert body object ke JSON string
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(apiUrl(path), config);

    // Handle non-JSON response (untuk kasus khusus seperti file download)
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      // Coba parse error sebagai JSON
      let errorData = {};
      if (isJson) {
        errorData = await response.json().catch(() => ({}));
      }

      // Handle 401 Unauthorized - auto logout
      if (response.status === 401) {
        removeToken();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Throw error dengan pesan dari backend atau fallback
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    // Return parsed JSON jika response JSON, atau response object untuk non-JSON
    return isJson ? response.json() : response;
  } catch (error) {
    // Network error atau fetch gagal
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    }
    throw error;
  }
}

/**
 * Shorthand untuk GET request
 * @param {string} path - Path endpoint TANPA prefix /api
 * @returns {Promise<object>} Response JSON
 */
export function apiGet(path) {
  return apiFetch(path, { method: 'GET' });
}

/**
 * Shorthand untuk POST request
 * @param {string} path - Path endpoint TANPA prefix /api
 * @param {object} body - Request body (akan di-stringify otomatis)
 * @returns {Promise<object>} Response JSON
 */
export function apiPost(path, body) {
  return apiFetch(path, { method: 'POST', body });
}

/**
 * Shorthand untuk PATCH request
 * @param {string} path - Path endpoint TANPA prefix /api
 * @param {object} body - Request body (akan di-stringify otomatis)
 * @returns {Promise<object>} Response JSON
 */
export function apiPatch(path, body) {
  return apiFetch(path, { method: 'PATCH', body });
}

/**
 * Shorthand untuk DELETE request
 * @param {string} path - Path endpoint TANPA prefix /api
 * @returns {Promise<object>} Response JSON
 */
export function apiDelete(path) {
  return apiFetch(path, { method: 'DELETE' });
}

// Export API_BASE untuk kasus khusus yang butuh base URL tanpa helper
export { API_BASE };
