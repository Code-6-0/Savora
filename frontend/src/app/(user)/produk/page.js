"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, ArrowUpDown, Clock, CheckCircle2, AlertTriangle, AlertCircle, BarChart2, Lightbulb, TrendingUp, Sparkles, Image as ImageIcon, Camera, Package, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

import TopHeader from "@/components/organisms/TopHeader";
import Badge from "@/components/atoms/Badge";

export default function ProdukPage() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMode, setAddMode] = useState(null); // 'manual' or 'ai'

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Dummy data for visual
  const products = [
    { id: 1, name: "Nasi Kotak Ayam Bakar", category: "Makanan Siap Saji", original_price: 35000, rescue_price: 20000, stock: 8, score: 87, timer: "6j", status: "Aktif" },
    { id: 2, name: "Roti Gandum Artisan", category: "Bakeri & Roti", original_price: 25000, rescue_price: 12000, stock: 3, score: 38, timer: "2j", status: "Hampir Habis" },
    { id: 3, name: "Salad Bowl Superfood", category: "Makanan Sehat", original_price: 45000, rescue_price: 28000, stock: 12, score: 74, timer: "8j", status: "Aktif" },
    { id: 4, name: "Kue Tart Spesial", category: "Kue & Pastri", original_price: 150000, rescue_price: 65000, stock: 1, score: 14, timer: "1j", status: "Kritis" },
    { id: 5, name: "Sandwich Club Tuna", category: "Sandwich & Wrap", original_price: 28000, rescue_price: null, stock: 0, score: 0, timer: "-", status: "Habis" },
    { id: 6, name: "Smoothie Bowl Mango", category: "Minuman & Bowl", original_price: 55000, rescue_price: 35000, stock: 6, score: 68, timer: "7j", status: "Aktif" },
    { id: 7, name: "Pizza Margherita Min", category: "Pizza & Pasta", original_price: 65000, rescue_price: 65000, stock: 4, score: 91, timer: "11j", status: "Aktif" },
    { id: 8, name: "Bakso Premium Solo", category: "Makanan Siap Saji", original_price: 40000, rescue_price: 25000, stock: 6, score: 55, timer: "5j", status: "Aktif" },
  ];

  const formatRupiah = (number) => {
    if (!number) return "—";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const barData = [
    { name: 'Mystery Box', uv: 15 },
    { name: 'Salad Bowl', uv: 12 },
    { name: 'Nasi Kotak', uv: 8 },
    { name: 'Smoothie', uv: 6 },
    { name: 'Bakso', uv: 6 },
    { name: 'Pizza Mini', uv: 4 },
    { name: 'Roti Gandum', uv: 4 },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory ? p.category === filterCategory : true;
    const matchesTab = activeTab === "Semua" ? true : (activeTab === "Mystery Box" ? p.name.includes("Mystery Box") : p.status === activeTab);
    return matchesSearch && matchesCategory && matchesTab;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.rescue_price - b.rescue_price;
    if (sortBy === "price_desc") return b.rescue_price - a.rescue_price;
    if (sortBy === "stock_asc") return a.stock - b.stock;
    if (sortBy === "stock_desc") return b.stock - a.stock;
    if (sortBy === "score_desc") return b.score - a.score;
    return 0;
  });

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <>
      <TopHeader title="Kelola Produk" subtitle="Kelola seluruh produk food rescue, pantau stok, dan masa kelayakan secara real-time.">
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input type="text" placeholder="Cari produk atau kategori..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '8px 12px 8px 35px', borderRadius: '20px', border: '1px solid #D1D5DB', width: '250px', fontSize: '0.875rem' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '20px', border: '1px solid #D1D5DB', background: filterCategory ? '#ECFDF5' : 'white', color: filterCategory ? '#10B981' : 'inherit', cursor: 'pointer', fontSize: '0.875rem' }}>
              <Filter size={16} /> {filterCategory || "Filter"}
            </button>
            {showFilterDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px', zIndex: 10, minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '5px', cursor: 'pointer', color: !filterCategory ? '#10B981' : 'inherit' }} onClick={() => { setFilterCategory(""); setShowFilterDropdown(false); }}>Semua Kategori</div>
                {categories.map(cat => (
                  <div key={cat} style={{ padding: '5px', cursor: 'pointer', color: filterCategory === cat ? '#10B981' : 'inherit' }} onClick={() => { setFilterCategory(cat); setShowFilterDropdown(false); }}>{cat}</div>
                ))}
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '20px', border: '1px solid #D1D5DB', background: sortBy ? '#ECFDF5' : 'white', color: sortBy ? '#10B981' : 'inherit', cursor: 'pointer', fontSize: '0.875rem' }}>
              <ArrowUpDown size={16} /> Urutkan
            </button>
            {showSortDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px', zIndex: 10, minWidth: '180px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '5px', cursor: 'pointer', color: !sortBy ? '#10B981' : 'inherit' }} onClick={() => { setSortBy(""); setShowSortDropdown(false); }}>Default</div>
                <div style={{ padding: '5px', cursor: 'pointer', color: sortBy === 'price_asc' ? '#10B981' : 'inherit' }} onClick={() => { setSortBy("price_asc"); setShowSortDropdown(false); }}>Harga Termurah</div>
                <div style={{ padding: '5px', cursor: 'pointer', color: sortBy === 'price_desc' ? '#10B981' : 'inherit' }} onClick={() => { setSortBy("price_desc"); setShowSortDropdown(false); }}>Harga Termahal</div>
                <div style={{ padding: '5px', cursor: 'pointer', color: sortBy === 'stock_asc' ? '#10B981' : 'inherit' }} onClick={() => { setSortBy("stock_asc"); setShowSortDropdown(false); }}>Stok Paling Sedikit</div>
                <div style={{ padding: '5px', cursor: 'pointer', color: sortBy === 'score_desc' ? '#10B981' : 'inherit' }} onClick={() => { setSortBy("score_desc"); setShowSortDropdown(false); }}>Rescue Score Tertinggi</div>
              </div>
            )}
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '20px' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Tambah Produk
          </button>
        </div>
      </TopHeader>

      <div className="content-area">
        {/* Top KPI Cards */}
        <div className="grid-4" style={{ marginBottom: '20px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>TOTAL PRODUK</div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}><Package size={14} /></div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '10px 0' }}>10</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280' }}>
              <span>vs. bulan lalu</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>↗ 12%</span>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>PRODUK AKTIF</div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={14} /></div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '10px 0' }}>5</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280' }}>
              <span>siap dijual hari ini</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>↗ 8%</span>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>HAMPIR HABIS</div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}><AlertTriangle size={14} /></div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '10px 0' }}>4</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280' }}>
              <span>stok {'<'} 5 unit tersisa</span>
              <span style={{ color: '#EF4444', fontWeight: 600 }}>↘ 25%</span>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>HAMPIR BERAKHIR</div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}><Clock size={14} /></div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '10px 0' }}>3</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280' }}>
              <span>rescue berakhir {'<'} 4 jam</span>
              <span style={{ color: '#EF4444', fontWeight: 600 }}>↘ 10%</span>
            </div>
          </div>
        </div>

        {/* Product Table List */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '25px' }}>
            {['Semua', 'Aktif', 'Habis', 'Draft', 'Mystery Box'].map(tab => (
              <div key={tab} onClick={() => setActiveTab(tab)} style={{ 
                cursor: 'pointer', 
                fontWeight: activeTab === tab ? 600 : 400, 
                color: activeTab === tab ? '#10B981' : '#6B7280',
                borderBottom: activeTab === tab ? '2px solid #10B981' : 'none',
                paddingBottom: '10px',
                marginBottom: '-16px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {tab} 
                <span style={{ fontSize: '0.65rem', backgroundColor: activeTab === tab ? '#ECFDF5' : '#F3F4F6', color: activeTab === tab ? '#10B981' : '#6B7280', padding: '2px 6px', borderRadius: '10px' }}>
                  {tab === 'Semua' ? 10 : (tab === 'Aktif' ? 5 : 1)}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: '20px' }}>PRODUK</th>
                <th>KATEGORI</th>
                <th>HARGA NORMAL</th>
                <th>HARGA RESCUE</th>
                <th>STOK</th>
                <th style={{ width: '150px' }}>RESCUE SCORE</th>
                <th>RESCUE TIMER</th>
                <th style={{ width: '80px', textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? filteredProducts.map(p => (
                <tr key={p.id}>
                  <td style={{ paddingLeft: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}></div>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                  </td>
                  <td style={{ color: '#6B7280' }}>{p.category}</td>
                  <td style={{ color: '#9CA3AF', textDecoration: p.rescue_price ? 'line-through' : 'none' }}>{formatRupiah(p.original_price)}</td>
                  <td style={{ fontWeight: 600, color: '#10B981' }}>{p.rescue_price ? formatRupiah(p.rescue_price) : '—'}</td>
                  <td style={{ fontWeight: 600, color: p.stock === 0 ? '#EF4444' : (p.stock < 5 ? '#F59E0B' : '#111827') }}>{p.stock}</td>
                  <td>
                    {p.score > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${p.score}%`, height: '100%', backgroundColor: p.score < 30 ? '#EF4444' : (p.score < 60 ? '#F59E0B' : '#10B981') }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.score < 30 ? '#EF4444' : (p.score < 60 ? '#F59E0B' : '#10B981') }}>{p.score}%</span>
                      </div>
                    ) : (
                      <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px' }}></div>
                    )}
                  </td>
                  <td style={{ color: p.timer === '-' ? '#9CA3AF' : '#D97706', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {p.timer !== '-' && <Clock size={14} />} {p.timer}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }} title="Edit"><Edit size={16} /></button>
                      <button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Hapus"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
                    Tidak ada produk yang cocok dengan filter atau pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
          <div style={{ padding: '15px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: '#6B7280' }}>
            <span>Menampilkan <strong>{filteredProducts.length > 0 ? 1 : 0}-{filteredProducts.length}</strong> dari <strong>{products.length}</strong> produk</span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button style={{ padding: '5px 10px', border: '1px solid #E5E7EB', borderRadius: '6px', background: 'white' }}>&lt;</button>
              <button style={{ padding: '5px 10px', border: 'none', borderRadius: '6px', background: '#10B981', color: 'white', fontWeight: 600 }}>1</button>
              <button style={{ padding: '5px 10px', border: 'none', borderRadius: '6px', background: 'transparent' }}>2</button>
              <button style={{ padding: '5px 10px', border: '1px solid #E5E7EB', borderRadius: '6px', background: 'white' }}>&gt;</button>
            </div>
          </div>
        </div>

        {/* Peringatan Produk Kritis */}
        <div style={{ border: '1px solid #FECACA', backgroundColor: '#FEF2F2', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={18} /></div>
              <div>
                <div style={{ fontWeight: 700, color: '#991B1B' }}>Peringatan Produk Kritis</div>
                <div style={{ fontSize: '0.75rem', color: '#B91C1C' }}>Rescue Score rendah — tindakan segera diperlukan untuk menghindari food waste</div>
              </div>
            </div>
            <Badge type="critical" customStyle={{ borderRadius: '20px' }}>3 produk</Badge>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[products[1], products[3], products[7]].map((p, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #FEE2E2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '30%' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}></div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                      <div style={{ width: '60px', height: '4px', backgroundColor: '#FEE2E2', borderRadius: '2px' }}>
                        <div style={{ width: `${p.score}%`, height: '100%', backgroundColor: p.score < 30 ? '#EF4444' : '#F59E0B' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.score < 30 ? '#EF4444' : '#F59E0B' }}>{p.score}%</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                   <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={12} /> {p.timer} 57m 22s</div>
                   <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>sisa rescue</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Turunkan Harga</button>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Donasikan</button>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Perpanjang</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts & Insights */}
        <div className="grid-sidebar-right" style={{ marginBottom: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ marginBottom: '5px' }}>Inventori & Penjualan</h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Tingkat stok saat ini per produk aktif</p>
              </div>
              <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span> Normal</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span> Hampir habis</span>
              </div>
            </div>
            
            <div style={{ height: '200px', marginBottom: '30px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                  <Tooltip cursor={{fill: '#F3F4F6'}} />
                  <Bar dataKey="uv" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.uv < 5 ? '#F59E0B' : '#10B981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}><TrendingUp size={16} color="#10B981" /> Produk Terlaris</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.75rem' }}>
                  {[
                    {name: 'Mystery Box Harian', val: 89, width: '95%'},
                    {name: 'Salad Bowl', val: 67, width: '75%'},
                    {name: 'Nasi Kotak Ayam', val: 45, width: '55%'},
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#9CA3AF', width: '10px' }}>{i+1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>{p.name}</span>
                          <span style={{ fontWeight: 600 }}>{p.val}</span>
                        </div>
                        <div style={{ height: '4px', backgroundColor: '#F3F4F6', borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: p.width, backgroundColor: '#10B981', borderRadius: '2px' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}><Sparkles size={16} color="#10B981" /> Paling Banyak Diselamatkan</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.75rem' }}>
                  {[
                    {name: 'Mystery Box Harian', val: 34, width: '80%'},
                    {name: 'Bakso Premium', val: 22, width: '60%'},
                    {name: 'Roti Gandum', val: 18, width: '45%'},
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#9CA3AF', width: '10px' }}>{i+1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>{p.name}</span>
                          <span style={{ fontWeight: 600 }}>{p.val}</span>
                        </div>
                        <div style={{ height: '4px', backgroundColor: '#F3F4F6', borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: p.width, backgroundColor: '#10B981', borderRadius: '2px' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#ECFDF5', borderRadius: '50%', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lightbulb size={20} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>Insight Produk</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Analitik minggu ini</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '15px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#FFFBEB', borderRadius: '8px', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><TrendingUp size={16} /></div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Produk Terlaris</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Mystery Box Harian A</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>89 terjual · 445 views</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '15px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#ECFDF5', borderRadius: '8px', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sparkles size={16} /></div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Rescue Score Tertinggi</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Mystery Box Harian A</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>Score 92% — sangat baik</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '15px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#FEF2F2', borderRadius: '8px', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AlertTriangle size={16} /></div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Potensi Food Waste</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Kue Tart Spesial</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>Score 14% — tindakan segera</div>
              </div>
            </div>
            
            <button style={{ width: '100%', padding: '12px', border: '1px solid #10B981', color: '#10B981', backgroundColor: 'transparent', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}>Lihat Semua Insight ↗</button>
          </div>
        </div>

      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Tambah Produk Baru</h3>
              <button onClick={() => { setIsModalOpen(false); setAddMode(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6B7280' }}>&times;</button>
            </div>
            
            {!addMode ? (
              <div className="grid-2">
                <div 
                  onClick={() => setAddMode('ai')}
                  style={{ border: '2px solid #10B981', borderRadius: '12px', padding: '25px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#F0FDF4' }}>
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#D1FAE5', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                    <Sparkles size={30} />
                  </div>
                  <h4 style={{ margin: '0 0 10px 0' }}>AI Auto-Scan</h4>
                  <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: 0 }}>Upload foto produk, AI akan otomatis mengisi detail dan saran harga rescue.</p>
                </div>
                <div 
                  onClick={() => setAddMode('manual')}
                  style={{ border: '1px solid #D1D5DB', borderRadius: '12px', padding: '25px', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#F3F4F6', color: '#6B7280', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                    <Plus size={30} />
                  </div>
                  <h4 style={{ margin: '0 0 10px 0' }}>Input Manual</h4>
                  <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: 0 }}>Isi form detail produk dan kelayakan secara manual dari awal.</p>
                </div>
              </div>
            ) : (
              <div>
                {addMode === 'ai' && (
                  <div style={{ marginBottom: '20px', padding: '20px', border: '2px dashed #D1D5DB', borderRadius: '10px', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                    <Camera size={40} color="#9CA3AF" style={{ marginBottom: '10px' }} />
                    <div style={{ fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Upload foto produk</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>AI akan memindai dan mengisi detail form otomatis</div>
                    <button className="btn-secondary" style={{ marginTop: '15px' }}>Pilih Foto</button>
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Nama Produk</label>
                    <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Kategori</label>
                      <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                        <option>Pilih Kategori</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Stok</label>
                      <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Harga Normal</label>
                      <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px', color: '#10B981' }}>Harga Rescue (AI Suggested)</label>
                      <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #10B981', backgroundColor: '#F0FDF4' }} />
                      <Sparkles size={16} color="#10B981" style={{ position: 'absolute', right: '10px', top: '35px' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '10px' }}>Assessment Kelayakan Makanan</div>
                    <div style={{ padding: '15px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                         <input type="checkbox" /> <span>Kemasan masih utuh dan tidak rusak</span>
                       </label>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                         <input type="checkbox" /> <span>Warna, bau, dan tekstur normal</span>
                       </label>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <input type="checkbox" /> <span>Belum melewati batas kedaluwarsa maksimal 2 hari</span>
                       </label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setAddMode(null); }}>Batal</button>
                    <button className="btn-primary">Simpan Produk</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
