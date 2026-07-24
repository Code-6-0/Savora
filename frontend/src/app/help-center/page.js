'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormGroup from '@/components/molecules/FormGroup';
import Typography from '@/components/atoms/Typography';

// 7 Kategori PERSIS dari PRD Section 14.7 (wording exact)
const categories = [
  "Produk tidak tersedia saat pickup",
  "Produk tidak sesuai deskripsi/foto",
  "UMKM tidak merespons",
  "Terjadi kendala saat pickup",
  "Order dibatalkan sepihak",
  "Pembayaran Midtrans sandbox berhasil tetapi pickup code tidak muncul",
  "Pembayaran Midtrans sandbox gagal/expired atau status tidak berubah"
];

export default function HelpCenterPage() {
  const [formData, setFormData] = useState({
    order_id: '',
    category: '',
    description: '',
    proof_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasi
    if (!formData.category || !formData.description) {
      setError('Kategori dan deskripsi wajib diisi');
      setLoading(false);
      return;
    }

    try {
      // Ambil token dari localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Prepare payload
      const payload = {
        category: formData.category,
        description: formData.description,
      };

      // Add optional fields
      if (formData.order_id) {
        payload.order_id = parseInt(formData.order_id);
      }
      if (formData.proof_url) {
        payload.proof_url = formData.proof_url;
      }

      // Submit
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/help-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Gagal membuat laporan');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/pesanan');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="help-center-page">
      <div className="container">
        <Typography variant="h1">Pusat Bantuan</Typography>
        <Typography variant="body" className="subtitle">
          Laporkan masalah yang Anda alami dan tim kami akan segera membantu.
        </Typography>

        {success ? (
          <div className="success-message">
            <Typography variant="body">
              ✅ Laporan berhasil dikirim! Admin kami akan segera menangani masalah Anda.
            </Typography>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="help-form">
            {error && (
              <div className="error-message">
                <Typography variant="body" color="danger">{error}</Typography>
              </div>
            )}

            <FormGroup label="Order ID (Opsional)" htmlFor="order_id">
              <Input
                id="order_id"
                type="number"
                value={formData.order_id}
                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                placeholder="Masukkan ID Order jika terkait dengan pesanan tertentu"
              />
            </FormGroup>

            <FormGroup label="Kategori Masalah *" htmlFor="category">
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Pilih kategori masalah</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup label="Deskripsi Masalah *" htmlFor="description">
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan masalah yang Anda alami secara detail..."
                rows="6"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.95rem'
                }}
              />
            </FormGroup>

            <FormGroup label="Link Bukti Foto (Opsional)" htmlFor="proof_url">
              <Input
                id="proof_url"
                type="url"
                value={formData.proof_url}
                onChange={(e) => setFormData({ ...formData, proof_url: e.target.value })}
                placeholder="https://..."
              />
              <Typography variant="caption" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                Upload foto bukti ke layanan seperti Imgur atau Google Drive, lalu paste linknya di sini
              </Typography>
            </FormGroup>

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Kembali
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Mengirim...' : 'Kirim Laporan'}
              </Button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .help-center-page {
          min-height: 100vh;
          background: var(--bg-color);
          padding: 2rem 1rem;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
        }
        .subtitle {
          margin-top: 0.5rem;
          margin-bottom: 2rem;
          color: var(--text-muted);
        }
        .help-form {
          background: var(--card-bg);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .error-message {
          padding: 1rem;
          background: #fee;
          border: 1px solid var(--danger-color);
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }
        .success-message {
          padding: 2rem;
          background: #efe;
          border: 1px solid var(--success-color);
          border-radius: 8px;
          text-align: center;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}
