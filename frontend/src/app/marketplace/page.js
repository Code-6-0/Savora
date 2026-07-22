"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  Clock3,
  Flame,
  Gauge,
  Leaf,
  Megaphone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import {
  computeProductScore,
  fallbackMarketplaceProducts,
  fetchMarketplaceProducts,
  filterMarketplaceProducts,
  normalizeMarketplaceProduct,
} from "@/lib/marketplace";
import { foodScoreBand, rescueTimeColor, rescueTimeLabel } from "@/lib/foodScore";
import { deriveRestaurantSafety } from "@/lib/reviews";
import { fallbackAds, fetchAds, trackAdImpression, trackAdClick } from "@/lib/ads";

const categories = ["Semua", "Nasi", "Bakery", "Snack", "Catering"];
const trustOptions = ["Semua", "Fresh", "Layak Dijual", "Segera Dijual"];

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Ticker bersama: satu timestamp Date.now() di-refresh tiap detik. Semua kartu
// menghitung Food Score & sisa waktu terhadap timestamp ini sehingga skor TIDAK
// reset saat halaman dimuat ulang (berbasis waktu absolut, bukan elapsed).
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  return now;
}

function safetyIcon(levelKey) {
  if (levelKey === "gawat") return <Flame size={11} aria-hidden="true" />;
  if (levelKey === "warning") return <ShieldAlert size={11} aria-hidden="true" />;
  return <ShieldCheck size={11} aria-hidden="true" />;
}

function MarketplaceHeader({ search, onSearchChange }) {
  return (
    <header className="savora-topbar">
      <Link className="savora-brand" href="/marketplace" aria-label="Savora marketplace">
        <span className="savora-brand-mark">S</span>
        <span> Savora <small>FOOD RESCUE</small></span>
      </Link>
      <label className="savora-search">
        <Search size={17} aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari nasi, roti, warung, atau UMKM..."
          aria-label="Cari produk atau UMKM"
        />
      </label>
      <nav className="savora-main-nav" aria-label="Navigasi marketplace">
        <a href="#rescue-deals">Rescue Deals</a>
        <a href="#cara-kerja">Cara Kerja</a>
        <a href="#untuk-umkm">UMKM</a>
        <Link href="/akun">Riwayat &amp; Impact</Link>
      </nav>
      <button className="savora-icon-button" type="button" aria-label="Tema terang demo">
        <Sun size={18} />
      </button>
      <button className="savora-cart" type="button" aria-label="Keranjang demo">
        <ShoppingBag size={19} /> <b>2</b>
      </button>
      <button className="savora-login" type="button">Masuk</button>
      <button className="savora-signup" type="button">Daftar</button>
    </header>
  );
}

function AdRail({ ads, source }) {
  const impressionTracked = useRef(new Set());

  const handleAdClick = (adId) => {
    // Track klik tanpa menunda navigasi (fire-and-forget, non-blocking)
    trackAdClick(adId, source);
  };

  const handleAdVisible = useCallback((adId) => {
    // Catat impression SEKALI per iklan per pemuatan halaman
    if (impressionTracked.current.has(adId)) return;
    impressionTracked.current.add(adId);
    trackAdImpression(adId, source);
  }, [source]);

  useEffect(() => {
    // Fallback: catat impression saat mount untuk iklan yang sudah terlihat
    // (bila IntersectionObserver tidak tersedia atau iklan sudah di viewport)
    if (!ads.length) return;

    // Coba pakai IntersectionObserver untuk tracking yang lebih akurat
    if (typeof IntersectionObserver === "undefined") {
      // Browser lama: langsung track semua iklan saat mount
      ads.forEach((ad) => handleAdVisible(ad.id));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const adId = entry.target.dataset.adId;
            if (adId) handleAdVisible(adId);
          }
        });
      },
      { threshold: 0.5 },
    );

    const cards = document.querySelectorAll("[data-ad-id]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [ads, handleAdVisible]);

  if (!ads.length) return null;

  return (
    <aside className="savora-ad-rail" aria-label="Iklan dan promosi">
      {ads.map((ad) => {
        const linkProps = ad.external
          ? { href: ad.href, target: "_blank", rel: "nofollow sponsored noopener" }
          : { href: ad.href };
        const Wrapper = ad.external ? "a" : Link;
        return (
          <Wrapper
            key={ad.id}
            className={`savora-ad-card is-${ad.type}`}
            data-ad-id={ad.id}
            onClick={() => handleAdClick(ad.id)}
            {...linkProps}
          >
            <div className="savora-ad-media">
              <Image src={ad.photo_url} alt={ad.sponsor} fill sizes="(max-width: 900px) 100vw, 33vw" />
              <span className="savora-ad-flag"><Megaphone size={11} aria-hidden="true" /> {ad.type === "umkm" ? "Promoted" : "Iklan"}</span>
            </div>
            <div className="savora-ad-body">
              <b>{ad.sponsor}</b>
              <p>{ad.headline}</p>
              <span className="savora-ad-cta">{ad.cta} <ArrowRight size={13} aria-hidden="true" /></span>
            </div>
          </Wrapper>
        );
      })}
    </aside>
  );
}

