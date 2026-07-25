"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import { setToken, setUser, getRedirectAfterLogin, isAuthenticated, getUser } from '@/lib/auth';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      if (user?.role) {
        const redirectUrl = getRedirectAfterLogin(user.role);
        router.replace(redirectUrl);
      }
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Semua field wajib diisi');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      const payload = { name: formData.name, email: formData.email, password: formData.password };

      const response = await apiPost('/auth/register', payload);

      if (response.success && response.data) {
        // F1: Register tanpa auto-login — redirect ke login dengan flag registered=1
        router.push('/login?registered=1');
      } else {
        setError(response.error?.message || 'Registrasi gagal');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F8F9' }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/images/savora-logo.png" alt="Savora Logo" style={{ width: '28px', height: '28px' }} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#1B7A43' }}>Savora</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 52px)', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: '#1F2937' }}>Buat Akun Savora</h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>Bergabunglah dengan ribuan orang untuk menyelamatkan makanan setiap hari.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', color: '#991B1B' }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Nama Lengkap */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Nama Lengkap</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama lengkapmu"
                disabled={loading}
                required
                style={{ height: '42px', borderRadius: '10px', border: '1px solid #E5E7EB' }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@contoh.com"
                disabled={loading}
                required
                style={{ height: '42px', borderRadius: '10px', border: '1px solid #E5E7EB' }}
              />
            </div>

            {/* Kata Sandi */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Kata Sandi</label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 karakter"
                  disabled={loading}
                  required
                  style={{ height: '42px', borderRadius: '10px', border: '1px solid #E5E7EB', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Konfirmasi Kata Sandi</label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ketik ulang kata sandi"
                  disabled={loading}
                  required
                  style={{ height: '42px', borderRadius: '10px', border: '1px solid #E5E7EB', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Daftar */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{ width: '100%', height: '44px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600, backgroundColor: '#1B7A43', marginBottom: '12px' }}
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </Button>

            {/* Tombol Masuk (Outline) */}
            <Link href="/login" style={{ textDecoration: 'none', display: 'block' }}>
              <Button
                type="button"
                disabled={loading}
                style={{ width: '100%', height: '44px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600, backgroundColor: '#FFFFFF', border: '2px solid #1B7A43', color: '#1B7A43' }}
              >
                Sudah punya akun? Masuk di sini
              </Button>
            </Link>
          </form>

          {/* Teks Nonaktif - WAJIB ADA (T1) */}
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', fontSize: '12px', color: '#6B7280', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 8px' }}>🏪 <strong>Ingin berjualan?</strong> Gabung jadi UMKM — Segera hadir</p>
            <p style={{ margin: 0 }}>🤝 <strong>Daftar sebagai Mitra</strong> — Segera hadir</p>
          </div>

          {/* Footer Text */}
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#9CA3AF', lineHeight: '1.5' }}>
            Dengan mendaftar, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi Savora.
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#1F2937', textAlign: 'left' };
