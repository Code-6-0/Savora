"use client";

<<<<<<< HEAD
// Halaman Insight kini digabung ke /analitik (menu "Analitik & Insight").
// Rute lama /insight tetap dipertahankan agar tautan lama tidak rusak:
// user diarahkan otomatis ke /analitik dengan section Insight aktif.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InsightRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/analitik?section=insight");
  }, [router]);

  return (
    <div style={{ padding: "40px", color: "#6B7280" }}>
      Mengalihkan ke Analitik &amp; Insight...
    </div>
=======
import { useState } from "react";
import { TrendingUp, Package, Clock, DollarSign, Calendar, TrendingDown, Leaf, AlertTriangle, Lightbulb, Zap, Users } from "lucide-react";
import TopHeader from "@/components/organisms/TopHeader";
import RecommendationCard from "@/components/molecules/RecommendationCard";
import ProgressTargetBar from "@/components/molecules/ProgressTargetBar";
import Badge from "@/components/atoms/Badge";

export default function InsightPage() {
  const [activeTab, setActiveTab] = useState("Produksi");

  const renderTabContent = () => {
    switch(activeTab) {
      case "Produksi":
        return (
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>AI Prediksi Permintaan</h3>
              <RecommendationCard type="success" icon={<TrendingUp size={20} />} title="Permintaan Akhir Pekan Naik" description="Prediksi kenaikan permintaan 35% di hari Sabtu. Tingkatkan produksi menu utama (Nasi Kotak)." actionText="Lihat Detail Histori" />
              <RecommendationCard type="info" icon={<Zap size={20} />} title="Produk Terlaris Bulan Ini" description="Mystery Box Harian konsisten habis terjual sebelum pukul 15.00. Pertimbangkan menambah kuota dari sisa bahan harian." />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Mitigasi Overproduction</h3>
              <RecommendationCard type="warning" icon={<TrendingDown size={20} />} title="Kurangi Produksi Roti Gandum" description="Terdapat sisa >10 porsi Roti Gandum dalam 3 hari terakhir. Kurangi batch produksi harian sebesar 15%." actionText="Terapkan Saran Produksi" />
              <RecommendationCard type="critical" icon={<AlertTriangle size={20} />} title="Peringatan Kue Basah" description="Kue basah memiliki persentase pembuangan tertinggi (8%). Evaluasi ulang estimasi produksi pagi." />
            </div>
          </div>
        );
      
      case "Harga":
        return (
          <div className="grid-2">
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Rekomendasi Dynamic Pricing</h3>
                <Badge type="success">AI Aktif</Badge>
              </div>
              <div className="grid-3">
                <RecommendationCard type="info" icon={<DollarSign size={20} />} title="Diskon 50% untuk Salad Bowl" description="Sisa 4 jam kelayakan. Turunkan harga menjadi Rp 14.000 untuk memicu impulse buying." actionText="Terapkan Diskon" />
                <RecommendationCard type="success" icon={<TrendingUp size={20} />} title="Harga Normal Mystery Box" description="Permintaan sangat tinggi. Pertahankan harga Rp 25.000 tanpa perlu tambahan diskon ekstra." />
                <RecommendationCard type="warning" icon={<DollarSign size={20} />} title="Flash Sale Sore Hari" description="Banyak user aktif jam 16.00-18.00. Aktifkan diskon 30% pada jam tersebut khusus untuk Roti." actionText="Jadwalkan Flash Sale" />
              </div>
            </div>
          </div>
        );

      case "Produk":
        return (
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Peringatan Food Waste</h3>
              <RecommendationCard type="critical" icon={<AlertTriangle size={20} />} title="Sandwich Tuna Segera Basi" description="Rescue Score sisa 14%. Sisa 1 jam kelayakan konsumsi. Sangat disarankan untuk segera didonasikan atau turun harga 80%." actionText="Ambil Tindakan Cepat" />
              <RecommendationCard type="warning" icon={<Clock size={20} />} title="Periksa Suhu Penyimpanan Kue" description="Kue Tart lebih cepat basi minggu ini. Pastikan showcase berada di bawah 4°C." />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Rekomendasi Kategori</h3>
              <RecommendationCard type="success" icon={<Package size={20} />} title="Performa Terbaik: Nasi & Lauk" description="Kategori ini mendominasi 65% penyelamatan food waste. Pertahankan kualitas." />
              <RecommendationCard type="info" icon={<Lightbulb size={20} />} title="Eksperimen Kategori Baru" description="Peminat Makanan Sehat (Vegan) meningkat. Anda mungkin bisa menambah produk salad." />
            </div>
          </div>
        );

      case "Customer":
        return (
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Perilaku Customer (Insight)</h3>
              <RecommendationCard type="info" icon={<Clock size={20} />} title="Jam Pembelian Terbaik: 18.00 - 19.00" description="Sebagian besar pembelian food rescue terjadi pada jam pulang kerja. Pasang notifikasi promo di jam 17.30." />
              <RecommendationCard type="info" icon={<Calendar size={20} />} title="Hari Terbaik: Jumat & Sabtu" description="Pesanan melonjak di akhir pekan. Siapkan stok rescue box ekstra di hari Jumat pagi." />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Loyalitas</h3>
              <RecommendationCard type="success" icon={<Users size={20} />} title="Sapa Repeat Customer Anda" description="65% pembeli adalah pelanggan tetap. Tawarkan 'Loyalty Badge' agar mereka makin rajin berbelanja." actionText="Buat Program Loyalitas" />
              <RecommendationCard type="warning" icon={<Users size={20} />} title="Kategori Favorit: Dessert" description="Customer wanita usia 20-30 paling sering membeli Dessert. Buat bundling Menu Utama + Dessert." actionText="Buat Paket Bundling" />
            </div>
          </div>
        );

      case "Operasional":
        return (
          <div className="grid-2">
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Rekomendasi Operasional & Logistik</h3>
                <Badge type="warning">2 Peringatan</Badge>
              </div>
              <div className="grid-2">
                <RecommendationCard type="critical" icon={<AlertTriangle size={20} />} title="Peringatan Produk Hampir Kedaluwarsa" description="Sistem mendeteksi 4 produk yang masa simpannya sisa < 3 jam. Segera pindahkan ke etalase khusus diskon." actionText="Lihat Daftar Produk" />
                <RecommendationCard type="info" icon={<Package size={20} />} title="Rekomendasi Restock Kemasan" description="Stok kantong belanja ramah lingkungan sisa sedikit. Lakukan restock sebelum akhir minggu." />
                <RecommendationCard type="success" icon={<Leaf size={20} />} title="Rekomendasi Pengelolaan Food Waste" description="Sampah organik minggu ini bisa dialihkan ke mitra pengomposan Savora. Jadwalkan penjemputan sampah." actionText="Jadwalkan Penjemputan" />
              </div>
            </div>
          </div>
        );

      case "Sustainability":
        return (
          <div className="grid-sidebar-left">
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Target Bulanan</h3>
              <ProgressTargetBar title="Target Pengurangan Food Waste" current="73%" target="85%" percentage={85} color="#F59E0B" statusText="On Progress" />
              <ProgressTargetBar title="Savora Rescue Score" current="92" target="95" percentage={96} color="#10B981" statusText="Hampir Tercapai" />
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#F9FAFB', borderRadius: '8px', fontSize: '0.875rem' }}>
                Ayo tingkatkan donasi produk H-1 basi untuk langsung mendapatkan lonjakan poin *Rescue Score*!
              </div>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Rekomendasi Keberlanjutan (Eco-Insight)</h3>
              <RecommendationCard type="success" icon={<Leaf size={20} />} title="Strategi Mengurangi Food Waste 15%" description="Gunakan sistem First In First Out (FIFO) dengan ketat di kulkas penyimpanan Anda." />
              <RecommendationCard type="info" icon={<Zap size={20} />} title="Meningkatkan Food Rescue Score" description="Donasikan 10 porsi makanan berlebih (kurang layak jual tapi masih aman) ke Savora Shelter hari ini." actionText="Mulai Donasi" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <TopHeader title="AI Business Insight" subtitle="Rekomendasi cerdas dari AI berdasarkan pola transaksi dan analisis data Anda.">
        <div style={{ display: 'flex', gap: '10px' }}>
          <Badge type="info" customStyle={{ padding: '8px 12px', fontSize: '0.875rem' }}><Lightbulb size={16} style={{marginRight: '5px'}}/> Diperbarui: 5 menit lalu</Badge>
        </div>
      </TopHeader>

      <div className="content-area">
        {/* Navigation Tabs */}
        <div style={{ overflowX: 'auto', marginBottom: '25px', paddingBottom: '5px' }}>
          <div style={{ 
            display: 'inline-flex', 
            backgroundColor: '#FFFFFF', 
            border: '1px solid #E5E7EB', 
            borderRadius: '9999px', 
            padding: '4px',
            gap: '4px'
          }}>
            {["Produksi", "Harga", "Produk", "Customer", "Operasional", "Sustainability"].map(tab => (
              <div 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '8px 25px', 
                  cursor: 'pointer',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === tab ? 600 : 500,
                  backgroundColor: activeTab === tab ? '#ECFDF5' : 'transparent',
                  color: activeTab === tab ? '#10B981' : '#6B7280',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Content */}
        {renderTabContent()}

      </div>
    </>
>>>>>>> feat/customer-pages
  );
}
