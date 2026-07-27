'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  // Calculate delta vs bulan lalu dari monthly_trend
  function calculateDelta() {
    if (!summary?.monthly_trend || summary.monthly_trend.length < 2) {
      return null;
    }
    const trend = summary.monthly_trend;
    const currentMonth = trend[trend.length - 1]?.revenue || 0;
    const lastMonth = trend[trend.length - 2]?.revenue || 0;

    if (lastMonth === 0) return null;

    const delta = ((currentMonth - lastMonth) / lastMonth) * 100;
    return {
      percentage: delta,
      isPositive: delta >= 0,
      currentMonth: trend[trend.length - 1]?.month || '',
      lastMonth: trend[trend.length - 2]?.month || ''
    };
  }

  const delta = calculateDelta();

  function handleExport(format) {
    const token = getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
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
      <div className="main-container">
        <div className="topbar">
          <div>
            <div className="page-title">Dashboard Keuangan</div>
            <div className="page-subtitle">Monitoring revenue platform dari service fee</div>
          </div>
        </div>

        <div className="content-area">
          {/* Delta Info Box */}
          {delta && (
            <div style={{
              marginBottom: '20px',
              padding: '16px 20px',
              backgroundColor: delta.isPositive ? 'var(--secondary-color)' : '#fee',
              borderLeft: `4px solid ${delta.isPositive ? 'var(--success-color)' : 'var(--danger-color)'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px'
            }}>
              <span style={{ fontSize: '24px' }}>
                {delta.isPositive ? '📈' : '📉'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Revenue Bulan Ini {delta.isPositive ? 'Naik' : 'Turun'}{' '}
                  <span style={{ color: delta.isPositive ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {delta.isPositive ? '+' : ''}{delta.percentage.toFixed(1)}%
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {delta.currentMonth} vs {delta.lastMonth}
                </div>
              </div>
            </div>
          )}

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

          {/* Breakdown per Source Type */}
          <div className="card" style={{ marginBottom: '30px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
              Breakdown Revenue per Sumber
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Komposisi service fee 5% dari transaksi produk dan iklan
            </p>

            {/* Progress bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* From Orders */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    🛒 Service Fee dari Orders (Transaksi Produk)
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                    {formatCurrency(summary?.from_orders || 0)}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: 'var(--border-color)',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${summary?.total_service_fee > 0 ? ((summary?.from_orders || 0) / summary.total_service_fee * 100) : 0}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary-color)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {summary?.order_count || 0} transaksi • {summary?.total_service_fee > 0 ? ((summary?.from_orders || 0) / summary.total_service_fee * 100).toFixed(1) : 0}% dari total
                </div>
              </div>

              {/* From Ads */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    📢 Service Fee dari Iklan (UMKM + Pihak Ketiga)
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--success-color)' }}>
                    {formatCurrency(summary?.from_ads || 0)}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: 'var(--border-color)',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${summary?.total_service_fee > 0 ? ((summary?.from_ads || 0) / summary.total_service_fee * 100) : 0}%`,
                    height: '100%',
                    backgroundColor: 'var(--success-color)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {summary?.ad_count || 0} iklan • {summary?.total_service_fee > 0 ? ((summary?.from_ads || 0) / summary.total_service_fee * 100).toFixed(1) : 0}% dari total
                </div>
              </div>
            </div>
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
              <Button variant="primary" onClick={() => handleExport('xlsx')}>
                📊 Export Excel
              </Button>
              <Button variant="primary" onClick={() => handleExport('pdf')}>
                📑 Export PDF
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
              <strong>Catatan:</strong> Export tersedia dalam 3 format: CSV, Excel (XLSX), dan PDF. Pilih rentang tanggal opsional untuk filter data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
