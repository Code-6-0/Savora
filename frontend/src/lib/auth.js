// frontend/src/lib/auth.js
// Auth helper functions untuk manage JWT token dan user session

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('savora_token');
}

/**
 * Save JWT token to localStorage
 * @param {string} token - JWT token to save
 */
export function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('savora_token', token);
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('savora_token');
  localStorage.removeItem('savora_user');
}

/**
 * Get user data from localStorage
 * @returns {Object|null} User object or null
 */
export function getUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('savora_user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

/**
 * Save user data to localStorage
 * @param {Object} user - User object to save
 */
export function setUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('savora_user', JSON.stringify(user));
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Logout user (clear token and user data)
 */
export function logout() {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Get redirect URL based on user role after login
 * @param {string|Object} roleOrData - User role string (old signature) or login response data (new signature)
 * @param {string} [verificationStatus] - Optional verification status (for old signature with UMKM/MITRA)
 * @returns {string} Redirect URL
 *
 * Supports both signatures for backward compatibility:
 * - getRedirectAfterLogin('CUSTOMER') // old way
 * - getRedirectAfterLogin(responseData) // new way with verification_status from login
 */
export function getRedirectAfterLogin(roleOrData, verificationStatus = null) {
  let role, status;

  // Handle both old signature (role string) and new signature (data object)
  if (typeof roleOrData === 'string') {
    role = roleOrData;
    status = verificationStatus;
  } else {
    // New signature: extract role and verification_status from login response data
    role = roleOrData.user?.role || roleOrData.role;
    status = roleOrData.verification_status;
  }

  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'UMKM':
      // Cek verification_status untuk UMKM (K3: PENDING/APPROVED/REJECTED)
      if (status === 'APPROVED') {
        return '/dashboard'; // UMKM dashboard existing
      }
      return '/verifikasi-umkm'; // PENDING atau REJECTED → halaman menunggu verifikasi
    case 'CUSTOMER':
      return '/marketplace';
    case 'MITRA_DONASI':
      return '/mitra-donasi/dashboard'; // Halaman status mitra dengan badge
    default:
      return '/';
  }
}

/**
 * Check if user has specific role
 * @param {string} requiredRole - Required role
 * @returns {boolean} True if user has required role
 */
export function hasRole(requiredRole) {
  const user = getUser();
  if (!user) return false;
  return user.role === requiredRole;
}

/**
 * Check if user is admin
 * @returns {boolean} True if user is admin
 */
export function isAdmin() {
  return hasRole('ADMIN');
}

/**
 * Check if user is UMKM
 * @returns {boolean} True if user is UMKM
 */
export function isUMKM() {
  return hasRole('UMKM');
}

/**
 * Check if user is customer
 * @returns {boolean} True if user is customer
 */
export function isCustomer() {
  return hasRole('CUSTOMER');
}
