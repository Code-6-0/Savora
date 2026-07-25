"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  ChevronDown,
  Clock,
  Star,
  ChevronRight,
  Leaf,
  DollarSign,
  Footprints,
  ShoppingCart,
  Award,
  Trophy,
  Globe,
  Trees,
  Utensils,
  Lock,
} from "lucide-react";
import { fetchMarketplaceProducts, computeProductScore, filterMarketplaceProducts } from "@/lib/marketplace";
import { useCart } from "@/lib/CartContext";

export default function BerandaPage() {
  const { count } = useCart();
  const [products, setProducts] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMarketplaceProducts().then((result) => {
      setProducts(result.products || []);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getTimerColor = (seconds) => {
    const hours = seconds / 3600;
    if (hours < 1) return "#ba1a1a";
    if (hours < 3) return "#fcc304";
    return "#16a34a";
  };

  const getFoodScoreBadge = (score) => {
    if (score >= 80) return { text: "Sangat Layak", color: "#10b981" };
    if (score >= 60) return { text: "Layak", color: "#3b82f6" };
    if (score >= 35) return { text: "Segera Ambil", color: "#f59e0b" };
    return { text: "Kritis", color: "#ef4444" };
  };

  const getFoodScoreColor = (score) => {
    if (score >= 70) return "#16a34a";
    if (score >= 40) return "#f0d944";
    return "#ba1a1a";
  };

  const filteredProducts = filterMarketplaceProducts(products);
  const topProducts = filteredProducts.slice(0, 8);

  const categories = [
    { name: "Bakery", icon: "/categories/bakery.svg", bgColor: "#ecfdf5", iconColor: "#059669" },
    { name: "Resto", icon: "/categories/resto.svg", bgColor: "#fff7ed", iconColor: "#ea580c" },
    { name: "UMKM", icon: "/categories/umkm.svg", bgColor: "#eff6ff", iconColor: "#2563eb" },
    { name: "Dessert", icon: "/categories/dessert.svg", bgColor: "#fdf2f8", iconColor: "#db2777" },
    { name: "Cafe", icon: "/categories/cafe.svg", bgColor: "#fefce8", iconColor: "#ca8a04" },
    { name: "Snacks", icon: "/categories/snacks.svg", bgColor: "#f0fdf4", iconColor: "#16a34a" },
    { name: "Vegan", icon: "/categories/vegan.svg", bgColor: "#faf5ff", iconColor: "#9333ea" },
    { name: "Fruits", icon: "/categories/fruits.svg", bgColor: "#fef2f2", iconColor: "#dc2626" },
    { name: "Drinks", icon: "/categories/drinks.svg", bgColor: "#ecfeff", iconColor: "#0891b2" },
  ];

  const restaurants = [
    { name: "Warung Bu Ratih", rating: 4.8, reviews: 124 },
    { name: "Kios Mbak Sari", rating: 4.6, reviews: 89 },
    { name: "Roti Kayu Bakery", rating: 4.9, reviews: 156 },
    { name: "Warung Pak Joko", rating: 4.7, reviews: 203 },
  ];

  const faqs = [
    {
      tag: "Pengambilan",
      question: "Bagaimana jika merchant tidak bisa memenuhi pesanan?",
    },
    {
      tag: "Refund",
      question: "Bagaimana proses refund jika ada masalah?",
    },
    {
      tag: "Keamanan Makanan",
      question: "Apakah makanannya aman untuk dimakan?",
    },
    {
      tag: "Kemasan",
      question: "Kemasan apa yang akan digunakan untuk makanan saya?",
    },
    {
      tag: "Food Trust Score",
      question: "Apa itu Food Trust Score?",
    },
    {
      tag: "Pengambilan",
      question: "Berapa lama saya bisa mengambil pesanan?",
    },
    {
      tag: "Refund",
      question: "Apa saja syarat untuk mendapatkan refund?",
    },
    {
      tag: "Keamanan Makanan",
      question: "Bagaimana cara memeriksa kondisi makanan saat pickup?",
    },
  ];

  return (
    <div className="beranda-page">
      {/* 1. Navbar */}
      <header className="beranda-navbar">
        <div className="beranda-navbar-container">
          <div className="beranda-brand">
            <img src="/brand/savora-logo.png" alt="Savora" className="beranda-logo-img" />
            <span className="beranda-brand-text">Savora</span>
          </div>
          <nav className="beranda-nav">
            <Link href="/" className="nav-active">Home</Link>
            <Link href="/marketplace">Marketplace</Link>
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
            <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: count > 0 ? '#eaf8ec' : 'transparent', transition: 'background-color 0.2s' }}>
              <ShoppingCart size={20} color={count > 0 ? '#16a34a' : '#6b7280'} />
              {count > 0 && (
                <span style={{ position: 'absolute', top: '0', right: '0', backgroundColor: '#16a34a', color: 'white', fontSize: '10px', fontWeight: '700', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                  {count}
                </span>
              )}
            </Link>
            <Link href="/dashboard" className="beranda-btn-secondary">
              Masuk
            </Link>
            <Link href="/marketplace" className="beranda-btn-primary">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Hijau */}
      <section className="beranda-hero">
        {/* Decorative icons */}
        <img src="/hero/deco-1.svg" className="hero-deco hero-deco-1" alt="" />
        <img src="/hero/deco-2.svg" className="hero-deco hero-deco-2" alt="" />
        <img src="/hero/deco-3.svg" className="hero-deco hero-deco-3" alt="" />
        <img src="/hero/deco-4.svg" className="hero-deco hero-deco-4" alt="" />
        <img src="/hero/deco-screen.png" className="hero-deco hero-deco-5" alt="" />

        <div className="beranda-hero-bowl beranda-hero-bowl-left">
          <img src="/hero/bowl-1.png" alt="Food bowl" />
        </div>
        <div className="beranda-hero-bowl beranda-hero-bowl-right">
          <img src="/hero/bowl-2.png" alt="Food bowl" />
        </div>
        <div className="beranda-hero-container">
          <div className="beranda-hero-content">
            <h1 className="beranda-hero-title">
              <span className="beranda-hero-title-yellow">Selamatkan Makanan,</span>
              <br />
              <span className="beranda-hero-title-white">Jaga Masa Depan</span>
            </h1>
            <div className="beranda-search-bar">
              <Search size={20} className="beranda-search-icon" />
              <input
                type="text"
                placeholder="Cari makanan atau resto terdekat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="beranda-search-input"
              />
              <button onClick={handleSearch} className="beranda-search-btn">
                Cari Sekarang
              </button>
            </div>
            <div className="beranda-chips">
              <span className="beranda-chips-label">Populer:</span>
              <span className="beranda-chip">Bakery</span>
              <span className="beranda-chip">Vegan</span>
              <span className="beranda-chip">Healthy Bowl</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Running Text Banner */}
      <div className="beranda-marquee">
        <div className="beranda-marquee-content">
          <span>⚡ Semua Menu Favoritmu Ada di Sini! Nikmati berbagai menu favorit dengan harga spesial. Berlaku hari ini, jangan sampai terlewat!</span>
          <span>⚡ Semua Menu Favoritmu Ada di Sini! Nikmati berbagai menu favorit dengan harga spesial. Berlaku hari ini, jangan sampai terlewat!</span>
          <span>⚡ Semua Menu Favoritmu Ada di Sini! Nikmati berbagai menu favorit dengan harga spesial. Berlaku hari ini, jangan sampai terlewat!</span>
        </div>
      </div>

      {/* 4. Jelajahi Kategori */}
      <section id="kategori" className="beranda-section">
        <div className="beranda-container">
          <div className="beranda-section-header">
            <h2>Jelajahi Kategori</h2>
            <Link href="/marketplace" className="beranda-link">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>
          <div className="beranda-categories">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className="beranda-category"
              >
                <div
                  className="beranda-category-circle"
                  style={{ backgroundColor: cat.bgColor }}
                >
                  <span
                    className="beranda-category-icon"
                    style={{
                      backgroundColor: cat.iconColor,
                      maskImage: `url(${cat.icon})`,
                      WebkitMaskImage: `url(${cat.icon})`,
                    }}
                  />
                </div>
                <span className="beranda-category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Rekomendasi Hari Ini */}
      <section className="beranda-section beranda-section-gray">
        <div className="beranda-container">
          <div className="beranda-section-header">
            <h2>Rekomendasi Hari Ini</h2>
            <Link href="/marketplace" className="beranda-link">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>
          <div className="beranda-products-grid">
            {topProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                <p style={{ fontSize: '15px', margin: '0 0 8px 0' }}>Tidak ada produk tersedia saat ini.</p>
                <p style={{ fontSize: '13px', margin: 0 }}>Coba lagi nanti untuk rescue deal baru.</p>
              </div>
            ) : (
              topProducts.map((product) => {
                const now = Date.now();
                const { score, remainingSeconds } = computeProductScore(product, now, elapsed);
                const badge = getFoodScoreBadge(score);
                const timerColor = remainingSeconds < 3600 ? "#ba1a1a" : remainingSeconds < 10800 ? "#f59e0b" : "#16a34a";
                const rating = product.rating ?? (4.5 + ((product.id?.length ?? 0) % 5) * 0.1);
                const discountPercent = Math.round(((product.original_price - product.rescue_price) / product.original_price) * 100);

                return (
                  <div key={product.id} className="beranda-product-card">
                    <Link href={`/marketplace/${product.id}`} className="beranda-product-link">
                      <div className="beranda-product-image">
                        <img src={product.photo_url} alt={product.name} />
                        <div className="beranda-product-badges">
                          <span
                            className="beranda-badge-timer"
                            style={{ backgroundColor: timerColor, color: "#fff" }}
                          >
                            <Clock size={12} /> {formatTimer(remainingSeconds)}
                          </span>
                        </div>
                        {score !== undefined && (
                          <span
                            className="beranda-badge-foodscore"
                            style={{ backgroundColor: score >= 70 ? "#16a34a" : "#f0d944" }}
                          >
                            <span className="beranda-badge-foodscore-icon">●</span>
                            FRS {Math.round(score)}%
                          </span>
                        )}
                      </div>
                      <div className="beranda-product-info">
                        <div className="beranda-product-title-row">
                          <h3>{product.name}</h3>
                          <div className="beranda-product-rating">
                            <Star size={9} fill="#16a34a" color="#16a34a" />
                            <span>{rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="beranda-product-vendor">
                          <MapPin size={9} /> {product.vendor} • {product.distanceKm} km
                        </p>
                        {Number.isFinite(product.stock) && (
                          <span className={`beranda-product-stock${product.stock <= 3 ? ' is-low' : ''}`}>
                            Sisa {product.stock} porsi
                          </span>
                        )}
                        <div className="beranda-product-footer">
                          <div className="beranda-product-price">
                            <div className="beranda-price-old-row">
                              <span className="beranda-price-original">
                                Rp {product.original_price.toLocaleString("id-ID")}
                              </span>
                              <span className="beranda-price-discount">-{discountPercent}%</span>
                            </div>
                            <span className="beranda-price-rescue">
                              Rp {product.rescue_price.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <button
                      className="beranda-product-cart"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/marketplace/${product.id}`;
                      }}
                      aria-label="Tambah ke keranjang"
                    >
                      <ShoppingCart size={17} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 6. Restoran Pilihan */}
      <section className="beranda-section">
        <div className="beranda-container">
          <div className="beranda-section-header">
            <h3>Restoran Pilihan</h3>
            <Link href="/marketplace" className="beranda-link">
              Lihat Semua
            </Link>
          </div>
          <div className="beranda-shops">
            <Link href="/marketplace" className="beranda-shop-card">
              <Image
                src="/shops/martabak.png"
                alt="Martabak"
                width={144}
                height={144}
                loading="eager"
              />
              <h4>Martabak</h4>
              <p>Sweet Treats</p>
              <div className="beranda-shop-rating">
                <Star size={11} fill="#eab308" color="#eab308" />
                <span>4.9</span>
              </div>
            </Link>
            <Link href="/marketplace" className="beranda-shop-card">
              <Image
                src="/shops/bakso-soto.png"
                alt="Bakso & Soto"
                width={144}
                height={144}
                loading="eager"
              />
              <h4>Bakso & Soto</h4>
              <p>Indonesian Comfort</p>
              <div className="beranda-shop-rating">
                <Star size={11} fill="#eab308" color="#eab308" />
                <span>4.8</span>
              </div>
            </Link>
            <Link href="/marketplace" className="beranda-shop-card">
              <Image
                src="/shops/bakery.png"
                alt="Bakery"
                width={144}
                height={144}
                loading="eager"
              />
              <h4>Bakery</h4>
              <p>Fresh Breads</p>
              <div className="beranda-shop-rating">
                <Star size={11} fill="#eab308" color="#eab308" />
                <span>4.6</span>
              </div>
            </Link>
            <Link href="/marketplace" className="beranda-shop-card">
              <Image
                src="/shops/chinese.png"
                alt="Chinese"
                width={144}
                height={144}
                loading="eager"
              />
              <h4>Chinese</h4>
              <p>Dim Sum & More</p>
              <div className="beranda-shop-rating">
                <Star size={11} fill="#eab308" color="#eab308" />
                <span>4.7</span>
              </div>
            </Link>
            <Link href="/marketplace" className="beranda-shop-card">
              <Image
                src="/shops/martabak.png"
                alt="Martabak"
                width={144}
                height={144}
                loading="eager"
              />
              <h4>Martabak</h4>
              <p>Sweet Treats</p>
              <div className="beranda-shop-rating">
                <Star size={11} fill="#eab308" color="#eab308" />
                <span>4.9</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Slot Iklan */}
      <section className="beranda-section beranda-section-gray">
        <div className="beranda-container">
          <h3 className="text-lg font-semibold mb-4">Iklan</h3>
          <div className="beranda-ads">
            <Image
              src="/ads/satara.png"
              alt="Iklan Satara" loading="eager"
              width={631}
              height={200}
              className="rounded-lg"
            />
            <Image
              src="/ads/asha-clean.png"
              alt="Iklan Asha Clean" loading="eager"
              width={283}
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* 8. Dampak Keberlanjutan */}
      <section id="tentang" className="beranda-section">
        <div className="beranda-container">
          <h2 className="beranda-section-title-center">Dampak Keberlanjutan</h2>
          <p className="beranda-impact-subtitle">
            Lihat kontribusimu dalam mengurangi food waste dan menjaga lingkungan.
          </p>
          <div className="beranda-impact">
            <div className="beranda-impact-community">
              <h3 className="beranda-impact-heading">
                <Globe size={20} color="#16a34a" className="beranda-impact-icon" />
                Kontribusi Komunitas
              </h3>
              <div className="beranda-impact-stats">
                <div className="beranda-impact-stat">
                  <div className="beranda-impact-number" style={{ color: "#16a34a" }}>1.2M+</div>
                  <div className="beranda-impact-label-upper">TOTAL MEALS SAVED</div>
                </div>
                <div className="beranda-impact-stat">
                  <div className="beranda-impact-number" style={{ color: "#006d2f" }}>450T</div>
                  <div className="beranda-impact-label-upper">CO2 EMISSION CUT</div>
                </div>
              </div>
              <div className="beranda-progress">
                <div className="beranda-progress-header-split">
                  <span className="beranda-progress-label-left">Target Zero Waste 2025</span>
                  <span className="beranda-progress-label-right">65% Achieved</span>
                </div>
                <div className="beranda-progress-bar">
                  <div className="beranda-progress-fill" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>
            <div className="beranda-impact-personal">
              <h3 className="beranda-impact-heading">
                <Star size={20} color="#16a34a" className="beranda-impact-icon" />
                Pencapaian Kamu
              </h3>
              <div className="beranda-achievement-card-horizontal">
                <div className="beranda-achievement-badge">
                  <Leaf size={34} color="#16a34a" />
                  <div className="beranda-achievement-level">LVL 5</div>
                </div>
                <div className="beranda-achievement-content">
                  <p className="beranda-achievement-text">
                    Kamu sudah menyelamatkan setara dengan <span style={{ color: '#16a34a', fontWeight: '600' }}>3 Pohon</span> minggu ini!
                  </p>
                  <div className="beranda-achievement-icons">
                    <div className="beranda-achievement-icon-badge" style={{ backgroundColor: 'white' }}>
                      <Trees size={20} color="#16a34a" />
                    </div>
                    <div className="beranda-achievement-icon-badge" style={{ backgroundColor: '#f59e0b' }}>
                      <Utensils size={20} color="white" />
                    </div>
                    <div className="beranda-achievement-icon-badge" style={{ backgroundColor: '#e5e7eb' }}>
                      <Lock size={20} color="#9ca3af" />
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/dashboard" className="beranda-achievement-button">
                Lihat Dashboard Lengkap
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. 3 Info Cards */}
      <section className="beranda-section beranda-section-gray">
        <div className="beranda-container">
          <div className="beranda-info-cards">
            <div className="beranda-info-card" style={{ backgroundColor: "#e8f6e9" }}>
              <div className="beranda-info-icon" style={{ backgroundColor: "#d1fae5" }}>
                <Leaf size={28} color="#16a34a" />
              </div>
              <h3>Jaga Planet Kita</h3>
              <p>
                Setiap makanan yang diselamatkan mengurangi emisi gas rumah kaca dan membantu
                menjaga lingkungan untuk generasi mendatang.
              </p>
            </div>
            <div className="beranda-info-card" style={{ backgroundColor: "#fffac3" }}>
              <div className="beranda-info-icon" style={{ backgroundColor: "#fef3c7" }}>
                <DollarSign size={28} color="#f59e0b" />
              </div>
              <h3>Hemat Uang Setiap Hari</h3>
              <p>
                Dapatkan makanan berkualitas dengan diskon hingga 50%. Harga transparan dengan
                breakdown service fee 5% sebelum checkout.
              </p>
            </div>
            <div className="beranda-info-card" style={{ backgroundColor: "#e4f2fd" }}>
              <div className="beranda-info-icon" style={{ backgroundColor: "#dbeafe" }}>
                <Footprints size={28} color="#3b82f6" />
              </div>
              <h3>Jalan Kaki & Rescue</h3>
              <p>
                Ambil sendiri di lokasi UMKM terdekat. Self-pickup mengurangi jejak karbon dari
                delivery dan menjaga harga tetap terjangkau.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ 2-Column */}
      <section className="beranda-section">
        <div className="beranda-container">
          <div className="beranda-faq-two-column">
            <div className="beranda-faq-left">
              <h2>Pertanyaan yang sering diajukan</h2>
              <p className="beranda-faq-subtitle">
                Semua yang perlu kamu ketahui tentang menyelamatkan makanan di Savora.
              </p>
              <Link href="/marketplace" className="beranda-link">
                Hubungi support <ChevronRight size={16} />
              </Link>
            </div>
            <div className="beranda-faq-right">
              {faqs.map((faq, index) => (
                <div key={index} className="beranda-faq-flat-item">
                  <span className="beranda-faq-chip">{faq.tag}</span>
                  <p className="beranda-faq-question-text">{faq.question}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
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
    </div>
  );
}
