"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthGuard } from "@/lib/useAuthGuard";
import {
  Clock3,
  Leaf,
  Package,
  PiggyBank,
  Weight,
} from "lucide-react";
import { computeImpactSummary } from "@/lib/impact";
import { baseUrl } from "@/lib/apiBase.js";
import { useCart } from "@/lib/CartContext";
import { apiGet } from "@/lib/api";
import { getUser, logout, getToken } from "@/lib/auth";
import SavoraNavbar from "@/components/navbar/SavoraNavbar";

// ── Data demo lokal (fallback tanpa backend) ──────────────────────────────
// 3-4 order contoh: campuran Completed & Paid, termasuk service fee 5%.

const DEMO_ORDERS = [
  {
    id: "ORD-20260721-001",
    product_name: "Nasi Campur Bali Spesial",
    vendor: "Warung Bu Ratih",
    quantity: 2,
    original_price: 25000,
    rescue_price: 12000,
    subtotal: 24000,
    service_fee: 1200,
    total_price: 25200,
    status: "Completed",
    created_at: "2026-07-21T12:30:00+07:00",
    completed_at: "2026-07-21T13:15:00+07:00",
  },
  {
    id: "ORD-20260721-002",
    product_name: "Pastry Cokelat Almond",
    vendor: "Sweet Corner Patisserie",
    quantity: 1,
    original_price: 35000,
    rescue_price: 18000,
    subtotal: 18000,
    service_fee: 900,
    total_price: 18900,
    status: "Completed",
    created_at: "2026-07-20T15:00:00+07:00",
    completed_at: "2026-07-20T16:20:00+07:00",
  },
  {
    id: "ORD-20260722-003",
    product_name: "Paket Gorengan Campur",
    vendor: "Kios Mbak Sari",
    quantity: 3,
    original_price: 15000,
    rescue_price: 6000,
    subtotal: 18000,
    service_fee: 900,
    total_price: 18900,
    status: "Paid",
    created_at: "2026-07-22T09:45:00+07:00",
    completed_at: null,
  },
  {
    id: "ORD-20260719-004",
    product_name: "Roti Sourdough Artisan",
    vendor: "Roti Kayu Bakery",
    quantity: 1,
    original_price: 45000,
    rescue_price: 22000,
    subtotal: 22000,
    service_fee: 1100,
    total_price: 23100,
    status: "Completed",
    created_at: "2026-07-19T11:00:00+07:00",
    completed_at: "2026-07-19T12:40:00+07:00",
  },
];

// ── Fetch helper ──────────────────────────────────────────────────────────

