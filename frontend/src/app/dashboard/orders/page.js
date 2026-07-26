"use client";

import { useState, useEffect } from "react";
import { useAuthGuard } from "@/lib/useAuthGuard";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, Package, XCircle, Search } from "lucide-react";

export default function DashboardOrdersPage() {
  const { loading: authLoading } = useAuthGuard(['UMKM'], { checkVerification: true });
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  if (authLoading) {
    return <div style={{ padding: '40px', color: '#6B7280' }}>Memuat...</div>;
  }

  const fetchOrders = async () => {
    setIsLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${baseUrl}/api/orders`);
      if (!response.ok) throw new Error("Gagal mengambil data pesanan");
      const data = await response.json();
      // Asumsikan data adalah array of orders
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    setProcessingId(id);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${baseUrl}/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Gagal update status");
      }
      alert("Status pesanan berhasil diperbarui!");
      fetchOrders(); // Refresh data
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const validatePickupCode = async (id) => {
    if (!pickupCodeInput) {
      alert("Masukkan kode pickup!");
      return;
    }
    setProcessingId(id);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    try {
      const response = await fetch(`${baseUrl}/api/orders/${id}/validate-pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup_code: pickupCodeInput }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Kode pickup tidak valid");
      }
      alert("Pickup berhasil, pesanan selesai!");
      setPickupCodeInput("");
      setActiveOrderId(null);
      fetchOrders(); // Refresh data
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  };

  const STATUS_LABELS = {
    "CREATED": "Baru",
    "PAYMENT_PENDING": "Menunggu Pembayaran",
    "PAID": "Dibayar",
    "READY_FOR_PICKUP": "Siap Diambil",
    "COMPLETED": "Selesai",
    "CANCELLED": "Dibatalkan",
    "EXPIRED": "Kedaluwarsa",
    "NO_SHOW": "No Show"
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "ALL") return true;
    if (filter === "PAID" && o.status === "PAID") return true;
    if (filter === "READY" && o.status === "READY_FOR_PICKUP") return true;
    if (filter === "COMPLETED" && o.status === "COMPLETED") return true;
    return false;
  });

  return (
    <div className="savora-marketplace" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Manajemen Pesanan UMKM</h1>
        <Link href="/analitik" style={{ color: '#10B981', textDecoration: 'none', fontWeight: 500 }}>
          Kembali ke Dashboard
        </Link>
      </header>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setFilter("ALL")} 
          style={{ padding: '8px 16px', borderRadius: '20px', border: filter === "ALL" ? 'none' : '1px solid #D1D5DB', backgroundColor: filter === "ALL" ? '#10B981' : 'transparent', color: filter === "ALL" ? '#FFF' : '#374151', cursor: 'pointer' }}>
          Semua Pesanan
        </button>
        <button 
          onClick={() => setFilter("PAID")} 
          style={{ padding: '8px 16px', borderRadius: '20px', border: filter === "PAID" ? 'none' : '1px solid #D1D5DB', backgroundColor: filter === "PAID" ? '#10B981' : 'transparent', color: filter === "PAID" ? '#FFF' : '#374151', cursor: 'pointer' }}>
          Pesanan Baru (Perlu Disiapkan)
        </button>
        <button 
          onClick={() => setFilter("READY")} 
          style={{ padding: '8px 16px', borderRadius: '20px', border: filter === "READY" ? 'none' : '1px solid #D1D5DB', backgroundColor: filter === "READY" ? '#10B981' : 'transparent', color: filter === "READY" ? '#FFF' : '#374151', cursor: 'pointer' }}>
          Siap Diambil
        </button>
        <button 
          onClick={() => setFilter("COMPLETED")} 
          style={{ padding: '8px 16px', borderRadius: '20px', border: filter === "COMPLETED" ? 'none' : '1px solid #D1D5DB', backgroundColor: filter === "COMPLETED" ? '#10B981' : 'transparent', color: filter === "COMPLETED" ? '#FFF' : '#374151', cursor: 'pointer' }}>
          Selesai
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Memuat data pesanan...</div>
      ) : (
        <div style={{ backgroundColor: '#FFF', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
              Tidak ada pesanan untuk filter ini.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem' }}>ID Pesanan</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem' }}>Produk</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem' }}>Waktu Order</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem' }}>Status</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.875rem' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 500 }}>ORD-{order.id}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>
                      {order.product?.name || `Product ID ${order.product_id}`} <br/>
                      <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>Qty: {order.quantity} | Total: {formatRupiah(order.total_price)}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>{formatDate(order.created_at)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: order.status === 'COMPLETED' ? '#ECFDF5' : order.status === 'READY_FOR_PICKUP' ? '#FEF3C7' : '#F3F4F6',
                        color: order.status === 'COMPLETED' ? '#10B981' : order.status === 'READY_FOR_PICKUP' ? '#D97706' : '#4B5563'
                      }}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>
                      {order.status === "PAID" && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, "READY_FOR_PICKUP")}
                          disabled={processingId === order.id}
                          style={{ padding: '6px 12px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                          {processingId === order.id ? "Memproses..." : "Siapkan Pesanan"}
                        </button>
                      )}
                      {order.status === "READY_FOR_PICKUP" && (
                        <div>
                          {activeOrderId === order.id ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="text" 
                                placeholder="Kode Pickup"
                                value={pickupCodeInput}
                                onChange={e => setPickupCodeInput(e.target.value)}
                                style={{ padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: '4px', width: '100px' }}
                              />
                              <button 
                                onClick={() => validatePickupCode(order.id)}
                                disabled={processingId === order.id}
                                style={{ padding: '4px 8px', backgroundColor: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Validasi
                              </button>
                              <button 
                                onClick={() => { setActiveOrderId(null); setPickupCodeInput(""); }}
                                style={{ padding: '4px 8px', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setActiveOrderId(order.id)}
                              style={{ padding: '6px 12px', backgroundColor: '#3B82F6', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                              Input Pickup Code
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
