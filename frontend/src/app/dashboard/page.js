"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, ShoppingBag, Package, FileText, BarChart2, Plus, Users, MessageSquare, ShieldCheck, Star, Award, Leaf, Wind, Sprout } from "lucide-react";

import TopHeader from "@/components/organisms/TopHeader";
import SummaryCard from "@/components/molecules/SummaryCard";
import Badge from "@/components/atoms/Badge";
import ProgressTargetBar from "@/components/molecules/ProgressTargetBar";
import { useUmkm } from '@/context/UmkmContext';
import { useAuthGuard } from '@/lib/useAuthGuard';

import { fetchUmkmInsight, fetchSalesTrend } from "@/lib/analytics";
import { fetchUMKMProducts } from "@/lib/products";
import { fetchUMKMOrders } from "@/lib/orders";

const COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1D5DB'];

export default function DashboardPage() {
  const router = useRouter();
  const { umkmData } = useUmkm();
  const { loading: authLoading } = useAuthGuard(['UMKM'], { checkVerification: true });
  const [data, setData] = useState({
    sales_today: 2450000,
    sales_trend: 12.4,
    active_orders: 12,
    active_orders_trend: 3,
    active_products: 34,
    active_products_trend: -2.1,
    monthly_revenue: 48750000,
    monthly_revenue_trend: 18.7,
    food_rescue_score: 94,
    trust_score: 4.8,
    rating: 4.9,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const insight = await fetchUmkmInsight(1);
        const products = await fetchUMKMProducts(1);
        const orders = await fetchUMKMOrders(1);

        const activeOrders = orders.filter(o => ["Menunggu", "Diproses", "Siap Diambil"].includes(o.status)).length;
        const activeProducts = products.filter(p => p.status === "Aktif").length;

        setData(prev => ({
          ...prev,
          sales_today: insight.total_revenue > 0 ? insight.total_revenue / 30 : prev.sales_today,
          active_orders: activeOrders || prev.active_orders,
          active_products: activeProducts || prev.active_products,
          monthly_revenue: insight.total_revenue || prev.monthly_revenue,
          trust_score: insight.avg_rating || prev.trust_score,
          rating: insight.avg_rating || prev.rating,
        }));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      }
    }
    loadDashboardData();
  }, []);


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

  if (authLoading) return null;
  if (!data) return <div>Loading...</div>;

  const mockChartData = [
    { name: 'Sen', value: 1500000 },
    { name: 'Sel', value: 2100000 },
    { name: 'Rab', value: 1800000 },
    { name: 'Kam', value: 2500000 },
    { name: 'Jum', value: 3100000 },
    { name: 'Sab', value: 3800000 },
    { name: 'Min', value: 2900000 },
  ];
  
  const mockTrendData1 = [{value: 10}, {value: 12}, {value: 11}, {value: 14}, {value: 15}, {value: 18}];
  const mockTrendData2 = [{value: 5}, {value: 6}, {value: 8}, {value: 7}, {value: 10}, {value: 12}];
  const mockTrendData3 = [{value: 40}, {value: 38}, {value: 36}, {value: 37}, {value: 35}, {value: 34}];
  const mockTrendData4 = [{value: 30}, {value: 32}, {value: 35}, {value: 40}, {value: 45}, {value: 48}];

  const categoryData = [
    { name: 'Makanan Berat', value: 35 },
    { name: 'Minuman', value: 25 },
    { name: 'Snack', value: 20 },
    { name: 'Kue & Roti', value: 12 },
    { name: 'Lainnya', value: 8 },
  ];

  return (
    <>
      <TopHeader title={`Halo, ${umkmData?.umkm_profiles?.business_name} 👋`} subtitle="Kamis, 9 Juli 2026" />

      <div className="content-area">
        {/* KPI Cards */}
        <div className="grid-4" style={{ marginBottom: '25px' }}>
          <SummaryCard 
            title="Total Penjualan Hari Ini" 
            value={formatRupiah(data.sales_today)} 
            icon={<TrendingUp size={20} color="#046C4E" />} 
            trend={`${data.sales_trend}%`} 
            trendUp={true} 
            chartData={mockTrendData1}
          />
          <SummaryCard 
            title="Pesanan Aktif" 
            value={`${data.active_orders} pesanan`} 
            icon={<ShoppingBag size={20} color="#1E429F" />} 
            trend={`+${data.active_orders_trend} dari kemarin`} 
            trendUp={true}
            chartData={mockTrendData2}
            chartColor="#3B82F6"
          />
          <SummaryCard 
            title="Produk Aktif" 
            value={`${data.active_products} produk`} 
            icon={<Package size={20} color="#B43403" />} 
            trend={`${Math.abs(data.active_products_trend)}% turun`} 
            trendUp={false} 
            chartData={mockTrendData3}
            chartColor="#F59E0B"
          />
          <SummaryCard 
            title="Pendapatan Bulan Ini" 
            value={formatRupiah(data.monthly_revenue)} 
            icon={<TrendingUp size={20} color="#6366F1" />} 
            trend={`${data.monthly_revenue_trend}%`} 
            trendUp={true} 
            chartData={mockTrendData4}
            chartColor="#6366F1"
          />
        </div>

        {/* Charts & Categories */}
        <div className="grid-sidebar-right" style={{ marginBottom: '25px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ marginBottom: '5px' }}>Grafik Penjualan</h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Tren pendapatan harian {umkmData?.umkm_profiles?.business_name}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Badge status="Aktif" customStyle={{ borderRadius: '20px' }}>7 Hari</Badge>
                <Badge status="Draft" customStyle={{ borderRadius: '20px' }}>30 Hari</Badge>
                <Badge status="Draft" customStyle={{ borderRadius: '20px' }}>90 Hari</Badge>
              </div>
            </div>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '5px' }}>Kategori Terlaris</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '20px' }}>Distribusi per kategori produk</p>
            <div style={{ height: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0 0 0', fontSize: '0.875rem' }}>
              {categoryData.map((item, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[index], marginRight: '8px' }}></span>
                    {item.name}
                  </span>
                  <span style={{ fontWeight: 600 }}>{item.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pesanan Aktif & Inventori Hampir Habis */}
        <div className="grid-sidebar-right">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Pesanan Aktif</h3>
              <button className="btn-secondary" onClick={() => router.push('/pesanan')} style={{ padding: '6px 12px', fontSize: '0.875rem', cursor: 'pointer' }}>Lihat Semua →</button>
            </div>
            <table className="table" style={{ fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th>No. Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Status</th>
                  <th>Jam Pickup</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, color: '#10B981' }}>#SVR-0892</td>
                  <td>Rina Marlina</td>
                  <td><Badge status="Menunggu" /></td>
                  <td>13:45</td>
                  <td><button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Detail</button></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#10B981' }}>#SVR-0891</td>
                  <td>Budi Santoso</td>
                  <td><Badge status="Diproses" /></td>
                  <td>13:20</td>
                  <td><button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Detail</button></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#10B981' }}>#SVR-0890</td>
                  <td>Dewi Rahayu</td>
                  <td><Badge status="Siap Diambil" /></td>
                  <td>12:55</td>
                  <td><button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Detail</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Inventori — Hampir Habis</h3>
              <button className="btn-primary" onClick={() => router.push('/produk')} style={{ padding: '6px 12px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><Plus size={16}/> Tambah Produk</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                { name: 'Nasi Padang Box', stock: 3, timer: '02:15', status: 'critical', price: 'Rp 25.000' },
                { name: 'Mie Ayam Spesial', stock: 5, timer: '01:30', status: 'warning', price: 'Rp 24.000' },
                { name: 'Kue Lapis Legit', stock: 8, timer: '03:00', status: 'warning', price: 'Rp 18.000' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: idx !== 2 ? '1px solid #E5E7EB' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Sisa stok: {item.stock} porsi</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: item.status === 'critical' ? '#EF4444' : '#F59E0B' }}>{item.timer}</div>
                      <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Rescue Timer</div>
                    </div>
                    <Badge type={item.status}>{item.status === 'critical' ? 'Kritis' : 'Hampir Habis'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dampak Food Rescue */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Dampak Food Rescue</h3>
          <div className="grid-4">
            <div style={{ padding: '15px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', marginBottom: '10px' }}>
                <Package size={18} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>234 kg</div>
              <div style={{ fontSize: '0.75rem', color: '#4B5563', marginBottom: '5px' }}>Makanan Diselamatkan</div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>+18 kg hari ini</div>
            </div>
            
            <div style={{ padding: '15px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', marginBottom: '10px' }}>
                <Leaf size={18} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>89 kg</div>
              <div style={{ fontSize: '0.75rem', color: '#4B5563', marginBottom: '5px' }}>Food Waste Dicegah</div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>+7 kg hari ini</div>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#EFF6FF', borderRadius: '10px', border: '1px solid #DBEAFE' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: '10px' }}>
                <Wind size={18} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>156 kg</div>
              <div style={{ fontSize: '0.75rem', color: '#4B5563', marginBottom: '5px' }}>Emisi CO₂ Berkurang</div>
              <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>Setara 14 pohon</div>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#F5F3FF', borderRadius: '10px', border: '1px solid #EDE9FE' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', marginBottom: '10px' }}>
                <Users size={18} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>412</div>
              <div style={{ fontSize: '0.75rem', color: '#4B5563', marginBottom: '5px' }}>Pelanggan Dilayani</div>
              <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>+23 pelanggan bulan ini</div>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ECFDF5', borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, color: '#065F46' }}>
                <Award size={18} /> Menuju Badge Platinum Rescuer
              </div>
              <div style={{ fontWeight: 700, color: '#065F46' }}>234 / 300 kg</div>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#D1FAE5', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '78%', height: '100%', backgroundColor: '#10B981' }}></div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '8px' }}>Hemat 66 kg lagi untuk naik ke level Platinum! 🎯 Kamu hampir di sana.</div>
          </div>
        </div>

        {/* Reputasi & Aksi Cepat */}
        <div className="grid-sidebar-right" style={{ marginTop: '20px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Reputasi Toko</h3>
            <div className="grid-3" style={{ marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>94</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Food Rescue Score</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Sangat Baik</div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', marginTop: '8px' }}>
                  <div style={{ width: '94%', height: '100%', backgroundColor: '#10B981' }}></div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>4.8</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Trust Score</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Sangat Terpercaya</div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', marginTop: '8px' }}>
                  <div style={{ width: '96%', height: '100%', backgroundColor: '#10B981' }}></div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>4.9</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Rating Pelanggan</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Dari 127 ulasan</div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', marginTop: '8px' }}>
                  <div style={{ width: '98%', height: '100%', backgroundColor: '#10B981' }}></div>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '15px', backgroundColor: '#F0FDF4', border: '1px solid #10B981', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Badge UMKM Gold Rescuer <Badge type="warning" customStyle={{ fontSize: '0.65rem', padding: '2px 6px' }}>Gold</Badge>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>Excellent Partner - Bergabung sejak Maret 2024</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#10B981' }}>Excellent</div>
                <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>Partner Status</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Aksi Cepat</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <button onClick={() => router.push('/produk')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '15px 10px', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#ECFDF5', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={20} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Tambah<br/>Produk</span>
              </button>
              
              <button onClick={() => router.push('/produk')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '15px 10px', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF', color: '#3B82F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Kelola<br/>Produk</span>
              </button>
              
              <button onClick={() => router.push('/pesanan')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '15px 10px', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={20} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Daftar<br/>Pesanan</span>
              </button>
              
              <button onClick={() => router.push('/analitik')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '15px 10px', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#F3E8FF', color: '#9333EA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={20} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Analitik</span>
              </button>

              <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '15px 10px', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#E0F2FE', color: '#0284C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={20} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Chat<br/>Pelanggan</span>
              </button>

              <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '15px 10px', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#FFE4E6', color: '#E11D48', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Laporan</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Target & Pencapaian */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Target Bulan Ini</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <ProgressTargetBar title="Target Penjualan" current="Rp 48,8jt" target="Rp 60,0jt" percentage={81} color="#10B981" statusText="On Track" />
            <ProgressTargetBar title="Target Food Rescue" current="1.847 produk" target="2.000 produk" percentage={78} color="#10B981" statusText="Almost Target" />
            <ProgressTargetBar title="Target Pelanggan Baru" current="87 org" target="120 org" percentage={73} color="#6366F1" />
            <ProgressTargetBar title="Target Pendapatan Bersih" current="Rp 38,2jt" target="Rp 55,0jt" percentage={69} color="#F59E0B" />
          </div>
        </div>

      </div>
    </>
  );
}
