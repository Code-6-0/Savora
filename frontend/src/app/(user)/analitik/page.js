"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, YAxis, PieChart, Pie, Legend } from "recharts";
import { TrendingUp, Package, DollarSign, Calendar, FileText, Download, Leaf, Users, Star, Activity, ArrowDownRight, ArrowUpRight } from "lucide-react";
import TopHeader from "@/components/organisms/TopHeader";
import SummaryCard from "@/components/molecules/SummaryCard";
import ProgressTargetBar from "@/components/molecules/ProgressTargetBar";
import Badge from "@/components/atoms/Badge";

export default function AnalitikPage() {
  const [activeTab, setActiveTab] = useState("Penjualan");
  const [dateFilter, setDateFilter] = useState("Juni 2025");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

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

  const renderTabContent = () => {
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontWeight: 600 }}>Nasi Kotak Ayam Teriyaki</div><div style={{ fontSize: '0.75rem', color: '#6B7280' }}>284 terjual</div></div>
                  <Badge type="success">Peringkat 1</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontWeight: 600 }}>Nasi Gudeg Komplit</div><div style={{ fontSize: '0.75rem', color: '#6B7280' }}>267 terjual</div></div>
                  <Badge type="success">Peringkat 2</Badge>
                </div>
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

  return (
    <>
      <TopHeader title="Analitik Data Bisnis" subtitle="Pusat data performa bisnis, penjualan, dan metrik keberlanjutan.">
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
            {["Penjualan", "Produk", "Food Waste", "Customer", "Sustainability", "Visualisasi"].map(tab => (
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
  );
}
