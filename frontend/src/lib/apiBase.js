/**
 * API Base URL Configuration
 *
 * Konsolidasi semua akses base URL backend ke satu modul untuk konsistensi.
 *
 * Konvensi:
 * - Base URL TANPA suffix `/api`
 * - Setiap call site harus menulis path lengkap termasuk `/api/...`
 * - Default port 8000 (backend Go), bukan 3001
 *
 * Env vars (priority order):
 * 1. NEXT_PUBLIC_API_BASE_URL (prefer ini di .env)
 * 2. NEXT_PUBLIC_API_URL (fallback untuk backward compatibility)
 * 3. http://localhost:8000 (default development)
 */

export function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
  );
}
