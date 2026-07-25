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

      {/* Section 2 — Pilih peran Anda dalam ekosistem */}
      <section className="mitra-roles">
        <div className="mitra-roles-container">
          <h2 className="mitra-roles-title">Pilih peran Anda dalam ekosistem</h2>
          <p className="mitra-roles-subtitle">
            Platform terintegrasi untuk pengelolaan sisa makanan yang efisien dan berdampak sosial.
          </p>

          {/* Card 1 — UMKM Kuliner */}
          <div className="mitra-role-card mitra-role-umkm">
            <div className="mitra-role-image">
              <img src="/images/karakter-mitra1.png" alt="UMKM Kuliner" />
            </div>
            <div className="mitra-role-content">
              <h3 className="mitra-role-card-title">Saya UMKM Kuliner</h3>
              <p className="mitra-role-card-desc">
                Restoran, Café, Bakery, atau Hotel yang ingin mengelola sisa makanan secara bertanggung jawab dan mematuhi regulasi lingkungan.
              </p>
              <ul className="mitra-role-features">
                <li>
                  <span className="mitra-check-icon">✓</span> Reduksi Waste & Cost Saving
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span> Meningkatkan Value Brand & CSR
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span> Dashboard Monitoring Real-time
                </li>
              </ul>
              <button className="mitra-role-button">Daftar Sekarang</button>
            </div>
          </div>

          {/* Card 2 — Mitra Pengolah */}
          <div className="mitra-role-card mitra-role-pengolah">
            <div className="mitra-role-content">
              <h3 className="mitra-role-card-title">Saya Mitra Pengolah</h3>
              <p className="mitra-role-card-desc">
                Organisasi sosial, pembudidaya maggot, atau pengelola kompos yang membutuhkan suplai bahan organik berkualitas tinggi secara konsisten.
              </p>
              <ul className="mitra-role-features">
                <li>
                  <span className="mitra-check-icon">✓</span> Menerima Donasi Bahan Berkualitas
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span> Manajemen Pickup Terjadwal
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span> Verifikasi Badge "Mitra Berdampak"
                </li>
              </ul>
              <button className="mitra-role-button">Gabung Ekosistem</button>
            </div>
            <div className="mitra-role-image">
              <img src="/images/karakter-mitra2.png" alt="Mitra Pengolah" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Bagaimana Cara Bergabung? */}
      <section className="mitra-steps">
        <div className="mitra-steps-container">
          <h2 className="mitra-steps-title">Bagaimana Cara Bergabung?</h2>
          <p className="mitra-steps-subtitle">
            Proses pendaftaran hanya membutuhkan beberapa langkah sederhana.
          </p>

          <div className="mitra-steps-grid">
            {/* Step 1 - Daftar (Active) */}
            <div className="mitra-step-item">
              <div className="mitra-step-circle mitra-step-active">1</div>
              <h3 className="mitra-step-title">Daftar</h3>
              <p className="mitra-step-desc">Buat akun di platform Savora</p>
            </div>

            {/* Step 2 - Lengkapi Profil */}
            <div className="mitra-step-item">
              <div className="mitra-step-circle">2</div>
              <h3 className="mitra-step-title">Lengkapi Profil</h3>
              <p className="mitra-step-desc">Isi data bisnis Anda</p>
            </div>

            {/* Step 3 - Upload Dokumen */}
            <div className="mitra-step-item">
              <div className="mitra-step-circle">3</div>
              <h3 className="mitra-step-title">Upload Dokumen</h3>
              <p className="mitra-step-desc">Unggah berkas pendukung</p>
            </div>

            {/* Step 4 - Verifikasi */}
            <div className="mitra-step-item">
              <div className="mitra-step-circle">4</div>
              <h3 className="mitra-step-title">Verifikasi</h3>
              <p className="mitra-step-desc">Review oleh tim Savora</p>
            </div>

            {/* Step 5 - Menjadi Mitra */}
            <div className="mitra-step-item">
              <div className="mitra-step-circle">5</div>
              <h3 className="mitra-step-title">Menjadi Mitra</h3>
              <p className="mitra-step-desc">Mulai kelola sisa makanan</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
