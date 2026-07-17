"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock3, MapPin, Minus, Plus, Search, ShoppingBag, Sun } from "lucide-react";
import { fallbackMarketplaceProducts, fetchMarketplaceProduct, normalizeMarketplaceProduct } from "@/lib/marketplace";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function trustClass(status) {
  if (status === "Fresh") return "is-fresh";
  if (status === "Segera Dijual") return "is-urgent";
  return "is-eligible";
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
      <nav className="savora-main-nav" aria-label="Navigasi marketplace"><Link href="/marketplace">Rescue Deals</Link><a href="#assessment">Food Trust Index</a><a href="#pickup">Pickup</a></nav>
      <button className="savora-icon-button" type="button" aria-label="Tema terang demo"><Sun size={18} /></button>
      <button className="savora-cart" type="button" aria-label="Keranjang demo"><ShoppingBag size={19} /> <b>2</b></button>
      <button className="savora-login" type="button">Masuk</button>
      <button className="savora-signup" type="button">Daftar</button>
    </header>
  );
}

function Timer({ initialMinutes }) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  useEffect(() => {
    const interval = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, []);
  const time = useMemo(() => ({
    hours: String(Math.floor(seconds / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((seconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(seconds % 60).padStart(2, "0"),
  }), [seconds]);
  return <div className="savora-rescue-timer"><span><Clock3 size={14} /> Smart Rescue Timer</span><div><b>{time.hours}</b><small>jam</small><b>{time.minutes}</b><small>menit</small><b>{time.seconds}</b><small>detik</small></div></div>;
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

  if (!product) {
    return <div className="savora-marketplace"><MarketplaceHeader /><main className="savora-not-found"><h1>Produk tidak ditemukan</h1><p>Rescue deal ini mungkin sudah habis atau tidak aktif.</p><Link href="/marketplace" className="savora-primary-action">Kembali ke marketplace</Link></main></div>;
  }

  const savings = product.original_price - product.rescue_price;
  const reviewAverage = product.reviews?.length ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1) : "4.8";
  function updateQuantity(delta) { setQuantity((current) => Math.min(product.stock, Math.max(1, current + delta))); }
  function reserveProduct() { setNotice(`${quantity} porsi ${product.name} berhasil dipilih. Lanjutkan ke Checkout untuk pembayaran.`); }

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
              <div className="savora-assessment-title"><span>✦</span><div><h2 id="assessment-title">Food Eligibility Assessment</h2><p>Data yang diinput UMKM untuk perhitungan Food Trust Index.</p></div></div>
              <div className="savora-assessment-grid">
                <div><span>◷ Waktu produksi</span><b>{product.productionTime}</b></div>
                <div><span>▤ Kategori</span><b>{product.category}</b></div>
                <div><span>⌁ Penyimpanan</span><b>{product.storage}</b></div>
                <div><span>▣ Kemasan</span><b>{product.packaging}</b></div>
                <div><span>◷ Masa simpan</span><b>{product.shelfLife}</b></div>
                <div><span>✦ Skor Trust</span><b>{product.food_trust_status} ({product.trustScore}/100)</b></div>
              </div>
              <p className="savora-disclaimer"><b>Kenapa skor ini?</b> Produk berada dalam batas masa simpan, kemasan baik, dan penyimpanan sesuai input UMKM. Food Trust Index bukan sertifikasi lab; periksa kondisi makanan saat pickup.</p>
            </section>

            <section className="savora-reviews" aria-labelledby="reviews-title">
              <div className="savora-reviews-head"><h2 id="reviews-title">Ulasan Customer</h2><b>★ {reviewAverage} <small>({product.reviews?.length || 128})</small></b></div>
              {(product.reviews?.length ? product.reviews : [{ name: "Food Rescuer", rating: 5, comment: "Produk sesuai informasi UMKM dan pickup berjalan lancar." }]).map((review, index) => <article key={`${review.name}-${index}`}><span>{review.name.slice(0, 1)}</span><div><b>{review.name}</b><p>{"★".repeat(review.rating)} <i>{review.comment}</i></p></div></article>)}
            </section>
          </div>

          <aside className="savora-buy-panel">
            <p className="savora-vendor">{product.vendor}<span>•</span>{product.distanceKm.toFixed(1)} km</p>
            <h1>{product.name}</h1>
            <p className="savora-product-description">{product.description}</p>
            <div className="savora-prices savora-large-prices"><strong>{formatRupiah(product.rescue_price)}</strong>{product.original_price > product.rescue_price && <s>{formatRupiah(product.original_price)}</s>} {savings > 0 && <span>Hemat {formatRupiah(savings)} per porsi</span>}</div>
            <Timer key={`${product.id}-${product.timerMinutes}`} initialMinutes={product.timerMinutes} />
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
