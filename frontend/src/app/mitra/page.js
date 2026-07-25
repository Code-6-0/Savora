"use client";

import SavoraNavbar from "@/components/navbar/SavoraNavbar";
import "./mitra.css";

export default function MitraPage() {
  return (
    <div className="mitra-page">
      {/* Navbar global (reuse existing) */}
      <SavoraNavbar />

      {/* Hero Section — Kutipan inspiratif dengan bg kuning */}
      <section className="mitra-hero">
        <div className="mitra-hero-container">
          <blockquote className="mitra-hero-quote">
            <span className="mitra-quote-dark">
              "Bersama Savora, setiap langkah kecil menjadi kontribusi nyata
              dalam menyelamatkan{" "}
            </span>
            <span className="mitra-quote-green">
              makanan, mengurangi limbah, dan membangun masa depan."
            </span>
          </blockquote>

          {/* Dekorasi ikon line-art (SVG inline sederhana) */}
          {/* Pizza slice — pojok kiri bawah */}
          <svg
            className="mitra-deco mitra-deco-pizza"
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M40 10 L70 70 L10 70 Z"
              stroke="#151c27"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="35" cy="50" r="3" stroke="#151c27" strokeWidth="2" fill="none" />
            <circle cx="48" cy="55" r="3" stroke="#151c27" strokeWidth="2" fill="none" />
            <circle cx="40" cy="38" r="3" stroke="#151c27" strokeWidth="2" fill="none" />
            <line x1="40" y1="10" x2="40" y2="70" stroke="#151c27" strokeWidth="1.5" />
          </svg>

          {/* Roti/Croissant — pojok kanan atas */}
          <svg
            className="mitra-deco mitra-deco-bread"
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 35 Q30 20, 45 25 Q60 30, 65 40 Q68 50, 60 60 L20 60 Q15 50, 20 35 Z"
              stroke="#151c27"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M25 40 Q35 32, 45 38"
              stroke="#151c27"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M30 50 Q40 45, 50 50"
              stroke="#151c27"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          {/* Cangkir teh — pojok kanan bawah */}
          <svg
            className="mitra-deco mitra-deco-cup"
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 30 L25 60 L55 60 L60 30 Z"
              stroke="#151c27"
              strokeWidth="2"
              fill="none"
            />
            <line x1="20" y1="30" x2="60" y2="30" stroke="#151c27" strokeWidth="2" />
            <path
              d="M60 35 Q70 35, 70 45 Q70 55, 60 55"
              stroke="#151c27"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M30 20 Q35 12, 40 20"
              stroke="#151c27"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </div>
      </section>

      {/* Stats Bar — Statistik mitra dalam 4 kolom */}
      <section className="mitra-stats">
        <div className="mitra-stats-container">
          <div className="mitra-stat-item">
            <div className="mitra-stat-number">250+</div>
            <div className="mitra-stat-label">Mitra UMKM Aktif</div>
          </div>

          <div className="mitra-stat-item">
            <div className="mitra-stat-number">4 Jenis</div>
            <div className="mitra-stat-label">Mitra Pengolah</div>
          </div>

          <div className="mitra-stat-item">
            <div className="mitra-stat-number">1.2k+</div>
            <div className="mitra-stat-label">Produk Diselamatkan</div>
          </div>

          <div className="mitra-stat-item">
            <div className="mitra-stat-number">95%</div>
            <div className="mitra-stat-label">Pickup Tepat Waktu</div>
          </div>
        </div>
      </section>
    </div>
  );
}
