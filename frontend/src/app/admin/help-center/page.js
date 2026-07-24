'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import DataTable from '@/components/organisms/DataTable';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { apiGet, apiPatch } from '@/lib/api';
import { isAdmin } from '@/lib/auth';

export default function HelpCenterPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'in_progress' | 'resolved'
  const [filterCategory, setFilterCategory] = useState('');
  const [pendingCount, setPendingCount] = useState(0); // Badge count tab Baru
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [action, setAction] = useState(''); // Aksi: WARN_UMKM, CANCEL_ORDER, CLOSE_INVALID (PRD 14.8)
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
      return;
    }
    fetchTickets();
    fetchBadgeCount();
  }, [activeTab, filterCategory]);

  async function fetchBadgeCount() {
    try {
      const response = await apiGet('/admin/reports/summary');
      if (response.success && response.data?.summary) {
        setPendingCount(response.data.summary.tiket_help_baru_count || 0);
      }
    } catch (err) {
      // Silent fail untuk badge count - tidak kritikal
      console.error('Failed to fetch badge count:', err);
    }
  }

  async function fetchTickets() {
    try {
      setLoading(true);
      setError(null);

      // Map tab ke status backend
      const statusMap = {
        'new': 'OPEN',
        'in_progress': 'IN_PROGRESS',
        'resolved': 'RESOLVED,CLOSED' // Tab "Selesai" include RESOLVED & CLOSED
      };

      let params = [];
      const mappedStatus = statusMap[activeTab];
      if (mappedStatus) params.push(`status=${mappedStatus}`);
      if (filterCategory) params.push(`category=${filterCategory}`);

      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      const response = await apiGet(`/admin/help-tickets${queryString}`);
      if (response.success) {
        setTickets(response.data.tickets || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openDialog(ticket, actionType = '') {
    setSelectedTicket(ticket);
    setAction(actionType); // Set aksi yang dipilih (PRD 14.8)
    setNewStatus(ticket.status);
    setAdminNote(ticket.admin_note || '');
    setShowDialog(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!adminNote.trim()) {
      alert('Catatan admin wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        status: newStatus,
        admin_note: adminNote,
      };

      // Tambahkan action jika ada (PRD Section 14.8)
      if (action) {
        payload.action = action;
      }

      const response = await apiPatch(`/admin/help-tickets/${selectedTicket.id}/status`, payload);

      if (response.success) {
        const actionText = {
          'WARN_UMKM': 'Warning berhasil diberikan ke UMKM',
          'CANCEL_ORDER': 'Order berhasil dibatalkan',
          'CLOSE_INVALID': 'Tiket berhasil ditutup (invalid)',
        }[action] || 'Status ticket berhasil diperbarui';

        alert(actionText);
        setShowDialog(false);
        fetchTickets();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // 7 Kategori PERSIS dari PRD Section 14.7 (wording exact, disesuaikan dengan backend model)
  const categoryLabels = {
    'Produk tidak tersedia saat pickup': 'Produk tidak tersedia saat pickup',
    'Produk tidak sesuai deskripsi/foto': 'Produk tidak sesuai deskripsi/foto',
    'UMKM tidak merespons': 'UMKM tidak merespons',
    'Terjadi kendala saat pickup': 'Terjadi kendala saat pickup',
    'Order dibatalkan sepihak': 'Order dibatalkan sepihak',
    'Pembayaran Midtrans sandbox berhasil tetapi pickup code tidak muncul': 'Pembayaran Midtrans sandbox berhasil tetapi pickup code tidak muncul',
    'Pembayaran Midtrans sandbox gagal/expired atau status tidak berubah': 'Pembayaran Midtrans sandbox gagal/expired atau status tidak berubah'
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
            <div className="page-title">Help Center</div>
            <div className="page-subtitle">Kelola laporan bantuan dari customer</div>
          </div>
        </div>

        <div className="content-area">
          {/* Tab Navigation */}
          <div style={{
            borderBottom: '2px solid var(--border-color)',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={() => setActiveTab('new')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'new' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'new' ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: activeTab === 'new' ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                marginBottom: '-2px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'new') {
                  e.currentTarget.style.background = 'var(--secondary-color)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Baru
              {pendingCount > 0 && (
                <span style={{
                  marginLeft: '6px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--danger-color)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'in_progress' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'in_progress' ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: activeTab === 'in_progress' ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '-2px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'in_progress') {
                  e.currentTarget.style.background = 'var(--secondary-color)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Diproses
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'resolved' ? '3px solid var(--primary-color)' : '3px solid transparent',
                color: activeTab === 'resolved' ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: activeTab === 'resolved' ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '-2px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'resolved') {
                  e.currentTarget.style.background = 'var(--secondary-color)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Selesai
            </button>
          </div>

          {/* Filter Kategori */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                Kategori:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  minWidth: '200px'
                }}
              >
                <option value="">Semua</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
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
              <button className="btn-primary" onClick={fetchTickets}>Coba Lagi</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && tickets.length === 0 && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Tidak ada ticket bantuan
            </div>
          )}

          {/* Table */}
          {!loading && !error && tickets.length > 0 && (
            <DataTable
              columns={[
                { key: 'id', label: 'ID' },
                {
                  key: 'reporter_name',
                  label: 'Pelapor',
                  render: (row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.reporter_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.reporter_email}</div>
                    </div>
                  )
                },
                {
                  key: 'category',
                  label: 'Kategori Aduan',
                  render: (row) => (
                    <span style={{ fontSize: '0.85rem' }}>
                      {categoryLabels[row.category] || row.category}
                    </span>
                  )
                },
                {
                  key: 'order_id',
                  label: 'Order/Entitas Terkait',
                  render: (row) => (
                    row.order_id ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 500 }}>
                        Order #{row.order_id}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>-</span>
                    )
                  )
                },
                {
                  key: 'description',
                  label: 'Deskripsi',
                  render: (row) => (
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.description}
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (row) => (
                    <Badge
                      variant={
                        row.status === 'RESOLVED' ? 'success' :
                        row.status === 'IN_PROGRESS' ? 'info' :
                        row.status === 'CLOSED' ? 'secondary' :
                        'warning'
                      }
                      text={row.status.replace('_', ' ')}
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
                    <Button variant="primary" onClick={() => openDialog(row)}>
                      Detail
                    </Button>
                  )
                }
              ]}
              data={tickets}
            />
          )}
        </div>
      </div>

      {/* Dialog Detail & Update */}
      {showDialog && (
        <div className="dialog-overlay" onClick={() => setShowDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>
              Detail Ticket Bantuan
            </h2>

            {/* Ticket Info */}
            <div style={{
              marginBottom: '1rem',
              padding: '16px',
              backgroundColor: 'var(--secondary-color)',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>ID:</strong> #{selectedTicket?.id}
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Pelapor:</strong> {selectedTicket?.reporter_name} ({selectedTicket?.reporter_email})
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Kategori:</strong> {categoryLabels[selectedTicket?.category] || selectedTicket?.category}
              </p>
              {selectedTicket?.order_id && (
                <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                  <strong>Order ID:</strong> #{selectedTicket.order_id}
                </p>
              )}
              <p style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
                <strong>Deskripsi:</strong><br />
                {selectedTicket?.description}
              </p>
              {selectedTicket?.proof_url && (
                <div style={{ marginTop: '12px' }}>
                  <strong>Bukti:</strong>
                  <img
                    src={selectedTicket.proof_url}
                    alt="Bukti"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', marginTop: '8px', borderRadius: '6px' }}
                  />
                </div>
              )}
              <p style={{ marginTop: '12px', marginBottom: '0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Dibuat: {new Date(selectedTicket?.created_at).toLocaleString('id-ID')}
              </p>
            </div>

            {/* Pilihan Aksi Penanganan (PRD Section 14.8) */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600 }}>
                Pilih Aksi Penanganan:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setAction('')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: action === '' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    background: action === '' ? 'var(--primary-color)' : 'white',
                    color: action === '' ? 'white' : 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: action === '' ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  Update Status Biasa
                </button>
                <button
                  type="button"
                  onClick={() => setAction('WARN_UMKM')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: action === 'WARN_UMKM' ? '2px solid var(--warning-color)' : '1px solid var(--border-color)',
                    background: action === 'WARN_UMKM' ? 'var(--warning-color)' : 'white',
                    color: action === 'WARN_UMKM' ? 'white' : 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: action === 'WARN_UMKM' ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  Beri Warning ke UMKM
                </button>
                <button
                  type="button"
                  onClick={() => setAction('CANCEL_ORDER')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: action === 'CANCEL_ORDER' ? '2px solid var(--danger-color)' : '1px solid var(--border-color)',
                    background: action === 'CANCEL_ORDER' ? 'var(--danger-color)' : 'white',
                    color: action === 'CANCEL_ORDER' ? 'white' : 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: action === 'CANCEL_ORDER' ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  Batalkan Order
                </button>
                <button
                  type="button"
                  onClick={() => setAction('CLOSE_INVALID')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: action === 'CLOSE_INVALID' ? '2px solid var(--text-muted)' : '1px solid var(--border-color)',
                    background: action === 'CLOSE_INVALID' ? 'var(--text-muted)' : 'white',
                    color: action === 'CLOSE_INVALID' ? 'white' : 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: action === 'CLOSE_INVALID' ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  Tutup Tiket (Invalid)
                </button>
              </div>
              {action && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--secondary-color)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-main)' }}>
                  <strong>Aksi dipilih:</strong> {
                    action === 'WARN_UMKM' ? 'Beri Warning ke UMKM (dicatat ke audit logs)' :
                    action === 'CANCEL_ORDER' ? 'Batalkan Order (order status → CANCELLED)' :
                    action === 'CLOSE_INVALID' ? 'Tutup Tiket karena Komplain Tidak Valid' :
                    'Update Status Biasa'
                  }
                </div>
              )}
            </div>

            {/* Update Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600 }}>
                  Status:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '14px'
                  }}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600 }}>
                  Catatan Admin:
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  required
                  placeholder="Tulis catatan atau solusi untuk customer..."
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
                  {submitting ? 'Memproses...' : 'Update'}
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
          max-width: 650px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
