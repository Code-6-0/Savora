'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/organisms/DataTable';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { apiGet, apiPatch } from '@/lib/api';
import { isAdmin } from '@/lib/auth';

export default function ManajemenIklanPage() {
  const [adList, setAdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'active' | 'rejected'
  const [pendingCount, setPendingCount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewAd, setViewAd] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
      return;
    }
    fetchAdList();
    fetchBadgeCount();
  }, [activeTab]);

  async function fetchBadgeCount() {
    try {
      const response = await apiGet('/admin/reports/summary');
      if (response.success) {
        setPendingCount(response.data.summary?.iklan_pending_count || 0);
      }
    } catch (err) {
      // Silent fail untuk badge count
    }
  }

  async function fetchAdList() {
    try {
      setLoading(true);
      setError(null);

      // Map tab ke status filter backend
      const statusMap = {
        pending: 'PENDING',
        active: 'ACTIVE',     // Iklan yang sedang tayang
        rejected: 'REJECTED'
      };

      const status = statusMap[activeTab];
      const response = await apiGet(`/admin/advertisements?status=${status}`);
      if (response.success) {
        setAdList(response.data.advertisements || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openDialog(ad, actionType) {
    setSelectedAd(ad);
    setAction(actionType);
    setNote('');
    setShowDialog(true);
  }

  function openViewDialog(ad) {
    setViewAd(ad);
    setShowViewDialog(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!note.trim()) {
      alert('Catatan wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiPatch(`/admin/advertisements/${selectedAd.id}/status`, {
        status: action,
        note: note,
      });

      if (response.success) {
        alert(`Iklan berhasil ${action === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
        setShowDialog(false);
        fetchAdList();
        fetchBadgeCount(); // Refresh badge count after action
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function formatPeriode(ad) {
    if (!ad.starts_at || !ad.expires_at) {
      return <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>-</span>;
    }
    const start = formatDate(ad.starts_at);
    const end = formatDate(ad.expires_at);
    return (
      <div style={{ fontSize: '0.875rem' }}>
        <div>{start}</div>
        <div style={{ color: 'var(--text-muted)' }}>s/d {end}</div>
      </div>
    );
  }

  // Build columns based on active tab
  const getColumns = () => {
    const baseColumns = [
      { key: 'id', label: 'ID' },
      {
        key: 'title',
        label: 'Judul',
        render: (row) => (
          <div
            style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={row.title}
          >
            {row.title}
          </div>
        )
      },
      {
        key: 'advertiser_type',
        label: 'Tipe',
        render: (row) => (
          <Badge
            variant={row.advertiser_type === 'UMKM' ? 'info' : 'secondary'}
            text={row.advertiser_type || '-'}
          />
        )
      },
      {
        key: 'price',
        label: 'Harga',
        render: (row) => formatCurrency(row.price)
      },
      {
        key: 'service_fee',
        label: 'Service Fee',
        render: (row) => formatCurrency(row.service_fee)
      },
      {
        key: 'duration_days',
        label: 'Durasi',
        render: (row) => `${row.duration_days} hari`
      }
    ];

    // For pending tab, show duration info; for active/rejected, show periode tayang
    if (activeTab === 'pending') {
      baseColumns.push({
        key: 'created_at',
        label: 'Tanggal Pengajuan',
        render: (row) => formatDate(row.created_at)
      });
    } else {
      baseColumns.push({
        key: 'periode',
        label: 'Periode Tayang',
        render: (row) => formatPeriode(row)
      });
    }

    // Status column only for active and rejected tabs (redundant for pending)
    if (activeTab !== 'pending') {
      baseColumns.push({
        key: 'status',
        label: 'Status',
        render: (row) => (
          <Badge
            variant={
              row.status === 'ACTIVE' ? 'success' :
              row.status === 'APPROVED' ? 'success' :
              row.status === 'PENDING' ? 'warning' :
              row.status === 'REJECTED' ? 'danger' :
              'secondary'
            }
            text={row.status}
          />
        )
      });
    }

    // Actions column
    baseColumns.push({
      key: 'actions',
      label: 'Aksi',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => openViewDialog(row)}>
            Lihat
          </Button>
          {row.status === 'PENDING' && (
            <>
              <Button variant="primary" onClick={() => openDialog(row, 'APPROVED')}>
                Setujui
              </Button>
              <Button variant="danger" onClick={() => openDialog(row, 'REJECTED')}>
                Tolak
              </Button>
            </>
          )}
        </div>
      )
    });

    return baseColumns;
  };

  return (
    <div className="dashboard-wrapper">
      <div className="main-container">
        <div className="topbar">
          <div>
            <div className="page-title">Manajemen Iklan</div>
            <div className="page-subtitle">Kelola dan verifikasi iklan UMKM & eksternal</div>
          </div>
        </div>

        <div className="content-area">
          {/* Tab Navigation */}
          <div style={{ marginBottom: '2rem', borderBottom: '2px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('pending')}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderBottom: activeTab === 'pending' ? '3px solid var(--primary-color)' : '3px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'pending' ? 700 : 500,
                  color: activeTab === 'pending' ? 'var(--primary-color)' : 'var(--text-main)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '-2px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'pending') {
                    e.currentTarget.style.backgroundColor = 'var(--secondary-color)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Menunggu
                {pendingCount > 0 && (
                  <span style={{
                    backgroundColor: 'var(--danger-color)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('active')}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderBottom: activeTab === 'active' ? '3px solid var(--primary-color)' : '3px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'active' ? 700 : 500,
                  color: activeTab === 'active' ? 'var(--primary-color)' : 'var(--text-main)',
                  transition: 'all 0.2s ease',
                  marginBottom: '-2px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'active') {
                    e.currentTarget.style.backgroundColor = 'var(--secondary-color)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Aktif
              </button>

              <button
                onClick={() => setActiveTab('rejected')}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderBottom: activeTab === 'rejected' ? '3px solid var(--primary-color)' : '3px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'rejected' ? 700 : 500,
                  color: activeTab === 'rejected' ? 'var(--primary-color)' : 'var(--text-main)',
                  transition: 'all 0.2s ease',
                  marginBottom: '-2px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'rejected') {
                    e.currentTarget.style.backgroundColor = 'var(--secondary-color)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Ditolak
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '14px' }}>Memuat data...</div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ color: 'var(--danger-color)', fontSize: '14px', marginBottom: '10px' }}>
                {error}
              </div>
              <button className="btn-primary" onClick={fetchAdList}>Coba Lagi</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && adList.length === 0 && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Tidak ada iklan yang ditemukan
            </div>
          )}

          {/* Table */}
          {!loading && !error && adList.length > 0 && (
            <DataTable headers={getColumns().map(col => col.label)}>
              {adList.map((ad, idx) => (
                <tr key={idx}>
                  {getColumns().map((col, colIdx) => (
                    <td key={colIdx}>{col.render ? col.render(ad) : (ad[col.key] ?? '-')}</td>
                  ))}
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </div>

      {/* Dialog Konfirmasi */}
      {showDialog && (
        <div className="dialog-overlay" onClick={() => setShowDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>
              {action === 'APPROVED' ? 'Setujui' : 'Tolak'} Iklan
            </h2>

            {/* Detail Iklan */}
            <div style={{
              marginBottom: '1rem',
              padding: '16px',
              backgroundColor: 'var(--secondary-color)',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Judul:</strong> {selectedAd?.title}
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Tipe:</strong> {selectedAd?.advertiser_type}
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Harga:</strong> {formatCurrency(selectedAd?.price || 0)}
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Service Fee:</strong> {formatCurrency(selectedAd?.service_fee || 0)}
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Total:</strong> {formatCurrency((selectedAd?.price || 0) + (selectedAd?.service_fee || 0))}
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Durasi:</strong> {selectedAd?.duration_days} hari
              </p>
              {selectedAd?.image_url && (
                <div style={{ marginTop: '12px' }}>
                  <strong>Preview Gambar:</strong>
                  <img
                    src={selectedAd.image_url}
                    alt="Preview iklan"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', marginTop: '8px', borderRadius: '6px' }}
                  />
                </div>
              )}
              {selectedAd?.target_url && (
                <p style={{ marginTop: '8px', marginBottom: '0', color: 'var(--text-main)' }}>
                  <strong>Target URL:</strong>{' '}
                  <a
                    href={selectedAd.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary-color)', textDecoration: 'underline', wordBreak: 'break-all' }}
                  >
                    {selectedAd.target_url}
                  </a>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600 }}>
                  Catatan (wajib):
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  required
                  placeholder="Tulis catatan atau alasan verifikasi..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
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

      {/* Dialog Lihat Detail */}
      {showViewDialog && viewAd && (
        <div className="dialog-overlay" onClick={() => setShowViewDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 600 }}>
              Detail Iklan
            </h2>

            {/* Preview Image */}
            {viewAd.image_url && (
              <div style={{ marginBottom: '1.5rem' }}>
                <img
                  src={viewAd.image_url}
                  alt={viewAd.title}
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
            )}

            {/* Ad Details */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Judul Iklan
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  {viewAd.title}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Tipe Pengiklan
                  </div>
                  <Badge
                    variant={viewAd.advertiser_type === 'UMKM' ? 'info' : 'secondary'}
                    text={viewAd.advertiser_type || '-'}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Status
                  </div>
                  <Badge
                    variant={
                      viewAd.status === 'ACTIVE' ? 'success' :
                      viewAd.status === 'APPROVED' ? 'success' :
                      viewAd.status === 'PENDING' ? 'warning' :
                      viewAd.status === 'REJECTED' ? 'danger' :
                      'secondary'
                    }
                    text={viewAd.status}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Harga
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>
                    {formatCurrency(viewAd.price || 0)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Service Fee
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>
                    {formatCurrency(viewAd.service_fee || 0)}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Biaya
                </div>
                <div style={{ fontSize: '1.1rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                  {formatCurrency((viewAd.price || 0) + (viewAd.service_fee || 0))}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Durasi Tayang
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  {viewAd.duration_days} hari
                </div>
              </div>

              {viewAd.starts_at && viewAd.expires_at && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Periode Tayang
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {formatDate(viewAd.starts_at)} - {formatDate(viewAd.expires_at)}
                  </div>
                </div>
              )}

              {viewAd.target_url && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Target URL
                  </div>
                  <a
                    href={viewAd.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--primary-color)',
                      textDecoration: 'underline',
                      wordBreak: 'break-all',
                      fontSize: '0.875rem'
                    }}
                  >
                    {viewAd.target_url}
                  </a>
                </div>
              )}

              <div style={{ marginBottom: '0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Tanggal Pengajuan
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  {formatDate(viewAd.created_at)}
                </div>
              </div>
            </div>

            {/* Actions for PENDING ads */}
            {viewAd.status === 'PENDING' && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--secondary-color)',
                borderRadius: '8px',
                marginBottom: '1rem',
                borderLeft: '4px solid var(--warning-color)'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  Iklan ini menunggu tinjauan. Anda dapat menyetujui atau menolak dari sini:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowViewDialog(false);
                      openDialog(viewAd, 'APPROVED');
                    }}
                  >
                    ✓ Setujui
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowViewDialog(false);
                      openDialog(viewAd, 'REJECTED');
                    }}
                  >
                    ✕ Tolak
                  </Button>
                </div>
              </div>
            )}

            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowViewDialog(false)}>
                Tutup
              </Button>
            </div>
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
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
