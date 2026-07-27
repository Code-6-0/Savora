"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import SavoraNavbar from "@/components/navbar/SavoraNavbar";
import {
  sidebarMenu,
  articles,
  DEFAULT_ARTICLE_ID,
  getAllArticles,
  findSidebarLocation,
} from "./data/help-articles";
import "./tentang.css";

// Kenapa Savora zigzag data (unchanged)
const kenapaSavoraCards = [
  {
    title: "UMKM Kuliner Terbaik, Ada di Savora",
    description:
      "Savora menghubungkanmu dengan UMKM kuliner di sekitarmu yang berkomitmen mengurangi food waste. Setiap pembelianmu membantu mereka tetap untung — dan tidak ada makanan layak yang berakhir di tempat sampah.",
    image: "/tentang/karakter-umkm.png",
    alt: "Ilustrasi karakter Savora bersama UMKM kuliner",
  },
  {
    title: "Ribuan Pilihan Menu Surplus Setiap Hari",
    description:
      "Temukan aneka makanan dan minuman berkualitas dari mitra UMKM dengan harga hingga 50% lebih hemat. Rasanya sama enaknya, harganya jauh lebih bersahabat — tinggal pilih menu favoritmu sebelum kehabisan.",
    image: "/tentang/karakter-surplus.png",
    alt: "Ilustrasi karakter Savora dengan berbagai pilihan menu surplus",
  },
  {
    title: "Bisa Makan sambil Berkontribusi",
    description:
      "Dari jajanan hingga makanan berat, setiap transaksi di Savora adalah aksi nyata: mengurangi limbah makanan, memperkuat ekonomi UMKM lokal, dan memangkas jejak karbon. Kenyang di perut, baik untuk bumi.",
    image: "/tentang/karakter-kontribusi.png",
    alt: "Ilustrasi karakter Savora berkontribusi untuk lingkungan",
  },
];

