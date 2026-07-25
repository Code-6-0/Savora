"use client";

import { useState, useEffect } from "react";
import { useAuthGuard } from "@/lib/useAuthGuard";
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
import { fetchTopProducts, fetchWasteLogs, createWasteLog, fetchUmkmInsight, fetchListingMetrics } from "@/lib/analytics";

const UMKM_ID = 1;

// Sub-tab masing-masing section.
const ANALITIK_TABS = ["Penjualan", "Produk", "Food Waste", "Customer", "Sustainability", "Visualisasi"];
const INSIGHT_TABS = ["Evaluasi Stok", "Performa Listing", "Harga", "Produk", "Customer", "Sustainability"];

export default function AnalitikPage() {
  const { loading: authLoading } = useAuthGuard(['UMKM'], { checkVerification: true });
  // View level: gabungan Analitik + Insight jadi satu menu.
  const [view, setView] = useState("Analitik");
  const [activeTab, setActiveTab] = useState("Penjualan");
  const [insightTab, setInsightTab] = useState("Evaluasi Stok");
  const [dateFilter, setDateFilter] = useState("Juni 2025");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [showWasteForm, setShowWasteForm] = useState(false);
  const [wasteForm, setWasteForm] = useState({ food_name: "", category: "Bahan Baku", estimated_weight: "", reason: "" });
  const [wasteLoading, setWasteLoading] = useState(false);
  const [insightData, setInsightData] = useState(null);
  const [listingMetrics, setListingMetrics] = useState([]);

  useEffect(() => {
    let active = true;
    fetchTopProducts(UMKM_ID, 5).then((data) => {
      if (active) setTopProducts(data);
    });
    fetchWasteLogs(UMKM_ID).then((data) => {
      if (active) setWasteLogs(data);
    });
    fetchUmkmInsight(UMKM_ID).then((data) => {
      if (active) setInsightData(data);
    });
    fetchListingMetrics(UMKM_ID).then((data) => {
      if (active) setListingMetrics(data);
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

  if (authLoading) {
    return <div style={{ padding: '40px', color: '#6B7280' }}>Memuat...</div>;
  }

  const formatRupiah = (number) => {
    if (number >= 1000000) {
      return `Rp ${(number / 1000000).toFixed(2).replace('.', ',')}jt`;
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

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
            <SummaryCard title="Total Penjualan" value={insightData ? formatRupiah(insightData.total_revenue) : "Loading..."} icon={<DollarSign size={20} color="#10B981" />} trend="+12.4%" trendLabel="vs bulan lalu" trendUp={true} chartData={mockChartData} />
            <SummaryCard title="Total Pendapatan" value={insightData ? formatRupiah(insightData.total_revenue * 0.8) : "Loading..."} icon={<TrendingUp size={20} color="#10B981" />} trend="+8.2%" trendLabel="vs bulan lalu" trendUp={true} chartData={mockChartData} />
            <SummaryCard title="Jumlah Pesanan" value={insightData ? insightData.total_units : "Loading..."} icon={<Package size={20} color="#10B981" />} trend="+15.1%" trendLabel="vs bulan lalu" trendUp={true} chartData={mockChartData} />
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '10px' }}>Rata-rata Nilai Transaksi</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '5px' }}>{insightData ? formatRupiah(insightData.total_revenue / (insightData.total_units || 1)) : "Rp 0"}</div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Catatan Waste Log</h3>
                <button 
                  onClick={() => setShowWasteForm(true)}
                  style={{
                    padding: '8px 16px', backgroundColor: '#10B981', color: '#FFF',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem'
                  }}>
                  + Catat Limbah Dapur
                </button>
              </div>

              {showWasteForm && (
                <div style={{ 
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999, 
                  display: 'flex', justifyContent: 'center', alignItems: 'center' 
                }}>
                  <div style={{ 
                    backgroundColor: '#FFF', padding: '24px', borderRadius: '12px', 
                    width: '90%', maxWidth: '500px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}>
                    <h4 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 600 }}>Catat Limbah Dapur / Bahan Baku</h4>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '20px' }}>Gunakan form ini khusus untuk mencatat limbah yang bukan berasal dari produk etalase (misal: telur pecah, adonan tumpah).</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500, color: '#374151' }}>Nama Barang/Bahan</label>
                        <input 
                          type="text" 
                          value={wasteForm.food_name}
                          onChange={(e) => setWasteForm({...wasteForm, food_name: e.target.value})}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                          placeholder="Cth: Telur Ayam, Adonan Roti"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500, color: '#374151' }}>Kategori</label>
                        <select 
                          value={wasteForm.category}
                          onChange={(e) => setWasteForm({...wasteForm, category: e.target.value})}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                        >
                          <option value="Bahan Baku">Bahan Baku</option>
                          <option value="Makanan Siap Saji">Makanan Siap Saji</option>
                          <option value="Kue & Jajanan">Kue & Jajanan</option>
                          <option value="Roti & Pastry">Roti & Pastry</option>
                          <option value="Sayur & Buah">Sayur & Buah</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500, color: '#374151' }}>Estimasi Berat (kg)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={wasteForm.estimated_weight}
                          onChange={(e) => setWasteForm({...wasteForm, estimated_weight: e.target.value})}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                          placeholder="Cth: 0.5"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500, color: '#374151' }}>Alasan</label>
                        <textarea 
                          value={wasteForm.reason}
                          onChange={(e) => setWasteForm({...wasteForm, reason: e.target.value})}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem', minHeight: '80px', resize: 'vertical' }}
                          placeholder="Cth: Jatuh tersenggol, salah takaran air"
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setShowWasteForm(false)}
                        style={{ padding: '10px 18px', backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                        Batal
                      </button>
                      <button 
                        onClick={async () => {
                          setWasteLoading(true);
                          try {
                            await createWasteLog({
                              umkm_id: UMKM_ID,
                              food_name: wasteForm.food_name,
                              category: wasteForm.category,
                              estimated_weight: parseFloat(wasteForm.estimated_weight) || 0,
                              reason: "Manual: " + wasteForm.reason,
                            });
                            const data = await fetchWasteLogs(UMKM_ID);
                            setWasteLogs(data);
                            setShowWasteForm(false);
                            setWasteForm({ food_name: "", category: "Bahan Baku", estimated_weight: "", reason: "" });
                          } catch (e) {
                            alert(e.message);
                          } finally {
                            setWasteLoading(false);
                          }
                        }}
                        disabled={wasteLoading}
                        style={{ padding: '10px 18px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', opacity: wasteLoading ? 0.7 : 1 }}>
                        {wasteLoading ? "Menyimpan..." : "Simpan Catatan"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem' }}>
                      <th style={{ padding: '12px 16px' }}>Tanggal</th>
                      <th style={{ padding: '12px 16px' }}>Makanan</th>
                      <th style={{ padding: '12px 16px' }}>Kategori</th>
                      <th style={{ padding: '12px 16px' }}>Berat (kg)</th>
                      <th style={{ padding: '12px 16px' }}>Alasan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteLogs.length > 0 ? (
                      wasteLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{new Date(log.created_at).toLocaleDateString('id-ID')}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: '0.875rem' }}>{log.food_name}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#6B7280' }}>{log.category}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{log.estimated_weight}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#EF4444' }}>{log.reason}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
                          Belum ada catatan Waste Log.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
      case "Evaluasi Stok":
        return (
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Evaluasi Stok (Berdasarkan Waste Log)</h3>
              <RecommendationCard type="warning" icon={<TrendingDown size={20} />} title="Produksi Berlebih pada Akhir Minggu" description="Berdasarkan riwayat Waste Log, Nasi Kotak Ayam Bakar sering menjadi limbah di hari Minggu. Kurangi porsi produksi sebesar 10% di akhir pekan." actionText="Lihat Riwayat Log" onClick={() => setActiveTab("Food Waste")} />
              <RecommendationCard type="info" icon={<Zap size={20} />} title="Evaluasi Waktu Publish Listing" description="Produk yang dipublish setelah jam 19:00 lebih sering tidak terjual. Coba jadwalkan listing food rescue di jam 17:00." />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Evaluasi Kategori</h3>
              <RecommendationCard type="critical" icon={<AlertTriangle size={20} />} title="Peringatan Kue Basah" description="Kategori 'Kue & Jajanan' menyumbang 65% total Waste Log Anda. Evaluasi kembali jumlah produksi harian untuk kategori ini." />
            </div>
          </div>
        );

      case "Performa Listing":
        return (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Analitik Pelacakan & Konversi</h3>
              <Badge type="info">30 Hari Terakhir</Badge>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem' }}>
                    <th style={{ padding: '12px 16px' }}>Produk</th>
                    <th style={{ padding: '12px 16px' }}>Views</th>
                    <th style={{ padding: '12px 16px' }}>CTR</th>
                    <th style={{ padding: '12px 16px' }}>Conv. Rate</th>
                    <th style={{ padding: '12px 16px' }}>Terjual</th>
                    <th style={{ padding: '12px 16px' }}>Sisa Stok</th>
                    <th style={{ padding: '12px 16px' }}>Sell Through</th>
                  </tr>
                </thead>
                <tbody>
                  {listingMetrics.length > 0 ? (
                    listingMetrics.map((item) => (
                      <tr key={item.product_id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{item.views || Math.floor(Math.random()*2000 + 500)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{item.ctr ? (item.ctr * 100).toFixed(1) : (Math.random()*15+5).toFixed(1)}%</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#10B981' }}>{item.conversion_rate ? (item.conversion_rate * 100).toFixed(1) : (Math.random()*15+10).toFixed(1)}%</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{item.units_sold}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#EF4444' }}>{item.stock_left}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600 }}>{(item.sell_through * 100).toFixed(0)}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Data belum tersedia</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Harga":
        return (
          <div className="grid-2">
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Rekomendasi Dynamic Pricing</h3>
            <div className="grid-3">
              <RecommendationCard type="info" icon={<DollarSign size={20} />} title="Diskon 50% untuk Salad Bowl" description="Sisa 4 jam kelayakan. Turunkan harga menjadi Rp 14.000 untuk memicu impulse buying." actionText="Terapkan Diskon" onClick={() => alert("Simulasi Savora MVP: Harga produk Salad Bowl berhasil diturunkan menjadi Rp 14.000!")} />
              <RecommendationCard type="success" icon={<TrendingUp size={20} />} title="Harga Normal Mystery Box" description="Permintaan sangat tinggi. Pertahankan harga Rp 25.000 tanpa perlu tambahan diskon ekstra." />
              <RecommendationCard type="critical" icon={<DollarSign size={20} />} title="Flash Sale Sore Hari" description="Banyak user aktif jam 16.00-18.00. Aktifkan diskon 30% pada jam tersebut khusus untuk Roti." actionText="Jadwalkan Flash Sale" onClick={() => alert("Simulasi Savora MVP: Flash Sale berhasil dijadwalkan!")} />
            </div>
          </div>
          </div>
        );

      case "Produk":
        return (
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Peringatan Food Waste</h3>
              <RecommendationCard type="info" icon={<AlertTriangle size={20} />} title="Sandwich Tuna Segera Basi" description="Rescue Score sisa 14%. Sisa 1 jam kelayakan konsumsi. Sangat disarankan untuk segera didonasikan atau turun harga 80%." actionText="Ambil Tindakan Cepat" onClick={() => setActiveTab("Produk")} />
              <RecommendationCard type="critical" icon={<Clock size={20} />} title="Periksa Suhu Penyimpanan Kue" description="Kue Tart lebih cepat basi minggu ini. Pastikan showcase berada di bawah 4°C." />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Rekomendasi Kategori</h3>
              <RecommendationCard type="success" icon={<Package size={20} />} title="Performa Terbaik: Nasi & Lauk" description="Kategori ini mendominasi 65% penyelamatan food waste. Pertahankan kualitas." />
              <RecommendationCard type="info" icon={<Lightbulb size={20} />} title="Eksperimen Kategori Baru" description="Peminat Makanan Sehat (Vegan) meningkat. Anda mungkin bisa menambah produk salad." />
            </div>
          </div>
        );

      case "Customer": {
        const badgeColors = {
          "Aman": { bg: "#ECFDF5", text: "#10B981" },
          "Warning": { bg: "#FEF3C7", text: "#F59E0B" },
          "Gawat": { bg: "#FEE2E2", text: "#EF4444" },
          "Belum Cukup Data": { bg: "#F3F4F6", text: "#6B7280" }
        };
        const ks = insightData?.keyword_safety || { badge: "Belum Cukup Data", top_positive: [], top_negative: [] };
        const bStyle = badgeColors[ks.badge] || badgeColors["Belum Cukup Data"];

        return (
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Insight Perilaku & Loyalitas</h3>
              <RecommendationCard type="info" icon={<Clock size={20} />} title="Jam Pembelian Terbaik: 18.00 - 19.00" description="Sebagian besar pembelian food rescue terjadi pada jam pulang kerja. Pasang notifikasi promo di jam 17.30." />
              <RecommendationCard type="success" icon={<Users size={20} />} title="Sapa Repeat Customer Anda" description="65% pembeli adalah pelanggan tetap. Tawarkan 'Loyalty Badge' agar mereka makin rajin berbelanja." actionText="Buat Program Loyalitas" onClick={() => alert("Simulasi Savora MVP: Fitur Program Loyalitas akan segera hadir!")} />
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Review Keyword Safety</h3>
                <div style={{ padding: '4px 12px', borderRadius: '12px', backgroundColor: bStyle.bg, color: bStyle.text, fontSize: '0.75rem', fontWeight: 600 }}>
                  Status: {ks.badge}
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '15px' }}>
                Deteksi AI dari ulasan pelanggan dalam 30 hari terakhir.
              </p>
              
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10B981', marginBottom: '10px' }}>Keyword Positif Terbanyak</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ks.top_positive.length > 0 ? ks.top_positive.map((kw, i) => (
                    <span key={i} style={{ padding: '4px 10px', backgroundColor: '#ECFDF5', color: '#10B981', borderRadius: '12px', fontSize: '0.75rem' }}>
                      {kw.keyword} ({kw.count})
                    </span>
                  )) : <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Belum ada data</span>}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#EF4444', marginBottom: '10px' }}>Peringatan Keyword (Gawat/Warning)</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ks.top_negative.length > 0 ? ks.top_negative.map((kw, i) => (
                    <span key={i} style={{ padding: '4px 10px', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '12px', fontSize: '0.75rem' }}>
                      {kw.keyword} ({kw.count})
                    </span>
                  )) : <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Tidak ada masalah berat terdeteksi</span>}
                </div>
                {ks.badge === "Gawat" && (
                  <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#FEE2E2', borderRadius: '8px', borderLeft: '4px solid #EF4444', fontSize: '0.875rem', color: '#991B1B' }}>
                    <strong>Peringatan!</strong> Ditemukan banyak laporan "Basi / Bau" dari beberapa pelanggan. Segera periksa kualitas bahan dan kurangi porsi harian!
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }



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
              <RecommendationCard type="info" icon={<Zap size={20} />} title="Meningkatkan Food Rescue Score" description="Donasikan 10 porsi makanan berlebih (kurang layak jual tapi masih aman) ke Savora Shelter hari ini." actionText="Mulai Donasi" onClick={() => alert("Simulasi Savora MVP: Mengarahkan Anda ke formulir Mitra Donasi...")} />
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
