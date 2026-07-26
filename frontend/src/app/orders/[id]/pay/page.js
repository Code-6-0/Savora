"use client";

import { useState, useEffect } from "react";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  RefreshCw,
  Store,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { getOrderDetail, normalizeOrder } from "@/lib/orders";

// Format currency
function formatRupiah(value) {
  if (!value && value !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Format date/time
function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Countdown timer for payment expiry
function PaymentTimer({ expiresAt, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(expiresAt);
      const diff = target - now;

      if (diff <= 0) {
        if (onExpired) onExpired();
        return { expired: true };
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return { minutes, seconds, expired: false };
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  if (!timeLeft || timeLeft.expired) {
    return (
      <div className="savora-payment-timer expired">
        <Clock size={16} aria-hidden="true" />
        <span>Waktu pembayaran habis</span>
      </div>
    );
  }

  const isUrgent = timeLeft.minutes < 5;

  return (
    <div className={`savora-payment-timer ${isUrgent ? "urgent" : ""}`}>
      <Clock size={16} aria-hidden="true" />
      <span>
        Bayar dalam {timeLeft.minutes.toString().padStart(2, "0")}:
        {timeLeft.seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

// Loading skeleton
function PaymentSkeleton() {
  return (
    <div className="savora-payment-skeleton">
      <div className="savora-skeleton-header">
        <div className="savora-skeleton-line" style={{ width: "200px" }}></div>
      </div>
      <div className="savora-skeleton-content">
        <div className="savora-skeleton-line" style={{ width: "100%" }}></div>
        <div className="savora-skeleton-line" style={{ width: "80%" }}></div>
        <div className="savora-skeleton-line" style={{ width: "60%" }}></div>
      </div>
    </div>
  );
}

// Payment pending state
function PaymentPendingState({ order, onRefresh }) {
  return (
    <div className="savora-payment-state pending">
      <div className="savora-payment-icon">
        <Clock size={48} aria-hidden="true" />
      </div>
      <h2>Menunggu Pembayaran</h2>
      <p>Silakan selesaikan pembayaran melalui Xendit untuk melanjutkan.</p>

      {order.paymentUrl && (
        <a
          href={order.paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="savora-payment-button primary"
        >
          <CreditCard size={20} aria-hidden="true" />
          Bayar Sekarang
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      )}

      <button onClick={onRefresh} className="savora-payment-button secondary">
        <RefreshCw size={18} aria-hidden="true" />
        Refresh Status
      </button>

      <div className="savora-payment-breakdown">
        <h3>Detail Pembayaran</h3>
        <div className="savora-payment-line">
          <span>Order ID</span>
          <span>#{order.id}</span>
        </div>
        <div className="savora-payment-line">
          <span>Subtotal</span>
          <span>{formatRupiah(order.subtotal)}</span>
        </div>
        <div className="savora-payment-line">
          <span>Service Fee (5%)</span>
          <span>{formatRupiah(order.serviceFee)}</span>
        </div>
        <div className="savora-payment-line total">
          <span>Total Pembayaran</span>
          <span>{formatRupiah(order.totalPrice)}</span>
        </div>
      </div>

      {order.reservedUntil && (
        <PaymentTimer expiresAt={order.reservedUntil} />
      )}
    </div>
  );
}

// Payment success (paid) state
function PaymentSuccessState({ order }) {
  return (
    <div className="savora-payment-state success">
      <div className="savora-payment-icon">
        <CheckCircle size={48} aria-hidden="true" />
      </div>
      <h2>Pembayaran Berhasil!</h2>
      <p>Pesanan Anda sudah dikonfirmasi. Silakan ambil pesanan sesuai jadwal.</p>

      {order.pickupCode && (
        <div className="savora-pickup-code">
          <h3>Kode Pickup</h3>
          <div className="savora-code-display">{order.pickupCode}</div>
          <p className="savora-code-instruction">
            Tunjukkan kode ini ke UMKM saat mengambil pesanan
          </p>
        </div>
      )}

      {order.product && (
        <div className="savora-payment-product">
          <h3>Detail Pesanan</h3>
          <div className="savora-product-summary">
            {order.product.photoUrl && (
              <Image
                src={order.product.photoUrl}
                alt={order.product.name}
                width={60}
                height={60}
                className="savora-product-thumb"
              />
            )}
            <div className="savora-product-info">
              <h4>{order.product.name}</h4>
              <p>
                <Store size={14} aria-hidden="true" /> UMKM
              </p>
              <p>
                <MapPin size={14} aria-hidden="true" />
                {order.product.pickupAddress}
              </p>
            </div>
          </div>
        </div>
      )}

      {order.pickupDeadline && (
        <div className="savora-pickup-deadline">
          <Clock size={16} aria-hidden="true" />
          <span>Ambil sebelum: {formatDateTime(order.pickupDeadline)}</span>
        </div>
      )}

      <Link href="/marketplace" className="savora-payment-button secondary">
        Kembali ke Marketplace
      </Link>
    </div>
  );
}

// Payment failed/expired state
function PaymentFailedState({ order, status }) {
  const isExpired = status === "EXPIRED";
  const title = isExpired ? "Pembayaran Kedaluwarsa" : "Pembayaran Gagal";
  const message = isExpired
    ? "Waktu pembayaran telah habis. Silakan buat pesanan baru."
    : "Pembayaran tidak dapat diproses. Silakan coba lagi.";

  return (
    <div className="savora-payment-state failed">
      <div className="savora-payment-icon">
        {isExpired ? (
          <AlertTriangle size={48} aria-hidden="true" />
        ) : (
          <XCircle size={48} aria-hidden="true" />
        )}
      </div>
      <h2>{title}</h2>
      <p>{message}</p>

      <div className="savora-payment-actions">
        <Link
          href={`/marketplace/${order.product?.id || ""}`}
          className="savora-payment-button primary"
        >
          Pesan Lagi
        </Link>
        <Link href="/marketplace" className="savora-payment-button secondary">
          Kembali ke Marketplace
        </Link>
      </div>
    </div>
  );
}

// Main payment page component
export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuthGuard([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  const orderId = parseInt(params?.id);

  // Load order detail
  const loadOrder = async () => {
    try {
      const data = await getOrderDetail(orderId);
      const normalized = normalizeOrder(data);
      setOrder(normalized);
      setError(null);
      return normalized;
    } catch (err) {
      console.error("Failed to load order:", err);
      setError("Gagal memuat detail pesanan");
      throw err;
    }
  };

  // Initial load
  useEffect(() => {
    if (!orderId) {
      setError("Order ID tidak valid");
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        await loadOrder();
      } catch (err) {
        // Error already handled in loadOrder
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [orderId]);

  // Polling for payment status updates
  useEffect(() => {
    if (!order || loading) return;

    // Only poll if payment is pending
    if (order.paymentStatus !== "PENDING") {
      setPolling(false);
      return;
    }

    setPolling(true);

    // Poll every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const updated = await loadOrder();
        // Stop polling if payment is no longer pending
        if (updated.paymentStatus !== "PENDING") {
          clearInterval(pollInterval);
          setPolling(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Continue polling despite errors
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      setPolling(false);
    };
  }, [order?.paymentStatus, loading]);

  if (authLoading) {
    return <div style={{ padding: '40px', color: '#6B7280' }}>Memuat...</div>;
  }

  // Manual refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      await loadOrder();
    } catch (err) {
      // Error handled in loadOrder
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !order) {
    return (
      <div className="savora-payment-page">
        <header className="savora-topbar">
          <Link href="/marketplace" className="savora-back-button">
            <ArrowLeft size={20} aria-hidden="true" /> Marketplace
          </Link>
        </header>
        <PaymentSkeleton />
      </div>
    );
  }

  // Error state
  if (error && !order) {
    return (
      <div className="savora-payment-page">
        <header className="savora-topbar">
          <Link href="/marketplace" className="savora-back-button">
            <ArrowLeft size={20} aria-hidden="true" /> Kembali
          </Link>
        </header>
        <div className="savora-error-container">
          <p>{error}</p>
          <Link href="/marketplace" className="savora-payment-button">
            Kembali ke Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Render based on payment status
  const renderContent = () => {
    if (!order) return null;

    const status = order.status || order.paymentStatus;

    if (status === "PAID" || status === "READY_FOR_PICKUP") {
      return <PaymentSuccessState order={order} />;
    }

    if (status === "EXPIRED" || status === "PAYMENT_FAILED") {
      return <PaymentFailedState order={order} status={status} />;
    }

    // Default: PAYMENT_PENDING
    return <PaymentPendingState order={order} onRefresh={handleRefresh} />;
  };

  return (
    <div className="savora-payment-page">
      <header className="savora-topbar">
        <Link href="/marketplace" className="savora-back-button">
          <ArrowLeft size={20} aria-hidden="true" /> Marketplace
        </Link>
        <h1>Status Pembayaran</h1>
        {polling && (
          <span className="savora-polling-indicator" title="Memperbarui status...">
            <RefreshCw size={16} className="spin" aria-hidden="true" />
          </span>
        )}
      </header>

      <main className="savora-payment-main">
        <div className="savora-payment-container">{renderContent()}</div>
      </main>
    </div>
  );
}
