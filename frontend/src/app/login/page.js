"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import { setToken, setUser, getRedirectAfterLogin } from '@/lib/auth';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error saat user mulai mengetik
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi client-side
    if (!formData.email || !formData.password) {
      setError('Email dan password wajib diisi');
      setLoading(false);
      return;
    }

    try {
      const response = await apiPost('/auth/login', formData);

      if (response.success && response.data) {
        // Simpan token dan user data
        setToken(response.data.token);
        setUser(response.data.user);

        // Redirect berdasarkan role
        const redirectUrl = getRedirectAfterLogin(response.data.user.role);
        router.push(redirectUrl);
      } else {
        setError(response.error?.message || 'Login gagal');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      position: 'relative'
    }}>
      {/* Logo Savora di kiri atas halaman */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        fontSize: '20px',
        fontWeight: 700,
        color: 'var(--primary-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '24px' }}>🌿</span>
        Savora
      </div>

      {/* Container tengah */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* Kartu putih */}
        <div style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          position: 'relative'
        }}>
          {/* Header kartu: Logo kiri + X kanan */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ fontSize: '20px' }}>🌿</span>
              Savora
            </div>
            <Link
              href="/"
              style={{
                fontSize: '24px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                lineHeight: 1,
                cursor: 'pointer'
              }}
            >
              ✕
            </Link>
          </div>

          {/* Gambar maskot */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img
              src="/maskot-masuk-akun.png"
              alt="Maskot Savora"
              style={{
                maxWidth: '200px',
                height: 'auto',
                margin: '0 auto'
              }}
            />
          </div>

          {/* Judul dan subteks */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              margin: '0 0 8px',
              color: 'var(--text-main)'
            }}>
              Selamat Datang di Savora!
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Selamatkan makanan, hemat biaya, kurangi limbah.<br />
              Masuk untuk melanjutkan.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#991B1B'
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '6px',
                color: 'var(--text-main)'
              }}>
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                disabled={loading}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '6px',
                color: 'var(--text-main)'
              }}>
                Password
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            {/* Tombol Masuk - hijau full-width */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 600,
                marginBottom: '12px'
              }}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>

            {/* Tombol Daftar - outline putih full-width */}
            <Link href="/register" style={{ textDecoration: 'none', display: 'block' }}>
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  border: '2px solid var(--border-color)',
                  color: 'var(--text-main)'
                }}
              >
                Saya baru, daftar sekarang!
              </Button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
