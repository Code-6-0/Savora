"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarClock,
  ChefHat,
  Clock,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  Store,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { createOrder, normalizeOrder } from "@/lib/orders";
import { fetchMarketplaceProduct, normalizeMarketplaceProduct } from "@/lib/marketplace";

function formatRupiah(value) {
  if (!value && value !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
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

  const isUrgent = timeLeft.minutes < 5 || timeLeft.hours === 0;

  return (
    <div className={`savora-countdown ${isUrgent ? "is-urgent" : ""}`}>
      <Clock size={14} aria-hidden="true" /> Pembayaran berlaku hingga:
      <div className="savora-countdown-display">
        <div>
          <b>{timeLeft.hours.toString().padStart(2, "0")}</b>
          <small>jam</small>
        </div>
        <div>
          <b>{timeLeft.minutes.toString().padStart(2, "0")}</b>
          <small>menit</small>
        </div>
        <div>
          <b>{timeLeft.seconds.toString().padStart(2, "0")}</b>
          <small>detik</small>
        </div>
      </div>
    </div>
  );
}

function ProductSummary({ product, quantity }) {
  if (!product) return null;

  const subtotal = product.rescuePrice * quantity;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;

  return (
    <div className="savora-checkout-summary">
      <div className="savora-checkout-product">
        <div className="savora-checkout-product-image">
          {product.photoUrl ? (
            <Image
              src={product.photoUrl}
              alt={product.name}
              width={80}
              height={80}
              className="savora-product-thumb"
            />
          ) : (
            <div className="savora-product-placeholder">
              <ChefHat size={32} />
            </div>
          )}
        </div>
        <div className="savora-checkout-product-details">
          <h3 className="savora-checkout-product-name">{product.name}</h3>
          <p className="savora-checkout-product-vendor">
            <Store size={14} aria-hidden="true" /> {product.businessName}
          </p>
          <p className="savora-checkout-product-location">
            <MapPin size={14} aria-hidden="true" /> {product.pickupAddress}
          </p>
          <div className="savora-checkout-product-price">
            <span className="savora-rescue-price">
              {formatRupiah(product.rescuePrice)} × {quantity}
            </span>
          </div>
        </div>
      </div>

      <div className="savora-checkout-breakdown">
        <div className="savora-checkout-line">
          <span>Subtotal</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        <div className="savora-checkout-line">
          <span>Service Fee (5%)</span>
          <span>{formatRupiah(serviceFee)}</span>
        </div>
        <div className="savora-checkout-line savora-checkout-total">
          <span>
            <CreditCard size={16} aria-hidden="true" /> Total Pembayaran
          </span>
          <span>{formatRupiah(total)}</span>
        </div>
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="savora-checkout-skeleton">
      <div className="savora-checkout-skeleton-header">
        <div className="savora-skeleton-line" style={{ width: "200px" }}></div>
      </div>
      <div className="savora-checkout-skeleton-product">
        <div className="savora-skeleton-circle" style={{ width: "80px", height: "80px" }}></div>
        <div className="savora-checkout-skeleton-details">
          <div className="savora-skeleton-line" style={{ width: "70%" }}></div>
          <div className="savora-skeleton-line" style={{ width: "50%" }}></div>
          <div className="savora-skeleton-line" style={{ width: "60%" }}></div>
        </div>
      </div>
      <div className="savora-checkout-skeleton-form">
        <div className="savora-skeleton-line" style={{ width: "100%", height: "40px" }}></div>
        <div className="savora-skeleton-line" style={{ width: "100%", height: "40px" }}></div>
        <div className="savora-skeleton-line" style={{ width: "100%", height: "40px" }}></div>
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
    <form onSubmit={handleSubmit} className="savora-checkout-form">
      <h3 className="savora-checkout-section-title">
        <User size={18} aria-hidden="true" /> Data Pembayaran
      </h3>

      <div className="savora-form-group">
        <label htmlFor="billingName" className="savora-form-label">
          <User size={14} aria-hidden="true" /> Nama Lengkap *
        </label>
        <input
          type="text"
          id="billingName"
          name="billingName"
          value={formData.billingName}
          onChange={handleInputChange}
          placeholder="Nama Anda"
          className="savora-form-input"
          required
          disabled={loading}
        />
      </div>

      <div className="savora-form-group">
        <label htmlFor="billingEmail" className="savora-form-label">
          <Mail size={14} aria-hidden="true" /> Email *
        </label>
        <input
          type="email"
          id="billingEmail"
          name="billingEmail"
          value={formData.billingEmail}
          onChange={handleInputChange}
          placeholder="email@example.com"
          className="savora-form-input"
          required
          disabled={loading}
        />
      </div>

      <div className="savora-form-group">
        <label htmlFor="billingPhone" className="savora-form-label">
          <Phone size={14} aria-hidden="true" /> Nomor WhatsApp *
        </label>
        <input
          type="tel"
          id="billingPhone"
          name="billingPhone"
          value={formData.billingPhone}
          onChange={handleInputChange}
          placeholder="08123456789"
          className="savora-form-input"
          required
          disabled={loading}
        />
      </div>

      <div className="savora-form-group">
        <label htmlFor="customerNote" className="savora-form-label">
          <MessageSquare size={14} aria-hidden="true" /> Catatan (Opsional)
        </label>
        <textarea
          id="customerNote"
          name="customerNote"
          value={formData.customerNote}
          onChange={handleInputChange}
          placeholder="Instruksi khusus..."
          className="savora-form-input"
          rows="3"
          disabled={loading}
        />
      </div>

      {error && <div className="savora-error-message">{error}</div>}

      <button
        type="submit"
        className="savora-checkout-button"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Memproses..." : "Buat Pesanan & Lanjut Bayar"}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const productId = parseInt(searchParams?.get("product_id"));
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
        const normalized = normalizeMarketplaceProduct(data);
        setProduct(normalized);
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
      router.push(`/orders/${normalized.id}/pay`);
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="savora-checkout-page">
        <header className="savora-topbar">
          <Link href="/marketplace" className="savora-back-button">
            <ArrowLeft size={20} aria-hidden="true" /> Marketplace
          </Link>
        </header>
        <CheckoutSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="savora-checkout-page">
        <header className="savora-topbar">
          <Link href="/marketplace" className="savora-back-button">
            <ArrowLeft size={20} aria-hidden="true" /> Kembali
          </Link>
        </header>
        <div className="savora-error-container">
          <p>{error || "Produk tidak ditemukan"}</p>
          <Link href="/marketplace" className="savora-button">
            Kembali ke Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="savora-checkout-page">
      <header className="savora-topbar">
        <Link href={`/marketplace/${product.id}`} className="savora-back-button">
          <ArrowLeft size={20} aria-hidden="true" /> Detail Produk
        </Link>
        <h1>Checkout</h1>
      </header>

      <main className="savora-checkout-main">
        <div className="savora-checkout-container">
          <div className="savora-checkout-left">
            <ProductSummary product={product} quantity={quantity} />

            <div className="savora-checkout-quantity">
              <label htmlFor="quantity">Jumlah:</label>
              <div className="savora-quantity-control">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="savora-quantity-button"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="savora-quantity-input"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="savora-quantity-button"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="savora-checkout-info">
              <div className="savora-info-item">
                <CalendarClock size={16} aria-hidden="true" />
                <div>
                  <strong>Stok terbatas</strong>
                  <p>Pesanan untuk {product.pickupAddress}</p>
                </div>
              </div>
              <div className="savora-info-item">
                <Clock size={16} aria-hidden="true" />
                <div>
                  <strong>Waktu pengambilan</strong>
                  <p>Ambil hari ini sesuai jadwal UMKM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="savora-checkout-right">
            <CheckoutForm product={product} quantity={quantity} onSubmit={handleCheckoutSubmit} />
            <CountdownTimer targetDate={new Date(Date.now() + 15 * 60 * 1000)} />
          </div>
        </div>
      </main>
    </div>
  );
}
