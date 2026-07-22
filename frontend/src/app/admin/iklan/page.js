'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import DataTable from '@/components/organisms/DataTable';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { apiGet, apiPatch } from '@/lib/api';
import { isAdmin } from '@/lib/auth';

export default function ManajemenIklanPage() {
  const [adList, setAdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
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
    fetchAdList();
  }, [filterStatus]);

  async function fetchAdList() {
    try {
      setLoading(true);
      setError(null);
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const response = await apiGet(`/advertisements${params}`);
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!note.trim()) {
      alert('Catatan wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiPatch(`/advertisements/${selectedAd.id}/status`, {
        status: action,
        note: note,
      });

      if (response.success) {
        alert(`Iklan berhasil ${action === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
        setShowDialog(false);
        fetchAdList();
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
            <div className="page-title">Manajemen Iklan</div>
            <div className="page-subtitle">Kelola dan verifikasi iklan UMKM & eksternal</div>
          </div>
        </div>

        <div className="content-area">
          {/* Filter */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>
              Filter Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                minWidth: '160px'
              }}
            >
              <option value="">Semua</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
            </select>
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
            <DataTable
              columns={[
                { key: 'id', label: 'ID' },
                {
                  key: 'title',
                  label: 'Judul',
                  render: (row) => (
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                      text={row.advertiser_type}
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
                  label: 'Fee (5%)',
                  render: (row) => formatCurrency(row.service_fee)
                },
                {
                  key: 'duration_days',
                  label: 'Durasi',
                  render: (row) => `${row.duration_days} hari`
                },
                {
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
                },
                {
                  key: 'created_at',
                  label: 'Tanggal',
                  render: (row) => new Date(row.created_at).toLocaleDateString('id-ID')
                },
                {
                  key: 'actions',
                  label: 'Aksi',
                  render: (row) => (
                    row.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="primary" onClick={() => openDialog(row, 'APPROVED')}>
                          Setujui
                        </Button>
                        <Button variant="danger" onClick={() => openDialog(row, 'REJECTED')}>
                          Tolak
                        </Button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>-</span>
                    )
                  )
                }
              ]}
              data={adList}
            />
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
                <strong>Service Fee (5%):</strong> {formatCurrency(selectedAd?.service_fee || 0)}
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
