'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import Button from '@/components/atoms/Button';
import { apiGet, apiPatch } from '@/lib/api';
import { isAdmin } from '@/lib/auth';

export default function PengaturanPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form states - Profil Admin
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState('');

  // Form states - Ganti Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGet('/me');
      if (response.success && response.data) {
        const user = response.data.user || response.data;
        setProfile(user);
        setName(user.name || '');
        setEmail(user.email || '');
        setAvatar(user.avatar || '');
        setRole(user.role || 'ADMIN');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Nama dan email wajib diisi');
      return;
    }

    try {
      setSubmittingProfile(true);
      const payload = { name, email };
      if (avatar) payload.avatar = avatar;

      const response = await apiPatch('/me', payload);
      if (response.success) {
        alert('Profil berhasil diperbarui');
        fetchProfile();
      }
    } catch (err) {
      alert(`Gagal memperbarui profil: ${err.message}`);
    } finally {
      setSubmittingProfile(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Semua field password wajib diisi');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi tidak cocok');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password baru minimal 6 karakter');
      return;
    }

    try {
      setSubmittingPassword(true);
      const response = await apiPatch('/me/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (response.success) {
        alert('Password berhasil diubah');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      alert(`Gagal mengubah password: ${err.message}`);
    } finally {
      setSubmittingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <AdminSidebar />
        <div className="main-container">
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            Memuat data pengaturan...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <AdminSidebar />
        <div className="main-container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ color: 'var(--danger-color)', fontSize: '14px', marginBottom: '10px' }}>
              {error}
            </div>
            <button className="btn-primary" onClick={fetchProfile}>Coba Lagi</button>
          </div>
        </div>
      </div>
    );
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
            <div className="page-title">Pengaturan</div>
            <div className="page-subtitle">Kelola profil admin dan parameter platform</div>
          </div>
        </div>

        <div className="content-area">
          <div style={{ maxWidth: '800px' }}>
            {/* Section 1: Profil Admin */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
                Profil Admin
              </h2>
              <form onSubmit={handleUpdateProfile}>
                {/* Avatar Preview */}
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    margin: '0 auto 1rem',
                    background: avatar ? `url(${avatar}) center/cover` : 'var(--secondary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: 'var(--primary-color)',
                    fontWeight: 600,
                    border: '3px solid var(--border-color)'
                  }}>
                    {!avatar && (name ? name.charAt(0).toUpperCase() : 'A')}
                  </div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    URL Foto (opsional):
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '14px',
                      marginTop: '6px'
                    }}
                  />
                </div>

                {/* Nama */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                    Nama Lengkap<span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                    Email<span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Role (read-only) */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                    Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    readOnly
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '14px',
                      background: 'var(--secondary-color)',
                      color: 'var(--text-muted)',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>

                <Button type="submit" variant="primary" disabled={submittingProfile}>
                  {submittingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>
              </form>
            </div>

            {/* Section 2: Ganti Password */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
                Ganti Password
              </h2>
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                    Password Saat Ini<span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                    Password Baru<span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '14px'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Minimal 6 karakter
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                    Konfirmasi Password Baru<span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <Button type="submit" variant="primary" disabled={submittingPassword}>
                  {submittingPassword ? 'Mengubah...' : 'Ubah Password'}
                </Button>
              </form>
            </div>

            {/* Section 3: Parameter Platform (tipis, read-only) */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
                Parameter Platform
              </h2>
              <div style={{
                padding: '1rem',
                background: 'var(--secondary-color)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Service Fee Platform:
                  </span>
                  <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--primary-color)' }}>
                    5%
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Service fee platform ditetapkan 5% dari subtotal transaksi (sesuai PRD 14.4).
                  Fee ini ditambahkan ke pembayaran customer dan masuk ke platform revenue, bukan dipotong dari UMKM.
                </p>
              </div>
            </div>

            {/* Section 4: Tentang Aplikasi */}
            <div className="card">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
                Tentang Aplikasi
              </h2>
              <div style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text-main)' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Savora Admin Dashboard</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Versi 1.0.0 (MVP)</div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Dokumentasi:</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                    <li>
                      <a
                        href="/docs/SAVORA_PRD.md"
                        target="_blank"
                        style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                      >
                        Product Requirements Document (PRD v3.7)
                      </a>
                    </li>
                    <li>
                      <a
                        href="/docs/admin-dashboard-spec.md"
                        target="_blank"
                        style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                      >
                        Admin Dashboard Design Spec
                      </a>
                    </li>
                  </ul>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  © 2026 AmbaTeam — CODE 6.0 Software Development Competition
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
