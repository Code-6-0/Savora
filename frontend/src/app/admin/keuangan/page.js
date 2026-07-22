'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import SummaryCard from '@/components/molecules/SummaryCard';
import Button from '@/components/atoms/Button';
import { apiGet } from '@/lib/api';
import { isAdmin, getToken } from '@/lib/auth';

export default function KeuanganPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
      return;
    }
    fetchRevenue();
  }, []);

  async function fetchRevenue() {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGet('/admin/revenue');
      if (response.success) {
        setSummary(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function handleExport(format) {
    const token = getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    let url = `${baseUrl}/api/admin/revenue/export?format=${format}`;

    if (startDate) url += `&start=${startDate}`;
    if (endDate) url += `&end=${endDate}`;

    // Download dengan token auth
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Export gagal');
      return response.blob();
    })
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `revenue_export_${format}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    })
    .catch(err => {
      alert(err.message || 'Gagal mengekspor data');
    });
  }

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <AdminSidebar />
        <div className="main-container">
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
            Memuat data keuangan...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <AdminSidebar />
        <div className="main-container">
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div style={{ color: 'var(--danger-color)', marginBottom: '20px' }}>{error}</div>
            <Button variant="primary" onClick={fetchRevenue}>Coba Lagi</Button>
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
            <div className="page-title">Dashboard Keuangan</div>
            <div className="page-subtitle">Monitoring revenue platform dari service fee</div>
          </div>
        </div>

        <div className="content-area">
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <SummaryCard
              title="Total Revenue"
              value={formatCurrency(summary?.total_service_fee || 0)}
              subtitle="Service Fee dari semua sumber"
              icon="💰"
            />
            <SummaryCard
              title="Dari Orders"
              value={formatCurrency(summary?.from_orders || 0)}
              subtitle={`${summary?.order_count || 0} transaksi`}
              icon="🛒"
            />
            <SummaryCard
              title="Dari Iklan"
              value={formatCurrency(summary?.from_ads || 0)}
              subtitle={`${summary?.ad_count || 0} iklan`}
              icon="📢"
            />
          </div>

          {/* Trend Chart */}
          <div className="card" style={{ marginBottom: '30px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>
              Trend Revenue Bulanan (6 Bulan Terakhir)
            </h3>
            {summary?.monthly_trend && summary.monthly_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={summary.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis
                    dataKey="month"
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary-color)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary-color)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                Belum ada data trend
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
              Export Laporan Keuangan
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Export data revenue dengan rentang tanggal tertentu (opsional)
            </p>

            {/* Date Range */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                  Dari Tanggal:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                  Sampai Tanggal:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Export Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => handleExport('csv')}>
                📄 Export CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleExport('excel')}
                title="Fitur Excel export belum tersedia"
              >
                📊 Export Excel (Coming Soon)
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleExport('pdf')}
                title="Fitur PDF export belum tersedia"
              >
                📑 Export PDF (Coming Soon)
              </Button>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'var(--secondary-color)',
              borderRadius: '6px',
              fontSize: '13px',
              color: 'var(--text-main)'
            }}>
              <strong>Catatan:</strong> Export CSV sudah berfungsi penuh. Excel & PDF akan segera tersedia.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