async function fetchOrders() {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    // Tambahkan Authorization header jika user sudah login
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl()}/api/orders`, { headers });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json"))
      throw new Error("API orders tidak tersedia");
    const data = await response.json();

    if (data === null) {
      return { orders: [], source: "api" };
    }

    if (!Array.isArray(data)) throw new Error("Respons orders tidak valid");

    // Normalisasi field dari backend ke format yang dipakai UI
    const normalized = data.map(order => ({
      id: order.id || "—",
      product_name: order.product?.name || "—",
      vendor: "—", // UMKM name belum di-preload dari backend, fallback dulu
      umkm_name: "—",
      quantity: order.quantity ?? "—",
      original_price: order.product?.original_price || 0,
      rescue_price: order.product?.rescue_price || 0,
      subtotal: order.subtotal || 0,
      service_fee: order.service_fee || 0,
      total_price: order.total_price || 0,
      status: order.status || "—",
      created_at: order.created_at || null,
      completed_at: order.completed_at || null,
    }));

    return { orders: normalized, source: "api" };
  } catch {
    return { orders: DEMO_ORDERS, source: "fallback" };
  }
}

// ── Format helpers ────────────────────────────────────────────────────────

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const STATUS_STYLES = {
  completed: { label: "Selesai", className: "is-completed" },
  paid: { label: "Dibayar", className: "is-paid" },
  "payment pending": { label: "Menunggu", className: "is-pending" },
  cancelled: { label: "Dibatalkan", className: "is-cancelled" },
  expired: { label: "Kedaluwarsa", className: "is-expired" },
  "no show": { label: "No Show", className: "is-cancelled" },
};

function statusBadge(status) {
  const key = String(status || "").trim().toLowerCase();
  return STATUS_STYLES[key] || { label: status || "—", className: "" };
}

// ── Komponen halaman ──────────────────────────────────────────────────────

function ImpactCards({ impact }) {
  return (
    <section className="beranda-akun-impact" aria-labelledby="impact-title">
      <div className="beranda-akun-impact-head">
        <Leaf size={18} aria-hidden="true" color="#16a34a" />
        <h2 id="impact-title">Dampak Personal Kamu</h2>
      </div>

      <div className="beranda-akun-cards">
        <div className="beranda-akun-card">
          <span className="beranda-akun-card-icon">
            <Package size={24} aria-hidden="true" />
          </span>
          <b className="beranda-akun-card-value">{impact.totalPortions}</b>
          <span className="beranda-akun-card-label">Porsi Diselamatkan</span>
        </div>

        <div className="beranda-akun-card">
          <span className="beranda-akun-card-icon">
            <PiggyBank size={24} aria-hidden="true" />
          </span>
          <b className="beranda-akun-card-value">
            {formatRupiah(impact.totalSaved)}
          </b>
          <span className="beranda-akun-card-label">Total Hemat</span>
        </div>

        <div className="beranda-akun-card">
          <span className="beranda-akun-card-icon">
            <Weight size={24} aria-hidden="true" />
          </span>
          <b className="beranda-akun-card-value">{impact.estimatedKg} kg</b>
          <span className="beranda-akun-card-label">
            Makanan Terselamatkan
          </span>
        </div>
      </div>

      <p className="beranda-akun-disclaimer">
        Estimasi berbasis transaksi — bukan klaim resmi.
      </p>
    </section>
  );
}

function OrderTable({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="beranda-akun-empty">
        <b>Belum ada riwayat order.</b>
        <span>Mulai selamatkan makanan dari marketplace!</span>
      </div>
    );
  }

  return (
    <div className="beranda-akun-table-wrap">
      <table className="beranda-akun-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Produk</th>
            <th>UMKM</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Status</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const badge = statusBadge(order.status);
            return (
              <tr key={order.id}>
                <td className="beranda-akun-order-id">{order.id}</td>
                <td>{order.product_name || "—"}</td>
                <td>{order.vendor || order.umkm_name || "—"}</td>
                <td>{order.quantity ?? "—"}</td>
                <td className="beranda-akun-price">
                  {formatRupiah(order.total_price || 0)}
                </td>
                <td>
                  <span className={`beranda-akun-status ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="beranda-akun-date">
                  {formatDate(order.completed_at || order.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Default export ────────────────────────────────────────────────────────

export default function AkunPage() {
  const { loading: authLoading } = useAuthGuard([]);
  const { count } = useCart();
  const [orders, setOrders] = useState([]);
  const [dataSource, setDataSource] = useState("fallback");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders().then(({ orders: data, source }) => {
      setOrders(data);
      setDataSource(source);
      setIsLoading(false);
    });
  }, []);

  if (authLoading) {
    return <div style={{ padding: '40px', color: '#6B7280' }}>Memuat...</div>;
  }

  const impact = computeImpactSummary(orders);

  return (
    <div style={{ background: "#ffffff", fontFamily: '"Plus Jakarta Sans", sans-serif', minHeight: "100vh" }}>
      <SavoraNavbar />

      <main className="beranda-akun-main">
        <h1 className="beranda-akun-title">Riwayat &amp; Impact</h1>
        <p className="beranda-akun-subtitle">
          Pantau kontribusimu dalam menyelamatkan makanan surplus dari UMKM lokal.
        </p>

        {!isLoading && <ImpactCards impact={impact} />}

        <section aria-labelledby="order-history-title">
          <h2 id="order-history-title" className="beranda-akun-section-title">
            <Clock3 size={18} aria-hidden="true" color="#16a34a" /> Riwayat Order
          </h2>

          {dataSource === "fallback" && !isLoading && (
            <div className="beranda-akun-fallback" role="status">
              <span>Menampilkan data demo — server tidak terjangkau</span>
            </div>
          )}

          {isLoading ? (
            <div className="beranda-akun-loading">Memuat riwayat…</div>
          ) : (
            <OrderTable orders={orders} />
          )}
        </section>
      </main>

      <footer className="beranda-footer">
        <div className="beranda-footer-container">
          <div className="beranda-footer-column-brand">
            <div className="beranda-footer-wordmark">Savora</div>
            <p className="beranda-footer-mission">
              Misi kami sederhana: Tidak boleh ada makanan enak yang terbuang sia-sia.
              Bergabunglah dengan ribuan penyelamat makanan lainnya di seluruh Indonesia.
            </p>
          </div>
          <div className="beranda-footer-column">
            <h4>Layanan Kami</h4>
            <Link href="/marketplace">Daftar Marketplace</Link>
          </div>
          <div className="beranda-footer-column">
            <h4>Informasi</h4>
            <Link href="/marketplace">Tentang Kami</Link>
          </div>
        </div>
        <div className="beranda-footer-bottom">
          <span>© 2026 Savora Platform. Proudly Made In Indonesia for the Earth.</span>
        </div>
      </footer>
    </div>
  );
}
