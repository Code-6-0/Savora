"use client";

import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { getUser } from '@/lib/auth';
import { apiGet } from '@/lib/api';
import SavoraNavbar from '@/components/navbar/SavoraNavbar';

/**
 * F4: Halaman /profil-saya — Profil untuk semua role (milik Alia)
 * Guard: useAuthGuard tanpa allowedRoles (cuma cek authenticated)
 * Data: dari savora_user (localStorage) dengan optional fetch /api/me untuk data segar
 */

// Helper: role label ramah user (case-insensitive input)
function getRoleLabel(role) {
  const normalized = String(role || '').toUpperCase();
  switch (normalized) {
    case 'CUSTOMER':
      return 'Customer';
    case 'UMKM':
      return 'UMKM';
    case 'ADMIN':
      return 'Admin';
    case 'MITRA_DONASI':
    case 'MITRA':
      return 'Mitra Donasi';
    default:
      return 'Pengguna';
  }
}

// Helper: format tanggal bergabung (ISO → "5 Januari 2026")
function formatJoinDate(isoDate) {
  if (!isoDate) return 'Tidak tersedia';

  try {
    const date = new Date(isoDate);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch (err) {
    return 'Tidak tersedia';
  }
}

// Helper: avatar inisial (name → email → "?")
function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  if (email && email.trim()) {
    return email[0].toUpperCase();
  }

  return '?';
}

export default function ProfilSayaPage() {
  const { loading: authLoading } = useAuthGuard([], {}); // Guest → /login; semua role login boleh

  const [userData, setUserData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      // 1. Ambil dari localStorage dulu (savora_user)
      const localUser = getUser();

      if (!localUser) {
        setFetchError('Data pengguna tidak ditemukan. Silakan login ulang.');
        setDataLoading(false);
        return;
      }

      // Set data awal dari localStorage
      setUserData(localUser);

      // 2. Coba fetch dari /api/me untuk data segar (optional, fallback ke localUser)
      try {
        const response = await apiGet('/me');
        if (response.success && response.data?.user) {
          setUserData(response.data.user);
        }
        // Jika gagal fetch, tetap pakai localUser (tidak masalah)
      } catch (err) {
        console.log('Failed to fetch fresh data, using localStorage:', err);
        // Tetap pakai localUser dari localStorage (sudah di-set di atas)
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) {
      loadUserData();
    }
  }, [authLoading]);

  // Loading state
  if (authLoading || dataLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
        <SavoraNavbar />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          fontSize: '14px',
          color: '#6B7280'
        }}>
          Memuat data...
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError || !userData) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
        <SavoraNavbar />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ fontSize: '14px', color: '#DC2626', fontWeight: 500 }}>
            {fetchError || 'Data tidak ditemukan'}
          </div>
        </div>
      </div>
    );
  }

  const initials = getInitials(userData.name, userData.email);
  const roleLabel = getRoleLabel(userData.role);
  const joinDate = formatJoinDate(userData.created_at);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <SavoraNavbar />

      {/* Main Content */}
      <div style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 6px'
          }}>
            Profil Saya
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            margin: 0
          }}>
            Informasi profil dan pengaturan akun Anda
          </p>
        </div>

        {/* Kartu Profil */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          {/* Avatar & Nama */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Avatar Inisial Besar */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#1B7A43',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
              flexShrink: 0
            }}>
              {initials}
            </div>

            {/* Nama & Role */}
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 4px'
              }}>
                {userData.name || 'Nama tidak tersedia'}
              </h2>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: '#D1FAE5',
                color: '#065F46',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '12px'
              }}>
                {roleLabel}
              </div>
            </div>
          </div>

          {/* Informasi Detail */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Email */}
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#6B7280',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Email
              </div>
              <div style={{
                fontSize: '14px',
                color: '#111827',
                fontWeight: 500
              }}>
                {userData.email || 'Tidak tersedia'}
              </div>
            </div>

            {/* Tanggal Bergabung */}
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#6B7280',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Bergabung Sejak
              </div>
              <div style={{
                fontSize: '14px',
                color: '#111827',
                fontWeight: 500
              }}>
                {joinDate}
              </div>
            </div>
          </div>
        </div>

        {/* Kartu Reward (Soon) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          position: 'relative'
        }}>
          {/* Badge "Soon" */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '4px 10px',
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            fontSize: '11px',
            fontWeight: 700,
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Segera Hadir
          </div>

          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            margin: '0 0 8px'
          }}>
            Reward & Badge
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Kumpulkan poin dari setiap transaksi dan dapatkan badge eksklusif sebagai penghargaan kontribusi Anda dalam mengurangi food waste.
          </p>
        </div>
      </div>
    </div>
  );
}
