// frontend/src/lib/useAuthGuard.js
// Auth guard hook untuk proteksi route client-side
// Digunakan untuk halaman yang membutuhkan autentikasi dan/atau role tertentu

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, getRedirectAfterLogin } from './auth';
import { apiGet } from './api';

/**
 * Guard hook untuk proteksi route berdasarkan role & verification status
 *
 * @param {string[]} allowedRoles - Array role yang diizinkan (e.g., ['UMKM', 'ADMIN'])
 *                                  Kosongkan untuk cek authenticated saja
 * @param {Object} options - Opsi tambahan
 * @param {boolean} options.checkVerification - Cek verification_status untuk UMKM (default: false)
 *                                              Jika true dan UMKM PENDING/REJECTED, redirect ke /verifikasi-umkm
 * @returns {{ loading: boolean }} - loading state selama pengecekan auth
 *
 * @example
 * // Di halaman UMKM dashboard yang perlu cek verification:
 * const { loading } = useAuthGuard(['UMKM'], { checkVerification: true });
 * if (loading) return <LoadingSpinner />;
 *
 * @example
 * // Di halaman admin:
 * const { loading } = useAuthGuard(['ADMIN']);
 * if (loading) return null;
 */
export function useAuthGuard(allowedRoles = [], options = {}) {
  const { checkVerification = false } = options;
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Cek authenticated - tanpa token redirect ke /login
      if (!isAuthenticated()) {
        router.replace('/login');
        return;
      }

      // 2. Get user dari localStorage
      const user = getUser();
      if (!user || !user.role) {
        router.replace('/login');
        return;
      }

      // 3. Cek role - jika tidak sesuai, redirect ke halaman sesuai role-nya
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const redirectUrl = getRedirectAfterLogin(user.role, user.verification_status);
        router.replace(redirectUrl);
        return;
      }

      // 4. Cek verification status untuk UMKM (opsional)
      if (checkVerification && user.role === 'UMKM') {
        let verificationStatus = user.verification_status;

        // Jika tidak ada di localStorage, fetch dari API
        if (!verificationStatus) {
          try {
            const response = await apiGet('/me');
            if (response.success && response.data?.umkm_profile) {
              verificationStatus = response.data.umkm_profile.verification_status;
            }
          } catch (err) {
            console.error('Failed to fetch verification status:', err);
            // Jika fetch gagal, lanjutkan tanpa redirect (assume approved)
          }
        }

        // Jika PENDING atau REJECTED, redirect ke /verifikasi-umkm
        if (verificationStatus === 'PENDING' || verificationStatus === 'REJECTED') {
          router.replace('/verifikasi-umkm');
          return;
        }
      }

      // Semua check passed - halaman boleh diakses
      setLoading(false);
    };

    checkAuth();
  }, [router, allowedRoles, checkVerification]);

  return { loading };
}
