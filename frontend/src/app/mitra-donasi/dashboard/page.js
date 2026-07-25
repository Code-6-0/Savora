'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, getToken, logout } from '@/lib/auth';
import {
  DEMO_STATS_DONASI,
  DEMO_STATS_PENGOLAH,
  DEMO_PENAWARAN_DONASI,
  DEMO_PENAWARAN_LIMBAH,
  DEMO_JADWAL_AWAL,
  KETENTUAN_DONASI,
  KETENTUAN_PENGOLAH,
} from '@/lib/mitraDemoData';

// DEMO CONFIG - Ganti 'donasi' ke 'pengolah' untuk testing varian B
const DEMO_CONFIG = {
  kategori: 'donasi', // 'donasi' atau 'pengolah'
};

export default function MitraDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [mitraProfile, setMitraProfile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // State untuk penawaran dan jadwal (demo)
  const [penawaran, setPenawaran] = useState([]);
  const [jadwal, setJadwal] = useState(DEMO_JADWAL_AWAL);

  // Guard: cek auth + role
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const currentUser = getUser();
    if (!currentUser || currentUser.role?.toUpperCase() !== 'MITRA_DONASI') {
      router.push('/'); // Redirect jika bukan mitra
      return;
    }

    setUser(currentUser);

    // Fetch profile untuk status verifikasi
    async function fetchProfile() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/me`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        const data = await response.json();

        if (data.success && data.data.mitra_profile) {
          setMitraProfile(data.data.mitra_profile);
          setVerificationStatus(data.data.mitra_profile.verification_status?.toUpperCase());
        } else {
          // Fallback: gunakan data dari localStorage
          setVerificationStatus('PENDING');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setVerificationStatus('PENDING'); // Fallback
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  // Load penawaran berdasarkan kategori
  useEffect(() => {
    if (verificationStatus === 'APPROVED') {
      setPenawaran(
        DEMO_CONFIG.kategori === 'donasi'
          ? DEMO_PENAWARAN_DONASI
          : DEMO_PENAWARAN_LIMBAH
      );
    }
  }, [verificationStatus]);

  // Handler tombol Terima
  function handleTerima(id) {
    const item = penawaran.find((p) => p.id === id);
    if (item) {
      setJadwal((prev) => [...prev, { ...item, waktu_dijadwalkan: new Date().toISOString() }]);
      setPenawaran((prev) => prev.filter((p) => p.id !== id));
    }
  }

  // Handler tombol Tolak
  function handleTolak(id) {
    setPenawaran((prev) => prev.filter((p) => p.id !== id));
  }

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-color)',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--border-color)',
            borderTop: '4px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p>Memuat dashboard...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Status PENDING - DEMO: Show full dashboard for testing
  if (false && verificationStatus === 'PENDING') { // Temporarily disabled for demo
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-color)',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          backgroundColor: 'var(--card-bg)',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}>
            ⏳
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--text-main)' }}>
            Menunggu Verifikasi
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
            Akun Anda sedang dalam proses verifikasi oleh admin. Anda akan dapat mengakses dashboard
            setelah akun disetujui.
          </p>
          <button
            onClick={logout}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Status REJECTED - DEMO: Show full dashboard for testing
  if (false && verificationStatus === 'REJECTED') { // Temporarily disabled for demo
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-color)',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          backgroundColor: 'var(--card-bg)',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid var(--danger-color)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}>
            ✕
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--text-main)' }}>
            Verifikasi Ditolak
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
            Maaf, pengajuan Anda sebagai mitra tidak dapat disetujui.
          </p>
          {mitraProfile?.admin_note && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEE2E2',
              color: 'var(--danger-color)',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.875rem',
              textAlign: 'left',
            }}>
              <strong>Catatan Admin:</strong><br />
              {mitraProfile.admin_note}
            </div>
          )}
          <button
            onClick={logout}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Status APPROVED - Dashboard Penuh
  const isDonasi = DEMO_CONFIG.kategori === 'donasi';
  const stats = isDonasi ? DEMO_STATS_DONASI : DEMO_STATS_PENGOLAH;
  const ketentuan = isDonasi ? KETENTUAN_DONASI : KETENTUAN_PENGOLAH;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--primary-color)', fontSize: '24px' }}>⚲</span>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Savora - Dashboard Mitra
          </h1>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: 'white',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Info Mitra */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                {mitraProfile?.org_name || user?.name || 'Mitra Savora'}
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {isDonasi ? '🍽️ Donasi Makanan (Penyalur)' : '♻️ Pengolah Limbah'}
                </span>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: '#D1FAE5',
                  color: '#065F46',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  ✓ APPROVED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistik 4 Kartu */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {isDonasi ? (
            <>
              <StatCard title="Penawaran Baru" value={stats.penawaran_baru} icon="📩" />
              <StatCard title="Penjemputan Hari Ini" value={stats.penjemputan_hari_ini} icon="🚚" />
              <StatCard title="Porsi Tersalurkan (Bulan Ini)" value={stats.porsi_tersalurkan_bulan_ini} icon="🍱" />
              <StatCard title="Donatur Unik" value={stats.donatur_unik} icon="👥" />
            </>
          ) : (
            <>
              <StatCard title="Penawaran Limbah Baru" value={stats.penawaran_limbah_baru} icon="📩" />
              <StatCard title="Pengangkutan Hari Ini" value={stats.pengangkutan_hari_ini} icon="🚛" />
              <StatCard title="Total Diolah (Bulan Ini)" value={`${stats.total_kg_diolah_bulan_ini} kg`} icon="⚖️" />
              <StatCard title={`Output: ${stats.output_produksi.label}`} value={stats.output_produksi.value} icon="♻️" />
            </>
          )}
        </div>

        {/* Daftar Penawaran Masuk */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
            {isDonasi ? '📩 Penawaran Donasi Masuk' : '📩 Penawaran Limbah Masuk'}
          </h3>
          {penawaran.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
              Tidak ada penawaran baru saat ini
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {penawaran.map((item) =>
                isDonasi ? (
                  <PenawaranDonasiCard key={item.id} item={item} onTerima={handleTerima} onTolak={handleTolak} />
                ) : (
                  <PenawaranLimbahCard key={item.id} item={item} onTerima={handleTerima} onTolak={handleTolak} />
                )
              )}
            </div>
          )}
        </div>

        {/* Jadwal Penjemputan */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
            {isDonasi ? '📅 Jadwal Penjemputan' : '📅 Jadwal Pengangkutan'}
          </h3>
          {jadwal.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
              Belum ada jadwal. Tekan "Terima" pada penawaran untuk menambahkan ke jadwal.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {jadwal.map((item) => (
                <JadwalCard key={item.id} item={item} isDonasi={isDonasi} />
              ))}
            </div>
          )}
        </div>

        {/* Panel Ketentuan */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
            📋 {ketentuan.judul}
          </h3>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-main)', lineHeight: '1.8' }}>
            {ketentuan.poin.map((poin, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>{poin}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Komponen StatCard
function StatCard({ title, value, icon }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <span style={{ fontSize: '2rem' }}>{icon}</span>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{title}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</p>
    </div>
  );
}

// Komponen PenawaranDonasiCard
function PenawaranDonasiCard({ item, onTerima, onTolak }) {
  const countdown = getCountdown(item.batas_layak);

  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{item.donatur_nama}</strong>
            <span style={{
              padding: '2px 8px',
              backgroundColor: item.donatur_badge === 'UMKM' ? '#DBEAFE' : '#FEF3C7',
              color: item.donatur_badge === 'UMKM' ? '#1E40AF' : '#92400E',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              {item.donatur_badge === 'UMKM' ? '🏪 UMKM' : '👤 Customer'}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            📍 {item.lokasi} ({item.jarak_km} km)
          </p>
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-main)' }}>
        <strong>Jenis:</strong> {item.jenis_makanan}
      </p>
      <p style={{ fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-main)' }}>
        <strong>Estimasi Porsi:</strong> {item.estimasi_porsi} porsi
      </p>
      <p style={{ fontSize: '0.875rem', marginBottom: '12px', color: 'var(--text-main)' }}>
        <strong>Batas Layak:</strong> <span style={{ color: countdown.color, fontWeight: 600 }}>{countdown.label}</span>
      </p>

      <div style={{
        backgroundColor: '#F9FAFB',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '12px',
        fontSize: '0.75rem',
      }}>
        <strong style={{ display: 'block', marginBottom: '8px' }}>Checklist Kelayakan:</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: item.checklist.disiapkan_fresh ? 'var(--success-color)' : 'var(--danger-color)' }}>
            {item.checklist.disiapkan_fresh ? '✓' : '✗'} Disiapkan fresh (&lt; 4 jam)
          </span>
          <span style={{ color: item.checklist.disimpan_tertutup ? 'var(--success-color)' : 'var(--danger-color)' }}>
            {item.checklist.disimpan_tertutup ? '✓' : '✗'} Disimpan tertutup
          </span>
          <span style={{ color: item.checklist.bukan_berisiko_tinggi ? 'var(--success-color)' : 'var(--danger-color)' }}>
            {item.checklist.bukan_berisiko_tinggi ? '✓' : '✗'} Bukan pangan berisiko tinggi
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onTerima(item.id)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ✓ Terima
        </button>
        <button
          onClick={() => onTolak(item.id)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: 'white',
            color: 'var(--danger-color)',
            border: '1px solid var(--danger-color)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ✗ Tolak
        </button>
      </div>
    </div>
  );
}

// Komponen PenawaranLimbahCard
function PenawaranLimbahCard({ item, onTerima, onTolak }) {
  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '16px',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{item.umkm_nama}</strong>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          📍 {item.lokasi} ({item.jarak_km} km)
        </p>
      </div>

      <p style={{ fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-main)' }}>
        <strong>Jenis Limbah:</strong> {item.jenis_limbah}
      </p>
      <p style={{ fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
        {item.deskripsi}
      </p>
      <p style={{ fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-main)' }}>
        <strong>Estimasi Berat:</strong> {item.estimasi_berat_kg} kg
      </p>
      <p style={{ fontSize: '0.875rem', marginBottom: '12px', color: 'var(--text-main)' }}>
        <strong>Frekuensi:</strong> {item.frekuensi}
      </p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onTerima(item.id)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ✓ Terima
        </button>
        <button
          onClick={() => onTolak(item.id)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: 'white',
            color: 'var(--danger-color)',
            border: '1px solid var(--danger-color)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ✗ Tolak
        </button>
      </div>
    </div>
  );
}

// Komponen JadwalCard
function JadwalCard({ item, isDonasi }) {
  return (
    <div style={{
      border: '1px solid var(--success-color)',
      backgroundColor: '#F0FDF4',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '0.875rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{isDonasi ? item.donatur_nama : item.umkm_nama}</strong>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            {isDonasi ? `${item.estimasi_porsi} porsi` : `${item.estimasi_berat_kg} kg`} • {item.lokasi}
          </p>
        </div>
        <span style={{
          padding: '4px 8px',
          backgroundColor: 'var(--success-color)',
          color: 'white',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          ✓ Dijadwalkan
        </span>
      </div>
    </div>
  );
}

// Helper: countdown label & color
function getCountdown(batasLayak) {
  const now = new Date();
  const batas = new Date(batasLayak);
  const diffMs = batas - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffMs < 0) {
    return { label: 'Kedaluwarsa', color: 'var(--danger-color)' };
  }

  if (diffHours < 1) {
    return { label: `${diffMins} menit lagi`, color: 'var(--danger-color)' };
  }

  if (diffHours < 3) {
    return { label: `${diffHours} jam ${diffMins} menit`, color: 'var(--warning-color)' };
  }

  return { label: `${diffHours} jam ${diffMins} menit`, color: 'var(--success-color)' };
}
