"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  ChevronDown,
  Clock,
  Star,
  ChevronRight,
  SlidersHorizontal,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import { fetchMarketplaceProducts, computeProductScore, filterMarketplaceProducts, selectRecommendedProducts } from "@/lib/marketplace";
import { fetchAds, AD_TYPES } from "@/lib/ads";
import { deriveRestaurantSafety } from "@/lib/reviews";
import { useCart } from "@/lib/CartContext";

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const { count } = useCart();
  const [allProducts, setAllProducts] = useState([]);
  const [dataSource, setDataSource] = useState("api");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [sortMode, setSortMode] = useState("default");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [ads, setAds] = useState([]);
  const [adsSource, setAdsSource] = useState("api");
  const [elapsed, setElapsed] = useState(0);
  const sortDropdownRef = useRef(null);

  // Fetch products
  useEffect(() => {
    fetchMarketplaceProducts().then((result) => {
      setAllProducts(result.products || []);
      setDataSource(result.source || "api");
    });
  }, []);

  // Read category from query params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categoryParam !== "Semua") {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Fetch ads
  useEffect(() => {
    fetchAds(2).then(result => {
      setAds(result.ads);
      setAdsSource(result.source);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };
    if (sortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortDropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSortDropdownOpen(false);
      }
    };
    if (sortDropdownOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [sortDropdownOpen]);

  // Apply filtering
  const products = filterMarketplaceProducts(allProducts, {
    search: searchTerm,
    category: selectedCategory,
    sort: sortMode,
  });

  // Handlers
  const handleSearch = () => {
    // Filtering is reactive, no action needed
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSortClick = () => {
    setSortDropdownOpen((prev) => !prev);
  };

  const handleSortSelect = (mode) => {
    setSortMode(mode);
    setSortDropdownOpen(false);
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory((prev) => (prev === categoryName ? "Semua" : categoryName));
  };

  const handleRetry = () => {
    fetchMarketplaceProducts().then((result) => {
      setAllProducts(result.products || []);
      setDataSource(result.source || "api");
    });
  };

  const sortLabel = sortMode === "nearest" ? "Terdekat" : sortMode === "lowest-price" ? "Termurah" : "Terpopuler";

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getFoodScoreBadge = (score) => {
    if (score >= 80) return { text: "Sangat Layak", color: "#10b981" };
    if (score >= 60) return { text: "Layak", color: "#3b82f6" };
    if (score >= 35) return { text: "Segera Ambil", color: "#f59e0b" };
    return { text: "Kritis", color: "#ef4444" };
  };

  const nearbyProducts = products.slice(0, 12);
  // Pilih produk rekomendasi dengan logika adaptif untuk katalog kecil
  const now = Date.now();
  const recommendedBase = selectRecommendedProducts(products, { now, elapsedSeconds: elapsed });
  // Inject ads hanya jika: mode fallback ATAU (mode api DAN ada iklan)
  const shouldShowAds = adsSource === 'fallback' || (adsSource === 'api' && ads.length > 0);
  const recommendedProducts = shouldShowAds
    ? [...ads.slice(0, 2), ...recommendedBase].slice(0, 6)
    : recommendedBase;

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

  return (
    <div className="beranda-page">
      <header className="beranda-navbar">
        <div className="beranda-navbar-container">
          <div className="beranda-brand">
            <img src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png" alt="Savora Logo" className="beranda-logo-img" />
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

      <section className="beranda-section">
        <div className="beranda-container">
          <div style={{ marginBottom: "8px" }}>
            <div style={{
              position: "relative",
              width: "100%",
              height: "54px",
              backgroundColor: "#fff",
              borderRadius: "22px",
              display: "flex",
              alignItems: "center",
              paddingLeft: "20px",
              paddingRight: "8px",
              border: "1px solid #e8e8e8",
            }}>
              <Search size={18} color="#6b7280" />
              <input
                type="text"
                placeholder="Cari makanan atau resto terdekat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "15px",
                  color: "#151c27",
                  marginLeft: "12px",
                  backgroundColor: "transparent",
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  padding: "10px 24px",
                  borderRadius: "15px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cari
              </button>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}>
            <div ref={sortDropdownRef} style={{ position: "relative" }}>
              <button
                onClick={handleSortClick}
                style={{
                  backgroundColor: "#f5f3f3",
                  color: "#3e4941",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "8px 16px",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Urutkan: {sortLabel}
                <ChevronDown size={14} />
              </button>

              {sortDropdownOpen && (
                <div className="beranda-sort-dropdown">
                  <button
                    onClick={() => handleSortSelect("default")}
                    className={`beranda-sort-option ${sortMode === "default" ? "is-active" : ""}`}
                  >
                    Terpopuler
                  </button>
                  <button
                    onClick={() => handleSortSelect("nearest")}
                    className={`beranda-sort-option ${sortMode === "nearest" ? "is-active" : ""}`}
                  >
                    Terdekat
                  </button>
                  <button
                    onClick={() => handleSortSelect("lowest-price")}
                    className={`beranda-sort-option ${sortMode === "lowest-price" ? "is-active" : ""}`}
                  >
                    Termurah
                  </button>
                </div>
              )}
            </div>

            <div style={{
              width: "1px",
              height: "24px",
              backgroundColor: "#bdcabe",
            }}></div>

            <button style={{
              backgroundColor: "rgba(6,134,81,0.10)",
              color: "#006a3f",
              fontSize: "12px",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
            }}>
              Promo
            </button>

            <button style={{
              backgroundColor: "#fff",
              color: "#3e4941",
              fontSize: "12px",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid #e8e8e8",
              cursor: "pointer",
            }}>
              Rating 4.5+
            </button>

            <button style={{
              backgroundColor: "#fff",
              color: "#3e4941",
              fontSize: "12px",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid #e8e8e8",
              cursor: "pointer",
            }}>
              Di bawah 1 km
            </button>

            <button style={{
              backgroundColor: "#fff",
              color: "#3e4941",
              fontSize: "12px",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid #e8e8e8",
              cursor: "pointer",
            }}>
              Buka Sekarang
            </button>

            <button style={{
              backgroundColor: "#fff",
              color: "#3e4941",
              fontSize: "12px",
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid #e8e8e8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginLeft: "auto",
            }}>
              <SlidersHorizontal size={14} />
              Semua Filter
            </button>
          </div>
        </div>
      </section>

      <section className="beranda-section">
        <div className="beranda-container">
          <div className="beranda-section-header">
            <h2>Jelajahi Kategori</h2>
            <Link href="/marketplace" className="beranda-link">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>
          <div className="beranda-categories">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="beranda-category"
                style={{
                  opacity: selectedCategory === cat.name ? 1 : selectedCategory === "Semua" ? 1 : 0.5,
                  transform: selectedCategory === cat.name ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.2s ease",
                }}
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
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="beranda-section">
        <div className="beranda-container">
          {dataSource === "fallback" && (
            <div style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "15px",
              padding: "12px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}>
              <span style={{ fontSize: "14px", color: "#856404" }}>
                Menampilkan data demo — server tidak terjangkau
              </span>
              <button
                onClick={handleRetry}
                style={{
                  backgroundColor: "#ffc107",
                  color: "#000",
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "6px 14px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <RefreshCw size={14} /> Coba Lagi
              </button>
            </div>
          )}
          <div className="beranda-section-header">
            <h2>Makanan Terdekat</h2>
            <Link href="/marketplace" className="beranda-link">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>
          {products.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "48px 24px",
              backgroundColor: "#f9fafb",
              borderRadius: "15px",
              border: "1px solid #e5e7eb",
            }}>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", marginBottom: "8px" }}>
                Tidak ada produk ditemukan
              </p>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                Coba ubah pencarian atau filter kategori
              </p>
            </div>
          ) : null}
          <div className="beranda-products-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {nearbyProducts.map((product) => {
              const now = Date.now();
              const { score, remainingSeconds } = computeProductScore(product, now, elapsed);
              const badge = getFoodScoreBadge(score);
              const timerColor = remainingSeconds < 3600 ? "#ba1a1a" : "#16a34a";
              const rating = product.rating ?? (4.5 + ((product.id?.length ?? 0) % 5) * 0.1);
              const discountPercent = Math.round(((product.original_price - product.rescue_price) / product.original_price) * 100);

              // Safety badge (PRD 12.7)
              const showSafetyBadge = product.safety_level || (product.reviews && product.reviews.length >= 3);
              const safetyData = showSafetyBadge ? deriveRestaurantSafety(product.reviews || [], product.safety_level) : null;
              const safetyColor = safetyData?.level.key === "aman" ? "#16a34a" : safetyData?.level.key === "warning" ? "#f59e0b" : "#ef4444";

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
                        {safetyData && (
                          <span
                            className="beranda-badge-timer"
                            style={{ backgroundColor: safetyColor, color: "#fff", marginLeft: "4px" }}
                          >
                            {safetyData.level.label}
                          </span>
                        )}
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
                        <MapPin size={9} /> {product.vendor || "Toko"} • {product.distanceKm || "0.8"} km
                      </p>
                      <div className="beranda-product-footer">
                        <div className="beranda-product-price">
                          <div className="beranda-price-old-row">
                            <span className="beranda-price-original">
                              Rp {product.original_price?.toLocaleString("id-ID") || "30.000"}
                            </span>
                            <span className="beranda-price-discount">-{discountPercent}%</span>
                          </div>
                          <span className="beranda-price-rescue">
                            Rp {product.rescue_price?.toLocaleString("id-ID") || "15.000"}
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
            })}
          </div>
        </div>
      </section>

      <section className="beranda-section">
        <div className="beranda-container">
          <div className="beranda-section-header">
            <h2>Makanan Rekomendasi</h2>
            <Link href="/marketplace" className="beranda-link">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>
          {recommendedProducts.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "32px 24px",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                Tidak ada rekomendasi tersedia saat ini
              </p>
            </div>
          ) : (
            <div className="beranda-products-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {recommendedProducts.map((item) => {
              // Check if this is an ad or a product
              const isAd = item.sponsor !== undefined;

              if (isAd) {
                // Render ad card
                const adLabel = item.type === "umkm" ? "Promoted UMKM" : "Iklan";
                return (
                  <div key={item.id} className="beranda-product-card">
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : "_self"}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="beranda-product-link"
                    >
                      <div className="beranda-product-image">
                        <img src={item.photo_url} alt={item.headline} />
                        <div className="beranda-product-badges">
                          <span
                            className="beranda-badge-timer"
                            style={{ backgroundColor: "#f59e0b", color: "#fff" }}
                          >
                            {adLabel}
                          </span>
                        </div>
                      </div>
                      <div className="beranda-product-info">
                        <h3 style={{ fontSize: "14px", marginBottom: "4px" }}>{item.headline}</h3>
                        <p className="beranda-product-vendor">
                          <MapPin size={9} /> {item.sponsor}
                        </p>
                        <div className="beranda-product-footer">
                          <button
                            style={{
                              backgroundColor: "#16a34a",
                              color: "#fff",
                              fontSize: "13px",
                              fontWeight: 600,
                              padding: "8px 16px",
                              borderRadius: "10px",
                              border: "none",
                              cursor: "pointer",
                              width: "100%",
                            }}
                          >
                            {item.cta}
                          </button>
                        </div>
                      </div>
                    </a>
                  </div>
                );
              }

              // Render regular product card (same as nearbyProducts)
              const product = item;
              const now = Date.now();
              const { score, remainingSeconds } = computeProductScore(product, now, elapsed);
              const badge = getFoodScoreBadge(score);
              const timerColor = remainingSeconds < 3600 ? "#ba1a1a" : "#16a34a";
              const rating = product.rating ?? (4.5 + ((product.id?.length ?? 0) % 5) * 0.1);
              const discountPercent = Math.round(((product.original_price - product.rescue_price) / product.original_price) * 100);

              // Safety badge (PRD 12.7)
              const showSafetyBadge = product.safety_level || (product.reviews && product.reviews.length >= 3);
              const safetyData = showSafetyBadge ? deriveRestaurantSafety(product.reviews || [], product.safety_level) : null;
              const safetyColor = safetyData?.level.key === "aman" ? "#16a34a" : safetyData?.level.key === "warning" ? "#f59e0b" : "#ef4444";

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
                        {safetyData && (
                          <span
                            className="beranda-badge-timer"
                            style={{ backgroundColor: safetyColor, color: "#fff", marginLeft: "4px" }}
                          >
                            {safetyData.level.label}
                          </span>
                        )}
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
                        <MapPin size={9} /> {product.vendor || "Toko"} • {product.distanceKm || "0.8"} km
                      </p>
                      <div className="beranda-product-footer">
                        <div className="beranda-product-price">
                          <div className="beranda-price-old-row">
                            <span className="beranda-price-original">
                              Rp {product.original_price?.toLocaleString("id-ID") || "30.000"}
                            </span>
                            <span className="beranda-price-discount">-{discountPercent}%</span>
                          </div>
                          <span className="beranda-price-rescue">
                            Rp {product.rescue_price?.toLocaleString("id-ID") || "15.000"}
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
            })}
          </div>
          )}
        </div>
      </section>

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
              <p>Comfort Food</p>
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
              <p>Fresh Bread</p>
              <div className="beranda-shop-rating">
                <Star size={11} fill="#eab308" color="#eab308" />
                <span>4.9</span>
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
              <p>Asian Cuisine</p>
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
