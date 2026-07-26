'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import TopHeader from '@/components/organisms/TopHeader';
import { FileText, Download, Calendar, MapPin, Search, Filter, AlertCircle } from 'lucide-react';
import { getMitraDonationHistory } from '@/lib/mitraDonasi';

const DEMO_HISTORY = [
  {
    id: 1,
    pickup_date: '2026-07-20T10:30:00Z',
    donor: { name: 'Warung Bu Lestari' },
    offer: { food_name: 'Nasi Kotak + Snack Box', pickup_address: 'Jl. Mangga Dua No. 45, Jakarta Utara' },
    portions_saved: 50,
    weight_kg: 25.0,
  },
  {
    id: 2,
    pickup_date: '2026-07-18T14:00:00Z',
    donor: { name: 'Katering Rasa Nusantara' },
    offer: { food_name: 'Nasi Kuning + Lauk Pauk', pickup_address: 'Jl. Gajah Mada No. 12, Jakarta Barat' },
    portions_saved: 35,
    weight_kg: 17.5,
  },
  {
    id: 3,
    pickup_date: '2026-07-15T09:00:00Z',
    donor: { name: 'Acara Pernikahan Siti & Budi' },
    offer: { food_name: 'Prasmanan (Nasi Liwet, Ayam, Sayur)', pickup_address: 'Jl. Thamrin No. 88, Jakarta Pusat' },
    portions_saved: 80,
    weight_kg: 40.0,
  },
  {
    id: 4,
    pickup_date: '2026-07-12T11:15:00Z',
    donor: { name: 'Restoran Padang Sederhana' },
    offer: { food_name: 'Rendang + Nasi Bungkus', pickup_address: 'Jl. Kebon Jeruk No. 23, Jakarta Barat' },
    portions_saved: 45,
    weight_kg: 22.5,
  },
  {
    id: 5,
    pickup_date: '2026-07-10T16:00:00Z',
    donor: { name: 'Cafe Kopi & Snack' },
    offer: { food_name: 'Sandwich + Pastry', pickup_address: 'Jl. Blora No. 9, Jakarta Pusat' },
    portions_saved: 20,
    weight_kg: 10.0,
  },
];

export default function RiwayatMitraPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, total_portions: 0, total_weight: 0 });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    const currentUser = isAuthenticated() ? getUser() : null;
    setUser(currentUser || { name: 'Mitra Demo', role: 'MITRA_DONASI' });
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    setUsingDemoData(false);

    try {
      const data = await getMitraDonationHistory(dateFrom, dateTo);
      
      setHistory(data.history || []);
      setStats({
        total: data.total || (data.history || []).length,
        total_portions: data.total_portions || 0,
        total_weight: data.total_weight || 0,
      });
    } catch (err) {
      console.warn('Failed to fetch history from API, falling back to demo:', err.message);
      setUsingDemoData(true);
      loadDemoHistory();
    } finally {
      setLoading(false);
    }
  }

  function loadDemoHistory() {
    let filtered = [...DEMO_HISTORY];

    if (dateFrom) {
      filtered = filtered.filter(h => new Date(h.pickup_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(h => new Date(h.pickup_date) <= new Date(dateTo + 'T23:59:59'));
    }

    setHistory(filtered);
    setStats({
      total: filtered.length,
      total_portions: filtered.reduce((sum, h) => sum + (h.portions_saved || 0), 0),
      total_weight: filtered.reduce((sum, h) => sum + (h.weight_kg || 0), 0),
    });
  }

  function handleFilter() {
    loadHistory();
  }

  function handleExportCSV() {
    if (history.length === 0) return;

    const headers = ['Tanggal Penjemputan', 'Donatur', 'Jenis', 'Porsi', 'Berat (kg)', 'Lokasi'];
    const rows = history.map((item) => [
      new Date(item.pickup_date).toLocaleDateString('id-ID'),
      item.donor?.name || '-',
      item.offer?.food_name || '-',
      item.portions_saved || 0,
      item.weight_kg || 0,
      item.offer?.pickup_address || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `riwayat-mitra-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  return (
    <>
      <TopHeader 
        title="Riwayat Penjemputan"
        subtitle="Lihat histori penjemputan donasi & limbah yang telah selesai"
      />

      <div className="content-area">
        {/* Demo Data Banner */}
        {usingDemoData && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>Menampilkan data demo — backend tidak tersedia.</span>
          </div>
        )}

        {/* Summary Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '4px' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Penjemputan</div>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--success-color)', marginBottom: '4px' }}>
              {stats.total_portions}
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Porsi Diselamatkan</div>
          </div>
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--warning-color)', marginBottom: '4px' }}>
              {stats.total_weight.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kg</span>
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Berat Terolah</div>
          </div>
        </div>

        {/* Filter & Export Bar */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                Dari Tanggal
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <button
              onClick={handleFilter}
              className="btn-primary"
              style={{ fontSize: '0.875rem', padding: '9px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Filter size={16} /> Filter
            </button>
            <button 
              onClick={handleExportCSV}
              className="btn-secondary"
              style={{ fontSize: '0.875rem', padding: '9px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              disabled={history.length === 0}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Daftar Riwayat Penjemputan</h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              Memuat riwayat...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FileText size={48} className="mx-auto mb-3 opacity-40" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>
                Belum Ada Riwayat
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Riwayat penjemputan akan muncul setelah Anda menyelesaikan penjemputan donasi.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Tanggal</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Donatur / UMKM</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Jenis Pangan</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Porsi</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Berat (kg)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Lokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        {new Date(item.pickup_date).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>{item.donor?.name || '-'}</td>
                      <td style={{ padding: '14px 16px' }}>{item.offer?.food_name || '-'}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#10B981' }}>{item.portions_saved || 0}</td>
                      <td style={{ padding: '14px 16px' }}>{item.weight_kg ? item.weight_kg.toFixed(1) : '-'}</td>
                      <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: '0.8rem' }}>
                        {item.offer?.pickup_address || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
