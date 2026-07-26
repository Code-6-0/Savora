'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Badge from '../../../components/atoms/Badge';
import { getToken, isAdmin } from '@/lib/auth';

// Base API URL dengan fallback (sama seperti lib/api.js)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function ModerasiListingPage() {
  const router = useRouter();
  // State
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
      return;
    }
  }, [router]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [foodTrustFilter, setFoodTrustFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expiredOnly, setExpiredOnly] = useState(false);

  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(''); // 'suspend' | 'activate' | 'warning'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Utility functions
  const formatCurrency = (value) => {
    if (!value) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFoodScoreBadge = (score) => {
    if (!score && score !== 0) return { variant: 'secondary', text: '-' };
    if (score >= 80) return { variant: 'success', text: score };
    if (score >= 60) return { variant: 'warning', text: score };
    return { variant: 'danger', text: score };
  };

  const getFoodTrustBadge = (status) => {
    if (!status) return { variant: 'secondary', text: '-' };
    const badges = {
      'Fresh': { variant: 'success', text: 'Fresh' },
      'Layak Dijual': { variant: 'success', text: 'Layak Dijual' },
      'Segera Dijual': { variant: 'warning', text: 'Segera Dijual' },
      'Tidak Disarankan Dijual': { variant: 'danger', text: 'Tidak Disarankan' },
      'Tidak Layak Konsumsi': { variant: 'danger', text: 'Tidak Layak' }
    };
    return badges[status] || { variant: 'secondary', text: status };
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false;
    const now = new Date();
    const expires = new Date(expiresAt);
    const hoursUntilExpiry = (expires - now) / (1000 * 60 * 60);
    return hoursUntilExpiry < 24 && hoursUntilExpiry > 0;
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = getToken();

      // Build query params
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (categoryFilter) params.append('category', categoryFilter);
      if (foodTrustFilter) params.append('food_trust', foodTrustFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (expiredOnly) params.append('expired', 'true');

      const queryString = params.toString();
      const url = `${API_BASE_URL}/admin/products${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data produk');
      }

      const result = await response.json();
      if (result.success) {
        setProducts(result.data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    }
  };

  // Fetch data on mount and filter change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchProducts();
      } catch (err) {
        setError('Gagal memuat data produk');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchQuery, categoryFilter, foodTrustFilter, statusFilter, expiredOnly]);

  // Handlers
  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setFoodTrustFilter('');
    setStatusFilter('');
    setExpiredOnly(false);
  };

  const handleModerateAction = async () => {
    if (!note.trim()) {
      alert('Catatan wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();

      // Map dialog action to API status
      let status;
      if (dialogAction === 'suspend') status = 'Suspended';
      else if (dialogAction === 'activate') status = 'Active';
      else if (dialogAction === 'warning') status = 'Warning';

      const response = await fetch(
        `${API_BASE_URL}/admin/products/${selectedProduct.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status, note: note.trim() })
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Gagal memproses moderasi');
      }

      // Success - refresh data
      await fetchProducts();

      // Close dialog and reset
      setShowDialog(false);
      setSelectedProduct(null);
      setNote('');
      setDialogAction('');

      const actionText = dialogAction === 'suspend' ? 'suspend' :
                        dialogAction === 'activate' ? 'aktifkan' : 'beri warning pada';
      alert(`Berhasil ${actionText} produk`);
    } catch (err) {
      console.error('Error moderating product:', err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openDialog = (action, product) => {
    setDialogAction(action);
    setSelectedProduct(product);
    setNote('');
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedProduct(null);
    setNote('');
    setDialogAction('');
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Memuat data produk...</p>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: 'var(--text-main)',
          marginBottom: '0.5rem'
        }}>
          Moderasi Listing
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Tinjau dan moderasi listing produk yang memerlukan perhatian admin
        </p>
      </div>

      {/* Toolbar */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Search */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Cari nama produk atau UMKM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Kategori Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Kategori
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                backgroundColor: 'var(--bg-color)',
                cursor: 'pointer'
              }}
            >
              <option value="">Semua Kategori</option>
              <option value="Makanan Siap Saji">Makanan Siap Saji</option>
              <option value="Roti & Kue">Roti & Kue</option>
              <option value="Sayuran & Buah">Sayuran & Buah</option>
              <option value="Lauk Pauk">Lauk Pauk</option>
              <option value="Minuman">Minuman</option>
              <option value="Bahan Makanan">Bahan Makanan</option>
              <option value="Katering">Katering</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Food Trust Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Food Trust Status
            </label>
            <select
              value={foodTrustFilter}
              onChange={(e) => setFoodTrustFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                backgroundColor: 'var(--bg-color)',
                cursor: 'pointer'
              }}
            >
              <option value="">Semua Status</option>
              <option value="Fresh">Fresh</option>
              <option value="Layak Dijual">Layak Dijual</option>
              <option value="Segera Dijual">Segera Dijual</option>
              <option value="Tidak Disarankan Dijual">Tidak Disarankan Dijual</option>
              <option value="Tidak Layak Konsumsi">Tidak Layak Konsumsi</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Status Listing
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                backgroundColor: 'var(--bg-color)',
                cursor: 'pointer'
              }}
            >
              <option value="">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Expired Checkbox */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Filter Khusus
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={expiredOnly}
                onChange={(e) => setExpiredOnly(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Hanya Expired</span>
            </label>
          </div>
        </div>

        {/* Actions Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Menampilkan <strong style={{ color: 'var(--text-main)' }}>{products.length}</strong> produk
          </div>
          <button
            onClick={handleClearFilters}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: 'var(--primary-color)',
              border: '1px solid var(--primary-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tidak ada produk yang ditemukan</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {searchQuery || categoryFilter || foodTrustFilter || statusFilter || expiredOnly
                ? 'Coba ubah filter pencarian Anda'
                : 'Belum ada listing produk yang perlu dimoderasi'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--secondary-color)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem', width: '80px' }}>
                    Foto
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem', minWidth: '180px' }}>
                    Produk
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem', minWidth: '140px' }}>
                    UMKM
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem', minWidth: '140px' }}>
                    Food Trust & Score
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem', minWidth: '120px' }}>
                    Harga Rescue
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem', width: '80px' }}>
                    Stok
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem', minWidth: '140px' }}>
                    Expires At
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem', width: '100px' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem', minWidth: '220px' }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const foodScoreBadge = getFoodScoreBadge(product.food_score);
                  const foodTrustBadge = getFoodTrustBadge(product.food_trust_status);
                  const expiringSoon = isExpiringSoon(product.expires_at);
                  const expired = isExpired(product.expires_at);

                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {/* Foto */}
                      <td style={{ padding: '1rem' }}>
                        {product.photo_url ? (
                          <img
                            src={product.photo_url}
                            alt={product.name}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: 'var(--border-color)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                          }}>
                            No img
                          </div>
                        )}
                      </td>

                      {/* Produk */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {product.category || '-'}
                        </div>
                      </td>

                      {/* UMKM */}
                      <td style={{ padding: '1rem', color: 'var(--text-main)' }}>
                        {product.umkm_name || '-'}
                      </td>

                      {/* Food Trust & Score */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                          <Badge variant={foodTrustBadge.variant} size="sm">
                            {foodTrustBadge.text}
                          </Badge>
                          <Badge variant={foodScoreBadge.variant} size="sm">
                            Score: {foodScoreBadge.text}
                          </Badge>
                        </div>
                      </td>

                      {/* Harga Rescue */}
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {formatCurrency(product.rescue_price)}
                      </td>

                      {/* Stok */}
                      <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)' }}>
                        {product.stock || 0}
                      </td>

                      {/* Expires At */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', color: expired ? 'var(--danger-color)' : expiringSoon ? 'var(--warning-color)' : 'var(--text-main)' }}>
                          {formatDate(product.expires_at)}
                        </div>
                        {expired && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--danger-color)', fontWeight: '600', marginTop: '0.25rem' }}>
                            ⚠️ EXPIRED
                          </div>
                        )}
                        {!expired && expiringSoon && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--warning-color)', fontWeight: '600', marginTop: '0.25rem' }}>
                            ⏰ {'<'}24 jam
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <Badge
                          variant={product.status === 'Active' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {product.status === 'Active' ? 'Aktif' : 'Suspended'}
                        </Badge>
                      </td>

                      {/* Aksi */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {product.status === 'Active' ? (
                            <button
                              onClick={() => openDialog('suspend', product)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: 'var(--danger-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8125rem',
                                fontWeight: '600'
                              }}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => openDialog('activate', product)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: 'var(--success-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8125rem',
                                fontWeight: '600'
                              }}
                            >
                              Aktifkan
                            </button>
                          )}
                          <button
                            onClick={() => openDialog('warning', product)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: 'var(--warning-color)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8125rem',
                              fontWeight: '600'
                            }}
                          >
                            Warning
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog */}
      {showDialog && selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
              {dialogAction === 'suspend' ? 'Suspend Listing' :
               dialogAction === 'activate' ? 'Aktifkan Listing' :
               'Beri Warning ke UMKM'}
            </h2>

            {/* Product Info */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--secondary-color)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {selectedProduct.photo_url && (
                  <img
                    src={selectedProduct.photo_url}
                    alt={selectedProduct.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {selectedProduct.name}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {selectedProduct.umkm_name}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {selectedProduct.category} · Stok: {selectedProduct.stock}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div style={{
              padding: '1rem',
              backgroundColor: dialogAction === 'suspend' ? 'rgba(239, 68, 68, 0.1)' :
                              dialogAction === 'activate' ? 'rgba(34, 197, 94, 0.1)' :
                              'rgba(245, 158, 11, 0.1)',
              borderLeft: `4px solid ${dialogAction === 'suspend' ? 'var(--danger-color)' :
                                      dialogAction === 'activate' ? 'var(--success-color)' :
                                      'var(--warning-color)'}`,
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {dialogAction === 'suspend' && (
                  <>
                    <strong>⚠️ Perhatian:</strong> Listing akan di-suspend dan tidak muncul di marketplace.
                    UMKM akan menerima notifikasi beserta catatan Anda. Aksi ini reversible.
                  </>
                )}
                {dialogAction === 'activate' && (
                  <>
                    <strong>✓ Konfirmasi:</strong> Listing akan diaktifkan kembali dan muncul di marketplace.
                    UMKM akan menerima notifikasi aktivasi beserta catatan Anda.
                  </>
                )}
                {dialogAction === 'warning' && (
                  <>
                    <strong>⚠️ Warning:</strong> UMKM akan menerima peringatan beserta catatan Anda.
                    Status listing tetap aktif, namun warning dicatat dalam audit log.
                  </>
                )}
              </p>
            </div>

            {/* Note Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Catatan <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  dialogAction === 'suspend' ? 'Jelaskan alasan suspend listing ini...' :
                  dialogAction === 'activate' ? 'Berikan catatan aktivasi (opsional tapi disarankan)...' :
                  'Jelaskan peringatan yang diberikan ke UMKM...'
                }
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Catatan wajib diisi dan akan dicatat dalam audit log
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={closeDialog}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                Batal
              </button>
              <button
                onClick={handleModerateAction}
                disabled={submitting || !note.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: dialogAction === 'suspend' ? 'var(--danger-color)' :
                                  dialogAction === 'activate' ? 'var(--success-color)' :
                                  'var(--warning-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (submitting || !note.trim()) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: (submitting || !note.trim()) ? 0.6 : 1
                }}
              >
                {submitting ? 'Memproses...' :
                 dialogAction === 'suspend' ? 'Suspend' :
                 dialogAction === 'activate' ? 'Aktifkan' :
                 'Kirim Warning'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
