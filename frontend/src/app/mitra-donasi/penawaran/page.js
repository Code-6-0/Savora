'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import TopHeader from '@/components/organisms/TopHeader';
import Badge from '@/components/atoms/Badge';
import { Search, MapPin, Clock, CheckCircle2, XCircle, Package, AlertCircle, RefreshCw } from 'lucide-react';
import {
  getMitraDonationOffers,
  acceptDonationOffer,
  rejectDonationOffer,
  formatOfferStatus,
  getOfferStatusColor,
} from '@/lib/mitraDonasi';
import {
  DEMO_PENAWARAN_DONASI,
  DEMO_PENAWARAN_LIMBAH,
} from '@/lib/mitraDemoData';

export default function PenawaranMitraPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const currentUser = isAuthenticated() ? getUser() : null;
    setUser(currentUser || { name: 'Mitra Demo', role: 'MITRA_DONASI' });
    loadOffers();
  }, []);

  // Re-fetch when status filter changes (for API mode)
  useEffect(() => {
    if (!usingDemoData) {
      loadOffers();
    }
  }, [statusFilter]);

  useEffect(() => {
    let filtered = offers;

    // In demo mode, filter locally by status
    if (usingDemoData && statusFilter) {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((offer) => {
        const donorName = offer.donor?.name || '';
        const foodName = offer.food_name || '';
        const address = offer.pickup_address || '';
        return (
          donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    setFilteredOffers(filtered);
  }, [offers, statusFilter, searchQuery, usingDemoData]);

  async function loadOffers() {
    setLoading(true);
    setUsingDemoData(false);

    try {
      // API sends statusFilter to backend for server-side filtering
      const data = await getMitraDonationOffers(statusFilter);
      setOffers(data.offers || []);
    } catch (err) {
      console.warn('Failed to fetch offers from API, falling back to demo:', err.message);
      setUsingDemoData(true);
      loadDemoOffers();
    } finally {
      setLoading(false);
    }
  }

  function loadDemoOffers() {
    const allOffers = [
      ...DEMO_PENAWARAN_DONASI.map(d => ({
        id: d.id,
        donor: { name: d.donatur_nama },
        donor_type: d.donatur_badge,
        food_name: d.jenis_makanan,
        quantity: d.estimasi_porsi,
        pickup_address: d.lokasi,
        available_from: d.waktu_selesai_masak,
        available_until: d.batas_layak,
        description: `Jarak: ${d.jarak_km} km`,
        status: 'PENDING',
      })),
      ...DEMO_PENAWARAN_LIMBAH.map(d => ({
        id: d.id,
        donor: { name: d.umkm_nama },
        donor_type: 'UMKM',
        food_name: d.jenis_limbah,
        quantity: 0,
        weight: d.estimasi_berat_kg,
        pickup_address: d.lokasi,
        description: `${d.deskripsi} • Frekuensi: ${d.frekuensi} • Jarak: ${d.jarak_km} km`,
        status: 'PENDING',
      })),
    ];

    setOffers(allOffers);
  }

  async function handleAccept(id) {
    if (usingDemoData) {
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'ACCEPTED' } : o));
      return;
    }

    setActionLoading(id);
    try {
      await acceptDonationOffer(id);
      await loadOffers();
    } catch (err) {
      console.error('Failed to accept offer:', err.message);
      alert('Gagal menerima penawaran: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    const reason = prompt('Masukkan alasan penolakan:');
    if (!reason || reason.trim() === '') return;

    if (usingDemoData) {
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'REJECTED', rejection_reason: reason } : o));
      return;
    }

    setActionLoading(id);
    try {
      await rejectDonationOffer(id, reason);
      await loadOffers();
    } catch (err) {
      console.error('Failed to reject offer:', err.message);
      alert('Gagal menolak penawaran: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <>
      <TopHeader 
        title="Penawaran Masuk"
        subtitle="Kelola penawaran donasi dan limbah dari UMKM & Donatur"
      />

      <div className="content-area">
        {/* Demo Data Banner */}
        {usingDemoData && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>Menampilkan data demo — backend tidak tersedia.</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari donatur, makanan, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setStatusFilter('')}
                className={statusFilter === '' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.875rem', padding: '8px 16px' }}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={statusFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.875rem', padding: '8px 16px' }}
              >
                Menunggu
              </button>
              <button
                onClick={() => setStatusFilter('ACCEPTED')}
                className={statusFilter === 'ACCEPTED' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.875rem', padding: '8px 16px' }}
              >
                Diterima
              </button>
              <button
                onClick={() => setStatusFilter('REJECTED')}
                className={statusFilter === 'REJECTED' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.875rem', padding: '8px 16px' }}
              >
                Ditolak
              </button>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            Memuat penawaran...
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Package size={48} className="mx-auto mb-3 opacity-40" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
                Tidak Ada Penawaran
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {searchQuery ? 'Tidak ada penawaran yang sesuai dengan pencarian Anda.' : 'Belum ada penawaran masuk saat ini.'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {filteredOffers.map((offer) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                onAccept={handleAccept} 
                onReject={handleReject}
                isLoading={actionLoading === offer.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function OfferCard({ offer, onAccept, onReject, isLoading }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const donorName = offer.donor?.name || offer.donor_type || 'Donatur';
  const isPending = offer.status === 'PENDING';

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
              <strong style={{ fontSize: '1rem', color: '#111827' }}>{donorName}</strong>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${offer.donor_type === 'UMKM' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {offer.donor_type === 'UMKM' ? '🏪 UMKM' : '👤 Customer'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> {offer.pickup_address || 'Lokasi tidak tersedia'}
            </p>
          </div>
          <Badge variant={getOfferStatusColor(offer.status)}>
            {formatOfferStatus(offer.status)}
          </Badge>
        </div>

        <div style={{ display: 'grid', gap: '6px', marginBottom: '16px', fontSize: '0.85rem', color: '#374151' }}>
          <p><strong>Jenis:</strong> {offer.food_name || offer.category}</p>
          <p><strong>Jumlah:</strong> {offer.quantity ? `${offer.quantity} porsi` : ''} {offer.weight ? `(~${offer.weight} kg)` : ''}</p>
          {offer.description && (
            <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>{offer.description}</p>
          )}
          {offer.available_from && (
            <p style={{ color: '#4B5563', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> Tersedia: {formatDate(offer.available_from)} - {formatDate(offer.available_until)}
            </p>
          )}
          {offer.rejection_reason && (
            <p style={{ color: 'var(--danger-color)', fontSize: '0.8rem' }}><strong>Alasan Ditolak:</strong> {offer.rejection_reason}</p>
          )}
        </div>
      </div>

      {isPending && (
        <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
          <button
            onClick={() => onAccept(offer.id)}
            disabled={isLoading}
            className="btn-primary"
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: isLoading ? 0.5 : 1 }}
          >
            <CheckCircle2 size={16} /> {isLoading ? 'Memproses...' : 'Terima'}
          </button>
          <button
            onClick={() => onReject(offer.id)}
            disabled={isLoading}
            className="btn-danger"
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: isLoading ? 0.5 : 1 }}
          >
            <XCircle size={16} /> Tolak
          </button>
        </div>
      )}
    </div>
  );
}
