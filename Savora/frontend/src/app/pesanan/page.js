"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Calendar, MapPin, Phone, MessageSquare, AlertTriangle, CheckCircle2, ChevronRight, Download, Package } from "lucide-react";
import TopHeader from "@/components/organisms/TopHeader";
import Badge from "@/components/atoms/Badge";

export default function PesananPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("Pesanan Aktif");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFilter, setDateFilter] = useState("Hari Ini");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  useEffect(() => {
    // Mock data for UI presentation based on new designs
    setOrders([
      { id: "SVR-0892", customer: "Rina Marlina", phone: "0812-3456-7890", items: [{name: "Nasi Padang Box", qty: 3, price: 25000}], total: 75000, status: "Menunggu", time: "13:45", date: "9 Jul 2026", payment: "GoPay" },
      { id: "SVR-0891", customer: "Budi Santoso", phone: "0811-2233-4455", items: [{name: "Mie Ayam Spesial", qty: 2, price: 24000}], total: 48000, status: "Diproses", time: "13:20", date: "9 Jul 2026", payment: "OVO" },
      { id: "SVR-0890", customer: "Dewi Rahayu", phone: "0899-8877-6655", items: [{name: "Paket Sarapan", qty: 4, price: 24000}], total: 96000, status: "Siap Diambil", time: "12:55", date: "9 Jul 2026", payment: "ShopeePay" },
      { id: "SVR-0889", customer: "Ahmad Fauzi", phone: "0877-6655-4433", items: [{name: "Nasi Box Campur", qty: 1, price: 22000}], total: 22000, status: "Selesai", time: "12:30", date: "9 Jul 2026", payment: "Tunai" },
      { id: "SVR-0888", customer: "Siti Nurhaliza", phone: "0855-4433-2211", items: [{name: "Kue Basah Assorted", qty: 6, price: 9000}], total: 54000, status: "Dibatalkan", time: "11:45", date: "9 Jul 2026", payment: "DANA" },
    ]);
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (newStatus) => {
    if (!selectedOrder) return;
    setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
    setSelectedOrder({ ...selectedOrder, status: newStatus });
    if (newStatus === "Didonasikan" || newStatus === "Dibatalkan") {
      setIsEmergencyModalOpen(false);
      setIsModalOpen(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    let matchesTab = true;
    if (activeTab === "Pesanan Aktif") matchesTab = ["Menunggu", "Diproses", "Siap Diambil"].includes(o.status);
    if (activeTab === "Riwayat Penjualan") matchesTab = o.status === "Selesai";
    if (activeTab === "Riwayat Donasi") matchesTab = o.status === "Didonasikan";
    if (activeTab === "Dibatalkan") matchesTab = o.status === "Dibatalkan";

    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus ? o.status === filterStatus : true;
    const matchesDate = dateFilter === "Hari Ini" ? o.date === "9 Jul 2026" : true;

    return matchesTab && matchesSearch && matchesFilter && matchesDate;
  });

  const statuses = [...new Set(orders.map(o => o.status))];

  return (
    <>
      <TopHeader title="Pesanan Masuk" subtitle="Kelola pesanan dari pelanggan, update status pengambilan.">
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input type="text" placeholder="Cari ID Pesanan, Nama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '8px 12px 8px 35px', borderRadius: '20px', border: '1px solid #D1D5DB', width: '250px', fontSize: '0.875rem' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowDateDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '20px', border: '1px solid #D1D5DB', background: filterStatus ? '#ECFDF5' : 'white', color: filterStatus ? '#10B981' : 'inherit', cursor: 'pointer', fontSize: '0.875rem' }}>
              <Filter size={16} /> {filterStatus || "Filter"}
            </button>
            {showFilterDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px', zIndex: 10, minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '5px', cursor: 'pointer', color: !filterStatus ? '#10B981' : 'inherit' }} onClick={() => { setFilterStatus(""); setShowFilterDropdown(false); }}>Semua Status</div>
                {statuses.map(st => (
                  <div key={st} style={{ padding: '5px', cursor: 'pointer', color: filterStatus === st ? '#10B981' : 'inherit' }} onClick={() => { setFilterStatus(st); setShowFilterDropdown(false); }}>{st}</div>
                ))}
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowDateDropdown(!showDateDropdown); setShowFilterDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '20px', border: '1px solid #D1D5DB', background: dateFilter !== "Semua Waktu" ? '#ECFDF5' : 'white', color: dateFilter !== "Semua Waktu" ? '#10B981' : 'inherit', cursor: 'pointer', fontSize: '0.875rem' }}>
              <Calendar size={16} /> {dateFilter}
            </button>
            {showDateDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px', zIndex: 10, minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '5px', cursor: 'pointer', color: dateFilter === 'Hari Ini' ? '#10B981' : 'inherit' }} onClick={() => { setDateFilter("Hari Ini"); setShowDateDropdown(false); }}>Hari Ini</div>
                <div style={{ padding: '5px', cursor: 'pointer', color: dateFilter === 'Minggu Ini' ? '#10B981' : 'inherit' }} onClick={() => { setDateFilter("Minggu Ini"); setShowDateDropdown(false); }}>Minggu Ini</div>
                <div style={{ padding: '5px', cursor: 'pointer', color: dateFilter === 'Bulan Ini' ? '#10B981' : 'inherit' }} onClick={() => { setDateFilter("Bulan Ini"); setShowDateDropdown(false); }}>Bulan Ini</div>
                <div style={{ padding: '5px', cursor: 'pointer', color: dateFilter === 'Semua Waktu' ? '#10B981' : 'inherit' }} onClick={() => { setDateFilter("Semua Waktu"); setShowDateDropdown(false); }}>Semua Waktu</div>
              </div>
            )}
          </div>
        </div>
      </TopHeader>

      <div className="content-area">
        
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '25px', backgroundColor: '#F9FAFB' }}>
            {['Semua', 'Pesanan Aktif', 'Riwayat Penjualan', 'Riwayat Donasi', 'Dibatalkan'].map(tab => (
              <div key={tab} onClick={() => setActiveTab(tab)} style={{ 
                cursor: 'pointer', 
                fontWeight: activeTab === tab ? 600 : 500, 
                color: activeTab === tab ? '#10B981' : '#6B7280',
                borderBottom: activeTab === tab ? '2px solid #10B981' : 'none',
                paddingBottom: '15px',
                marginBottom: '-16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {tab}
                <span style={{ fontSize: '0.75rem', backgroundColor: activeTab === tab ? '#ECFDF5' : '#E5E7EB', color: activeTab === tab ? '#10B981' : '#4B5563', padding: '2px 8px', borderRadius: '12px' }}>
                  {tab === 'Semua' ? orders.length : (tab === 'Pesanan Aktif' ? 3 : (tab === 'Riwayat Penjualan' ? 1 : 0))}
                </span>
              </div>
            ))}
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: '20px' }}>ID PESANAN</th>
                <th>PELANGGAN</th>
                <th>PRODUK</th>
                <th>STATUS</th>
                <th>WAKTU PICKUP</th>
                <th>TOTAL BAYAR</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => openOrderDetails(order)}>
                  <td style={{ paddingLeft: '20px', fontWeight: 600, color: '#10B981' }}>#{order.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customer}</div>
                  </td>
                  <td style={{ color: '#4B5563' }}>
                    {order.items.length > 1 ? `${order.items[0].name} +${order.items.length - 1} lainnya` : order.items[0].name}
                  </td>
                  <td><Badge status={order.status} /></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.time}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{order.date}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatRupiah(order.total)}</td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={(e) => { e.stopPropagation(); openOrderDetails(order); }}>
                      Detail <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Detail Pesanan */}
      {isModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
            
            <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>Detail Pesanan #{selectedOrder.id}</h3>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{selectedOrder.date} • {selectedOrder.time}</div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6B7280' }}>&times;</button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Progress Flow */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', left: '30px', right: '30px', height: '2px', backgroundColor: '#E5E7EB', zIndex: 0 }}></div>
                
                {['Menunggu', 'Diproses', 'Siap Diambil', 'Selesai'].map((step, idx) => {
                  const steps = ['Menunggu', 'Diproses', 'Siap Diambil', 'Selesai'];
                  const currentIndex = steps.indexOf(selectedOrder.status);
                  const isCompleted = idx <= currentIndex;
                  const isActive = idx === currentIndex;
                  
                  return (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: isCompleted ? '#10B981' : 'white', border: isCompleted ? 'none' : '2px solid #D1D5DB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isCompleted && <CheckCircle2 size={20} />}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isCompleted ? '#111827' : '#9CA3AF' }}>{step}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ padding: '15px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#6B7280' }}>Informasi Pelanggan</h4>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '5px' }}>{selectedOrder.customer}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.875rem', color: '#4B5563', marginBottom: '10px' }}><Phone size={14} /> {selectedOrder.phone}</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ flex: 1, padding: '6px', border: '1px solid #10B981', color: '#10B981', backgroundColor: '#ECFDF5', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><MessageSquare size={14} /> Chat</button>
                    <button style={{ flex: 1, padding: '6px', border: '1px solid #3B82F6', color: '#3B82F6', backgroundColor: '#EFF6FF', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><Phone size={14} /> Hubungi</button>
                  </div>
                </div>

                <div style={{ padding: '15px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#6B7280' }}>Informasi Pengambilan</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}><MapPin size={16} /></div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Metode</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Self-Pickup (Ambil Sendiri)</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}><Package size={16} /></div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Waktu Estimasi</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedOrder.time}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '15px', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '0.875rem', color: '#6B7280' }}>Rincian Pesanan</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: idx !== selectedOrder.items.length - 1 ? '1px dashed #E5E7EB' : 'none' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ fontWeight: 600 }}>{item.qty}x</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{formatRupiah(item.price)} / item</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>{formatRupiah(item.price * item.qty)}</div>
                  </div>
                ))}
                
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '15px', marginTop: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.875rem', color: '#4B5563' }}>
                    <span>Subtotal</span>
                    <span>{formatRupiah(selectedOrder.total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.875rem', color: '#4B5563' }}>
                    <span>Biaya Platform</span>
                    <span>Rp 0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #E5E7EB' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>Total Pembayaran</span>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#10B981' }}>{formatRupiah(selectedOrder.total)}</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#6B7280', marginTop: '5px' }}>
                    Dibayar dengan <strong style={{ color: '#374151' }}>{selectedOrder.payment}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedOrder.status !== "Selesai" && selectedOrder.status !== "Dibatalkan" && (
                <div style={{ display: 'flex', gap: '15px' }}>
                  {selectedOrder.status === "Menunggu" && (
                    <button className="btn-primary" onClick={() => handleUpdateStatus("Diproses")} style={{ flex: 1, padding: '12px' }}>Konfirmasi & Proses Pesanan</button>
                  )}
                  {selectedOrder.status === "Diproses" && (
                    <button className="btn-primary" onClick={() => handleUpdateStatus("Siap Diambil")} style={{ flex: 1, padding: '12px' }}>Pesanan Siap Diambil</button>
                  )}
                  {selectedOrder.status === "Siap Diambil" && (
                    <button className="btn-primary" onClick={() => handleUpdateStatus("Selesai")} style={{ flex: 1, padding: '12px' }}>Selesaikan Pesanan</button>
                  )}
                  
                  <button onClick={() => setIsEmergencyModalOpen(true)} style={{ padding: '12px 20px', border: '1px solid #EF4444', color: '#EF4444', backgroundColor: 'white', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertTriangle size={18} /> Darurat (No-Show)
                  </button>
                </div>
              )}
              {selectedOrder.status === "Selesai" && (
                <button className="btn-secondary" style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <Download size={18} /> Download Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Donation Modal (No-Show) */}
      {isEmergencyModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 110, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', textAlign: 'center', padding: '30px' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <AlertTriangle size={30} />
            </div>
            <h3 style={{ margin: '0 0 10px 0' }}>Pelanggan Tidak Datang?</h3>
            <p style={{ color: '#4B5563', fontSize: '0.875rem', marginBottom: '25px', lineHeight: '1.5' }}>
              Jika pelanggan tidak mengambil pesanan (no-show) setelah batas waktu, Anda dapat mengalihkan makanan ini untuk donasi agar tidak menjadi food waste.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" onClick={() => handleUpdateStatus("Didonasikan")} style={{ padding: '12px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                Alihkan ke Donasi Savora
              </button>
              <button className="btn-secondary" onClick={() => handleUpdateStatus("Dibatalkan")} style={{ padding: '12px', width: '100%', color: '#EF4444', borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }}>
                Batalkan & Kembalikan ke Stok
              </button>
              <button onClick={() => setIsEmergencyModalOpen(false)} style={{ padding: '12px', width: '100%', background: 'none', border: 'none', color: '#6B7280', fontWeight: 600, cursor: 'pointer', marginTop: '10px' }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
