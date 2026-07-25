"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, logout } from '@/lib/auth';
import { apiGet } from '@/lib/api';
import Button from '@/components/atoms/Button';

export default function MitraDashboardPage() {
  const router = useRouter();
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
      if (!user || user.role !== 'mitra') {
        // Bukan mitra, redirect sesuai role
        router.replace('/');
        return;
      }

      // Fetch profile terbaru dari server
      try {
        const response = await apiGet('/me');
        if (response.success && response.data) {
          setProfile(response.data.mitra_profile);
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
  const isApproved = status === 'APPROVED';
  const isPending = status === 'PENDING';
  const isRejected = status === 'REJECTED';
  const adminNote = profile?.admin_note || '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '48px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        {/* Logo & Nama Organisasi */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🤝</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
            {profile?.org_name || 'Mitra Donasi Savora'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            Status Kemitraan
          </p>
        </div>

        {/* Status Badge */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {isApproved && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              border: '2px solid #10B981'
            }}>
              <span style={{ fontSize: '20px' }}>✔</span>
              Terverifikasi
            </div>
          )}

          {isPending && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '2px solid #FCD34D'
            }}>
              <span style={{ fontSize: '20px' }}>⏳</span>
              Menunggu Verifikasi
            </div>
          )}

          {isRejected && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              border: '2px solid #FCA5A5'
            }}>
              <span style={{ fontSize: '20px' }}>❌</span>
              Ditolak
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', color: '#991B1B', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Info Konten */}
        <div style={{ marginBottom: '32px' }}>
          {isApproved && (
            <div style={{ padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#065F46', fontSize: '15px' }}>
                🎉 Selamat! Kemitraan Anda telah disetujui
              </p>
              <p style={{ margin: 0, color: '#047857', fontSize: '14px', lineHeight: '1.6' }}>
                Anda kini resmi menjadi Mitra Donasi Savora. Terima kasih telah berkontribusi dalam misi penyelamatan makanan dan pengurangan limbah.
              </p>
            </div>
          )}

          {isPending && (
            <div style={{ padding: '20px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#92400E', fontSize: '15px' }}>
                Pendaftaran Anda sedang ditinjau
              </p>
              <p style={{ margin: 0, color: '#B45309', fontSize: '14px', lineHeight: '1.6' }}>
                Tim admin Savora sedang memverifikasi data organisasi Anda. Proses ini biasanya memakan waktu 1-3 hari kerja. Anda akan mendapatkan notifikasi segera setelah verifikasi selesai.
              </p>
            </div>
          )}

          {isRejected && (
            <div style={{ padding: '20px', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#991B1B', fontSize: '15px' }}>
                Pendaftaran tidak dapat disetujui
              </p>
              {adminNote && (
                <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '8px', marginBottom: '12px', border: '1px solid #FCA5A5' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: '#7F1D1D' }}>
                    Catatan Admin:
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#991B1B', lineHeight: '1.6' }}>
                    {adminNote}
                  </p>
                </div>
              )}
              <p style={{ margin: 0, color: '#B91C1C', fontSize: '14px', lineHeight: '1.6' }}>
                Silakan hubungi admin Savora melalui email support@savora.com untuk informasi lebih lanjut atau ajukan ulang dengan data yang lebih lengkap.
              </p>
            </div>
          )}
        </div>

        {/* Informasi Profil */}
        {profile && (
          <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              Informasi Organisasi
            </h3>
            <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
              {profile.phone && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Telepon: </span>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Alamat: </span>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{profile.address}</span>
                </div>
              )}
              {profile.description && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Deskripsi: </span>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{profile.description}</span>
                </div>
              )}
            </div>
          </div>
        )}

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
