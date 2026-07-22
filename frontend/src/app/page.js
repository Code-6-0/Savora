"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  ChevronDown,
  Leaf,
  DollarSign,
  Footprints,
  ShoppingCart,
} from "lucide-react";
import { fetchMarketplaceProducts, computeProductScore } from "@/lib/marketplace";

export default function BerandaPage() {
  const [products, setProducts] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);

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
    if (h > 0) return `${h}j ${m}m`;
    return `${m}m`;
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
      category: "Umum",
      question: "Apa itu Savora?",
      answer:
        "Savora adalah platform food rescue yang menghubungkan customer dengan UMKM kuliner untuk membeli makanan surplus berkualitas dengan harga lebih terjangkau.",
    },
    {
      category: "Pembelian",
      question: "Bagaimana cara membeli produk?",
      answer:
        "Pilih produk di marketplace, lakukan checkout cashless via Midtrans, lalu ambil dengan kode pickup di lokasi UMKM.",
    },
    {
      category: "Pembayaran",
      question: "Metode pembayaran apa saja yang tersedia?",
      answer:
        "Savora menggunakan pembayaran cashless only melalui Midtrans. Service fee 5% otomatis ditambahkan ke total pembayaran.",
    },
    {
      category: "Food Score",
      question: "Apa itu Food Score dan Rescue Timer?",
      answer:
        "Food Score (0-100) menurun seiring waktu mendekati expired. Rescue Timer menunjukkan sisa waktu dengan warna: merah < 1 jam, kuning 1-3 jam, hijau > 3 jam.",
    },
    {
      category: "Keamanan",
      question: "Bagaimana saya tahu makanan aman dikonsumsi?",
      answer:
        "Setiap produk dilengkapi Food Trust Index dan badge keyword safety dari review customer. Periksa kondisi makanan saat pickup.",
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
          <span>🎉 Hemat hingga 50% untuk rescue deals hari ini!</span>
          <span>🌍 Bantu kurangi food waste bersama Savora</span>
          <span>⭐ 1.2M+ makanan terselamatkan</span>
          <span>🎉 Hemat hingga 50% untuk rescue deals hari ini!</span>
          <span>🌍 Bantu kurangi food waste bersama Savora</span>
          <span>⭐ 1.2M+ makanan terselamatkan</span>
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
                        {product.discountPercent > 0 && (
                          <span className="beranda-badge-discount">
                            {product.discountPercent}% OFF
                          </span>
                        )}
                      </div>
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
          <div className="beranda-ads">
            <div className="beranda-ad-banner">
              <div className="beranda-ad-content">
                <h3>Iklan Premium UMKM</h3>
                <p>Ruang iklan untuk UMKM verified dengan approval admin.</p>
                <Link href="/dashboard" className="beranda-ad-btn">
                  Pasang Iklan
                </Link>
              </div>
            </div>
            <div className="beranda-ad-banner">
              <div className="beranda-ad-content">
                <h3>Sponsor Partner</h3>
                <p>Slot iklan pihak ketiga yang sudah disetujui.</p>
                <Link href="/marketplace" className="beranda-ad-btn">
                  Jelajahi Deals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Dampak Keberlanjutan */}
      <section id="tentang" className="beranda-section">
        <div className="beranda-container">
          <h2 className="beranda-section-title-center">Dampak Keberlanjutan</h2>
          <div className="beranda-impact">
            <div className="beranda-impact-community">
              <h3>Kontribusi Komunitas</h3>
              <div className="beranda-impact-stats">
                <div className="beranda-impact-stat">
                  <div className="beranda-impact-number">1.2M+</div>
                  <div className="beranda-impact-label">Makanan Terselamatkan</div>
                </div>
                <div className="beranda-impact-stat">
                  <div className="beranda-impact-number">450T</div>
                  <div className="beranda-impact-label">CO₂ Dikurangi (kg)</div>
                </div>
              </div>
              <div className="beranda-progress">
                <div className="beranda-progress-header">
                  <span>Target Zero Waste 2026</span>
                  <span>65%</span>
                </div>
                <div className="beranda-progress-bar">
                  <div className="beranda-progress-fill" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>
            <div className="beranda-impact-personal">
              <h3>Pencapaian Kamu</h3>
              <div className="beranda-achievement-card">
                <Leaf size={32} color="#16a34a" />
                <p>Mulai kontribusi dengan membeli rescue deal pertama kamu!</p>
                <Link href="/marketplace" className="beranda-achievement-btn">
                  Lihat Deals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. 3 Info Cards */}
      <section className="beranda-section beranda-section-gray">
        <div className="beranda-container">
          <div className="beranda-info-cards">
            <div className="beranda-info-card">
              <div className="beranda-info-icon" style={{ backgroundColor: "#d1fae5" }}>
                <Leaf size={28} color="#16a34a" />
              </div>
              <h3>Jaga Planet Kita</h3>
              <p>
                Setiap makanan yang diselamatkan mengurangi emisi gas rumah kaca dan membantu
                menjaga lingkungan untuk generasi mendatang.
              </p>
            </div>
            <div className="beranda-info-card">
              <div className="beranda-info-icon" style={{ backgroundColor: "#fef3c7" }}>
                <DollarSign size={28} color="#f59e0b" />
              </div>
              <h3>Hemat Uang Setiap Hari</h3>
              <p>
                Dapatkan makanan berkualitas dengan diskon hingga 50%. Harga transparan dengan
                breakdown service fee 5% sebelum checkout.
              </p>
            </div>
            <div className="beranda-info-card">
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

      {/* 10. FAQ Accordion */}
      <section className="beranda-section">
        <div className="beranda-container beranda-faq-container">
          <h2 className="beranda-section-title-center">Frequently Asked Questions</h2>
          <div className="beranda-faq-categories">
            <span className="beranda-faq-tag">Umum</span>
            <span className="beranda-faq-tag">Pembelian</span>
            <span className="beranda-faq-tag">Pembayaran</span>
            <span className="beranda-faq-tag">Food Score</span>
            <span className="beranda-faq-tag">Keamanan</span>
          </div>
          <div className="beranda-faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="beranda-faq-item">
                <button
                  className="beranda-faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={expandedFaq === index ? "beranda-faq-icon-open" : ""}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="beranda-faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
          <div className="beranda-faq-support">
            <p>Tidak menemukan jawaban yang kamu cari?</p>
            <Link href="/marketplace" className="beranda-link">
              Hubungi support <ChevronRight size={16} />
            </Link>
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
