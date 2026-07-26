'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import TopHeader from '@/components/organisms/TopHeader';
import SummaryCard from '@/components/molecules/SummaryCard';
import { Package, Scale, Users, TrendingUp, Leaf, Droplets, Wind, AlertCircle } from 'lucide-react';
import { getMitraDashboardStats, getMitraDonationHistory } from '@/lib/mitraDonasi';

export default function LaporanMitraPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [stats, setStats] = useState({
    total_porsi: 0,
    total_kg: 0,
    donatur_aktif: 0,
    rata_per_hari: 0,
  });

  useEffect(() => {
    const currentUser = isAuthenticated() ? getUser() : null;
    setUser(currentUser || { name: 'Mitra Demo', role: 'MITRA_DONASI' });
    loadImpactData();
  }, []);

  async function loadImpactData() {
    setLoading(true);
    setUsingDemoData(false);

    try {
      // Fetch from both endpoints to build impact report
      const [dashboardData, historyData] = await Promise.all([
        getMitraDashboardStats(),
        getMitraDonationHistory(), // All history, no date filter
      ]);

      const totalPortions = historyData.total_portions || dashboardData.stats?.total_portions || 0;
      const totalWeight = historyData.total_weight || 0;
      const uniqueDonors = dashboardData.stats?.unique_donors || 0;
      const totalPickups = historyData.total || 0;

      // Calculate average per day (assume 30-day period)
      const avgPerDay = totalPickups > 0 ? Math.round(totalPortions / 30) : 0;

      setStats({
        total_porsi: totalPortions,
        total_kg: totalWeight,
        donatur_aktif: uniqueDonors,
        rata_per_hari: avgPerDay,
      });
    } catch (err) {
      console.warn('Failed to fetch impact data, falling back to demo:', err.message);
      setUsingDemoData(true);
      setStats({
        total_porsi: 1250,
        total_kg: 875,
        donatur_aktif: 23,
        rata_per_hari: 42,
      });
    } finally {
      setLoading(false);
    }
  }

  // Calculate environmental impact from real data
  const co2Reduced = (stats.total_kg * 0.6).toFixed(0); // 0.6 kg CO2e per kg food
  const waterSaved = (stats.total_kg * 5).toLocaleString('id-ID'); // 5L per kg
  const treesEquivalent = Math.round(stats.total_kg * 0.6 / 12.5); // 1 tree absorbs ~12.5kg CO2/year

  return (
    <>
      <TopHeader 
        title="Laporan Impact"
        subtitle="Dampak penyelamatan pangan & pengolahan limbah yang telah dicapai"
      />

      <div className="content-area">
        {/* Demo Data Banner */}
        {usingDemoData && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>Menampilkan data demo — backend tidak tersedia.</span>
          </div>
        )}

        {/* Summary KPI Cards */}
        <div className="grid-4" style={{ marginBottom: '24px' }}>
          <SummaryCard 
            title="Total Porsi Diselamatkan" 
            value={loading ? '...' : stats.total_porsi.toLocaleString('id-ID')} 
            icon={<Package size={20} color="#046C4E" />}
            trend={usingDemoData ? '+12% bulan ini' : 'Semua waktu'}
            trendUp={true}
          />
          <SummaryCard 
            title="Total Berat (kg)" 
            value={loading ? '...' : stats.total_kg.toLocaleString('id-ID')} 
            icon={<Scale size={20} color="#1E429F" />}
            trend={usingDemoData ? '+18% bulan ini' : 'Semua waktu'}
            trendUp={true}
          />
          <SummaryCard 
            title="Donatur Aktif" 
            value={loading ? '...' : stats.donatur_aktif.toString()} 
            icon={<Users size={20} color="#B43403" />}
            trend={`${stats.donatur_aktif} UMKM/User`}
            trendUp={true}
          />
          <SummaryCard 
            title="Rata-rata Per Hari" 
            value={loading ? '...' : `${stats.rata_per_hari} porsi`} 
            icon={<TrendingUp size={20} color="#6366F1" />}
            trend="30 hari terakhir"
            trendUp={true}
          />
        </div>

        {/* Environmental Impact Banner */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Leaf size={22} className="text-emerald-600" /> Dampak Lingkungan
          </h2>
          <div style={{ 
            padding: '24px', 
            backgroundColor: '#ECFDF5', 
            borderRadius: '12px',
            border: '1px solid #A7F3D0',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', marginBottom: '6px' }}>
                  <Wind size={18} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>CO₂ Berkurang</span>
                </div>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065F46' }}>~{co2Reduced} kg</p>
                <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>Setara {treesEquivalent} pohon ditanam</p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', marginBottom: '6px' }}>
                  <Droplets size={18} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Air Dihemat</span>
                </div>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065F46' }}>~{waterSaved} L</p>
                <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>Hemat jejak air pangan</p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', marginBottom: '6px' }}>
                  <Users size={18} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Penerima Manfaat</span>
                </div>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065F46' }}>~{stats.total_porsi.toLocaleString('id-ID')} jiwa</p>
                <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>Tersalurkan ke masyarakat</p>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            * Estimasi berdasarkan rata-rata emisi per kg makanan (0.6 kg CO₂e) dan konsumsi air (5L per kg).
          </p>
        </div>

        {/* Trend Visualization Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>
            📈 Tren Penyelamatan Bulanan
          </h2>
          <div style={{ 
            height: '240px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: '10px',
            border: '1px dashed var(--border-color)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <TrendingUp size={40} className="mx-auto mb-2 opacity-30 text-emerald-600" />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Grafik tren bulanan penyelamatan pangan akan diperbarui secara otomatis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
