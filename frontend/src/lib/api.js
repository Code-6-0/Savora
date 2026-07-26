// frontend/src/lib/api.js
// API client untuk komunikasi dengan backend

import { getToken, removeToken } from './auth';

// Base API URL dari environment variable atau default (TANPA /api)
// Konvensi: env berisi host polos, apiRequest menambahkan /api sendiri
let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Penjagaan: kalau env terlanjur diakhiri /api, jangan dobel jadi /api/api
if (API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.slice(0, -4);
}

/**
 * Make API request with automatic JWT token attachment
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} Response data or throws error
 */
export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach JWT token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Add body as JSON string if present
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    // Tambahkan /api di sini (kecuali endpoint sudah dimulai dengan /api)
    const url = endpoint.startsWith('/api')
      ? `${API_BASE_URL}${endpoint}`
      : `${API_BASE_URL}/api${endpoint}`;
    const response = await fetch(url, config);
    const data = await response.json();

    // Handle API response format: { success, data, error }
    if (!response.ok) {
      // Handle 401 Unauthorized - auto logout
      if (response.status === 401) {
        removeToken();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Throw error with proper message
      throw new Error(data.error?.message || 'Terjadi kesalahan pada server');
    }

    return data;
  } catch (error) {
    // Network error or other issues
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    }
    throw error;
  }
}

/**
 * Shorthand for GET request
 */
export function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * Shorthand for POST request
 */
export function apiPost(endpoint, body) {
  return apiRequest(endpoint, { method: 'POST', body });
}

/**
 * Shorthand for PATCH request
 */
export function apiPatch(endpoint, body) {
  return apiRequest(endpoint, { method: 'PATCH', body });
}

/**
 * Shorthand for DELETE request
 */
export function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

// Export base URL for direct access if needed
export { API_BASE_URL };
