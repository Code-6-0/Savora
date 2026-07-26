'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import TopHeader from '@/components/organisms/TopHeader';
import SummaryCard from '@/components/molecules/SummaryCard';
import Badge from '@/components/atoms/Badge';
import { 
  getMitraDashboardStats, 
  getMitraProfile,
  acceptDonationOffer,
  rejectDonationOffer
} from '@/lib/mitraDonasi';
import { 
  Inbox, 
  Truck, 
  Utensils, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  RefreshCw,
  HeartHandshake,
  Recycle,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import {
  KETENTUAN_DONASI,
  KETENTUAN_PENGOLAH,
} from '@/lib/mitraDemoData';

export default function MitraDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mitraProfile, setMitraProfile] = useState(null);

  // State untuk data dashboard
  const [dashboardStats, setDashboardStats] = useState(null);
  const [latestOffers, setLatestOffers] = useState([]);
  const [scheduledPickups, setScheduledPickups] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Track which offer is being acted upon

  // Kategori mitra
  const kategoriMitra = mitraProfile?.category?.toLowerCase() || 'donasi';
  const isDonasi = kategoriMitra === 'donasi' || kategoriMitra === 'mitra_donasi';

  useEffect(() => {
    // Auth guard - redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const currentUser = getUser();
    
    // Role guard - only MITRA_DONASI can access
    if (currentUser?.role?.toUpperCase() !== 'MITRA_DONASI') {
      router.push('/login');
      return;
    }

    // Set user state after guards pass (async to avoid cascading)
    Promise.resolve().then(() => {
      setUser(currentUser);
    });
    
    // Fetch mitra profile from API
    loadMitraProfile();
    loadDashboardData();
  }, [router]);

  async function loadMitraProfile() {
    try {
      const data = await getMitraProfile();
      if (data?.mitra_profile) {
        setMitraProfile(data.mitra_profile);
      } else {
        // No mitra profile found - should not happen if properly registered
        console.error('Mitra profile not found');
        setMitraProfile(null);
      }
    } catch (err) {
      console.error('Failed to fetch mitra profile:', err.message);
      setMitraProfile(null);
    }
  }

  async function loadDashboardData() {
    setLoadingData(true);
    
    try {
      const data = await getMitraDashboardStats();
      
      // Map API response to state
      setDashboardStats(data.stats);
      setLatestOffers(data.latest_offers || []);
      setScheduledPickups(data.scheduled_pickups || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err.message);
      // Set empty data on error
      setDashboardStats({
        pending_offers: 0,
        scheduled_pickups: 0,
        total_portions: 0,
        unique_donors: 0,
      });
      setLatestOffers([]);
      setScheduledPickups([]);
    } finally {
      setLoadingData(false);
    }
  }

  async function handleTerima(id) {
    setActionLoading(id);
    try {
      await acceptDonationOffer(id);
      // Reload dashboard data from API
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to accept offer:', err.message);
      alert('Gagal menerima penawaran: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTolak(id) {
    const reason = prompt('Masukkan alasan penolakan:');
    if (!reason || reason.trim() === '') return;

    setActionLoading(id);
    try {
      await rejectDonationOffer(id, reason);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to reject offer:', err.message);
      alert('Gagal menolak penawaran: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  const ketentuan = isDonasi ? KETENTUAN_DONASI : KETENTUAN_PENGOLAH;

  return (
    <>
      <TopHeader 
        title={`Dashboard Mitra ${isDonasi ? 'Donasi' : 'Pengolah'}`}
        subtitle={mitraProfile?.org_name || user?.name || 'Mitra Savora'}
      />

      <div className="content-area">
        {/* Banner Profil & Verifikasi */}
        <div className="card mb-6 p-6 bg-gradient-to-r from-emerald-900/5 via-teal-900/5 to-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 flex-shrink-0">
                {isDonasi ? <HeartHandshake size={24} /> : <Recycle size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900">
                    {mitraProfile?.org_name || user?.name || 'Mitra Savora'}
                  </h2>
                  {mitraProfile?.verification_status?.toUpperCase() === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={14} /> Approved Partner
                    </span>
                  )}
                  {mitraProfile?.verification_status?.toUpperCase() === 'PENDING' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock size={14} /> Menunggu Verifikasi
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isDonasi ? 'Penyalur Makanan Surplus & Donasi Lingkungan' : 'Mitra Pengolahan & Pengelolaan Limbah Organik'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Platinum Rescuer
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid-4 mb-6">
          {isDonasi ? (
            <>
              <SummaryCard 
                title="Penawaran Baru" 
                value={dashboardStats?.pending_offers?.toString() || '0'} 
                icon={<Inbox size={22} className="text-emerald-600" />}
                trend={`${dashboardStats?.pending_offers || 0} tersedia`}
                trendUp={true}
              />
              <SummaryCard 
                title="Penjemputan Dijadwalkan" 
                value={dashboardStats?.scheduled_pickups?.toString() || '0'} 
                icon={<Truck size={22} className="text-blue-600" />}
                trend="Siap dijemput"
                trendUp={true}
              />
              <SummaryCard 
                title="Porsi Tersalurkan (Total)" 
                value={dashboardStats?.total_portions?.toString() || '0'} 
                icon={<Utensils size={22} className="text-amber-600" />}
                trend="Total semua"
                trendUp={true}
              />
              <SummaryCard 
                title="Donatur Unik" 
                value={dashboardStats?.unique_donors?.toString() || '0'} 
                icon={<Users size={22} className="text-indigo-600" />}
                trend="Terverifikasi"
                trendUp={true}
              />
            </>
          ) : (
            <>
              <SummaryCard 
                title="Penawaran Limbah Baru" 
                value={dashboardStats?.pending_offers?.toString() || '0'} 
                icon={<Inbox size={22} className="text-emerald-600" />}
              />
              <SummaryCard 
                title="Pengangkutan Dijadwalkan" 
                value={dashboardStats?.scheduled_pickups?.toString() || '0'} 
                icon={<Truck size={22} className="text-blue-600" />}
              />
              <SummaryCard 
                title="Total Diolah (kg)" 
                value={dashboardStats?.total_portions?.toString() || '0'} 
                icon={<Utensils size={22} className="text-amber-600" />}
              />
              <SummaryCard 
                title="Partner UMKM" 
                value={dashboardStats?.unique_donors?.toString() || '0'} 
                icon={<Users size={22} className="text-indigo-600" />}
              />
            </>
          )}
        </div>

        {/* Main Section Layout */}
        <div className="grid-sidebar-right mb-6">
          {/* Column Left: Penawaran Donasi Masuk */}
          <div className="card">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Inbox size={18} className="text-emerald-600" />
                  {isDonasi ? 'Penawaran Donasi Masuk' : 'Penawaran Limbah Masuk'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tinjau dan konfirmasi penawaran makanan surplus dari donatur
                </p>
              </div>
              <button 
                onClick={loadDashboardData} 
                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                title="Refresh data"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingData ? (
              <p className="text-sm text-slate-400 text-center py-8">
                Memuat penawaran...
              </p>
            ) : latestOffers.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Inbox size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-slate-600">Tidak ada penawaran baru</p>
                <p className="text-xs text-slate-400 mt-1">Penawaran dari donatur atau UMKM akan tampil di sini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {latestOffers.map((item) => (
                  <PenawaranCard 
                    key={item.id} 
                    item={item} 
                    onTerima={handleTerima} 
                    onTolak={handleTolak}
                    isLoading={actionLoading === item.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Column Right: Jadwal & Ketentuan */}
          <div className="space-y-6">
            {/* Jadwal Penjemputan */}
            <div className="card">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Clock size={16} className="text-blue-600" />
                {isDonasi ? 'Jadwal Penjemputan' : 'Jadwal Pengangkutan'}
              </h3>
              {scheduledPickups.length === 0 ? (
                <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Clock size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Belum ada penjemputan aktif</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Klik &quot;Terima&quot; pada kartu penawaran untuk menambahkan jadwal.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledPickups.map((item) => (
                    <JadwalCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Panel Ketentuan */}
            <div className="card bg-slate-50/50 border border-slate-200/80">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <FileCheck2 size={16} className="text-emerald-600" />
                {ketentuan.judul}
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {ketentuan.poin.map((poin, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{poin}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Dampak Lingkungan Progress */}
        <div className="card bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 rounded-2xl shadow-xl shadow-emerald-900/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-1">
                <Award size={16} /> Dampak Komunitas
              </div>
              <h3 className="text-lg font-bold">Progress Penyelamatan Makanan Bulan Ini</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Bersama Savora, Anda telah membantu menyelamatkan {dashboardStats?.total_portions || 0} porsi makanan dari pemborosan dan mengurangi jejak emisi karbon.
              </p>
            </div>
            
            <div className="w-full md:w-64 flex flex-col gap-2">
              {(() => {
                const portions = dashboardStats?.total_portions || 0;
                const target = Math.max(portions, 300); // dynamic target
                const pct = target > 0 ? Math.min(100, Math.round((portions / target) * 100)) : 0;
                return (
                  <>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-300">{portions} / {target} Porsi</span>
                      <span className="text-white">{pct}% Target</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Komponen PenawaranCard
function PenawaranCard({ item, onTerima, onTolak, isLoading }) {
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

  const donorName = item.donor?.name || item.donor_type || 'Donatur';
  const isUMKM = item.donor_type === 'UMKM';

  return (
    <div className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-300 transition-all duration-200 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-sm text-slate-900">{donorName}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isUMKM 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isUMKM ? '🏪 UMKM' : '👤 Customer'}
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin size={13} className="text-slate-400" />
            {item.pickup_address || 'Lokasi tidak tersedia'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 mb-4 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Jenis Pangan</span>
          <span className="font-semibold text-slate-800">{item.food_name || item.category}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Jumlah Estimasi</span>
          <span className="font-semibold text-slate-800">
            {item.quantity ? `${item.quantity} porsi` : ''} {item.weight ? `(~${item.weight} kg)` : ''}
          </span>
        </div>
        {item.available_from && (
          <div className="col-span-1 sm:col-span-2 text-slate-500 flex items-center gap-1 text-[11px] mt-1 pt-1 border-t border-slate-200/60">
            <Clock size={12} className="text-slate-400" />
            <span>Tersedia: {formatDate(item.available_from)} - {formatDate(item.available_until)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onTerima(item.id)}
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <CheckCircle2 size={15} /> {isLoading ? 'Memproses...' : 'Terima Penawaran'}
        </button>
        <button
          onClick={() => onTolak(item.id)}
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 py-2 px-3 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <XCircle size={15} /> Tolak
        </button>
      </div>
    </div>
  );
}

// Komponen JadwalCard
function JadwalCard({ item }) {
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

  const donorName = item.donor?.name || item.donor_type || 'Donatur';

  return (
    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="font-bold text-slate-900 block">{donorName}</span>
          <span className="text-slate-600 text-[11px] mt-0.5 block">
            {item.food_name || item.category} • {item.quantity} porsi
          </span>
          <span className="text-emerald-700 text-[10px] font-medium mt-1 flex items-center gap-1">
            <Clock size={11} /> {formatDate(item.available_from)}
          </span>
        </div>
        <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
          Dijadwalkan
        </span>
      </div>
    </div>
  );
}