function FoodCard({ product, now }) {
  const savings = product.original_price - product.rescue_price;
  const { score, remainingSeconds } = computeProductScore(product, now);
  const band = foodScoreBand(score);
  // Color indicator sisa waktu ABSOLUT (PRD 5.1 & REVISI #31): paralel dengan
  // band skor, keduanya boleh berbeda.
  const timeColor = rescueTimeColor(remainingSeconds);
  const safety = product.safety;
  const showSafety = safety.level.key !== "aman" || safety.keywords.length > 0;

  return (
    <Link href={`/marketplace/${product.id}`} className="savora-food-card" aria-label={`Buka detail ${product.name}`}>
      <div className="savora-food-image">
        <Image src={product.photo_url} alt={product.name} fill sizes="(max-width: 570px) 100vw, (max-width: 900px) 50vw, 33vw" />
        <span className={`savora-score-badge ${band.className}`} title={`Food Score ${score}/100 — ${band.label}`}>
          <Gauge size={12} aria-hidden="true" /> {score}<small>/100</small>
        </span>
        {product.discountPercent > 0 && <span className="savora-discount">-{product.discountPercent}%</span>}
        <span className={`savora-timer ${timeColor.className}`}>
          <Clock3 size={12} aria-hidden="true" /> {rescueTimeLabel(remainingSeconds)}
        </span>
      </div>
      <div className="savora-food-content">
        <p className="savora-vendor">
          {product.vendor}<span>•</span>{product.distanceKm.toFixed(1)} km
          {showSafety && (
            <span className={`savora-safety-pill ${safety.level.className}`} title={`Ulasan keyword: ${safety.level.label}`}>
              {safetyIcon(safety.level.key)} {safety.level.label}
            </span>
          )}
        </p>
        <h3>{product.name}</h3>
        <div className={`savora-score-meter ${band.className}`} role="img" aria-label={`Food Score ${score} dari 100, ${band.label}`}>
          <span style={{ width: `${score}%` }} />
        </div>
        <div className="savora-score-caption"><b>{band.label}</b> <span>Food Score {score}/100</span></div>
        <div className="savora-prices">
          <strong>{formatRupiah(product.rescue_price)}</strong>
          {product.original_price > product.rescue_price && <s>{formatRupiah(product.original_price)}</s>}
        </div>
        <div className="savora-card-bottom">
          <span>Sisa {product.stock} porsi</span>
          <span className="savora-rescue-link">Selamatkan <ArrowRight size={15} aria-hidden="true" /></span>
        </div>
        {savings > 0 && <p className="savora-saving">Hemat {formatRupiah(savings)}</p>}
      </div>
    </Link>
  );
}

// Lekatkan data turunan yang stabil: status keamanan dari ulasan.
function attachRuntimeFields(product) {
  return {
    ...product,
    safety: deriveRestaurantSafety(product.reviews, product.safety_level),
  };
}

