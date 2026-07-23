"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Clock,
  Clock3,
  Flame,
  Gauge,
  Heart,
  Home,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Sun,
} from "lucide-react";
import {
  computeProductScore,
  fallbackMarketplaceProducts,
  fetchMarketplaceProduct,
  normalizeMarketplaceProduct,
} from "@/lib/marketplace";
import { foodScoreBand, rescueTimeColor, rescueTimeParts } from "@/lib/foodScore";
import { classifyReviewText, deriveRestaurantSafety } from "@/lib/reviews";
import { computeCheckoutPricing } from "@/lib/pricing";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function trustClass(status) {
  if (status === "Fresh") return "is-fresh";
  if (status === "Segera Dijual") return "is-urgent";
  return "is-eligible";
}

function safetyIcon(levelKey) {
  if (levelKey === "gawat") return <Flame size={13} aria-hidden="true" />;
  if (levelKey === "warning") return <ShieldAlert size={13} aria-hidden="true" />;
  return <ShieldCheck size={13} aria-hidden="true" />;
}

// Timestamp Date.now() di-refresh tiap detik. Skor & sisa waktu dihitung dari
// timestamp absolut sehingga TIDAK reset saat halaman dimuat ulang.
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  return now;
}

function MarketplaceHeader() {
  return (
    <header className="savora-topbar">
      <Link className="savora-brand" href="/marketplace" aria-label="Savora marketplace">
        <span className="savora-brand-mark">S</span>
        <span> Savora <small>FOOD RESCUE</small></span>
      </Link>
      <label className="savora-search">
        <Search size={17} aria-hidden="true" />
        <input placeholder="Cari nasi, roti, warung, atau UMKM..." aria-label="Cari produk atau UMKM" readOnly />
      </label>
      <nav className="savora-main-nav" aria-label="Navigasi marketplace"><Link href="/marketplace">Rescue Deals</Link><a href="#assessment">Food Score</a><a href="#pickup">Pickup</a><Link href="/akun">Riwayat &amp; Impact</Link></nav>
      <button className="savora-icon-button" type="button" aria-label="Tema terang demo"><Sun size={18} /></button>
      <button className="savora-cart" type="button" aria-label="Keranjang demo"><ShoppingBag size={19} /> <b>2</b></button>
      <button className="savora-login" type="button">Masuk</button>
      <button className="savora-signup" type="button">Daftar</button>
    </header>
  );
}

function TimerDisplay({ seconds }) {
  const time = rescueTimeParts(seconds);
  // Color indicator sisa waktu ABSOLUT (PRD 5.1 & REVISI #31): paralel dengan
  // band skor, keduanya boleh berbeda.
  const timeColor = rescueTimeColor(seconds);
  return (
    <div className={`savora-rescue-timer ${timeColor.className}`}>
      <span><Clock3 size={14} aria-hidden="true" /> Smart Rescue Timer</span>
      <div><b>{time.hours}</b><small>jam</small><b>{time.minutes}</b><small>menit</small><b>{time.seconds}</b><small>detik</small></div>
    </div>
  );
}

