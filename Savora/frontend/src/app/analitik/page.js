"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, YAxis, PieChart, Pie, Legend } from "recharts";
import {
  TrendingUp, Package, DollarSign, Calendar, Download, Leaf, Users, Star, ArrowUpRight,
  Clock, TrendingDown, AlertTriangle, Lightbulb, Zap,
} from "lucide-react";
import TopHeader from "@/components/organisms/TopHeader";
import SummaryCard from "@/components/molecules/SummaryCard";
import ProgressTargetBar from "@/components/molecules/ProgressTargetBar";
import RecommendationCard from "@/components/molecules/RecommendationCard";
import Badge from "@/components/atoms/Badge";
import { fetchTopProducts } from "@/lib/analytics";

const UMKM_ID = 1;

// Sub-tab masing-masing section.
const ANALITIK_TABS = ["Penjualan", "Produk", "Food Waste", "Customer", "Sustainability", "Visualisasi"];
const INSIGHT_TABS = ["Produksi", "Harga", "Produk", "Customer", "Operasional", "Sustainability"];

export default function AnalitikPage() {
  // View level: gabungan Analitik + Insight jadi satu menu.
  const [view, setView] = useState("Analitik");
  const [activeTab, setActiveTab] = useState("Penjualan");
  const [insightTab, setInsightTab] = useState("Produksi");
  const [dateFilter, setDateFilter] = useState("Juni 2025");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    let active = true;
    fetchTopProducts(UMKM_ID, 5).then((data) => {
      if (active) setTopProducts(data);
    });
    return () => {
      active = false;
    };
  }, []);

  // Hormati ?section=insight (mis. dari redirect rute lama /insight).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = new URLSearchParams(window.location.search).get("section");
    if (section && section.toLowerCase() === "insight") setView("Insight");
  }, []);

  const mockChartData = [
    { name: '1/6', value: 850 }, { name: '7/6', value: 1200 }, { name: '13/6', value: 1800 },
    { name: '19/6', value: 1500 }, { name: '25/6', value: 2400 }, { name: '30/6', value: 2900 }
  ];

  const wasteData = [
    { name: 'Mg 1', terjual: 300, donasi: 50, waste: 120 }, { name: 'Mg 2', terjual: 400, donasi: 60, waste: 100 },
    { name: 'Mg 3', terjual: 500, donasi: 70, waste: 90 }, { name: 'Mg 4', terjual: 550, donasi: 80, waste: 80 },
    { name: 'Mg 5', terjual: 600, donasi: 90, waste: 70 }, { name: 'Mg 6', terjual: 650, donasi: 100, waste: 60 },
  ];

  const customerData = [
    { name: 'Repeat Customer', value: 65 },
    { name: 'Customer Baru', value: 35 },
  ];

  const COLORS = ['#10B981', '#FCD34D'];

  const renderAnalitikContent = () => {
    switch(activeTab) {
      case "Penjualan":
        return (
          <div className="grid-3">
            <SummaryCard title="Total Penjualan" value="Rp 48.200.000" icon={<DollarSign size={20} color="#10B981" />} trend="+12.4%" trendLabel="vs bulan lalu" trendUp={true} chartData={mockChartData} />
            <SummaryCard title="Total Pendapatan" value="Rp 12.850.000" icon={<TrendingUp size={20} color="#10B981" />} trend="+8.2%" trendLabel="vs bulan lalu" trendUp={true} chartData={mockChartData} />
            <SummaryCard title="Jumlah Pesanan" value="1.248" icon={<Package size={20} color="#10B981" />} trend="+15.1%" trendLabel="vs bulan lalu" trendUp={true} chartData={mockChartData} />
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '10px' }}>Rata-rata Nilai Transaksi</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '5px' }}>Rp 38.621</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#10B981' }}><ArrowUpRight size={14} /> +2.5% vs bulan lalu</div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '10px' }}>Pertumbuhan Penjualan</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '5px' }}>12.4%</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#10B981' }}>Di atas target (10%)</div>
            </div>
          </div>
        );

      case "Produk":
        return (
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '15px' }}>Produk Terlaris</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {topProducts.map((product, index) => (
                  <div key={product.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{product.units_sold} terjual</div>
                    </div>
                    <Badge type="success">Peringkat {index + 1}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '15px' }}>Produk Kurang Laku</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontWeight: 600 }}>Kue Tart Spesial</div><div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Hanya 2 terjual bulan ini</div></div>
                  <Badge type="critical">Perlu Tindakan</Badge>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '10px' }}>Produk Aktif</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>24 Produk</div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '5px' }}>Semua ready stock</div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '10px' }}>Tingkat Ketersediaan Stok</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>88%</div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', marginTop: '10px' }}>
                <div style={{ width: '88%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>
        );

      case "Food Waste":
        return (
          <div className="grid-3">
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '10px' }}>Total Makanan Terjual</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981' }}>1.847 porsi</div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '10px' }}>Total Makanan Didonasikan</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#3B82F6' }}>142 porsi</div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '10px' }}>Total Makanan Menjadi Limbah</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#EF4444' }}>84 porsi</div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '10px' }}>Persentase Food Waste</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#EF4444' }}>4.05%</div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '5px' }}>Menurun 1.2% dari bulan lalu</div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '10px' }}>Food Rescue Rate</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981' }}>95.95%</div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '5px' }}>Tingkat penyelamatan sangat baik</div>
            </div>
          </div>
        );

      case "Customer":
        return (
          <div className="grid-2">
            <div className="grid-2">
              <div className="card"><h3 style={{ fontSize: '0.75rem', color: '#6B7280' }}>Jumlah Customer</h3><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>854</div></div>
              <div className="card"><h3 style={{ fontSize: '0.75rem', color: '#6B7280' }}>Customer Baru</h3><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>298</div></div>
              <div className="card"><h3 style={{ fontSize: '0.75rem', color: '#6B7280' }}>Customer Aktif</h3><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>512</div></div>
              <div className="card"><h3 style={{ fontSize: '0.75rem', color: '#6B7280' }}>Repeat Customer</h3><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3B82F6' }}>556</div></div>
              <div className="card"><h3 style={{ fontSize: '0.75rem', color: '#6B7280' }}>Rating Rata-rata</h3><div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>4.6 <Star size={16} color="#F59E0B" fill="#F59E0B" /></div></div>
              <div className="card"><h3 style={{ fontSize: '0.75rem', color: '#6B7280' }}>Jumlah Ulasan</h3><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>2.068</div></div>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '10px' }}>Rasio Customer Baru vs Repeat</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={customerData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {customerData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case "Sustainability":
        return (
          <div className="grid-2">
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: '#ECFDF5', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={30} /></div>
              <div>
                <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '5px' }}>Total Makanan Terselamatkan</h3>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>1.989 porsi</div>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: '#F0FDF4', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Leaf size={30} /></div>
              <div>
                <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '5px' }}>Estimasi Pengurangan Emisi Karbon</h3>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>284 kg CO₂</div>
              </div>
            </div>
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: '15px' }}>Sustainability Score</h3>
              <ProgressTargetBar title="Score Keberlanjutan Savora" current="A+" target="Max" percentage={95} color="#10B981" statusText="Sangat Baik" />
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '10px' }}>Skor ini dihitung berdasarkan rasio makanan terselamatkan dibandingkan limbah, serta dampaknya terhadap pengurangan jejak karbon.</p>
            </div>
          </div>
        );

      case "Visualisasi":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 style={{ marginBottom: '15px' }}>Grafik Penjualan & Pendapatan</h3>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '15px' }}>Grafik Food Waste, Donasi & Carbon Impact</h3>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wasteData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} />
                    <Legend />
                    <Bar dataKey="terjual" name="Terselamatkan (Terjual)" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} barSize={20} />
                    <Bar dataKey="donasi" name="Didonasikan" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="waste" name="Food Waste" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderInsightContent = () => {
    switch(insightTab) {
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

  const segmentBtn = (label, active, onClick) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        padding: '8px 22px',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: active ? 700 : 500,
        backgroundColor: active ? '#10B981' : 'transparent',
        color: active ? '#FFFFFF' : '#6B7280',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );

  const subTabs = view === "Analitik" ? ANALITIK_TABS : INSIGHT_TABS;
  const currentSubTab = view === "Analitik" ? activeTab : insightTab;
  const setCurrentSubTab = view === "Analitik" ? setActiveTab : setInsightTab;

  return (
    <>
      <TopHeader
        title="Analitik & Insight"
        subtitle="Pusat data performa bisnis dan rekomendasi cerdas berbasis AI dalam satu tempat."
      >
        {view === "Analitik" ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowDateDropdown(!showDateDropdown); setShowExportDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '20px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>
                <Calendar size={16} /> {dateFilter}
              </button>
              {showDateDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px', zIndex: 10, minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  {["Juni 2025", "Mei 2025", "April 2025", "Tahun 2025", "Semua Waktu"].map(d => (
                    <div key={d} style={{ padding: '5px', cursor: 'pointer', color: dateFilter === d ? '#10B981' : 'inherit' }} onClick={() => { setDateFilter(d); setShowDateDropdown(false); }}>{d}</div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowExportDropdown(!showExportDropdown); setShowDateDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '20px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>
                <Download size={16} /> Export Data
              </button>
              {showExportDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px', zIndex: 10, minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <div style={{ padding: '5px', cursor: 'pointer' }} onClick={() => { alert('Mengunduh Laporan PDF...'); setShowExportDropdown(false); }}>Export as PDF</div>
                  <div style={{ padding: '5px', cursor: 'pointer' }} onClick={() => { alert('Mengunduh Laporan CSV...'); setShowExportDropdown(false); }}>Export as CSV</div>
                  <div style={{ padding: '5px', cursor: 'pointer' }} onClick={() => { alert('Mengunduh Laporan Excel...'); setShowExportDropdown(false); }}>Export as Excel</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Badge type="info" customStyle={{ padding: '8px 12px', fontSize: '0.875rem' }}><Lightbulb size={16} style={{marginRight: '5px'}}/> Diperbarui: 5 menit lalu</Badge>
          </div>
        )}
      </TopHeader>

      <div className="content-area">
        {/* Section switch: Analitik vs Insight (gabungan satu menu) */}
        <div style={{ display: 'inline-flex', backgroundColor: '#F3F4F6', borderRadius: '9999px', padding: '4px', gap: '4px', marginBottom: '20px' }}>
          {segmentBtn("Analitik", view === "Analitik", () => setView("Analitik"))}
          {segmentBtn("Insight", view === "Insight", () => setView("Insight"))}
        </div>

        {/* Sub-tab navigation untuk section aktif */}
        <div style={{ overflowX: 'auto', marginBottom: '25px', paddingBottom: '5px' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '9999px',
            padding: '4px',
            gap: '4px'
          }}>
            {subTabs.map(tab => (
              <div
                key={tab}
                onClick={() => setCurrentSubTab(tab)}
                style={{
                  padding: '8px 25px',
                  cursor: 'pointer',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: currentSubTab === tab ? 600 : 500,
                  backgroundColor: currentSubTab === tab ? '#ECFDF5' : 'transparent',
                  color: currentSubTab === tab ? '#10B981' : '#6B7280',
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
        {view === "Analitik" ? renderAnalitikContent() : renderInsightContent()}
      </div>
    </>
  );
}