export default function MarketplacePage() {
  const [products, setProducts] = useState(() =>
    fallbackMarketplaceProducts.map(normalizeMarketplaceProduct).map(attachRuntimeFields),
  );
  const [ads, setAds] = useState(() => fallbackAds.slice(0, 3).map((ad) => ({ ...ad, external: /^https?:\/\//i.test(ad.href) })));
  const [adSource, setAdSource] = useState("fallback");
  const [filters, setFilters] = useState({ search: "", category: "Semua", trustStatus: "Semua", sort: "default" });
  const [dataSource, setDataSource] = useState("fallback");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const now = useNow();

  const loadProducts = async () => {
    try {
      const result = await fetchMarketplaceProducts();
      setProducts(result.products.map(attachRuntimeFields));
      setDataSource(result.source);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleRetry = () => {
    setIsRefetching(true);
    loadProducts();
  };

  useEffect(() => {
    let alive = true;
    fetchAds(3).then((result) => {
      if (alive) {
        setAds(result.ads || result);
        setAdSource(result.source || "fallback");
      }
    });
    return () => { alive = false; };
  }, []);

  // Filter + hide expired (food_score 0 / sisa waktu habis) — PRD 12.6:
  // "Listing otomatis berstatus Expired dan disembunyikan dari marketplace".
  const visibleProducts = useMemo(() => {
    const filtered = filterMarketplaceProducts(products, filters);
    return filtered.filter((product) => {
      const { score } = computeProductScore(product, now);
      return score > 0;
    });
  }, [products, filters, now]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="savora-marketplace">
      <MarketplaceHeader search={filters.search} onSearchChange={(value) => updateFilter("search", value)} />
      <main>
        <section className="savora-hero" aria-labelledby="savora-title">
          <div className="savora-hero-copy">
            <p className="savora-eyebrow"><Leaf size={14} /> Selamatkan makanan surplus dari UMKM lokal</p>
            <h1 id="savora-title">Makan enak.<br /><em>Selamatkan bumi.</em></h1>
            <p className="savora-hero-description">Temukan makanan surplus berkualitas dari UMKM terdekat. Lebih hemat, lebih bermakna, dengan Food Score yang menurun mengikuti Rescue Time secara transparan.</p>
            <div className="savora-hero-actions">
              <a className="savora-primary-action" href="#rescue-deals">Jelajahi Rescue Deals <ArrowRight size={17} /></a>
              <a className="savora-secondary-action" href="#untuk-umkm">Daftar sebagai UMKM</a>
            </div>
            <dl className="savora-stats">
              <div><dt>1,240+</dt><dd>Porsi diselamatkan</dd></div>
              <div><dt>180+</dt><dd>UMKM mitra</dd></div>
              <div><dt>≈ 380kg</dt><dd>CO₂ dihemat</dd></div>
            </dl>
          </div>
          <div className="savora-hero-media" aria-label="Contoh rescue deal Savora">
            <Image src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=90" alt="Aneka makanan dari UMKM lokal" fill priority sizes="(max-width: 900px) 100vw, 55vw" />
            <div className="savora-image-trust"><span>✓</span><div><b>Food Score: 92 / Sangat Layak</b><small>Diproduksi 2 jam lalu • Warung Bu Ratih</small></div></div>
            <div className="savora-image-saving"><b>-52%</b><span>Hemat Rp13.000</span></div>
            <div className="savora-image-timer"><Clock3 size={13} /> Rescue Time 2j 15m</div>
          </div>
        </section>

        <section id="rescue-deals" className="savora-deals" aria-labelledby="rescue-deals-title">
          <div className="savora-section-heading">
            <div>
              <p className="savora-eyebrow savora-green">RESCUE DEALS HARI INI</p>
              <h2 id="rescue-deals-title">Makanan yang butuh diselamatkan</h2>
              <p>Food Score menurun seiring Rescue Time berkurang menuju batas layak. Pickup langsung, bayar cashless via Midtrans.</p>
            </div>
            <div className="savora-selects">
              <label><SlidersHorizontal size={14} /><select value={filters.trustStatus} onChange={(event) => updateFilter("trustStatus", event.target.value)} aria-label="Filter Food Trust Index">
                {trustOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select></label>
              <label><ArrowUpDown size={14} /><select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)} aria-label="Urutkan produk">
                <option value="default">Rekomendasi</option>
                <option value="nearest">Terdekat</option>
                <option value="lowest-price">Harga terendah</option>
              </select></label>
            </div>
          </div>
          <div className="savora-categories" role="group" aria-label="Filter kategori">
            {categories.map((category) => <button key={category} type="button" className={filters.category === category ? "is-active" : ""} onClick={() => updateFilter("category", category)}>
              {category === "Semua" ? "🍽" : category === "Nasi" ? "🍚" : category === "Bakery" ? "🥐" : category === "Snack" ? "🥟" : "🍱"} {category}
            </button>)}
          </div>
          <AdRail ads={ads} source={adSource} />
          {dataSource === "fallback" && !isLoading && (
            <div className="savora-fallback-banner" role="status">
              <AlertTriangle size={15} aria-hidden="true" />
              <span>Menampilkan data demo — server tidak terjangkau</span>
              <button type="button" onClick={handleRetry} disabled={isRefetching}>
                <RefreshCw size={13} className={isRefetching ? "savora-spin" : ""} aria-hidden="true" /> Coba lagi
              </button>
            </div>
          )}
          <div className="savora-product-grid">
            {isLoading ? (
              <>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="savora-food-card savora-skeleton-card" aria-hidden="true">
                    <div className="savora-food-image savora-skeleton-pulse" />
                    <div className="savora-food-content">
                      <div className="savora-skeleton-line" style={{ width: "60%" }} />
                      <div className="savora-skeleton-line" style={{ width: "80%" }} />
                      <div className="savora-skeleton-line" style={{ width: "40%" }} />
                    </div>
                  </div>
                ))}
              </>
            ) : visibleProducts.length > 0 ? visibleProducts.map((product) => <FoodCard key={product.id} product={product} now={now} />) : (
              <div className="savora-empty"><b>Belum ada rescue deal yang cocok.</b><span>Coba ubah kata kunci atau filter-mu.</span></div>
            )}
          </div>
        </section>

        <section id="cara-kerja" className="savora-how-it-works"><p className="savora-eyebrow savora-green">CARA KERJA</p><h2>Pilih. Selamatkan. Ambil.</h2><div><span>1</span><p><b>Temukan deal</b>Filter makanan surplus yang dekat dan sesuai kebutuhanmu.</p><span>2</span><p><b>Periksa Food Score</b>Lihat skor kelayakan yang menurun mengikuti Rescue Time dan status keyword ulasan.</p><span>3</span><p><b>Ambil pesanan</b>Bayar cashless via Midtrans Sandbox lalu ambil langsung di UMKM.</p></div></section>
      </main>
      <footer id="untuk-umkm" className="savora-footer"><div className="savora-brand"><span className="savora-brand-mark">S</span><span>Savora <small>FOOD RESCUE</small></span></div><p>Selamatkan makanan, hemat biaya, kurangi limbah.<br />Marketplace food rescue untuk UMKM kuliner lokal.</p><span>© 2026 Savora. Karya CODE 6.0.</span></footer>
    </div>
  );
}
