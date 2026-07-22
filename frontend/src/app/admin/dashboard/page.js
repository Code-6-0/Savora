'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import SummaryCard from '@/components/molecules/SummaryCard';
import DataTable from '@/components/organisms/DataTable';
import Badge from '@/components/atoms/Badge';
import { apiGet } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import { Users, Store, ShoppingCart, Package, UserCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        setRecentOrders(response.data.recent_orders || []);
        setRecentProducts(response.data.recent_products || []);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Selesai': { label: 'Selesai', color: 'success' },
      'Siap Diambil': { label: 'Siap Diambil', color: 'info' },
      'Diproses': { label: 'Diproses', color: 'warning' },
      'Menunggu': { label: 'Menunggu', color: 'secondary' },
      'Dibatalkan': { label: 'Dibatalkan', color: 'danger' }
    };
    const statusInfo = statusMap[status] || { label: status, color: 'secondary' };
    return <Badge variant={statusInfo.color} text={statusInfo.label} />;
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

  const orderColumns = [
    { key: 'id', label: 'ID Order' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'total_amount', label: 'Total', render: (row) => formatCurrency(row.total_amount) },
    { key: 'status', label: 'Status', render: (row) => getStatusBadge(row.status) },
    { key: 'created_at', label: 'Tanggal', render: (row) => formatDate(row.created_at) }
  ];

  const productColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nama Produk' },
    { key: 'category', label: 'Kategori' },
    {
      key: 'rescue_price',
      label: 'Harga Rescue',
      render: (row) => formatCurrency(row.rescue_price)
    },
    { key: 'stock', label: 'Stok' },
    { key: 'status', label: 'Status' }
  ];

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
          {/* Summary Cards */}
          <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <SummaryCard
              title="Total User"
              value={summary?.total_users || 0}
              icon={<Users size={24} />}
            />
            <SummaryCard
              title="Total Customer"
              value={summary?.total_customers || 0}
              icon={<Users size={24} />}
            />
            <SummaryCard
              title="UMKM Verified"
              value={`${summary?.umkm_verified || 0}/${summary?.total_umkm || 0}`}
              icon={<Store size={24} />}
            />
            <SummaryCard
              title="Active Listings"
              value={`${summary?.active_products || 0}/${summary?.total_products || 0}`}
              icon={<Package size={24} />}
            />
            <SummaryCard
              title="Total Orders"
              value={summary?.total_orders || 0}
              icon={<ShoppingCart size={24} />}
            />
            <SummaryCard
              title="Completed Orders"
              value={summary?.completed_orders || 0}
              icon={<ShoppingCart size={24} />}
            />
            <SummaryCard
              title="Total Transaksi"
              value={formatCurrency(summary?.total_transaction_value || 0)}
              icon={<ShoppingCart size={24} />}
            />
            <SummaryCard
              title="Mitra Donasi"
              value={summary?.total_mitra_donasi || 0}
              icon={<UserCheck size={24} />}
            />
          </div>

          {/* Order Status Breakdown */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', fontWeight: 700 }}>
              Status Order
            </h3>
            <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <div className="card" style={{ padding: '15px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Menunggu
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {summary?.orders_menunggu || 0}
                </div>
              </div>
              <div className="card" style={{ padding: '15px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Diproses
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {summary?.orders_diproses || 0}
                </div>
              </div>
              <div className="card" style={{ padding: '15px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Siap Diambil
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {summary?.orders_siap_diambil || 0}
                </div>
              </div>
              <div className="card" style={{ padding: '15px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Selesai
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-color)' }}>
                  {summary?.orders_selesai || 0}
                </div>
              </div>
              <div className="card" style={{ padding: '15px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Dibatalkan
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger-color)' }}>
                  {summary?.orders_dibatalkan || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', fontWeight: 700 }}>
              Order Terbaru
            </h3>
            {recentOrders.length > 0 ? (
              <DataTable columns={orderColumns} data={recentOrders} />
            ) : (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Belum ada order
              </div>
            )}
          </div>

          {/* Recent Products */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', fontWeight: 700 }}>
              Listing Terbaru
            </h3>
            {recentProducts.length > 0 ? (
              <DataTable columns={productColumns} data={recentProducts} />
            ) : (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Belum ada listing
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
