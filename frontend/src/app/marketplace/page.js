"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpDown,
  Clock3,
  Leaf,
  MapPin,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import {
  fallbackMarketplaceProducts,
  fetchMarketplaceProducts,
  filterMarketplaceProducts,
  normalizeMarketplaceProduct,
} from "@/lib/marketplace";

const categories = ["Semua", "Nasi", "Bakery", "Snack", "Catering"];
const trustOptions = ["Semua", "Fresh", "Layak Dijual", "Segera Dijual"];

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function timerLabel(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}j ${remainingMinutes}m` : `${remainingMinutes}m`;
}

function trustClass(status) {
  if (status === "Fresh") return "is-fresh";
  if (status === "Segera Dijual") return "is-urgent";
  return "is-eligible";
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

function FoodCard({ product }) {
  const savings = product.original_price - product.rescue_price;
  return (
    <Link href={`/marketplace/${product.id}`} className="savora-food-card" aria-label={`Buka detail ${product.name}`}>
      <div className="savora-food-image">
        <Image src={product.photo_url} alt={product.name} fill sizes="(max-width: 570px) 100vw, (max-width: 900px) 50vw, 33vw" />
        <span className={`savora-trust ${trustClass(product.food_trust_status)}`}>{product.food_trust_status}</span>
        {product.discountPercent > 0 && <span className="savora-discount">-{product.discountPercent}%</span>}
        <span className="savora-timer"><Clock3 size={12} /> {timerLabel(product.timerMinutes)}</span>
      </div>
      <div className="savora-food-content">
        <p className="savora-vendor">{product.vendor}<span>•</span>{product.distanceKm.toFixed(1)} km</p>
        <h3>{product.name}</h3>
        <div className="savora-prices">
          <strong>{formatRupiah(product.rescue_price)}</strong>
          {product.original_price > product.rescue_price && <s>{formatRupiah(product.original_price)}</s>}
        </div>
        <div className="savora-card-bottom">
          <span>Sisa {product.stock} porsi</span>
          <span className="savora-rescue-link">Selamatkan <ArrowRight size={15} /></span>
        </div>
        {savings > 0 && <p className="savora-saving">Hemat {formatRupiah(savings)}</p>}
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const [products, setProducts] = useState(() => fallbackMarketplaceProducts.map(normalizeMarketplaceProduct));
  const [filters, setFilters] = useState({ search: "", category: "Semua", trustStatus: "Semua", sort: "default" });

  useEffect(() => {
    let alive = true;
    fetchMarketplaceProducts().then((items) => {
      if (alive) setProducts(items);
    });
    return () => { alive = false; };
  }, []);

  const visibleProducts = useMemo(
    () => filterMarketplaceProducts(products, filters),
    [products, filters],
  );

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
            <p className="savora-hero-description">Temukan makanan surplus berkualitas dari UMKM terdekat. Lebih hemat, lebih bermakna, dengan Food Trust Index yang transparan.</p>
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
            <div className="savora-image-trust"><span>✓</span><div><b>Food Trust Index: Fresh</b><small>Diproduksi 2 jam lalu • Warung Bu Ratih</small></div></div>
            <div className="savora-image-saving"><b>-52%</b><span>Hemat Rp13.000</span></div>
            <div className="savora-image-timer"><Clock3 size={13} /> Pickup dalam 2j 15m</div>
          </div>
        </section>

        <section id="rescue-deals" className="savora-deals" aria-labelledby="rescue-deals-title">
          <div className="savora-section-heading">
            <div>
              <p className="savora-eyebrow savora-green">RESCUE DEALS HARI INI</p>
              <h2 id="rescue-deals-title">Makanan yang butuh diselamatkan</h2>
              <p>Semua dengan Food Trust Index transparan. Pickup langsung, bayar COD atau via Midtrans.</p>
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
          <div className="savora-product-grid">
            {visibleProducts.length > 0 ? visibleProducts.map((product) => <FoodCard key={product.id} product={product} />) : (
              <div className="savora-empty"><b>Belum ada rescue deal yang cocok.</b><span>Coba ubah kata kunci atau filter-mu.</span></div>
            )}
          </div>
        </section>

        <section id="cara-kerja" className="savora-how-it-works"><p className="savora-eyebrow savora-green">CARA KERJA</p><h2>Pilih. Selamatkan. Ambil.</h2><div><span>1</span><p><b>Temukan deal</b>Filter makanan surplus yang dekat dan sesuai kebutuhanmu.</p><span>2</span><p><b>Periksa Food Trust Index</b>Lihat info kelayakan, harga, dan batas pickup dengan transparan.</p><span>3</span><p><b>Ambil pesanan</b>Pilih COD atau Midtrans Sandbox lalu ambil langsung di UMKM.</p></div></section>
      </main>
      <footer id="untuk-umkm" className="savora-footer"><div className="savora-brand"><span className="savora-brand-mark">S</span><span>Savora <small>FOOD RESCUE</small></span></div><p>Selamatkan makanan, hemat biaya, kurangi limbah.<br />Marketplace food rescue untuk UMKM kuliner lokal.</p><span>© 2026 Savora. Karya CODE 6.0.</span></footer>
    </div>
  );
}
