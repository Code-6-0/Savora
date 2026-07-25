"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  ChefHat,
  ChevronDown,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  MessageSquare,
  Minus,
  Phone,
  Plus,
  ShoppingCart,
  Store,
  User,
  ShieldCheck,
} from "lucide-react";
import { createOrder, normalizeOrder } from "@/lib/orders";
import { fetchMarketplaceProduct } from "@/lib/marketplace";
import { useCart } from "@/lib/CartContext";

function formatRupiah(value) {
  if (!value && value !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function BerandaNavbar({ count }) {
  return (
    <header className="beranda-navbar">
      <div className="beranda-navbar-container">
        <div className="beranda-brand">
          <img
            src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png"
            alt="Savora Logo"
            className="beranda-logo-img"
          />
          <span className="beranda-brand-text">Savora</span>
        </div>
        <nav className="beranda-nav">
          <Link href="/">Home</Link>
          <Link href="/marketplace" className="nav-active">
            Marketplace
          </Link>
          <a href="#mitra">Mitra</a>
          <a href="#tentang">Tentang</a>
          <Link href="/akun">Impact</Link>
        </nav>
        <button className="beranda-location">
          <MapPin size={14} />
          <span>Masukkan Alamat Kamu</span>
          <ChevronDown size={13} />
        </button>
        <div className="beranda-actions">
          <Link
            href="/cart"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: count > 0 ? "#eaf8ec" : "transparent",
              transition: "background-color 0.2s",
            }}
          >
            <ShoppingCart size={20} color={count > 0 ? "#16a34a" : "#6b7280"} />
            {count > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  backgroundColor: "#16a34a",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "700",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid white",
                }}
              >
                {count}
              </span>
            )}
          </Link>
          <Link href="/dashboard" className="beranda-btn-secondary" style={{ color: "#1d1d1d" }}>
            Masuk
          </Link>
          <Link href="/marketplace" className="beranda-btn-primary">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </header>
  );
}

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 15,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const isUrgent = timeLeft.minutes < 5 && timeLeft.hours === 0;

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "14px 18px",
        borderRadius: "14px",
        backgroundColor: isUrgent ? "#fef2f2" : "#f0fdf4",
        border: `1px solid ${isUrgent ? "#fecaca" : "#bbf7d0"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", color: isUrgent ? "#991b1b" : "#166534" }}>
        <Clock size={16} />
        <span>Batas waktu checkout:</span>
      </div>
      <div style={{ display: "flex", gap: "6px", fontFamily: "monospace", fontSize: "14px", fontWeight: "700", color: isUrgent ? "#dc2626" : "#15803d" }}>
        <span>{timeLeft.hours.toString().padStart(2, "0")}j</span>
        <span>{timeLeft.minutes.toString().padStart(2, "0")}m</span>
        <span>{timeLeft.seconds.toString().padStart(2, "0")}s</span>
      </div>
    </div>
  );
}

function ProductSummary({ product, quantity }) {
  if (!product) return null;

  const rescuePrice = product.rescue_price ?? product.rescuePrice ?? 0;
  const originalPrice = product.original_price ?? product.originalPrice ?? 0;
  const photoUrl = product.photo_url ?? product.photoUrl;
  const vendorName = product.vendor ?? product.businessName ?? "UMKM Savora";
  const pickupAddress = product.pickup_address ?? product.pickupAddress ?? "Lokasi pickup dikonfirmasi setelah order dibuat.";

  const subtotal = rescuePrice * quantity;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;

  return (
    <div style={{ background: "#ffffff", borderRadius: "18px", border: "1px solid #e5e7eb", padding: "24px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1d1d1d", marginBottom: "20px" }}>Detail Produk & Ringkasan</h2>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <div style={{ width: "90px", height: "90px", borderRadius: "14px", overflow: "hidden", background: "#f3f4f6", flexShrink: 0, position: "relative" }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
              <ChefHat size={32} />
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1d1d1d", margin: "0 0 6px 0" }}>{product.name}</h3>
          <p style={{ fontSize: "13px", color: "#4b5563", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "6px" }}>
            <Store size={14} color="#16a34a" /> {vendorName}
          </p>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin size={14} color="#9ca3af" /> {pickupAddress}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px", fontWeight: "800", color: "#16a34a" }}>
              {formatRupiah(rescuePrice)}
            </span>
            {originalPrice > rescuePrice && (
              <span style={{ fontSize: "12px", color: "#9ca3af", textDecoration: "line-through" }}>
                {formatRupiah(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#4b5563" }}>
          <span>Subtotal ({quantity} item)</span>
          <span style={{ fontWeight: "600", color: "#1d1d1d" }}>{formatRupiah(subtotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#4b5563" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            Service Fee (5%)
          </span>
          <span style={{ fontWeight: "600", color: "#1d1d1d" }}>{formatRupiah(serviceFee)}</span>
        </div>
        <div style={{ borderTop: "1px dashed #e5e7eb", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "800", color: "#1d1d1d" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CreditCard size={18} color="#16a34a" /> Total Pembayaran
          </span>
          <span style={{ color: "#16a34a", fontSize: "18px" }}>{formatRupiah(total)}</span>
        </div>
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div style={{ maxWidth: "1151px", margin: "0 auto", padding: "40px 32px" }}>
      <div style={{ width: "150px", height: "20px", background: "#e5e7eb", borderRadius: "6px", marginBottom: "24px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px" }}>
        <div style={{ background: "#ffffff", borderRadius: "18px", padding: "24px", height: "300px", background: "#f9fafb" }} />
        <div style={{ background: "#ffffff", borderRadius: "18px", padding: "24px", height: "400px", background: "#f9fafb" }} />
      </div>
    </div>
  );
}

function CheckoutForm({ product, quantity, onSubmit }) {
  const [formData, setFormData] = useState({
    billingName: "",
    billingEmail: "",
    billingPhone: "",
    customerNote: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderData = {
        productId: product.id,
        quantity: quantity,
        ...formData,
      };
      await onSubmit(orderData);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat membuat pesanan");
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: "18px", border: "1px solid #e5e7eb", padding: "24px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1d1d1d", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
        <User size={20} color="#16a34a" /> Informasi Pemesan
      </h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label htmlFor="billingName" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Nama Lengkap *
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              id="billingName"
              name="billingName"
              value={formData.billingName}
              onChange={handleInputChange}
              placeholder="Masukkan nama lengkap Anda"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px 12px 38px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
            <User size={16} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        <div>
          <label htmlFor="billingEmail" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Email *
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              id="billingEmail"
              name="billingEmail"
              value={formData.billingEmail}
              onChange={handleInputChange}
              placeholder="email@example.com"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px 12px 38px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <Mail size={16} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        <div>
          <label htmlFor="billingPhone" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Nomor WhatsApp *
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="tel"
              id="billingPhone"
              name="billingPhone"
              value={formData.billingPhone}
              onChange={handleInputChange}
              placeholder="08123456789"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px 12px 38px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <Phone size={16} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        <div>
          <label htmlFor="customerNote" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Catatan Tambahan (Opsional)
          </label>
          <div style={{ position: "relative" }}>
            <textarea
              id="customerNote"
              name="customerNote"
              value={formData.customerNote}
              onChange={handleInputChange}
              placeholder="Instruksi khusus saat pengambilan..."
              rows="3"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px 12px 38px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
              }}
            />
            <MessageSquare size={16} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "16px" }} />
          </div>
        </div>

        {error && (
          <div style={{ padding: "12px", borderRadius: "8px", background: "#fef2f2", color: "#dc2626", fontSize: "13px", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "8px",
            width: "100%",
            padding: "14px",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "background 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {loading ? "Memproses..." : "Buat Pesanan & Lanjut Bayar"}
        </button>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { count } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const productId = searchParams?.get("product_id");
  const initialQty = parseInt(searchParams?.get("qty")) || 1;

  useEffect(() => {
    if (!productId) {
      setError("Product ID tidak valid");
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchMarketplaceProduct(productId);
        if (!data || !data.product) {
          setError("Produk tidak ditemukan");
          return;
        }
        setProduct(data.product);
        setQuantity(Math.max(1, initialQty));
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, initialQty]);

  const handleCheckoutSubmit = async (orderData) => {
    try {
      const orderResponse = await createOrder(orderData);
      const normalized = normalizeOrder(orderResponse);
      if (!normalized.id) throw new Error("Invalid order response");

      // Redirect langsung ke Xendit jika ada invoice_url
      if (normalized.paymentUrl) {
        window.location.href = normalized.paymentUrl;
      } else {
        // Fallback: ke halaman payment lokal jika invoice_url tidak tersedia
        router.push(`/orders/${normalized.id}/pay`);
      }
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#ffffff", fontFamily: '"Plus Jakarta Sans", sans-serif', minHeight: "100vh" }}>
        <BerandaNavbar count={count} />
        <CheckoutSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ background: "#ffffff", fontFamily: '"Plus Jakarta Sans", sans-serif', minHeight: "100vh" }}>
        <BerandaNavbar count={count} />
        <main style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 32px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1d1d1d", marginBottom: "16px" }}>{error || "Produk tidak ditemukan"}</h1>
          <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "32px", lineHeight: "1.6" }}>
            Tidak dapat memuat detail produk untuk transaksi ini. Silakan periksa kembali keranjang Anda.
          </p>
          <Link
            href="/marketplace"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "#16a34a",
              color: "white",
              borderRadius: "24px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} /> Kembali ke Marketplace
          </Link>
        </main>
      </div>
    );
  }

  const pickupAddress = product.pickup_address ?? product.pickupAddress ?? "Lokasi pickup dikonfirmasi setelah order dibuat.";

  return (
    <div style={{ background: "#ffffff", fontFamily: '"Plus Jakarta Sans", sans-serif', minHeight: "100vh" }}>
      <BerandaNavbar count={count} />

      <main style={{ maxWidth: "1151px", margin: "0 auto", padding: "32px 32px 64px" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "24px" }}>
          <Link
            href={`/marketplace/${product.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: "500",
              textDecoration: "none",
              marginBottom: "12px",
            }}
          >
            <ArrowLeft size={16} /> Kembali ke Detail Produk
          </Link>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1d1d1d", margin: 0 }}>
            Checkout Pesanan
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: "32px", alignItems: "start" }}>
          {/* Left Column: Product Summary & Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <ProductSummary product={product} quantity={quantity} />

            {/* Quantity Selector */}
            <div style={{ background: "#ffffff", borderRadius: "18px", border: "1px solid #e5e7eb", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Jumlah Porsi / Package:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f3f4f6", borderRadius: "12px", padding: "4px 8px" }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                >
                  <Minus size={14} color="#374151" />
                </button>
                <span style={{ width: "24px", textAlign: "center", fontWeight: "700", fontSize: "15px", color: "#1d1d1d" }}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                >
                  <Plus size={14} color="#374151" />
                </button>
              </div>
            </div>

            {/* Pickup Info Banner */}
            <div style={{ background: "#f9fafb", borderRadius: "18px", border: "1px solid #e5e7eb", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <CalendarClock size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ fontSize: "14px", color: "#1d1d1d", display: "block", marginBottom: "2px" }}>Lokasi Pickup UMKM</strong>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: "1.5" }}>{pickupAddress}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ fontSize: "14px", color: "#1d1d1d", display: "block", marginBottom: "2px" }}>Jaminan Kualitas Savora</strong>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: "1.5" }}>Makanan siap diambil hari ini sesuai jadwal UMKM. Pembayaran aman & transparan.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form & Timer */}
          <div style={{ position: "sticky", top: "100px" }}>
            <CheckoutForm product={product} quantity={quantity} onSubmit={handleCheckoutSubmit} />
            <CountdownTimer targetDate={new Date(Date.now() + 15 * 60 * 1000)} />
          </div>
        </div>
      </main>
    </div>
  );
}
