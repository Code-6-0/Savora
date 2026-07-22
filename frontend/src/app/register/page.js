"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import { setToken, setUser, getRedirectAfterLogin } from '@/lib/auth';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi client-side
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
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
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Tambah phone & address untuk Customer
      if (formData.role === 'CUSTOMER') {
        if (formData.phone) payload.phone = formData.phone;
        if (formData.address) payload.address = formData.address;
      }

      const response = await apiPost('/auth/register', payload);

      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);

        // Redirect berdasarkan role
        const redirectUrl = getRedirectAfterLogin(response.data.user.role);
        router.push(redirectUrl);
      } else {
        setError(response.error?.message || 'Registrasi gagal');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'CUSTOMER', label: 'Customer (Pembeli Makanan)' },
    { value: 'UMKM', label: 'UMKM (Penjual Makanan)' },
    { value: 'MITRA_DONASI', label: 'Mitra Donasi (Organisasi Sosial)' },
  ];

  const showCustomerFields = formData.role === 'CUSTOMER';
  const showPendingInfo = formData.role === 'UMKM' || formData.role === 'MITRA_DONASI';

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
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--primary-color)' }}>⚲</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
            Daftar ke Savora
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            Bergabunglah dalam misi penyelamatan makanan
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
            <label style={labelStyle}>Nama Lengkap</label>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nama Anda" disabled={loading} required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nama@email.com" disabled={loading} required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Role / Peran</label>
            <Select name="role" value={formData.role} onChange={handleChange} disabled={loading}>
              {roleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>

          {/* Conditional Fields untuk Customer */}
          {showCustomerFields && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>No. Telepon (Opsional)</label>
                <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" disabled={loading} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Alamat (Opsional)</label>
                <Input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Alamat lengkap Anda" disabled={loading} />
              </div>
            </>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Password</label>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimal 6 karakter" disabled={loading} required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Konfirmasi Password</label>
            <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Ketik ulang password" disabled={loading} required />
          </div>

          {/* Info untuk UMKM/Mitra Donasi */}
          {showPendingInfo && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#92400E'
            }}>
              <strong>Info:</strong> Akun Anda akan berstatus <strong>PENDING</strong> dan memerlukan verifikasi admin sebelum dapat menggunakan fitur lengkap.
            </div>
          )}

          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 600 }}>
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </Button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Sudah punya akun?{' '}
          <Link href="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: '6px',
  color: 'var(--text-main)'
};
