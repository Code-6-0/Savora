'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthenticated, getUser, getToken } from '@/lib/auth';
import TopHeader from '@/components/organisms/TopHeader';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import { AlertCircle } from 'lucide-react';
import { getMitraProfile } from '@/lib/mitraDonasi';

function ProfilMitraContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profil';
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [mitraProfile, setMitraProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    org_name: '',
    phone: '',
    address: '',
    description: '',
    document_url: '',
    category: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    const currentUser = isAuthenticated() ? getUser() : null;
    setUser(currentUser || { name: 'Mitra Demo', role: 'MITRA_DONASI' });
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setUsingDemoData(false);

    try {
      const data = await getMitraProfile();
      
      if (data?.user) {
        setUser(data.user);
      }

      if (data?.mitra_profile) {
        const profile = data.mitra_profile;
        setMitraProfile(profile);
        setFormData({
          org_name: profile.org_name || '',
          phone: profile.phone || '',
          address: profile.address || '',
          description: profile.description || '',
          document_url: profile.document_url || '',
          category: profile.category || '',
        });
      } else {
        // No mitra profile — user might not have one yet
        setUsingDemoData(true);
        loadDemoProfile();
      }
    } catch (err) {
      console.warn('Failed to fetch profile, using demo:', err.message);
      setUsingDemoData(true);
      loadDemoProfile();
    } finally {
      setLoading(false);
    }
  }

  function loadDemoProfile() {
    const demoProfile = {
      org_name: 'Yayasan Pangan Nusantara',
      phone: '081234567890',
      address: 'Jl. Mangga Dua No. 45, Jakarta Utara',
      description: 'Organisasi penyalur donasi makanan surplus untuk masyarakat yang membutuhkan',
      document_url: '',
      category: 'donasi',
      verification_status: 'APPROVED',
    };
    setMitraProfile(demoProfile);
    setFormData({
      org_name: demoProfile.org_name,
      phone: demoProfile.phone,
      address: demoProfile.address,
      description: demoProfile.description,
      document_url: demoProfile.document_url,
      category: demoProfile.category,
    });
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          mitra_profile: formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
        if (data.data?.mitra_profile) {
          setMitraProfile(data.data.mitra_profile);
        }
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Gagal memperbarui profil' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Password baru tidak cocok' });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password berhasil diubah' });
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Gagal mengubah password' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengubah password' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopHeader title="Profil Mitra" subtitle="Memuat..." />
        <div className="content-area" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat profil...</p>
        </div>
      </>
    );
  }

  const getCategoryLabel = (category) => {
    const categories = {
      'donasi': 'Mitra Donasi (Penyalur)',
      'mitra_donasi': 'Mitra Donasi (Penyalur)',
      'bank_sampah': 'Bank Sampah',
      'daur_ulang': 'Daur Ulang',
      'kompos': 'Kompos',
      'maggot_bsf': 'Maggot BSF',
      'pengangkutan_sampah': 'Pengangkutan Sampah',
      'waste_management': 'Waste Management',
    };
    return categories[category?.toLowerCase()] || category;
  };

  return (
    <>
      <TopHeader 
        title="Profil Mitra"
        subtitle={mitraProfile?.org_name || user?.name || 'Mitra Savora'}
      />

      <div className="content-area">
          {/* Demo Data Banner */}
          {usingDemoData && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>Menampilkan data demo — backend tidak tersedia.</span>
            </div>
          )}

          {/* Message Alert */}
          {message && (
            <div className={`card ${message.type === 'success' ? 'bg-success' : 'bg-danger'}`} style={{ 
              marginBottom: '20px',
              padding: '12px 16px',
              backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
              color: message.type === 'success' ? '#065F46' : 'var(--danger-color)',
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}>
              {message.text}
            </div>
          )}

          {/* Tab: Profil Organisasi */}
          {currentTab === 'profil' && (
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Profil Organisasi</h2>
              <form onSubmit={handleSaveProfile}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                    Nama Organisasi <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <Input
                    type="text"
                    name="org_name"
                    value={formData.org_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                    Kategori Mitra
                  </label>
                  <Input
                    type="text"
                    value={getCategoryLabel(formData.category)}
                    disabled
                    style={{ backgroundColor: '#F3F4F6', cursor: 'not-allowed' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Kategori tidak dapat diubah setelah verifikasi
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                    Nomor Telepon <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                    Alamat Lengkap <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                    Deskripsi Organisasi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                    URL Dokumen Legalitas
                  </label>
                  <Input
                    type="url"
                    name="document_url"
                    value={formData.document_url}
                    onChange={handleInputChange}
                    placeholder="https://drive.google.com/..."
                  />
                </div>

                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </form>
            </div>
          )}

          {/* Tab: Status Verifikasi */}
          {currentTab === 'verifikasi' && (
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Status Verifikasi</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Status Akun
                </p>
                <Badge variant={
                  mitraProfile?.verification_status?.toUpperCase() === 'APPROVED' ? 'success' :
                  mitraProfile?.verification_status?.toUpperCase() === 'REJECTED' ? 'danger' : 'warning'
                }>
                  {mitraProfile?.verification_status?.toUpperCase() === 'APPROVED' && '✓ APPROVED'}
                  {mitraProfile?.verification_status?.toUpperCase() === 'PENDING' && '⏳ PENDING'}
                  {mitraProfile?.verification_status?.toUpperCase() === 'REJECTED' && '✗ REJECTED'}
                </Badge>
              </div>

              {mitraProfile?.verification_status?.toUpperCase() === 'APPROVED' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#D1FAE5',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#065F46' }}>
                    ✓ Akun Anda telah diverifikasi dan disetujui oleh admin. Anda dapat mengakses semua fitur dashboard mitra.
                  </p>
                  {mitraProfile?.verified_at && (
                    <p style={{ fontSize: '0.75rem', color: '#065F46', marginTop: '8px' }}>
                      Diverifikasi pada: {new Date(mitraProfile.verified_at).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              )}

              {mitraProfile?.verification_status?.toUpperCase() === 'PENDING' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#92400E' }}>
                    ⏳ Akun Anda sedang dalam proses verifikasi. Mohon tunggu hingga admin meninjau pendaftaran Anda.
                  </p>
                </div>
              )}

              {mitraProfile?.verification_status?.toUpperCase() === 'REJECTED' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#FEE2E2',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--danger-color)', marginBottom: '8px' }}>
                    ✗ Maaf, pengajuan Anda sebagai mitra tidak dapat disetujui.
                  </p>
                  {mitraProfile?.admin_note && (
                    <>
                      <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', fontWeight: 600, marginTop: '12px' }}>
                        Catatan Admin:
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--danger-color)' }}>
                        {mitraProfile.admin_note}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Informasi Pendaftaran</h3>
                <div style={{ fontSize: '0.875rem', lineHeight: '1.8' }}>
                  <p><strong>Nama Organisasi:</strong> {mitraProfile?.org_name}</p>
                  <p><strong>Kategori:</strong> {getCategoryLabel(mitraProfile?.category)}</p>
                  <p><strong>Tanggal Daftar:</strong> {mitraProfile?.created_at ? new Date(mitraProfile.created_at).toLocaleDateString('id-ID') : '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Keamanan Akun */}
          {currentTab === 'keamanan' && (
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Keamanan Akun</h2>
              
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                    Password Lama <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <Input
                    type="password"
                    name="old_password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                    Password Baru <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <Input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>
                    Konfirmasi Password Baru <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <Input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Ketik ulang password baru"
                  />
                </div>

                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Mengubah...' : 'Ubah Password'}
                </Button>
              </form>
            </div>
          )}
        </div>
    </>
  );
}

export default function ProfilMitraPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Memuat...</p>
      </div>
    }>
      <ProfilMitraContent />
    </Suspense>
  );
}
