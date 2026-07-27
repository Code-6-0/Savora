"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { isAuthenticated, getUser, logout } from '@/lib/auth';
import { apiGet } from '@/lib/api';
import Button from '@/components/atoms/Button';

export default function VerifikasiUmkmPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuthGuard(['UMKM']);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.replace('/login');
        return;
      }

      const user = getUser();
      // Normalisasi case defensif: lowercase untuk role
      const normalizedRole = String(user?.role || '').toLowerCase();
      if (!user || normalizedRole !== 'umkm') {
        // Bukan UMKM, redirect sesuai role
        router.replace('/');
        return;
      }

      // Fetch profile terbaru dari server
      try {
        const response = await apiGet('/me');
        if (response.success && response.data) {
          setProfile(response.data.umkm_profile);

          // Jika ternyata sudah APPROVED, redirect ke dashboard UMKM
          if (response.data.umkm_profile?.verification_status === 'APPROVED') {
            router.replace('/dashboard');
            return;
          }
        } else {
          setError('Gagal memuat data profil');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (authLoading) {
    return <div style={{ padding: '40px', color: '#6B7280' }}>Memuat...</div>;
  }

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  const status = profile?.verification_status || 'PENDING';
  const isPending = status === 'PENDING';
  const isRejected = status === 'REJECTED';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '560px', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '48px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ fontSize: '48px', marginBottom: '24px', color: 'var(--primary-color)' }}>
          {isPending ? '⏳' : '❌'}
        </div>

        {/* Header */}
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-main)' }}>
          {isPending ? 'Menunggu Verifikasi Admin' : 'Verifikasi Ditolak'}
        </h1>

        {/* Status badge */}
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '24px',
          backgroundColor: isPending ? '#FEF3C7' : '#FEE2E2',
          color: isPending ? '#92400E' : '#991B1B',
          border: `1px solid ${isPending ? '#FCD34D' : '#FCA5A5'}`
        }}>
          Status: {status}
        </div>

        {/* Pesan */}
        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', color: '#991B1B', textAlign: 'left' }}>
            {error}
          </div>
        )}

        {isPending && (
          <div style={{ marginBottom: '32px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 12px' }}>
              Akun UMKM Anda sedang dalam proses peninjauan oleh tim admin Savora.
            </p>
            <p style={{ margin: 0 }}>
              Anda akan mendapatkan notifikasi segera setelah akun Anda diverifikasi. Mohon bersabar, proses ini biasanya memakan waktu 1-2 hari kerja.
            </p>
          </div>
        )}

        {isRejected && (
          <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#FEE2E2', borderRadius: '8px', border: '1px solid #FCA5A5', textAlign: 'left' }}>
            <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#991B1B' }}>
              Mohon maaf, pengajuan UMKM Anda tidak dapat disetujui.
            </p>
            <p style={{ margin: 0, color: '#7F1D1D', fontSize: '14px', lineHeight: '1.6' }}>
              Silakan hubungi admin Savora melalui email support@savora.com untuk informasi lebih lanjut atau ajukan ulang dengan data yang lebih lengkap.
            </p>
          </div>
        )}

        {/* Info tambahan */}
        <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', marginBottom: '24px', textAlign: 'left' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <strong>Apa yang bisa saya lakukan?</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <li>Pastikan data bisnis Anda lengkap dan valid</li>
            <li>Hubungi admin jika ada pertanyaan</li>
            {isPending && <li>Refresh halaman ini untuk cek status terbaru</li>}
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          {isPending && (
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 600 }}
            >
              🔄 Refresh Status
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={handleLogout}
            style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 600, backgroundColor: 'transparent', border: '2px solid var(--border-color)', color: 'var(--text-main)' }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
