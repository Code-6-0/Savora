"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, ArrowUpDown, Clock, CheckCircle2, AlertTriangle, AlertCircle, BarChart2, Lightbulb, TrendingUp, Sparkles, Image as ImageIcon, Camera, Package, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

import TopHeader from "@/components/organisms/TopHeader";
import Badge from "@/components/atoms/Badge";
import { fetchUMKMProducts, createProduct, updateProduct, deleteProduct, fallbackProducts } from "@/lib/products";
import { isoToDatetimeLocal, datetimeLocalToISO, validateProductDates, detectExpiryExtension } from "@/lib/dateValidation";

export default function ProdukPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMode, setAddMode] = useState(null); // 'manual' or 'ai'
  const [editingProductId, setEditingProductId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState([]);
  const [expiryExtensionWarning, setExpiryExtensionWarning] = useState(null);
  const [isProductionTimeEditable, setIsProductionTimeEditable] = useState(false);
  const [originalProductData, setOriginalProductData] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const data = await fetchUMKMProducts(1, true); // Enable fallback to dummy data
      setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const [newProduct, setNewProduct] = useState({ 
    name: "", category: "Makanan Siap Saji", original_price: "", rescue_price: "", stock: "",
    production_time: "", expires_at: "", packaging_condition: "Standar", storage_method: "Sesuai"
  });

  const calculateFoodTrustStatus = (prod) => {
    if (!prod.production_time || !prod.expires_at) return "Menunggu Data";
    const prodTime = new Date(prod.production_time).getTime();
    const expTime = new Date(prod.expires_at).getTime();
    const now = new Date().getTime();
    const totalLifespan = expTime - prodTime;
    const remainingTime = expTime - now;

    let f = 0;
    if (totalLifespan > 0) {
      f = remainingTime / totalLifespan;
    }

    if (f <= 0 || prod.packaging_condition === "Rusak") return "Tidak Layak Konsumsi";
    if (f < 0.15 || prod.storage_method === "Tidak Sesuai") return "Tidak Disarankan Dijual";
    if (f < 0.40) return "Segera Dijual";
    if (f < 0.75 || prod.packaging_condition === "Standar") return "Layak Dijual";
    if (f >= 0.75 && prod.packaging_condition === "Baik" && prod.storage_method === "Sesuai") return "Fresh";
    return "Layak Dijual";
  };

  const getFtiBadgeColor = (status) => {
    switch (status) {
      case "Fresh": return { bg: '#D1FAE5', text: '#10B981' };
      case "Layak Dijual": return { bg: '#DBEAFE', text: '#3B82F6' };
      case "Segera Dijual": return { bg: '#FEF3C7', text: '#D97706' };
      case "Tidak Disarankan Dijual": return { bg: '#FEE2E2', text: '#EF4444' };
      case "Tidak Layak Konsumsi": return { bg: '#F3F4F6', text: '#4B5563' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const currentFtiStatus = calculateFoodTrustStatus(newProduct);
  const ftiColor = getFtiBadgeColor(currentFtiStatus);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category) return;
    
    // Reset validation state
    setValidationErrors([]);
    setExpiryExtensionWarning(null);
    
    // Convert datetime-local to ISO
    const productionTimeISO = datetimeLocalToISO(newProduct.production_time);
    const expiresAtISO = datetimeLocalToISO(newProduct.expires_at);
    
    // Validate dates
    const validation = validateProductDates(productionTimeISO, expiresAtISO);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return; // Stop submission
    }
    
    // Check for expiry extension warning (only in edit mode)
    if (editingProductId && originalProductData?.expires_at) {
      const extension = detectExpiryExtension(originalProductData.expires_at, expiresAtISO);
      if (extension.extended) {
        setExpiryExtensionWarning("Memperpanjang waktu kedaluwarsa akan menaikkan Rescue Timer & Score. Pastikan sesuai kondisi makanan sebenarnya.");
      }
    }
    
    // Prepare product data for API
    const productData = {
      umkm_id: 1, // TODO: Get from auth context
      name: newProduct.name,
      category: newProduct.category,
      original_price: parseInt(newProduct.original_price) || 0,
      rescue_price: parseInt(newProduct.rescue_price) || 0,
      stock: parseInt(newProduct.stock) || 0,
      production_time: productionTimeISO,
      expires_at: expiresAtISO,
      packaging_condition: newProduct.packaging_condition || "Standar",
      storage_method: newProduct.storage_method || "Sesuai",
      status: currentFtiStatus === "Tidak Layak Konsumsi" ? "Limbah" : "Aktif",
    };
    
    try {
      if (editingProductId) {
        // Update existing product
        const updatedProduct = await updateProduct(editingProductId, productData);
        if (updatedProduct) {
          // Refetch all products to ensure timer/score are updated
          const refreshedProducts = await fetchUMKMProducts(1);
          setProducts(refreshedProducts);
        }
      } else {
        // Create new product
        const createdProduct = await createProduct(productData);
        if (createdProduct) {
          // Refetch all products
          const refreshedProducts = await fetchUMKMProducts(1);
          setProducts(refreshedProducts);
        }
      }

      setNewProduct({ name: "", category: "Makanan Siap Saji", original_price: "", rescue_price: "", stock: "", production_time: "", expires_at: "", packaging_condition: "Standar", storage_method: "Sesuai" });
      setIsModalOpen(false);
      setAddMode(null);
      setEditingProductId(null);
      setOriginalProductData(null);
      setValidationErrors([]);
      setExpiryExtensionWarning(null);
    } catch (error) {
      // Show API error as validation error
      setValidationErrors([error.message || "Gagal menyimpan produk"]);
    }
  };

  const handleEditClick = (p) => {
    setEditingProductId(p.id);
    
    // Store original data for comparison
    setOriginalProductData({
      production_time: p.production_time,
      expires_at: p.expires_at
    });
    
    // Populate form with existing data, converting ISO to datetime-local
    setNewProduct({
      name: p.name,
      category: p.category,
      original_price: p.original_price || "",
      rescue_price: p.rescue_price || "",
      stock: p.stock || "",
      production_time: isoToDatetimeLocal(p.production_time),
      expires_at: isoToDatetimeLocal(p.expires_at),
      packaging_condition: p.packaging_condition || "Standar",
      storage_method: p.storage_method || "Sesuai"
    });
    
    // Reset validation states
    setValidationErrors([]);
    setExpiryExtensionWarning(null);
    setIsProductionTimeEditable(false);
    
    setAddMode('manual');
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    }
  };

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
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => router.push('/produk/tambah')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={16} /> Tambah Produk
            </button>
          </div>
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
                    {p.photo_url && p.photo_url !== 'EMPTY' ? (
                      <img src={p.photo_url} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}></div>
                    )}
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
                  <td style={{ padding: '15px' }}>
                        {p.ftiStatus && (
                           <div style={{ marginBottom: '5px' }}>
                             <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: getFtiBadgeColor(p.ftiStatus).bg, color: getFtiBadgeColor(p.ftiStatus).text, fontWeight: 600 }}>{p.ftiStatus}</span>
                           </div>
                        )}
                        <span style={{ color: p.status === 'Aktif' ? '#10B981' : p.status === 'Hampir Habis' ? '#F59E0B' : '#EF4444', fontWeight: 500, fontSize: '0.875rem' }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => handleEditClick(p)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }} title="Edit"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteProduct(p.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Hapus"><Trash2 size={16} /></button>
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
        {products.filter(p => p && p.score < 50).length > 0 && (
        <div style={{ border: '1px solid #FECACA', backgroundColor: '#FEF2F2', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={18} /></div>
              <div>
                <div style={{ fontWeight: 700, color: '#991B1B' }}>Peringatan Produk Kritis</div>
                <div style={{ fontSize: '0.75rem', color: '#B91C1C' }}>Rescue Score rendah — tindakan segera diperlukan untuk menghindari food waste</div>
              </div>
            </div>
            <Badge type="critical" customStyle={{ borderRadius: '20px' }}>{products.filter(p => p && p.score < 50).length} produk</Badge>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {products.filter(p => p && p.score < 50).slice(0, 3).map((p, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #FEE2E2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '30%' }}>
                  {p.photo_url && p.photo_url !== 'EMPTY' ? (
                    <img src={p.photo_url} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}></div>
                  )}
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
        )}

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
              <h3 style={{ margin: 0 }}>{editingProductId ? "Edit Produk" : "Tambah Produk Baru"}</h3>
              <button onClick={() => { setIsModalOpen(false); setAddMode(null); setEditingProductId(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6B7280' }}>&times;</button>
            </div>
            
            <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Nama Produk</label>
                    <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Kategori</label>
                      <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Stok</label>
                      <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Harga Normal</label>
                      <input type="number" value={newProduct.original_price} onChange={(e) => setNewProduct({...newProduct, original_price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Harga Rescue</label>
                      <input type="number" value={newProduct.rescue_price} onChange={(e) => setNewProduct({...newProduct, rescue_price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '10px', borderTop: '1px solid #E5E7EB', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={{ margin: 0 }}>Food Trust Index Metadata</h4>
                      <div style={{ backgroundColor: ftiColor.bg, color: ftiColor.text, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                        Status: {currentFtiStatus}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Waktu Masak / Produksi</label>
                          {editingProductId && !isProductionTimeEditable && (
                            <button
                              type="button"
                              onClick={() => setIsProductionTimeEditable(true)}
                              style={{ fontSize: '0.75rem', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Koreksi
                            </button>
                          )}
                        </div>
                        <input
                          type="datetime-local"
                          value={newProduct.production_time}
                          onChange={(e) => setNewProduct({...newProduct, production_time: e.target.value})}
                          disabled={editingProductId && !isProductionTimeEditable}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: (editingProductId && !isProductionTimeEditable) ? '#F9FAFB' : '#fff', cursor: (editingProductId && !isProductionTimeEditable) ? 'not-allowed' : 'text' }}
                        />
                        {editingProductId && isProductionTimeEditable && (
                          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px', marginBottom: 0 }}>
                            Waktu produksi hanya diubah untuk koreksi salah input
                          </p>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Waktu Kedaluwarsa *</label>
                        <input
                          type="datetime-local"
                          value={newProduct.expires_at}
                          onChange={(e) => setNewProduct({...newProduct, expires_at: e.target.value})}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: validationErrors.length > 0 ? '1px solid #EF4444' : '1px solid #D1D5DB' }}
                        />
                      </div>
                    </div>
                    
                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                      <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '8px', padding: '10px', marginBottom: '15px' }}>
                        {validationErrors.map((err, idx) => (
                          <p key={idx} style={{ fontSize: '0.875rem', color: '#991B1B', margin: 0, marginBottom: idx < validationErrors.length - 1 ? '4px' : 0 }}>
                            • {err}
                          </p>
                        ))}
                      </div>
                    )}
                    
                    {/* Expiry Extension Warning */}
                    {expiryExtensionWarning && (
                      <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '10px', marginBottom: '15px' }}>
                        <p style={{ fontSize: '0.875rem', color: '#92400E', margin: 0 }}>
                          ⚠️ {expiryExtensionWarning}
                        </p>
                      </div>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Kondisi Kemasan</label>
                        <select value={newProduct.packaging_condition} onChange={(e) => setNewProduct({...newProduct, packaging_condition: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                          <option value="Baik">Baik</option>
                          <option value="Standar">Standar</option>
                          <option value="Rusak">Rusak</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '5px' }}>Metode Penyimpanan</label>
                        <select value={newProduct.storage_method} onChange={(e) => setNewProduct({...newProduct, storage_method: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                          <option value="Sesuai">Sesuai SOP</option>
                          <option value="Tidak Sesuai">Tidak Sesuai SOP</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setAddMode(null); setEditingProductId(null); }}>Batal</button>
                    <button className="btn-primary" onClick={handleAddProduct}>Simpan Produk</button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}
    </>
  );
}
