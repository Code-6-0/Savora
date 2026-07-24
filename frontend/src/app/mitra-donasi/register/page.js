'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Typography from '@/components/atoms/Typography';

export default function RegisterMitraDonasiPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    org_name: '',
    phone: '',
    address: '',
    description: '',
    document_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasi password
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    try {
      setLoading(true);
      const response = await apiPost('/mitra-donasi/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        org_name: formData.org_name,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        document_url: formData.document_url,
      });

      if (response.success) {
        setSuccess(true);
        // Redirect ke login setelah 3 detik
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.error?.message || 'Pendaftaran gagal');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-color)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          backgroundColor: 'var(--card-bg)',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            backgroundColor: 'var(--secondary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-color)',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
          <Typography variant="h2" style={{ marginBottom: '10px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
            Pendaftaran Berhasil!
          </Typography>
          <Typography style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
            Terima kasih telah mendaftar sebagai Mitra Donasi Savora.
            Akun Anda akan diverifikasi oleh admin dalam 1-2 hari kerja.
            Anda akan menerima notifikasi melalui email setelah verifikasi selesai.
          </Typography>
          <Typography style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Mengalihkan ke halaman login dalam 3 detik...
          </Typography>
          <div style={{ marginTop: '20px' }}>
            <Link href="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
              Atau klik di sini untuk login sekarang
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-color)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'var(--card-bg)',
        padding: '40px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            marginBottom: '20px'
          }}>
            <span style={{ color: "var(--primary-color)", fontSize: "28px" }}>⚲</span>
            <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-main)' }}>Savora</span>
          </Link>
          <Typography variant="h2" style={{ marginTop: '10px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
            Daftar Mitra Donasi
          </Typography>
          <Typography style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.875rem' }}>
            Bergabunglah sebagai mitra untuk menerima donasi makanan surplus
          </Typography>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#FEE2E2',
            color: 'var(--danger-color)',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.875rem',
            border: '1px solid var(--danger-color)'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Informasi Penanggung Jawab */}
          <div style={{ marginBottom: '24px' }}>
            <Typography variant="h3" style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-main)' }}>
              Informasi Penanggung Jawab
            </Typography>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Nama Lengkap <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama penanggung jawab"
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Email <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Password <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Konfirmasi Password <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ketik ulang password"
                required
              />
            </div>
          </div>

          {/* Informasi Organisasi */}
          <div style={{ marginBottom: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <Typography variant="h3" style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-main)' }}>
              Informasi Organisasi
            </Typography>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Nama Organisasi <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <Input
                type="text"
                name="org_name"
                value={formData.org_name}
                onChange={handleChange}
                placeholder="Nama yayasan/organisasi"
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Nomor Telepon <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08123456789"
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Alamat Lengkap <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Alamat lengkap organisasi"
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
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Deskripsi Organisasi <span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan visi, misi, dan kegiatan organisasi Anda"
                required
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                URL Dokumen Legalitas (Opsional)
              </label>
              <Input
                type="url"
                name="document_url"
                value={formData.document_url}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
              />
              <Typography style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Upload dokumen legalitas (akta, SK, dll) ke cloud storage dan paste link-nya di sini
              </Typography>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {loading ? 'Mendaftar...' : 'Daftar Sebagai Mitra Donasi'}
          </Button>

          {/* Link ke Login */}
          <div style={{ textAlign: 'center' }}>
            <Typography style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Sudah punya akun?{' '}
              <Link href="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
                Login di sini
              </Link>
            </Typography>
          </div>
        </form>
      </div>
    </div>
  );
}
