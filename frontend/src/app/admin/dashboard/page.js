'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import SummaryCard from '@/components/molecules/SummaryCard';
import Badge from '@/components/atoms/Badge';
import { apiGet } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { Users, Store, ShoppingCart, TrendingUp, Package, CheckCircle, Clock, AlertTriangle, Leaf } from 'lucide-react';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topUMKMPeriod, setTopUMKMPeriod] = useState('month'); // 'month' or '30days'
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGet('/admin/reports/summary');
      if (response.success) {
        setSummary(response.data.summary);
      } else {
        setError(response.error?.message || 'Gagal memuat data dashboard');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="mobile-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="sidebar-header"><span style={{ color: "var(--primary-color)" }}>⚲</span> Savora Admin</div>
        </div>
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>
        <div className="main-container">
          <div className="topbar">
            <div><div className="page-title">Dashboard Admin</div></div>
          </div>
          <div className="content-area">
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '14px' }}>Memuat data dashboard...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <div className="mobile-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="sidebar-header"><span style={{ color: "var(--primary-color)" }}>⚲</span> Savora Admin</div>
        </div>
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>
        <div className="main-container">
          <div className="topbar">
            <div><div className="page-title">Dashboard Admin</div></div>
          </div>
          <div className="content-area">
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ color: 'var(--danger-color)', fontSize: '14px', marginBottom: '10px' }}>{error}</div>
              <button className="btn-primary" onClick={fetchDashboardData}>Coba Lagi</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>
        <div className="sidebar-header">
          <span style={{ color: "var(--primary-color)" }}>⚲</span> Savora Admin
        </div>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="main-container">
        <div className="topbar">
          <div>
            <div className="page-title">Dashboard Admin</div>
            <div className="page-subtitle">Ringkasan aktivitas platform Savora</div>
          </div>
        </div>

        <div className="content-area">
          {/* SECTION 1: Platform Overview */}
          <div style={{ marginBottom: '30px' }}>
            <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <SummaryCard
                title="Total UMKM Aktif"
                value={summary?.total_umkm || 0}
                icon={<Store size={24} />}
                trend={summary?.umkm_aktif_delta_persen ? formatPercent(summary.umkm_aktif_delta_persen) : null}
                trendLabel="vs bulan lalu"
                trendUp={summary?.umkm_aktif_delta_persen >= 0}
              />
              <SummaryCard
                title="Total Customer"
                value={summary?.total_customers || 0}
                icon={<Users size={24} />}
                trend={summary?.customer_baru_count ? `+${summary.customer_baru_count} baru` : null}
                trendLabel="bulan ini"
                trendUp={true}
              />
              <SummaryCard
                title="Transaksi Hari Ini"
                value={summary?.transaksi_hari_ini_count || 0}
                icon={<ShoppingCart size={24} />}
              />
              <SummaryCard
                title="Revenue Platform"
                value={formatCurrency(summary?.revenue_bulan_ini || 0)}
                icon={<TrendingUp size={24} />}
                trend={summary?.revenue_delta_persen ? formatPercent(summary.revenue_delta_persen) : null}
                trendLabel="bulan ini"
                trendUp={summary?.revenue_delta_persen >= 0}
              />
            </div>
          </div>

          {/* SECTION 2: Aktivitas Hari Ini */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Aktivitas Hari Ini
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
              {/* Transaksi Berjalan */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>
                  Transaksi Berjalan
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>
                  {summary?.orders_today_count || 0}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {summary?.orders_today_by_status && Object.entries(summary.orders_today_by_status).map(([status, count]) => (
                    <Badge
                      key={status}
                      variant={
                        status === 'Selesai' ? 'success' :
                        status === 'Siap Diambil' ? 'info' :
                        status === 'Diproses' ? 'warning' :
                        status === 'Dibatalkan' ? 'danger' : 'secondary'
                      }
                      text={`${status}: ${count}`}
                    />
                  ))}
                </div>
              </div>

              {/* Pendaftaran Baru */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>
                  Pendaftaran Baru Hari Ini
                </div>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                      {summary?.registrations_today_umkm || 0}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UMKM</div>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }}></div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                      {summary?.registrations_today_customer || 0}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Moderasi Prioritas */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Moderasi Prioritas
            </h3>
            <div className="card" style={{ padding: '0', borderLeft: '4px solid var(--warning-color)' }}>
              {/* UMKM Menunggu Verifikasi */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Store size={18} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>UMKM menunggu verifikasi</span>
                  {(summary?.umkm_pending_count || 0) > 0 && (
                    <Badge variant="danger" text={summary.umkm_pending_count} />
                  )}
                </div>
                <Link href="/admin/verifikasi?tab=umkm" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
                  Lihat →
                </Link>
              </div>

              {/* Mitra Donasi Menunggu Persetujuan */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={18} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Mitra donasi menunggu persetujuan</span>
                  {(summary?.mitra_pending_count || 0) > 0 && (
                    <Badge variant="danger" text={summary.mitra_pending_count} />
                  )}
                </div>
                <Link href="/admin/verifikasi?tab=mitra" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
                  Lihat →
                </Link>
              </div>

              {/* Iklan Menunggu Tinjauan */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>◉</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Iklan menunggu tinjauan</span>
                  {(summary?.iklan_pending_count || 0) > 0 && (
                    <Badge variant="danger" text={summary.iklan_pending_count} />
                  )}
                </div>
                <Link href="/admin/iklan?tab=pending" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
                  Lihat →
                </Link>
              </div>

              {/* Listing Perlu Moderasi */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertTriangle size={18} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Listing perlu moderasi</span>
                  {(summary?.listing_moderasi_count || 0) > 0 && (
                    <Badge variant="danger" text={summary.listing_moderasi_count} />
                  )}
                </div>
                <Link href="/admin/moderasi-listing?filter=needs-review" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
                  Lihat →
                </Link>
              </div>

              {/* Laporan Customer Baru */}
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>!</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Laporan customer baru</span>
                  {(summary?.tiket_help_baru_count || 0) > 0 && (
                    <Badge variant="danger" text={summary.tiket_help_baru_count} />
                  )}
                </div>
                <Link href="/admin/help-center?tab=new" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
                  Lihat →
                </Link>
              </div>
            </div>
          </div>

          {/* SECTION 4: Quick Actions */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px'
            }}>
              {/* Button 1: Verifikasi UMKM */}
              <Link href="/admin/verifikasi?tab=umkm" style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>✓</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Verifikasi UMKM
                  </div>
                  {(summary?.umkm_pending_count || 0) > 0 && (
                    <Badge variant="danger" text={summary.umkm_pending_count} />
                  )}
                </div>
              </Link>

              {/* Button 2: Setujui Mitra */}
              <Link href="/admin/verifikasi?tab=mitra" style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>♥</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Setujui Mitra
                  </div>
                  {(summary?.mitra_pending_count || 0) > 0 && (
                    <Badge variant="danger" text={summary.mitra_pending_count} />
                  )}
                </div>
              </Link>

              {/* Button 3: Review Iklan */}
              <Link href="/admin/iklan?tab=pending" style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>◉</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Review Iklan
                  </div>
                  {(summary?.iklan_pending_count || 0) > 0 && (
                    <Badge variant="danger" text={summary.iklan_pending_count} />
                  )}
                </div>
              </Link>

              {/* Button 4: Laporan Customer */}
              <Link href="/admin/help-center?tab=new" style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>!</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Laporan Customer
                  </div>
                  {(summary?.tiket_help_baru_count || 0) > 0 && (
                    <Badge variant="danger" text={summary.tiket_help_baru_count} />
                  )}
                </div>
              </Link>

              {/* Button 5: Listing Expired */}
              <Link href="/admin/moderasi-listing?filter=expired" style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏱</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Listing Expired
                  </div>
                  {(summary?.listing_kedaluwarsa || 0) > 0 && (
                    <Badge variant="danger" text={summary.listing_kedaluwarsa} />
                  )}
                </div>
              </Link>

              {/* Button 6: Top UMKM Paling Aktif */}
              <Link href="/admin/umkm?sort=orders_completed&period=month" style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>★</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Top UMKM Paling Aktif
                  </div>
                </div>
              </Link>

              {/* Button 7: Download Laporan */}
              <Link href="/admin/keuangan" style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>↓</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Download Laporan
                  </div>
                </div>
              </Link>

              {/* Button 8: Broadcast Notif (Soon - disabled) */}
              <div
                className="card"
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'not-allowed',
                  opacity: 0.5,
                  background: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  position: 'relative'
                }}
                title="Segera hadir"
              >
                <div style={{ fontSize: '32px', marginBottom: '10px', filter: 'grayscale(1)' }}>✈</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Broadcast Notif
                </div>
                <span style={{
                  fontSize: '0.625rem',
                  background: 'var(--text-muted)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  Soon
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Platform Health */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Platform Health
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
              {/* Mini-card 1: Makanan Diselamatkan */}
              <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🍱</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '4px' }}>
                  {formatNumber(summary?.makanan_diselamatkan_kg || 0)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Makanan Diselamatkan (kg)
                </div>
              </div>

              {/* Mini-card 2: Produk Rescue Aktif */}
              <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '4px' }}>
                  {formatNumber(summary?.produk_rescue_aktif || 0)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Produk Rescue Aktif
                </div>
              </div>

              {/* Mini-card 3: Tingkat Pickup Sukses */}
              <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-color)', marginBottom: '4px' }}>
                  {(summary?.pickup_sukses_persen || 0).toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Tingkat Pickup Sukses
                </div>
              </div>

              {/* Mini-card 4: Listing Kedaluwarsa */}
              <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏰</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-color)', marginBottom: '4px' }}>
                  {formatNumber(summary?.listing_kedaluwarsa || 0)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Listing Kedaluwarsa
                </div>
              </div>

              {/* Mini-card 5: Waste Log (Coming Soon) */}
              <div className="card" style={{ padding: '16px', textAlign: 'center', opacity: 0.6 }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗑️</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  0
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Waste Log Tercatat
                  <div style={{ fontSize: '0.625rem', marginTop: '2px' }}>(Coming soon)</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: Top UMKM Paling Aktif */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Top UMKM Paling Aktif
              </h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Period Selector */}
                <div style={{ display: 'flex', gap: '5px', background: 'var(--bg-color)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setTopUMKMPeriod('month')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: topUMKMPeriod === 'month' ? 'var(--primary-color)' : 'transparent',
                      color: topUMKMPeriod === 'month' ? 'white' : 'var(--text-muted)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Bulan ini
                  </button>
                  <button
                    onClick={() => setTopUMKMPeriod('30days')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: topUMKMPeriod === '30days' ? 'var(--primary-color)' : 'transparent',
                      color: topUMKMPeriod === '30days' ? 'white' : 'var(--text-muted)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    30 hari
                  </button>
                </div>
                {/* Lihat Semua Link */}
                <Link href="/admin/umkm?sort=orders_completed&period=month" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
                  Lihat Semua →
                </Link>
              </div>
            </div>

            {/* Top UMKM Cards */}
            {summary?.top_umkm && summary.top_umkm.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
                {summary.top_umkm.slice(0, 4).map((umkm, index) => (
                  <div key={index} className="card" style={{ padding: '20px', position: 'relative' }}>
                    {/* Rank Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: index < 3 ? 'white' : 'var(--text-muted)'
                    }}>
                      #{index + 1}
                    </div>

                    {/* UMKM Info */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {umkm.umkm_name || 'UMKM'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {umkm.category || 'Kategori'}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Orders</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {formatNumber(umkm.orders_completed || 0)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                          {formatCurrency(umkm.revenue_kotor || 0)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Food Rescued</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success-color)' }}>
                          {formatNumber(umkm.food_rescued_kg || 0)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Belum ada data UMKM aktif periode ini
              </div>
            )}
          </div>

          {/* SECTION 7: Environmental Impact */}
          <div style={{ marginBottom: '30px' }}>
            <div
              className="card"
              style={{
                background: 'var(--secondary-color)',
                padding: '30px',
                borderRadius: '12px',
                border: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {/* Icon */}
                <div style={{
                  fontSize: '64px',
                  lineHeight: 1,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}>
                  <Leaf size={64} color="var(--primary-color)" />
                </div>

                {/* Metrics */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Dampak lingkungan Savora sejak awal
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
                    {/* Metric 1: Total Makanan Diselamatkan */}
                    <div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '2px' }}>
                        {formatNumber(summary?.total_makanan_diselamatkan_kg || 0)} kg
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Total Makanan Diselamatkan
                      </div>
                    </div>

                    {/* Metric 2: Porsi Diselamatkan */}
                    <div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '2px' }}>
                        {formatNumber(summary?.porsi_diselamatkan || 0)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Porsi Diselamatkan
                      </div>
                    </div>

                    {/* Metric 3: Order Completed */}
                    <div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '2px' }}>
                        {formatNumber(summary?.order_completed_count || 0)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Order Diselesaikan
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
