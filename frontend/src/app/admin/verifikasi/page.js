'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../components/templates/DashboardLayout';
import Badge from '../../../components/atoms/Badge';

export default function VerifikasiPage() {
  // State
  const [activeTab, setActiveTab] = useState('umkm'); // 'umkm' | 'mitra'
  const [umkmList, setUmkmList] = useState([]);
  const [mitraList, setMitraList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'approve' | 'reject' | 'view'
  const [selectedItem, setSelectedItem] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Badge counts
  const [badgeCounts, setBadgeCounts] = useState({ umkm: 0, mitra: 0 });

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fetch UMKM list
  const fetchUMKMList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/umkm?status=PENDING`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mengambil data UMKM');
      }

      const result = await response.json();
      if (result.success) {
        setUmkmList(result.data.umkm_list || []);
        setBadgeCounts(prev => ({ ...prev, umkm: result.data.total || 0 }));
      }
    } catch (err) {
      console.error('Error fetching UMKM:', err);
      setError(err.message);
    }
  };

  // Fetch Mitra Donasi list
  const fetchMitraList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/mitra-donasi?status=PENDING`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mengambil data mitra donasi');
      }

      const result = await response.json();
      if (result.success) {
        setMitraList(result.data.mitra_list || []);
        setBadgeCounts(prev => ({ ...prev, mitra: result.data.total || 0 }));
      }
    } catch (err) {
      console.error('Error fetching mitra:', err);
      setError(err.message);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchUMKMList(), fetchMitraList()]);
      } catch (err) {
        setError('Gagal memuat data verifikasi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle verify action
  const handleVerifyAction = async () => {
    if (!note.trim()) {
      alert('Catatan wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const isUMKM = activeTab === 'umkm';
      const endpoint = isUMKM
        ? `/api/admin/umkm/${selectedItem.id}/verification`
        : `/api/admin/mitra-donasi/${selectedItem.id}/verify`;

      const status = dialogType === 'approve' ? 'APPROVED' : 'REJECTED';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
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
        throw new Error(result.error?.message || 'Gagal memverifikasi');
      }

      // Success - refresh data
      if (isUMKM) {
        await fetchUMKMList();
      } else {
        await fetchMitraList();
      }

      // Close dialog and reset
      setShowDialog(false);
      setSelectedItem(null);
      setNote('');
      setDialogType('');

      alert(`Berhasil ${status === 'APPROVED' ? 'menyetujui' : 'menolak'} ${isUMKM ? 'UMKM' : 'mitra donasi'}`);
    } catch (err) {
      console.error('Error verifying:', err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle open dialog
  const openDialog = (type, item) => {
    setDialogType(type);
    setSelectedItem(item);
    setNote('');
    setShowDialog(true);
  };

  // Handle close dialog
  const closeDialog = () => {
    setShowDialog(false);
    setSelectedItem(null);
    setNote('');
    setDialogType('');
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat data verifikasi...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error && umkmList.length === 0 && mitraList.length === 0) {
    return (
      <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: 'var(--text-main)',
          marginBottom: '0.5rem'
        }}>
          Verifikasi UMKM & Mitra Donasi
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Tinjau dan verifikasi pendaftaran UMKM dan mitra donasi yang menunggu persetujuan
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('umkm')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'umkm' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'umkm' ? 'white' : 'var(--text-main)',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          UMKM
          {badgeCounts.umkm > 0 && (
            <Badge variant="danger" size="sm">{badgeCounts.umkm}</Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('mitra')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'mitra' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'mitra' ? 'white' : 'var(--text-main)',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          Mitra Donasi
          {badgeCounts.mitra > 0 && (
            <Badge variant="danger" size="sm">{badgeCounts.mitra}</Badge>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {/* UMKM Tab */}
        {activeTab === 'umkm' && (
          <>
            {umkmList.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tidak ada UMKM yang menunggu verifikasi</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Semua pendaftaran UMKM telah diproses</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--secondary-color)', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>Nama Bisnis</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>Kategori</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>Alamat</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>Tanggal Daftar</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {umkmList.map((umkm) => (
                      <tr key={umkm.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{umkm.business_name || '-'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{umkm.user_email || '-'}</div>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{umkm.category || '-'}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-main)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {umkm.address || '-'}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatDate(umkm.user_created_at || umkm.created_at)}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => openDialog('view', umkm)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: 'var(--secondary-color)',
                                color: 'var(--primary-color)',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8125rem',
                                fontWeight: '600'
                              }}
                            >
                              Lihat
                            </button>
                            <button
                              onClick={() => openDialog('approve', umkm)}
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
                              Setujui
                            </button>
                            <button
                              onClick={() => openDialog('reject', umkm)}
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
                              Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Mitra Donasi Tab */}
        {activeTab === 'mitra' && (
          <>
            {mitraList.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tidak ada mitra donasi yang menunggu verifikasi</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Semua pengajuan mitra donasi telah diproses</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--secondary-color)', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>Nama Organisasi</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>Kontak PIC</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>Alamat</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>Tanggal Pengajuan</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mitraList.map((mitra) => (
                      <tr key={mitra.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{mitra.org_name || '-'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mitra.user_email || '-'}</div>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-main)' }}>{mitra.phone || '-'}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-main)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {mitra.address || '-'}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatDate(mitra.created_at)}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => openDialog('view', mitra)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: 'var(--secondary-color)',
                                color: 'var(--primary-color)',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8125rem',
                                fontWeight: '600'
                              }}
                            >
                              Lihat
                            </button>
                            <button
                              onClick={() => openDialog('approve', mitra)}
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
                              Setujui
                            </button>
                            <button
                              onClick={() => openDialog('reject', mitra)}
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
                              Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog */}
      {showDialog && (
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
            {dialogType === 'view' && selectedItem && (
              <>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                  Detail {activeTab === 'umkm' ? 'UMKM' : 'Mitra Donasi'}
                </h2>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {activeTab === 'umkm' ? 'Nama Bisnis' : 'Nama Organisasi'}
                  </label>
                  <p style={{ color: 'var(--text-main)' }}>{activeTab === 'umkm' ? selectedItem.business_name : selectedItem.org_name}</p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {activeTab === 'umkm' ? 'Kategori' : 'Kontak PIC'}
                  </label>
                  <p style={{ color: 'var(--text-main)' }}>{activeTab === 'umkm' ? selectedItem.category : selectedItem.phone}</p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Alamat</label>
                  <p style={{ color: 'var(--text-main)' }}>{selectedItem.address}</p>
                </div>
                {activeTab === 'umkm' && selectedItem.phone && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Telepon</label>
                    <p style={{ color: 'var(--text-main)' }}>{selectedItem.phone}</p>
                  </div>
                )}
                {selectedItem.document_url && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Dokumen</label>
                    <a href={selectedItem.document_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                      Lihat Dokumen
                    </a>
                  </div>
                )}
                {activeTab === 'mitra' && selectedItem.description && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Deskripsi</label>
                    <p style={{ color: 'var(--text-main)' }}>{selectedItem.description}</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                  <button
                    onClick={closeDialog}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </>
            )}

            {(dialogType === 'approve' || dialogType === 'reject') && selectedItem && (
              <>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                  {dialogType === 'approve' ? 'Setujui' : 'Tolak'} {activeTab === 'umkm' ? 'UMKM' : 'Mitra Donasi'}
                </h2>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--secondary-color)', borderRadius: '8px' }}>
                  <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                    {activeTab === 'umkm' ? selectedItem.business_name : selectedItem.org_name}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {selectedItem.user_email}
                  </p>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Catatan <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={`Berikan catatan ${dialogType === 'approve' ? 'persetujuan' : 'penolakan'}...`}
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
                    Catatan wajib diisi dan akan dikirimkan ke {activeTab === 'umkm' ? 'UMKM' : 'mitra donasi'}
                  </p>
                </div>
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
                    onClick={handleVerifyAction}
                    disabled={submitting || !note.trim()}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: dialogType === 'approve' ? 'var(--success-color)' : 'var(--danger-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: (submitting || !note.trim()) ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      opacity: (submitting || !note.trim()) ? 0.6 : 1
                    }}
                  >
                    {submitting ? 'Memproses...' : (dialogType === 'approve' ? 'Setujui' : 'Tolak')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