// Sorot keyword pada teks ulasan sesuai level (gawat/warning/aman).
function ReviewComment({ comment }) {
  const text = String(comment || "");
  const { matched } = classifyReviewText(text);
  if (!matched.length) return <i>{text}</i>;
  const unique = [...new Set(matched)].sort((a, b) => b.length - a.length);
  const escaped = unique.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  return (
    <i>
      {text.split(regex).map((part, index) => {
        if (!part) return null;
        if (unique.includes(part.toLowerCase())) {
          const className = classifyReviewText(part).level.className;
          return <mark key={index} className={`savora-kw ${className}`}>{part}</mark>;
        }
        return <span key={index}>{part}</span>;
      })}
    </i>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const [product, setProduct] = useState(() => fallbackMarketplaceProducts.map(normalizeMarketplaceProduct).find((item) => item.id === id));
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const [dataSource, setDataSource] = useState("fallback");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      const result = await fetchMarketplaceProduct(id);
      setProduct(result.product);
      setDataSource(result.source);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleRetry = () => {
    setIsRefetching(true);
    loadProduct();
  };

  const now = useNow();
  const safety = useMemo(
    () => deriveRestaurantSafety(product?.reviews, product?.safety_level),
    [product],
  );

  // Loading state: tampilkan skeleton
  if (isLoading) {
    return (
      <div className="savora-marketplace">
        <MarketplaceHeader />
        <main className="savora-detail-main">
          <div className="savora-skeleton-line" style={{ width: "120px", height: "20px", marginBottom: "25px" }} />
          <div className="savora-detail-layout">
            <div>
              <div className="savora-skeleton-pulse" style={{ width: "100%", height: "391px", borderRadius: "24px" }} />
            </div>
            <div>
              <div className="savora-skeleton-line" style={{ width: "70%", height: "32px", marginBottom: "12px" }} />
              <div className="savora-skeleton-line" style={{ width: "90%", height: "16px", marginBottom: "8px" }} />
              <div className="savora-skeleton-line" style={{ width: "60%", height: "24px" }} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return <div className="savora-marketplace"><MarketplaceHeader /><main className="savora-not-found"><h1>Produk tidak ditemukan</h1><p>Rescue deal ini mungkin sudah habis atau tidak aktif.</p><Link href="/marketplace" className="savora-primary-action">Kembali ke marketplace</Link></main></div>;
  }

  const { score, remainingSeconds } = computeProductScore(product, now);
  const band = foodScoreBand(score);
  const expired = score <= 0 || remainingSeconds <= 0;
  const showSafety = safety.level.key !== "aman" || safety.keywords.length > 0;

  // Produk expired: tampilkan state "deal berakhir" (PRD 12.6).
  if (expired) {
    return (
      <div className="savora-marketplace savora-detail-page">
        <MarketplaceHeader />
        <main className="savora-not-found">
          <h1>Rescue deal telah berakhir</h1>
          <p>Food Score untuk <strong>{product.name}</strong> dari {product.vendor} telah mencapai 0. Deal ini sudah kedaluwarsa dan tidak lagi tersedia.</p>
          <Link href="/marketplace" className="savora-primary-action">← Kembali ke marketplace</Link>
        </main>
      </div>
    );
  }

  const savings = product.original_price - product.rescue_price;
  const reviewAverage = product.reviews?.length ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1) : "4.8";

  // Timer Rescue Cerdas menggunakan remainingSeconds dari Food Score (sumber yang sama dengan badge timer di list)
  const time = rescueTimeParts(remainingSeconds);
  const countdownHours = String(time.hours).padStart(2, '0');
  const countdownMinutes = String(time.minutes).padStart(2, '0');
  const countdownSeconds = String(time.seconds).padStart(2, '0');
  // Progress bar menunjukkan proporsi waktu tersisa (asumsi window 4 jam untuk produk fresh)
  const progressPercent = Math.min(100, Math.max(0, (remainingSeconds / 14400) * 100));
  // Deadline dinamis berdasarkan remainingSeconds
  const deadlineTime = new Date(now + remainingSeconds * 1000);
  const deadlineHour = String(deadlineTime.getHours()).padStart(2, '0');
  const deadlineMinute = String(deadlineTime.getMinutes()).padStart(2, '0');
  const totalPrice = computeCheckoutPricing(product.rescue_price, quantity).total;

  function updateQuantity(delta) { setQuantity((current) => Math.min(product.stock, Math.max(1, current + delta))); }
  function reserveProduct() {
    setNotice(`${quantity} porsi ${product.name} berhasil dipilih. Lanjutkan ke Checkout untuk pembayaran.`);
  }

  return (
    <div className="savora-marketplace savora-detail-page" style={{ background: '#ffffff', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Navbar from beranda with "Marketplace" active */}
      <header className="beranda-navbar">
        <div className="beranda-navbar-container">
          <div className="beranda-brand">
            <img src="/brand/savora-logo.png" alt="Savora" className="beranda-logo-img" />
            <span className="beranda-brand-text">Savora</span>
          </div>
          <nav className="beranda-nav">
            <Link href="/">Home</Link>
            <Link href="/marketplace" className="nav-active">Marketplace</Link>
            <a href="#mitra">Mitra</a>
            <a href="#tentang">Tentang</a>
          </nav>
          <button className="beranda-location">
            <MapPin size={14} />
            <span>Masukkan Alamat Kamu</span>
            <ChevronDown size={13} />
          </button>
          <div className="beranda-actions">
            <Link href="/dashboard" className="beranda-btn-secondary" style={{ color: '#1d1d1d' }}>Masuk</Link>
            <Link href="/marketplace" className="beranda-btn-primary">Daftar Sekarang</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1088px', margin: '0 auto', padding: '24px 32px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '16px', fontWeight: '500', color: '#999999' }}>
          <Home size={16} />
          <ChevronRight size={14} />
          <span>Marketplace</span>
          <ChevronRight size={14} />
          <span>Produk</span>
        </div>

        {/* 2-column layout */}
        <div style={{ display: 'flex', gap: '40px' }}>
          {/* Left column - 639px */}
          <div style={{ width: '639px' }}>
            {/* Main image with badges and buttons */}
            <div style={{ position: 'relative', height: '479px', background: '#eaf8ec', borderRadius: '18px', overflow: 'hidden' }}>
              <img src="/detail/main.png" alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {/* Badge "59% OFF" top-left */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#0b7a3b', color: 'white', padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700' }}>
                {product.discountPercent > 0 ? `${product.discountPercent}% OFF` : '59% OFF'}
              </div>
              {/* Icon buttons top-right */}
              <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Wishlist">
                  <Heart size={15} />
                </button>
                <button style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Share">
                  <Share2 size={15} />
                </button>
              </div>
            </div>
            {/* Thumbnails */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <img src="/detail/thumb-1.png" alt="View 1" style={{ width: '152px', height: '114px', borderRadius: '12px', objectFit: 'cover' }} />
              <img src="/detail/thumb-2.png" alt="View 2" style={{ width: '152px', height: '114px', borderRadius: '12px', objectFit: 'cover' }} />
              <img src="/detail/thumb-3.png" alt="View 3" style={{ width: '152px', height: '114px', borderRadius: '12px', objectFit: 'cover' }} />
              <img src="/detail/thumb-4.png" alt="View 4" style={{ width: '152px', height: '114px', borderRadius: '12px', objectFit: 'cover' }} />
            </div>
          </div>

          {/* Right column - 408px */}
          <div style={{ width: '408px', display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '4px' }}>
            {/* Restaurant header */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eaf8ec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChefHat size={16} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1d' }}>{product.vendor}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#eaf8ec', padding: '2px 8px', borderRadius: '9999px' }}>
                    <Check size={9} style={{ color: '#0b7a3b' }} />
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#0b7a3b' }}>Terverifikasi</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#999999', paddingLeft: '48px' }}>
                Restoran · Jakarta Selatan
              </div>
            </div>

            {/* Product title */}
            <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1d1d1d', margin: '0', lineHeight: '1.3' }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#ffb900" stroke="#ffb900" />
                ))}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1d' }}>4.8</span>
              <span style={{ fontSize: '13px', color: '#999999' }}>(247 ulasan)</span>
            </div>

            {/* Meta info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#666666' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} />
                <span>{product.distanceKm.toFixed(1)} km dari sini</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} />
                <span>Ambil 12:00–14:00</span>
              </div>
            </div>

            {/* Stock pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fffbeb', padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600', color: '#bb4d00', width: 'fit-content' }}>
              <Flame size={14} />
              <span>Hanya tersisa {product.stock} porsi</span>
            </div>

            {/* Pricing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '40px', fontWeight: '700', color: '#0b7a3b' }}>
                  {formatRupiah(product.rescue_price)}
                </span>
                {product.original_price > product.rescue_price && (
                  <span style={{ fontSize: '16px', color: '#999999', textDecoration: 'line-through' }}>
                    {formatRupiah(product.original_price)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#eaf8ec', padding: '4px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: '600', color: '#0b7a3b', width: 'fit-content' }}>
                  Hemat {formatRupiah(savings)}
                </div>
              )}
            </div>

            {/* Timer Rescue Cerdas card */}
            <div style={{ background: 'white', border: '1px solid #e8e8e8', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fef3c6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={14} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1d' }}>Timer Rescue Cerdas</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#e17100' }}>
                  {countdownHours}:{countdownMinutes}:{countdownSeconds}
                </div>
              </div>
              <div style={{ height: '6px', background: '#e8e8e8', borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', background: '#e17100', width: `${progressPercent}%`, transition: 'width 1s linear' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#999999' }}>
                Jendela reservasi ditutup pukul {deadlineHour}:{deadlineMinute} hari ini
              </div>
            </div>

            {/* Quantity stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: '500', color: '#1d1d1d' }}>Jumlah</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '8px 16px' }}>
                <button onClick={() => updateQuantity(-1)} disabled={quantity <= 1} style={{ width: '32px', height: '32px', borderRadius: '9px', border: 'none', background: quantity <= 1 ? '#f5f5f5' : '#fff', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Minus size={15} />
                </button>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1d', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => updateQuantity(1)} disabled={quantity >= product.stock} style={{ width: '32px', height: '32px', borderRadius: '9px', border: 'none', background: quantity >= product.stock ? '#f5f5f5' : '#fff', cursor: quantity >= product.stock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Primary CTA - disabled jika expired */}
            <button onClick={reserveProduct} disabled={expired} style={{ width: '100%', height: '48px', background: expired ? '#e8e8e8' : '#0b7a3b', color: expired ? '#999999' : 'white', border: 'none', borderRadius: '16px', fontSize: '13px', fontWeight: '600', cursor: expired ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {expired ? 'Rescue Berakhir' : `Selamatkan Sekarang · ${formatRupiah(totalPrice)}`}
            </button>

            {/* Secondary CTA */}
            <button style={{ width: '100%', height: '48px', background: '#eaf8ec', color: '#0b7a3b', border: 'none', borderRadius: '16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ShoppingCart size={16} />
              Tambah ke Keranjang
            </button>
          </div>
        </div>

        {/* Bottom placeholder */}
        <div style={{ marginTop: '60px', padding: '40px', background: '#f5f5f5', borderRadius: '12px', textAlign: 'center', color: '#999999' }}>
          <p style={{ margin: 0 }}>Detail produk, ulasan, dan informasi lainnya akan ditambahkan di sini.</p>
        </div>
      </main>

      {/* Footer from beranda */}
      <footer className="beranda-footer">
        <div className="beranda-footer-container">
          <div className="beranda-footer-column-brand">
            <div className="beranda-footer-wordmark">Savora</div>
            <p className="beranda-footer-mission">
              Misi kami sederhana: Tidak boleh ada makanan enak yang terbuang sia-sia.
              Bergabunglah dengan ribuan penyelamat makanan lainnya di seluruh Indonesia.
            </p>
            <div className="beranda-footer-social">
              <button className="beranda-footer-social-btn" aria-label="Website">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm5.8 5h-1.9c-.2-1-.5-2-1-2.8 1.5.6 2.6 1.8 2.9 3.3zM8 2c.6 1 1.1 2.2 1.3 3.5H6.7C6.9 4.2 7.4 3 8 2zM2.3 9.5c-.2-.5-.3-1-.3-1.5s.1-1 .3-1.5h2.2c-.1.5-.1 1-.1 1.5s0 1 .1 1.5H2.3zm.9 2h1.9c.2 1 .5 2 1 2.8-1.5-.6-2.6-1.8-2.9-3.3zM5.1 5H3.2c.3-1.5 1.4-2.7 2.9-3.3-.5.8-.8 1.8-1 2.8zm2.9 9c-.6-1-1.1-2.2-1.3-3.5h2.6c-.2 1.3-.7 2.5-1.3 3.5zm1.5-5.5H5.5c-.1-.5-.1-1-.1-1.5s0-1 .1-1.5h4.8c.1.5.1 1 .1 1.5s0 1-.1 1.5zm.6 4.8c.5-.8.8-1.8 1-2.8h1.9c-.3 1.5-1.4 2.7-2.9 3.3zm1.4-4.8c.1-.5.1-1 .1-1.5s0-1-.1-1.5h2.2c.2.5.3 1 .3 1.5s-.1 1-.3 1.5h-2.2z" fill="#006a3f"/>
                </svg>
              </button>
              <button className="beranda-footer-social-btn" aria-label="Share">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13 10c-.8 0-1.5.3-2 .8L6.5 8.3c.1-.3.1-.5.1-.8s0-.5-.1-.8L11 4.2c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .3 0 .5.1.8L5 5.3C4.5 4.8 3.8 4.5 3 4.5c-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2-.8l4.5 2.5c-.1.3-.1.5-.1.8 0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3z" fill="#006a3f"/>
                </svg>
              </button>
              <button className="beranda-footer-social-btn" aria-label="Chat">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 1H2C1.4 1 1 1.4 1 2v9c0 .6.4 1 1 1h3v3l3-3h6c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zM5 8H4V7h1v1zm3 0H7V7h1v1zm3 0h-1V7h1v1z" fill="#006a3f"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="beranda-footer-column">
            <h4>Layanan Kami</h4>
            <Link href="/marketplace">Daftar Marketplace</Link>
            <Link href="/marketplace">Daftar Sebagai Mitra Donasi</Link>
            <Link href="/marketplace">Voucher & Promo</Link>
            <Link href="/marketplace">Catering Sisa</Link>
          </div>

          <div className="beranda-footer-column">
            <h4>Informasi</h4>
            <Link href="/marketplace">Tentang Kami</Link>
            <Link href="/marketplace">Bantuan & FAQ</Link>
            <Link href="/marketplace">Syarat & Ketentuan</Link>
            <Link href="/marketplace">Kebijakan Privasi</Link>
          </div>

          <div className="beranda-footer-column">
            <h4>Dapatkan Informasi terbaru</h4>
            <p className="beranda-footer-newsletter-desc">
              Dapatkan info flash deal dan update promo penyelamatan makanan langsung di emailmu.
            </p>
            <div className="beranda-footer-newsletter">
              <input
                type="email"
                placeholder="Email kamu"
                className="beranda-footer-newsletter-input"
              />
              <button className="beranda-footer-newsletter-btn" aria-label="Subscribe">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M15.8 0.2c-.2-.2-.5-.3-.8-.2L0.4 5.6c-.3.1-.5.4-.5.7 0 .3.2.6.5.7l4.8 2.1L7.3 14c.1.3.4.5.7.5.3 0 .6-.2.7-.5L15.8 1c.1-.3.1-.6 0-.8z" fill="white"/>
                </svg>
              </button>
            </div>
            <div className="beranda-footer-badges">
              <img src="/footer/badge-1.png" alt="App Store" className="beranda-footer-badge" />
              <img src="/footer/badge-2.png" alt="Google Play" className="beranda-footer-badge" />
            </div>
          </div>
        </div>

        <div className="beranda-footer-bottom">
          <span>© 2026 Savora Platform. Proudly Made In Indonesia for the Earth.</span>
          <div className="beranda-footer-bottom-links">
            <span>SECURITY</span>
            <span>SITEMAP</span>
            <span>COOKIES</span>
          </div>
        </div>
      </footer>

      {notice && <div className="savora-toast" role="status">✓ {notice}</div>}
    </div>
  );
}