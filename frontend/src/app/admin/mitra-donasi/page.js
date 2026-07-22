'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import DataTable from '@/components/organisms/DataTable';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { apiGet, apiPatch } from '@/lib/api';
import { isAdmin } from '@/lib/auth';

export default function VerifikasiMitraDonasiPage() {
  const [mitraList, setMitraList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMitra, setSelectedMitra] = useState(null);
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
    fetchMitraList();
  }, []);

  async function fetchMitraList() {
    try {
      setLoading(true);
      setError(null);
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const response = await apiGet(`/admin/mitra-donasi${params}`);
      if (response.success) {
        setMitraList(response.data.mitra_list || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openDialog(mitra, actionType) {
    setSelectedMitra(mitra);
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
      const response = await apiPatch(`/admin/mitra-donasi/${selectedMitra.id}/verify`, {
        status: action,
        note: note,
      });

      if (response.success) {
        alert(`Mitra donasi berhasil ${action === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
        setShowDialog(false);
        fetchMitraList();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredList = mitraList;

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
            <div className="page-title">Verifikasi Mitra Donasi</div>
            <div className="page-subtitle">Kelola dan verifikasi pendaftaran mitra donasi</div>
          </div>
        </div>

        <div className="content-area">
          {/* Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ marginRight: '0.5rem', fontSize: '14px', color: 'var(--text-main)' }}>
              Filter Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                fetchMitraList();
              }}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                fontSize: '14px'
              }}
            >
              <option value="">Semua</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
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
              <button className="btn-primary" onClick={fetchMitraList}>Coba Lagi</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredList.length === 0 && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Tidak ada data mitra donasi
            </div>
          )}

          {/* Table */}
          {!loading && !error && filteredList.length > 0 && (
            <DataTable
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'org_name', label: 'Nama Organisasi' },
                { key: 'user_email', label: 'Email' },
                {
                  key: 'phone',
                  label: 'Telepon',
                  render: (row) => row.phone || '-'
                },
                {
                  key: 'address',
                  label: 'Alamat',
                  render: (row) => (
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.address || '-'}
                    </div>
                  )
                },
                {
                  key: 'document_url',
                  label: 'Dokumen',
                  render: (row) => row.document_url ? (
                    <a
                      href={row.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.875rem' }}
                    >
                      Lihat
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>-</span>
                  )
                },
                {
                  key: 'verification_status',
                  label: 'Status',
                  render: (row) => (
                    <Badge
                      variant={
                        row.verification_status === 'APPROVED' ? 'success' :
                        row.verification_status === 'PENDING' ? 'warning' : 'danger'
                      }
                      text={row.verification_status}
                    />
                  )
                },
                {
                  key: 'created_at',
                  label: 'Tanggal Daftar',
                  render: (row) => new Date(row.created_at).toLocaleDateString('id-ID')
                },
                {
                  key: 'actions',
                  label: 'Aksi',
                  render: (row) => (
                    row.verification_status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="primary" onClick={() => openDialog(row, 'APPROVED')}>
                          Setujui
                        </Button>
                        <Button variant="danger" onClick={() => openDialog(row, 'REJECTED')}>
                          Tolak
                        </Button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )
                  )
                }
              ]}
              data={filteredList}
            />
          )}
        </div>
      </div>

      {/* Dialog Konfirmasi */}
      {showDialog && (
        <div className="dialog-overlay" onClick={() => setShowDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>
              {action === 'APPROVED' ? 'Setujui' : 'Tolak'} Mitra Donasi
            </h2>

            {/* Detail Mitra */}
            <div style={{
              marginBottom: '1rem',
              padding: '12px',
              backgroundColor: 'var(--secondary-color)',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Organisasi:</strong> {selectedMitra?.org_name}
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Email:</strong> {selectedMitra?.user_email}
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Telepon:</strong> {selectedMitra?.phone || '-'}
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Alamat:</strong> {selectedMitra?.address || '-'}
              </p>
              {selectedMitra?.description && (
                <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                  <strong>Deskripsi:</strong> {selectedMitra.description}
                </p>
              )}
              {selectedMitra?.document_url && (
                <p style={{ marginBottom: '0', color: 'var(--text-main)' }}>
                  <strong>Dokumen:</strong>{' '}
                  <a
                    href={selectedMitra.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}
                  >
                    Lihat dokumen
                  </a>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '14px' }}>
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
                    borderRadius: '4px',
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
