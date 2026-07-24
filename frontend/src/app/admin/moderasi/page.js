'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import DataTable from '@/components/organisms/DataTable';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { apiGet, apiPatch } from '@/lib/api';
import { isAdmin } from '@/lib/auth';

export default function ModerasiPage() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
    fetchUserList();
  }, []);

  async function fetchUserList() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterRole) params.append('role', filterRole);
      if (filterStatus) params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      const queryString = params.toString();
      const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
      const response = await apiGet(endpoint);
      if (response.success) {
        setUserList(response.data.users || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    fetchUserList();
  }

  function openDialog(user, actionType) {
    setSelectedUser(user);
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
      const response = await apiPatch(`/admin/users/${selectedUser.id}/status`, {
        action: action,
        note: note,
      });
      if (response.success) {
        const actionText = {
          approve: 'disetujui',
          reject: 'ditolak',
          warning: 'diberi warning',
          suspend: 'disuspend',
        }[action];
        alert(`User berhasil ${actionText}`);
        setShowDialog(false);
        fetchUserList();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function getActionButtons(user) {
    if (user.status === 'PENDING') {
      return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="primary" onClick={() => openDialog(user, 'approve')}>Approve</Button>
          <Button variant="danger" onClick={() => openDialog(user, 'reject')}>Reject</Button>
        </div>
      );
    } else if (user.status === 'ACTIVE') {
      return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="warning" onClick={() => openDialog(user, 'warning')}>Warning</Button>
          <Button variant="danger" onClick={() => openDialog(user, 'suspend')}>Suspend</Button>
        </div>
      );
    } else if (user.status === 'SUSPENDED') {
      return <Button variant="primary" onClick={() => openDialog(user, 'approve')}>Aktifkan Kembali</Button>;
    }
    return <span style={{ color: 'var(--text-muted)' }}>-</span>;
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
            <div className="page-title">Moderasi User</div>
            <div className="page-subtitle">Kelola dan moderasi user platform</div>
          </div>
        </div>
        <div className="content-area">
          {/* Filters */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px' }}>Role:</label>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '14px' }}>
                <option value="">Semua</option>
                <option value="CUSTOMER">Customer</option>
                <option value="UMKM">UMKM</option>
                <option value="ADMIN">Admin</option>
                <option value="MITRA_DONASI">Mitra Donasi</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px' }}>Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '14px' }}>
                <option value="">Semua</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px' }}>Cari (nama/email):</label>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFilter()} placeholder="Cari user..."
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
              <button className="btn-primary" onClick={fetchUserList}>Coba Lagi</button>
            </div>
          )}
          {!loading && !error && userList.length === 0 && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Tidak ada data user
            </div>
          )}
          {!loading && !error && userList.length > 0 && (
            <>
              <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '14px' }}>
                Total: {userList.length} user
              </p>
              <DataTable
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'name', label: 'Nama' },
                  { key: 'email', label: 'Email' },
                  { key: 'role', label: 'Role', render: (row) => <Badge variant="info" text={row.role} /> },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (row) => (
                      <Badge
                        variant={row.status === 'ACTIVE' ? 'success' : row.status === 'PENDING' ? 'warning' : 'danger'}
                        text={row.status}
                      />
                    )
                  },
                  {
                    key: 'created_at',
                    label: 'Tanggal Daftar',
                    render: (row) => new Date(row.created_at).toLocaleDateString('id-ID')
                  },
                  { key: 'actions', label: 'Aksi', render: (row) => getActionButtons(row) }
                ]}
                data={userList}
              />
            </>
          )}
        </div>
      </div>
      {showDialog && (
        <div className="dialog-overlay" onClick={() => setShowDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>
              {action === 'approve' && 'Approve User'}
              {action === 'reject' && 'Reject User'}
              {action === 'warning' && 'Beri Warning'}
              {action === 'suspend' && 'Suspend User'}
            </h2>
            <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
              User: <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
            </p>
            <p style={{ marginBottom: '1rem', fontSize: '14px', color: 'var(--text-muted)' }}>
              Role: {selectedUser?.role} | Status saat ini: {selectedUser?.status}
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '14px' }}>
                  Catatan (wajib):
                </label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} required
                  placeholder="Tulis catatan atau alasan moderasi..."
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
          max-width: 500px;
          width: 90%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
