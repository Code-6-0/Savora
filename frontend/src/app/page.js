"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
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
import { fetchMarketplaceProducts, computeProductScore } from "@/lib/marketplace";

export default function BerandaPage() {
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
    if (score >= 40) return "#fcc304";
    return "#ba1a1a";
  };

  const topProducts = products.slice(0, 8);

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
            <div className="beranda-logo">S</div>
            <span className="beranda-brand-text">Savora</span>
          </div>
          <nav className="beranda-nav">
            <Link href="/">Beranda</Link>
            <Link href="/marketplace">Marketplace</Link>
            <a href="#kategori">Kategori</a>
            <a href="#tentang">Tentang</a>
          </nav>
          <div className="beranda-location">
            <MapPin size={16} />
            <span>Sleman, Yogyakarta</span>
          </div>
          <div className="beranda-actions">
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
        <div className="beranda-hero-bowl beranda-hero-bowl-left">
          <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop" alt="Food bowl" />
        </div>
        <div className="beranda-hero-bowl beranda-hero-bowl-right">
          <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop" alt="Food bowl" />
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
            {topProducts.map((product) => {
              const now = Date.now();
              const { score, remainingSeconds } = computeProductScore(product, now, elapsed);
              const badge = getFoodScoreBadge(score);
              const timerColor = getTimerColor(remainingSeconds);

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
                          style={{ backgroundColor: getFoodScoreColor(score) }}
                        >
                          <span className="beranda-badge-foodscore-icon">●</span>
                          FS {Math.round(score)}%
                        </span>
                      )}
                    </div>
                    <div className="beranda-product-info">
                      <h3>{product.name}</h3>
                      <p className="beranda-product-vendor">
                        <span>{product.vendor}</span>
                        <span className="beranda-product-distance">
                          <MapPin size={14} /> {product.distanceKm} km
                        </span>
                      </p>
                      <div className="beranda-product-footer">
                        <div className="beranda-product-price">
                          <span className="beranda-price-original">
                            Rp {product.original_price.toLocaleString("id-ID")}
                          </span>
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
                    <ShoppingCart size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Restoran Pilihan */}
      <section className="beranda-section">
        <div className="beranda-container">
          <div className="beranda-section-header">
            <h2>Restoran Pilihan</h2>
            <Link href="/marketplace" className="beranda-link">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>
          <div className="beranda-restaurants">
            {restaurants.map((resto) => (
              <Link key={resto.name} href="/marketplace" className="beranda-restaurant">
                <div className="beranda-restaurant-avatar">{resto.name.charAt(0)}</div>
                <div className="beranda-restaurant-info">
                  <h3>{resto.name}</h3>
                  <div className="beranda-restaurant-rating">
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span>{resto.rating}</span>
                    <span className="beranda-restaurant-reviews">({resto.reviews} ulasan)</span>
                  </div>
                </div>
              </Link>
            ))}
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
          <div className="beranda-footer-brand">
            <div className="beranda-footer-logo">
              <div className="beranda-logo">S</div>
              <span className="beranda-brand-text">Savora</span>
            </div>
            <p>Selamatkan makanan, hemat biaya, kurangi limbah.</p>
            <p className="beranda-footer-tagline">
              Marketplace food rescue untuk UMKM kuliner lokal.
            </p>
          </div>
          <div className="beranda-footer-links">
            <div className="beranda-footer-column">
              <h4>Produk</h4>
              <Link href="/marketplace">Marketplace</Link>
              <Link href="/dashboard">Dashboard UMKM</Link>
              <a href="#kategori">Kategori</a>
            </div>
            <div className="beranda-footer-column">
              <h4>Perusahaan</h4>
              <a href="#tentang">Tentang Kami</a>
              <Link href="/marketplace">Cara Kerja</Link>
              <Link href="/marketplace">Kontak</Link>
            </div>
            <div className="beranda-footer-column">
              <h4>Dukungan</h4>
              <Link href="/marketplace">FAQ</Link>
              <Link href="/marketplace">Help Center</Link>
              <Link href="/marketplace">Kebijakan Privasi</Link>
            </div>
          </div>
        </div>
        <div className="beranda-footer-bottom">
          <span>© 2026 Savora. Karya CODE 6.0.</span>
          <span>Food rescue marketplace berbasis web.</span>
        </div>
      </footer>
    </div>
  );
}