// =========================================================================
// Inner component — uses useSearchParams (needs Suspense boundary)
// =========================================================================
function TentangInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial article from URL query ?artikel=...
  const urlArticle = searchParams.get("artikel");
  const initialArticle =
    urlArticle && articles[urlArticle] ? urlArticle : DEFAULT_ARTICLE_ID;

  // State
  const [activeArticleId, setActiveArticleId] = useState(initialArticle);
  const [openSections, setOpenSections] = useState(() => {
    // Open the section that contains the initial article
    const loc = findSidebarLocation(initialArticle);
    const initial = {};
    if (loc) initial[loc.sectionIndex] = true;
    return initial;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [fadeState, setFadeState] = useState("in"); // "in" | "out"

  // Refs
  const cardRefs = useRef([]);
  const articleRef = useRef(null);
  const searchWrapperRef = useRef(null);

  // Current article
  const currentArticle = articles[activeArticleId] || articles[DEFAULT_ARTICLE_ID];

  // ---- Navigate to an article ----
  const navigateToArticle = useCallback(
    (articleId) => {
      if (articleId === activeArticleId) return;
      if (!articles[articleId]) return;

      // Fade out → swap → fade in
      setFadeState("out");
      setTimeout(() => {
        setActiveArticleId(articleId);

        // Update URL without full navigation
        const newUrl = `/tentang?artikel=${articleId}`;
        window.history.replaceState(null, "", newUrl);

        // Open the parent sidebar section
        const loc = findSidebarLocation(articleId);
        if (loc) {
          setOpenSections((prev) => ({ ...prev, [loc.sectionIndex]: true }));
        }

        // Scroll article into view
        if (articleRef.current) {
          articleRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }

        setFadeState("in");
      }, 200);
    },
    [activeArticleId]
  );

  // ---- Sync URL on popstate (browser back/forward) ----
  useEffect(() => {
    function handlePopState() {
      const params = new URLSearchParams(window.location.search);
      const artId = params.get("artikel");
      if (artId && articles[artId] && artId !== activeArticleId) {
        setActiveArticleId(artId);
        const loc = findSidebarLocation(artId);
        if (loc) {
          setOpenSections((prev) => ({ ...prev, [loc.sectionIndex]: true }));
        }
      }
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeArticleId]);

  // ---- Toggle accordion section ----
  function toggleSection(index) {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  // ---- Handle top-level menu click (no subitems = navigate directly) ----
  function handleMenuClick(section, sectionIndex) {
    if (section.subitems) {
      // Has subitems → just toggle accordion
      toggleSection(sectionIndex);
    } else if (section.articleId) {
      // No subitems → navigate to article directly
      navigateToArticle(section.articleId);
    }
  }

  // ---- Search ----
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const allArticles = getAllArticles();
    const matches = allArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.searchText.toLowerCase().includes(q)
    );
    setSearchResults(matches);
    setShowSearchResults(true);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchResultClick(articleId) {
    setSearchQuery("");
    setShowSearchResults(false);
    navigateToArticle(articleId);
  }

  // ---- Intersection Observer for zigzag cards ----
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // ---- Helper props for article Content components ----
  function LinkTo({ href, children }) {
    return <Link href={href}>{children}</Link>;
  }

  function ArticleLink({ articleId, children }) {
    return (
      <button
        type="button"
        className="tentang-inline-article-link"
        onClick={() => navigateToArticle(articleId)}
      >
        {children}
      </button>
    );
  }

  // ---- Check if an article is the active one ----
  function isArticleActive(articleId) {
    return activeArticleId === articleId;
  }

  // ---- Check if a top-level section is active (for non-subitem sections) ----
  function isSectionActive(section) {
    if (section.articleId) return activeArticleId === section.articleId;
    if (section.subitems) {
      return section.subitems.some((s) => s.articleId === activeArticleId);
    }
    return false;
  }

  // ---- Render article content ----
  const { Content } = currentArticle;

  return (
    <div className="beranda-page">
      {/* 1. Navbar */}
      <SavoraNavbar />

      {/* 2. Hero Bantuan */}
      <section className="tentang-hero">
        <h1>Hai, ada yang bisa kami bantu?</h1>
        <div className="tentang-search-wrapper" ref={searchWrapperRef}>
          <div className="tentang-search-bar">
            <input
              type="text"
              placeholder="Mencari..."
              className="tentang-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setShowSearchResults(true);
              }}
              aria-label="Cari artikel bantuan"
              id="tentang-search"
              autoComplete="off"
            />
            <button className="tentang-search-btn" aria-label="Cari">
              <Search size={18} />
            </button>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="tentang-search-results" role="listbox">
              {searchResults.map((article) => (
                <button
                  key={article.id}
                  className="tentang-search-result-item"
                  onClick={() => handleSearchResultClick(article.id)}
                  role="option"
                  aria-selected={false}
                >
                  <span className="tentang-search-result-category">
                    {article.category}
                  </span>
                  <span className="tentang-search-result-title">
                    {article.title}
                  </span>
                </button>
              ))}
            </div>
          )}

          {showSearchResults && searchQuery.trim() && searchResults.length === 0 && (
            <div className="tentang-search-results">
              <div className="tentang-search-no-results">
                Tidak ditemukan artikel untuk &ldquo;{searchQuery}&rdquo;
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Layout Dua Kolom */}
      <section className="tentang-content-section">
        <div className="tentang-content-container">
          {/* Sidebar */}
          <aside className="tentang-sidebar" aria-label="Navigasi bantuan">
            {sidebarMenu.map((section, sectionIndex) => {
              const hasSubitems = section.subitems && section.subitems.length > 0;
              const isOpen = openSections[sectionIndex] || false;
              const sectionIsActive = isSectionActive(section);

              return (
                <div key={section.id} className="tentang-accordion-item">
                  <button
                    className={`tentang-accordion-btn ${isOpen ? "is-open" : ""} ${
                      !hasSubitems && sectionIsActive ? "is-active-section" : ""
                    }`}
                    onClick={() => handleMenuClick(section, sectionIndex)}
                    aria-expanded={hasSubitems ? isOpen : undefined}
                    aria-controls={
                      hasSubitems ? `accordion-panel-${sectionIndex}` : undefined
                    }
                    id={`accordion-header-${sectionIndex}`}
                  >
                    {section.title}
                    {hasSubitems && (
                      <ChevronDown
                        size={16}
                        className="tentang-accordion-chevron"
                      />
                    )}
                  </button>
                  {hasSubitems && (
                    <div
                      className={`tentang-accordion-content ${isOpen ? "is-open" : ""}`}
                      role="region"
                      id={`accordion-panel-${sectionIndex}`}
                      aria-labelledby={`accordion-header-${sectionIndex}`}
                    >
                      <ul className="tentang-accordion-list">
                        {section.subitems.map((sub) => (
                          <li key={sub.id}>
                            <button
                              className={
                                isArticleActive(sub.articleId)
                                  ? "is-active"
                                  : ""
                              }
                              onClick={() => navigateToArticle(sub.articleId)}
                            >
                              {sub.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </aside>

          {/* Article Content — with fade transition */}
          <article
            ref={articleRef}
            className={`tentang-article tentang-article-fade tentang-article-fade-${fadeState}`}
          >
            <h2>{currentArticle.title}</h2>
            <Content LinkTo={LinkTo} ArticleLink={ArticleLink} />
          </article>
        </div>
      </section>

      {/* 4. Section "Kenapa Savora?" (unchanged) */}
      <section className="tentang-kenapa">
        <div className="tentang-kenapa-container">
          <h2>Kenapa Savora?</h2>

          {kenapaSavoraCards.map((card, index) => (
            <div
              key={card.title}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={`tentang-zigzag-card ${index % 2 !== 0 ? "is-reversed" : ""}`}
            >
              <div className="tentang-zigzag-image">
                <img src={card.image} alt={card.alt} loading="lazy" />
              </div>
              <div className="tentang-zigzag-text">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Footer (unchanged — reuse beranda-footer) */}
      <footer className="beranda-footer">
        <div className="beranda-footer-container">
          <div className="beranda-footer-column-brand">
            <div className="beranda-footer-wordmark">Savora</div>
            <p className="beranda-footer-mission">
              Misi kami sederhana: Tidak boleh ada makanan enak yang terbuang
              sia-sia. Bergabunglah dengan ribuan penyelamat makanan lainnya di
              seluruh Indonesia.
            </p>
            <div className="beranda-footer-social">
              <button
                className="beranda-footer-social-btn"
                aria-label="Website"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm5.8 5h-1.9c-.2-1-.5-2-1-2.8 1.5.6 2.6 1.8 2.9 3.3zM8 2c.6 1 1.1 2.2 1.3 3.5H6.7C6.9 4.2 7.4 3 8 2zM2.3 9.5c-.2-.5-.3-1-.3-1.5s.1-1 .3-1.5h2.2c-.1.5-.1 1-.1 1.5s0 1 .1 1.5H2.3zm.9 2h1.9c.2 1 .5 2 1 2.8-1.5-.6-2.6-1.8-2.9-3.3zM5.1 5H3.2c.3-1.5 1.4-2.7 2.9-3.3-.5.8-.8 1.8-1 2.8zm2.9 9c-.6-1-1.1-2.2-1.3-3.5h2.6c-.2 1.3-.7 2.5-1.3 3.5zm1.5-5.5H5.5c-.1-.5-.1-1-.1-1.5s0-1 .1-1.5h4.8c.1.5.1 1 .1 1.5s0 1-.1 1.5zm.6 4.8c.5-.8.8-1.8 1-2.8h1.9c-.3 1.5-1.4 2.7-2.9 3.3zm1.4-4.8c.1-.5.1-1 .1-1.5s0-1-.1-1.5h2.2c.2.5.3 1 .3 1.5s-.1 1-.3 1.5h-2.2z"
                    fill="#006a3f"
                  />
                </svg>
              </button>
              <button
                className="beranda-footer-social-btn"
                aria-label="Share"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13 10c-.8 0-1.5.3-2 .8L6.5 8.3c.1-.3.1-.5.1-.8s0-.5-.1-.8L11 4.2c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .3 0 .5.1.8L5 5.3C4.5 4.8 3.8 4.5 3 4.5c-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2-.8l4.5 2.5c-.1.3-.1.5-.1.8 0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3z"
                    fill="#006a3f"
                  />
                </svg>
              </button>
              <button
                className="beranda-footer-social-btn"
                aria-label="Chat"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 1H2C1.4 1 1 1.4 1 2v9c0 .6.4 1 1 1h3v3l3-3h6c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zM5 8H4V7h1v1zm3 0H7V7h1v1zm3 0h-1V7h1v1z"
                    fill="#006a3f"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="beranda-footer-column">
            <h4>Layanan Kami</h4>
            <Link href="/marketplace">Daftar Marketplace</Link>
            <Link href="/marketplace">Daftar Sebagai Mitra Donasi</Link>
            <Link href="/marketplace">Voucher &amp; Promo</Link>
            <Link href="/marketplace">Catering Sisa</Link>
          </div>

          <div className="beranda-footer-column">
            <h4>Informasi</h4>
            <Link href="/tentang">Tentang Kami</Link>
            <Link href="/tentang">Bantuan &amp; FAQ</Link>
            <Link href="/marketplace">Syarat &amp; Ketentuan</Link>
            <Link href="/marketplace">Kebijakan Privasi</Link>
          </div>

          <div className="beranda-footer-column">
            <h4>Dapatkan Informasi terbaru</h4>
            <p className="beranda-footer-newsletter-desc">
              Dapatkan info flash deal dan update promo penyelamatan makanan
              langsung di emailmu.
            </p>
            <div className="beranda-footer-newsletter">
              <input
                type="email"
                placeholder="Email kamu"
                className="beranda-footer-newsletter-input"
              />
              <button
                className="beranda-footer-newsletter-btn"
                aria-label="Subscribe"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M15.8 0.2c-.2-.2-.5-.3-.8-.2L0.4 5.6c-.3.1-.5.4-.5.7 0 .3.2.6.5.7l4.8 2.1L7.3 14c.1.3.4.5.7.5.3 0 .6-.2.7-.5L15.8 1c.1-.3.1-.6 0-.8z"
                    fill="white"
                  />
                </svg>
              </button>
            </div>
            <div className="beranda-footer-badges">
              <img
                src="/footer/badge-1.png"
                alt="App Store"
                className="beranda-footer-badge"
              />
              <img
                src="/footer/badge-2.png"
                alt="Google Play"
                className="beranda-footer-badge"
              />
            </div>
          </div>
        </div>

        <div className="beranda-footer-bottom">
          <span>
            © 2026 Savora Platform. Proudly Made In Indonesia for the Earth.
          </span>
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

// =========================================================================
// Wrapper with Suspense (required for useSearchParams)
// =========================================================================
export default function TentangPage() {
  return (
    <Suspense
      fallback={
        <div className="beranda-page">
          <SavoraNavbar />
          <section className="tentang-hero">
            <h1>Hai, ada yang bisa kami bantu?</h1>
          </section>
        </div>
      }
    >
      <TentangInner />
    </Suspense>
  );
}
