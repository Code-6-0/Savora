"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  Leaf,
  Package,
  PiggyBank,
  Search,
  ShoppingBag,
  Sun,
  Weight,
} from "lucide-react";
import { computeImpactSummary } from "@/lib/impact";

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
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  try {
    const response = await fetch(`${baseUrl}/api/orders`, {
      credentials: "include",
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json"))
      throw new Error("API orders tidak tersedia");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Respons orders tidak valid");
    return { orders: data, source: "api" };
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

function AkunHeader() {
  return (
    <header className="savora-topbar">
      <Link
        className="savora-brand"
        href="/marketplace"
        aria-label="Savora marketplace"
      >
        <span className="savora-brand-mark">S</span>
        <span>
          {" "}
          Savora <small>FOOD RESCUE</small>
        </span>
      </Link>
      <nav className="savora-main-nav" aria-label="Navigasi marketplace">
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/akun" aria-current="page">
          Riwayat &amp; Impact
        </Link>
      </nav>
      <button
        className="savora-icon-button"
        type="button"
        aria-label="Tema terang demo"
      >
        <Sun size={18} />
      </button>
      <button className="savora-cart" type="button" aria-label="Keranjang demo">
        <ShoppingBag size={19} /> <b>2</b>
      </button>
      <button className="savora-login" type="button">
        Masuk
      </button>
      <button className="savora-signup" type="button">
        Daftar
      </button>
    </header>
  );
}

function ImpactCards({ impact }) {
  return (
    <section
      className="savora-akun-impact"
      aria-labelledby="impact-title"
    >
      <div className="savora-akun-impact-head">
        <Leaf size={16} aria-hidden="true" />
        <h2 id="impact-title">Dampak Personal Kamu</h2>
      </div>

      <div className="savora-akun-cards">
        <div className="savora-akun-card">
          <span className="savora-akun-card-icon savora-akun-green">
            <Package size={22} aria-hidden="true" />
          </span>
          <b className="savora-akun-card-value">{impact.totalPortions}</b>
          <span className="savora-akun-card-label">Porsi Diselamatkan</span>
        </div>

        <div className="savora-akun-card">
          <span className="savora-akun-card-icon savora-akun-lime">
            <PiggyBank size={22} aria-hidden="true" />
          </span>
          <b className="savora-akun-card-value">
            {formatRupiah(impact.totalSaved)}
          </b>
          <span className="savora-akun-card-label">Total Hemat</span>
        </div>

        <div className="savora-akun-card">
          <span className="savora-akun-card-icon savora-akun-yellow">
            <Weight size={22} aria-hidden="true" />
          </span>
          <b className="savora-akun-card-value">{impact.estimatedKg} kg</b>
          <span className="savora-akun-card-label">
            Makanan Terselamatkan
          </span>
        </div>
      </div>

      <p className="savora-akun-disclaimer">
        Estimasi berbasis transaksi — bukan klaim resmi.
      </p>
    </section>
  );
}

function OrderTable({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="savora-akun-empty">
        <b>Belum ada riwayat order.</b>
        <span>Mulai selamatkan makanan dari marketplace!</span>
      </div>
    );
  }

  return (
    <div className="savora-akun-table-wrap">
      <table className="savora-akun-table">
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
                <td className="savora-akun-order-id">{order.id}</td>
                <td>{order.product_name || "—"}</td>
                <td>{order.vendor || order.umkm_name || "—"}</td>
                <td>{order.quantity ?? "—"}</td>
                <td className="savora-akun-price">
                  {formatRupiah(order.total_price || 0)}
                </td>
                <td>
                  <span className={`savora-akun-status ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="savora-akun-date">
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

  const impact = computeImpactSummary(orders);

  return (
    <div className="savora-marketplace">
      <AkunHeader />

      <main className="savora-akun-main">
        <div className="savora-akun-back-row">
          <Link href="/marketplace" className="savora-back">
            <ArrowLeft size={15} aria-hidden="true" /> Kembali ke Marketplace
          </Link>
        </div>

        <h1 className="savora-akun-title">Riwayat &amp; Impact</h1>
        <p className="savora-akun-subtitle">
          Pantau kontribusimu dalam menyelamatkan makanan surplus dari UMKM
          lokal.
        </p>

        {!isLoading && <ImpactCards impact={impact} />}

        <section aria-labelledby="order-history-title">
          <h2 id="order-history-title" className="savora-akun-section-title">
            <Clock3 size={16} aria-hidden="true" /> Riwayat Order
          </h2>

          {dataSource === "fallback" && !isLoading && (
            <div className="savora-fallback-banner" role="status">
              <span>Menampilkan data demo — server tidak terjangkau</span>
            </div>
          )}

          {isLoading ? (
            <div className="savora-akun-loading">Memuat riwayat…</div>
          ) : (
            <OrderTable orders={orders} />
          )}
        </section>
      </main>

      <footer className="savora-footer">
        <div className="savora-brand">
          <span className="savora-brand-mark">S</span>
          <span>
            Savora <small>FOOD RESCUE</small>
          </span>
        </div>
        <p>
          Selamatkan makanan, hemat biaya, kurangi limbah.
          <br />
          Marketplace food rescue untuk UMKM kuliner lokal.
        </p>
        <span>© 2026 Savora. Karya CODE 6.0.</span>
      </footer>
    </div>
  );
}
