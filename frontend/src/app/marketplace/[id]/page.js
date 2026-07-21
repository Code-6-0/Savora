"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  Flame,
  Gauge,
  MapPin,
  Minus,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
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
      <nav className="savora-main-nav" aria-label="Navigasi marketplace"><Link href="/marketplace">Rescue Deals</Link><a href="#assessment">Food Score</a><a href="#pickup">Pickup</a></nav>
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

  useEffect(() => {
    let alive = true;
    fetchMarketplaceProduct(id).then((result) => { if (alive) setProduct(result); });
    return () => { alive = false; };
  }, [id]);

  const now = useNow();
  const safety = useMemo(
    () => deriveRestaurantSafety(product?.reviews, product?.safety_level),
    [product],
  );

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

  function updateQuantity(delta) { setQuantity((current) => Math.min(product.stock, Math.max(1, current + delta))); }
  function reserveProduct() {
    setNotice(`${quantity} porsi ${product.name} berhasil dipilih. Lanjutkan ke Checkout untuk pembayaran.`);
  }

  return (
    <div className="savora-marketplace savora-detail-page">
      <MarketplaceHeader />
      <main className="savora-detail-main">
        <button type="button" className="savora-back" onClick={() => router.back()}><ArrowLeft size={16} /> Kembali ke marketplace</button>
        <section className="savora-detail-layout">
          <div className="savora-detail-left">
            <div className="savora-detail-image">
              <Image src={product.photo_url} alt={product.name} fill priority sizes="(max-width: 900px) 100vw, 55vw" />
              <span className={`savora-trust ${trustClass(product.food_trust_status)}`}>{product.food_trust_status}</span>
              {product.discountPercent > 0 && <span className="savora-discount">-{product.discountPercent}%</span>}
            </div>

            <section className="savora-assessment" id="assessment" aria-labelledby="assessment-title">
              <div className="savora-assessment-title"><span>✦</span><div><h2 id="assessment-title">Food Eligibility Assessment</h2><p>Data yang diinput UMKM untuk perhitungan Food Trust Index dan Food Score.</p></div></div>
              <div className="savora-assessment-grid">
                <div><span>◷ Waktu produksi</span><b>{product.productionTime}</b></div>
                <div><span>▤ Kategori</span><b>{product.category}</b></div>
                <div><span>⌁ Penyimpanan</span><b>{product.storage}</b></div>
                <div><span>▣ Kemasan</span><b>{product.packaging}</b></div>
                <div><span>◷ Masa simpan</span><b>{product.shelfLife}</b></div>
                <div><span>✦ Skor Trust</span><b>{product.food_trust_status} ({product.trustScore}/100)</b></div>
              </div>
              <p className="savora-disclaimer"><b>Kenapa skor ini?</b> Food Score dihitung dari status Food Trust Index saat listing dipublikasikan (Fresh=100, Layak Dijual=85, Segera Dijual=70) lalu menurun otomatis mengikuti sisa waktu menuju batas layak konsumsi. Food Score bukan sertifikasi lab; periksa kondisi makanan saat pickup.</p>
            </section>

            <section className="savora-reviews" aria-labelledby="reviews-title">
              <div className="savora-reviews-head">
                <h2 id="reviews-title">Ulasan Customer</h2>
                <b>★ {reviewAverage} <small>({product.reviews?.length || 128})</small></b>
              </div>
              {showSafety && (
                <p className={`savora-safety-note ${safety.level.className}`}>
                  {safetyIcon(safety.level.key)} Status keyword ulasan: <b>{safety.level.label}</b>
                  {safety.keywords.length > 0 && <span> — terdeteksi: {safety.keywords.join(", ")}</span>}
                </p>
              )}
              {(product.reviews?.length ? product.reviews : [{ name: "Food Rescuer", rating: 5, comment: "Produk sesuai informasi UMKM dan pickup berjalan lancar." }]).map((review, index) => (
                <article key={`${review.name}-${index}`}>
                  <span>{review.name.slice(0, 1)}</span>
                  <div><b>{review.name}</b><p>{"★".repeat(review.rating)} <ReviewComment comment={review.comment} /></p></div>
                </article>
              ))}
            </section>
          </div>

          <aside className="savora-buy-panel">
            <p className="savora-vendor">
              {product.vendor}<span>•</span>{product.distanceKm.toFixed(1)} km
              {showSafety && (
                <span className={`savora-safety-pill ${safety.level.className}`} title={`Ulasan keyword: ${safety.level.label}`}>
                  {safetyIcon(safety.level.key)} {safety.level.label}
                </span>
              )}
            </p>
            <h1>{product.name}</h1>
            <p className="savora-product-description">{product.description}</p>
            <div className="savora-prices savora-large-prices"><strong>{formatRupiah(product.rescue_price)}</strong>{product.original_price > product.rescue_price && <s>{formatRupiah(product.original_price)}</s>} {savings > 0 && <span>Hemat {formatRupiah(savings)} per porsi</span>}</div>

            <div className={`savora-score-panel ${band.className}`}>
              <div className="savora-score-panel-head">
                <span><Gauge size={15} aria-hidden="true" /> Food Score</span>
                <b>{score}<small>/100</small></b>
              </div>
              <div className="savora-score-meter" role="img" aria-label={`Food Score ${score} dari 100, ${band.label}`}>
                <span style={{ width: `${score}%` }} />
              </div>
              <p>{band.label} — skor menurun otomatis mengikuti sisa waktu.</p>
            </div>

            <TimerDisplay seconds={remainingSeconds} />
            <div className="savora-quantity"><span>Sisa {product.stock} porsi</span><div><button type="button" onClick={() => updateQuantity(-1)} disabled={quantity <= 1} aria-label="Kurangi jumlah"><Minus size={15} /></button><b>{quantity}</b><button type="button" onClick={() => updateQuantity(1)} disabled={quantity >= product.stock} aria-label="Tambah jumlah"><Plus size={15} /></button></div></div>
            <button type="button" className="savora-main-rescue" onClick={reserveProduct}>Selamatkan sekarang — <span>{formatRupiah(product.rescue_price * quantity)}</span></button>
            <div className="savora-pickup" id="pickup"><b><MapPin size={15} /> Lokasi Pickup</b><span>{product.pickup_address}</span><small>Tunjukkan pickup code saat tiba. Batas pickup mengikuti Smart Rescue Timer.</small></div>
          </aside>
        </section>
      </main>
      {notice && <div className="savora-toast" role="status">✓ {notice}</div>}
    </div>
  );
}
