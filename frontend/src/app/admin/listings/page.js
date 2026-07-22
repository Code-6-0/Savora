'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import DataTable from '@/components/organisms/DataTable';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { apiGet, apiPatch } from '@/lib/api';
import { isAdmin } from '@/lib/auth';

export default function ModerasiListingPage() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
      return;
    }
    fetchProductList();
  }, []);

  async function fetchProductList() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      const queryString = params.toString();
      const endpoint = queryString ? `/admin/products?${queryString}` : '/admin/products';
      const response = await apiGet(endpoint);
      if (response.success) {
        setProductList(response.data.products || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    fetchProductList();
  }

  function openDialog(product, actionType) {
    setSelectedProduct(product);
    setAction(actionType);
    setNote('');
    setShowDialog(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!note.trim()) {
      alert('Catatan wajib diisi');
      return;
    }
    try {
      setSubmitting(true);
      const response = await apiPatch(`/admin/products/${selectedProduct.id}/status`, {
        status: action,
        note: note,
      });
      if (response.success) {
        const actionText = action === 'Active' ? 'diaktifkan' : 'disuspend';
        alert(`Listing berhasil ${actionText}`);
        setShowDialog(false);
        fetchProductList();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function getActionButtons(product) {
    if (product.status === 'Active') {
      return <Button variant="danger" onClick={() => openDialog(product, 'Suspended')}>Suspend</Button>;
    } else if (product.status === 'Suspended') {
      return <Button variant="primary" onClick={() => openDialog(product, 'Active')}>Aktifkan</Button>;
    }
    return <span style={{ color: 'var(--text-muted)' }}>-</span>;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

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
            <div className="page-title">Moderasi Listing</div>
            <div className="page-subtitle">Kelola dan moderasi listing produk UMKM</div>
          </div>
        </div>
        <div className="content-area">
          {/* Filters */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px' }}>Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '14px' }}>
                <option value="">Semua</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px' }}>Cari (produk/UMKM):</label>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFilter()} placeholder="Cari listing..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '14px' }} />
            </div>
            <Button variant="primary" onClick={handleFilter}>Filter</Button>
          </div>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '14px' }}>Memuat data...</div>
            </div>
          )}
          {error && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ color: 'var(--danger-color)', fontSize: '14px', marginBottom: '10px' }}>{error}</div>
              <button className="btn-primary" onClick={fetchProductList}>Coba Lagi</button>
            </div>
          )}
          {!loading && !error && productList.length === 0 && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Tidak ada data listing
            </div>
          )}
          {!loading && !error && productList.length > 0 && (
            <>
              <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '14px' }}>
                Total: {productList.length} listing
              </p>
              <DataTable
                columns={[
                  { key: 'id', label: 'ID' },
                  {
                    key: 'photo_url',
                    label: 'Foto',
                    render: (row) => (
                      row.photo_url ? (
                        <img src={row.photo_url} alt={row.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#9ca3af' }}>
                          No img
                        </div>
                      )
                    )
                  },
                  { key: 'name', label: 'Nama Produk' },
                  { key: 'category', label: 'Kategori', render: (row) => row.category || '-' },
                  { key: 'umkm_name', label: 'UMKM', render: (row) => row.umkm_name || '-' },
                  { key: 'rescue_price', label: 'Harga Rescue', render: (row) => formatCurrency(row.rescue_price) },
                  { key: 'stock', label: 'Stok' },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (row) => (
                      <Badge
                        variant={row.status === 'Active' ? 'success' : 'danger'}
                        text={row.status}
                      />
                    )
                  },
                  {
                    key: 'created_at',
                    label: 'Tanggal Dibuat',
                    render: (row) => new Date(row.created_at).toLocaleDateString('id-ID')
                  },
                  { key: 'actions', label: 'Aksi', render: (row) => getActionButtons(row) }
                ]}
                data={productList}
              />
            </>
          )}
        </div>
      </div>
      {showDialog && (
        <div className="dialog-overlay" onClick={() => setShowDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>
              {action === 'Active' ? 'Aktifkan' : 'Suspend'} Listing
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              {selectedProduct?.photo_url && (
                <img src={selectedProduct.photo_url} alt={selectedProduct.name}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
              )}
              <p style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Produk: <strong>{selectedProduct?.name}</strong>
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                UMKM: {selectedProduct?.umkm_name} | Kategori: {selectedProduct?.category} | Status saat ini: {selectedProduct?.status}
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '14px' }}>
                  Catatan (wajib):
                </label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} required
                  placeholder="Tulis catatan atau alasan moderasi listing..."
                  style={{
                    width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)',
                    fontFamily: 'inherit', fontSize: '14px', resize: 'vertical'
                  }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Memproses...' : 'Konfirmasi'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowDialog(false)} disabled={submitting}>
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style jsx>{`
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .dialog-content {
          background: var(--bg-color);
          padding: 2rem;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
