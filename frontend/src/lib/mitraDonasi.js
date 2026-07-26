// API client for Mitra Donasi endpoints
// Connects to backend /api/mitra-donasi/* routes

import { getToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get dashboard stats and latest offers for mitra donasi
 * GET /api/mitra-donasi/dashboard
 * @returns {Promise<Object>} { stats: { pending_offers, scheduled_pickups, total_portions, unique_donors }, latest_offers: [], scheduled_pickups: [] }
 */
export async function getMitraDashboardStats() {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/mitra-donasi/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gagal mengambil data dashboard');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching mitra dashboard stats:', error);
    throw error;
  }
}

/**
 * Get donation offers (penawaran) for mitra donasi
 * GET /api/mitra-donasi/penawaran?status=PENDING
 * @param {string} status - Filter by status (PENDING, ACCEPTED, REJECTED, COMPLETED, EXPIRED, CANCELLED)
 * @returns {Promise<Object>} { offers: [], total: number }
 */
export async function getMitraDonationOffers(status = '') {
  const token = getToken();
  
  try {
    const url = new URL(`${API_BASE_URL}/api/mitra-donasi/penawaran`);
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gagal mengambil data penawaran');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching mitra donation offers:', error);
    throw error;
  }
}

/**
 * Accept a donation offer
 * POST /api/mitra-donasi/penawaran/:id/accept
 * @param {number} offerId - Offer ID
 * @param {string} notes - Optional notes from mitra
 * @returns {Promise<Object>} { message: string, offer: Object }
 */
export async function acceptDonationOffer(offerId, notes = '') {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/mitra-donasi/penawaran/${offerId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gagal menerima penawaran');
    }

    return data.data;
  } catch (error) {
    console.error('Error accepting donation offer:', error);
    throw error;
  }
}

/**
 * Reject a donation offer
 * POST /api/mitra-donasi/penawaran/:id/reject
 * @param {number} offerId - Offer ID
 * @param {string} reason - Required reason for rejection
 * @returns {Promise<Object>} { message: string, offer: Object }
 */
export async function rejectDonationOffer(offerId, reason) {
  const token = getToken();
  
  if (!reason || reason.trim() === '') {
    throw new Error('Alasan penolakan wajib diisi');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/mitra-donasi/penawaran/${offerId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gagal menolak penawaran');
    }

    return data.data;
  } catch (error) {
    console.error('Error rejecting donation offer:', error);
    throw error;
  }
}

/**
 * Get donation history (riwayat) for mitra donasi
 * GET /api/mitra-donasi/riwayat?date_from=&date_to=
 * @param {string} dateFrom - Filter from date (YYYY-MM-DD)
 * @param {string} dateTo - Filter to date (YYYY-MM-DD)
 * @returns {Promise<Object>} { history: [], total: number, total_portions: number, total_weight: number }
 */
export async function getMitraDonationHistory(dateFrom = '', dateTo = '') {
  const token = getToken();
  
  try {
    const url = new URL(`${API_BASE_URL}/api/mitra-donasi/riwayat`);
    if (dateFrom) {
      url.searchParams.append('date_from', dateFrom);
    }
    if (dateTo) {
      url.searchParams.append('date_to', dateTo);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gagal mengambil data riwayat');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching mitra donation history:', error);
    throw error;
  }
}

/**
 * Format date for API (YYYY-MM-DD)
 * @param {Date} date 
 * @returns {string}
 */
export function formatDateForAPI(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format donation offer status to Indonesian
 * @param {string} status 
 * @returns {string}
 */
export function formatOfferStatus(status) {
  const statusMap = {
    'PENDING': 'Menunggu',
    'ACCEPTED': 'Diterima',
    'REJECTED': 'Ditolak',
    'COMPLETED': 'Selesai',
    'EXPIRED': 'Kadaluarsa',
    'CANCELLED': 'Dibatalkan',
  };
  return statusMap[status] || status;
}

/**
 * Get status badge color
 * @param {string} status 
 * @returns {string}
 */
export function getOfferStatusColor(status) {
  const colorMap = {
    'PENDING': 'warning',
    'ACCEPTED': 'success',
    'REJECTED': 'danger',
    'COMPLETED': 'primary',
    'EXPIRED': 'muted',
    'CANCELLED': 'muted',
  };
  return colorMap[status] || 'muted';
}

/**
 * Get mitra profile from /api/me
 * @returns {Promise<Object>} { user: Object, mitra_profile: Object }
 */
export async function getMitraProfile() {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gagal mengambil data profil');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching mitra profile:', error);
    throw error;
  }
}
