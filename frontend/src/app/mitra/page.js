"use client";

import { useState } from "react";
import Link from "next/link";
import SavoraNavbar from "@/components/navbar/SavoraNavbar";
import "./mitra.css";

export default function MitraPage() {
  // State untuk FAQ accordion (index 0 = item pertama terbuka by default)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  const faqItems = [
    {
      question: "Berapa biaya untuk bergabung menjadi mitra?",
      answer: "Pendaftaran dasar di Savora adalah gratis. Kami hanya menerapkan biaya platform per transaksi pickup yang berhasil untuk mendukung keberlanjutan operasional logistik yang tersertifikasi."
    },
    {
      question: "Bagaimana kualitas makanan yang didonasikan dipastikan?",
      answer: "Semua makanan melalui sistem Food Trust Index yang menganalisis metadata produk dan memberikan skor real-time. UMKM wajib mengikuti standar keamanan pangan dan dapat diaudit sewaktu-waktu oleh tim verifikasi kami."
    },
    {
      question: "Siapa yang bertanggung jawab atas penjemputan?",
      answer: "Customer atau mitra pengolah bertanggung jawab mengambil makanan langsung di lokasi UMKM sesuai jadwal yang disepakati. Savora menyediakan sistem pickup code untuk memastikan keamanan transaksi."
    },
    {
      question: "Berapa lama proses verifikasi mitra?",
      answer: "Proses verifikasi standar membutuhkan 3-7 hari kerja setelah dokumen lengkap diterima. Untuk kasus tertentu yang memerlukan validasi lapangan, proses dapat memakan waktu hingga 14 hari kerja."
    },
    {
      question: "Apakah ada biaya untuk bergabung menjadi mitra?",
      answer: "Tidak ada biaya pendaftaran atau biaya bulanan untuk menjadi mitra Savora. Kami hanya menerapkan biaya layanan kecil per transaksi yang berhasil untuk keberlanjutan platform."
    },
    {
      question: "Dokumen apa saja yang perlu disiapkan?",
      answer: "Untuk UMKM: NIB/SIUP, sertifikat higiene/PIRT, foto lokasi usaha. Untuk Mitra Pengolah: profil organisasi, izin operasional pengolahan limbah (jika ada), dan dokumentasi fasilitas."
    },
    {
      question: "Bagaimana jika pengajuan saya ditolak?",
      answer: "Anda akan menerima notifikasi email dengan alasan penolakan dan saran perbaikan. Anda dapat melengkapi dokumen yang kurang atau memperbaiki data, lalu mengajukan ulang setelah 7 hari."
    },
    {
      question: "Bagaimana cara mengetahui status pengajuan saya?",
      answer: "Status pengajuan dapat dilihat langsung di dashboard akun Anda. Anda juga akan menerima notifikasi email setiap ada perubahan status verifikasi."
    },
    {
      question: "Apakah saya dapat mengubah data usaha setelah menjadi mitra?",
      answer: "Ya, Anda dapat mengubah sebagian besar informasi profil melalui dashboard. Perubahan data krusial seperti alamat atau nama bisnis akan memerlukan verifikasi ulang oleh tim kami."
    },
    {
      question: "Apakah saya dapat berhenti menjadi mitra kapan saja?",
      answer: "Ya, Anda dapat menonaktifkan akun mitra kapan saja tanpa penalti. Pastikan semua transaksi aktif diselesaikan terlebih dahulu. Data Anda akan diarsipkan sesuai kebijakan privasi kami."
    }
  ];

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

      {/* Section 4 — Persyaratan Menjadi Mitra */}
      <section className="mitra-requirements">
        <div className="mitra-requirements-container">
          <h2 className="mitra-requirements-title">Persyaratan Menjadi Mitra</h2>
          <p className="mitra-requirements-subtitle">
            Pastikan Anda memenuhi persyaratan berikut sebelum mendaftar sebagai mitra Savora.
          </p>

          <div className="mitra-requirements-grid">
            {/* Card 1 — UMKM Kuliner */}
            <div className="mitra-requirement-card mitra-requirement-umkm">
              <div className="mitra-requirement-header">
                <span className="mitra-requirement-badge">🍽️</span>
                <h3 className="mitra-requirement-card-title">UMKM Kuliner</h3>
              </div>
              <ul className="mitra-requirement-list">
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Bisnis kuliner aktif (Restoran/Cafe/Hotel)
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Memiliki standar kualitas makanan yang baik
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Alamat operasional yang jelas
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Kontak penanggung jawab aktif
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Mematuhi standar keamanan pangan
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Bersedia diverifikasi oleh tim Savora
                </li>
              </ul>
            </div>

            {/* Card 2 — Mitra Pengolah */}
            <div className="mitra-requirement-card mitra-requirement-pengolah">
              <div className="mitra-requirement-header">
                <span className="mitra-requirement-badge mitra-requirement-badge-green">♻️</span>
                <h3 className="mitra-requirement-card-title">Mitra Pengolah</h3>
              </div>
              <ul className="mitra-requirement-list">
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Memiliki aktivitas pengolahan sampah organik
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Lokasi pengolahan yang memadai
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Penanggung jawab operasional
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Jadwal penjemputan yang konsisten
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Pelaporan data sirkularitas rutin
                </li>
                <li>
                  <span className="mitra-check-icon">✓</span>
                  Verifikasi fasilitas pengolahan
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Kategori Mitra Pengolah */}
      <section className="mitra-categories">
        <div className="mitra-categories-container">
          <h2 className="mitra-categories-title">Kategori Mitra Pengolah</h2>
          <p className="mitra-categories-subtitle">
            Berbagai jalur pengolahan yang kami dukung untuk memastikan nol sampah ke TPA.
          </p>

          <div className="mitra-categories-grid">
            {/* Card 1 — Organisasi Donasi */}
            <div className="mitra-category-card">
              <span className="mitra-category-badge mitra-category-badge-red">❤️</span>
              <h3 className="mitra-category-title">Organisasi Donasi</h3>
              <p className="mitra-category-desc">
                Menyalurkan makanan layak konsumsi kepada komunitas yang membutuhkan secara rutin.
              </p>
            </div>

            {/* Card 2 — Budidaya Maggot */}
            <div className="mitra-category-card">
              <span className="mitra-category-badge mitra-category-badge-blue">🐛</span>
              <h3 className="mitra-category-title">Budidaya Maggot</h3>
              <p className="mitra-category-desc">
                Pengolahan sampah organik efisien menggunakan larva BSF (Black Soldier Fly).
              </p>
            </div>

            {/* Card 3 — Kompos */}
            <div className="mitra-category-card">
              <span className="mitra-category-badge mitra-category-badge-gold">♻️</span>
              <h3 className="mitra-category-title">Kompos</h3>
              <p className="mitra-category-desc">
                Mengolah limbah organik menjadi pupuk nutrisi tinggi untuk pertanian berkelanjutan.
              </p>
            </div>

            {/* Card 4 — Pengolahan Organik */}
            <div className="mitra-category-card">
              <span className="mitra-category-badge mitra-category-badge-green">🧪</span>
              <h3 className="mitra-category-title">Pengolahan Organik</h3>
              <p className="mitra-category-desc">
                Riset dan pengembangan energi terbarukan seperti biogas dari limbah makanan.
              </p>
            </div>

            {/* Card 5 — Pakan Ternak */}
            <div className="mitra-category-card">
              <span className="mitra-category-badge mitra-category-badge-orange">🐾</span>
              <h3 className="mitra-category-title">Pakan Ternak</h3>
              <p className="mitra-category-desc">
                Pengolahan sisa makanan menjadi pakan ternak yang higienis dan terstandarisasi.
              </p>
            </div>

            {/* Card 6 — Bank Sampah */}
            <div className="mitra-category-card">
              <span className="mitra-category-badge mitra-category-badge-dark">📋</span>
              <h3 className="mitra-category-title">Bank Sampah</h3>
              <p className="mitra-category-desc">
                Layanan pengangkutan dan manajemen limbah sisa produksi untuk ekonomi sirkular.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — Proses Verifikasi Mitra */}
      <section className="mitra-verification">
        <div className="mitra-verification-container">
          <h2 className="mitra-verification-title">Proses Verifikasi Mitra</h2>
          <p className="mitra-verification-subtitle">
            Setelah formulir dikirim, berikut tahapan yang akan dilalui.
          </p>

          <div className="mitra-verification-grid">
            {/* Step 1 — Lakukan Pendaftaran */}
            <div className="mitra-verification-step">
              <div className="mitra-verification-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="#16a34a" strokeWidth="2"/>
                  <line x1="8" y1="12" x2="16" y2="12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="mitra-verification-step-title">Lakukan Pendaftaran</h3>
              <p className="mitra-verification-step-desc">
                Tim kami akan meninjau kelengkapan dokumen Anda.
              </p>
            </div>

            {/* Step 2 — Sedang Diverifikasi */}
            <div className="mitra-verification-step">
              <div className="mitra-verification-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="6" stroke="#16a34a" strokeWidth="2"/>
                  <line x1="14.5" y1="14.5" x2="19" y2="19" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="mitra-verification-step-title">Sedang Diverifikasi</h3>
              <p className="mitra-verification-step-desc">
                Pengecekan detail data dan validasi lapangan jika diperlukan.
              </p>
            </div>

            {/* Step 3 — Disetujui */}
            <div className="mitra-verification-step">
              <div className="mitra-verification-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="mitra-verification-step-title">Disetujui</h3>
              <p className="mitra-verification-step-desc">
                Akun Anda telah disetujui dan bergabung dalam ekosistem.
              </p>
            </div>

            {/* Step 4 — Mitra Aktif */}
            <div className="mitra-verification-step">
              <div className="mitra-verification-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12L10 17L19 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="9" stroke="#16a34a" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="mitra-verification-step-title">Mitra Aktif</h3>
              <p className="mitra-verification-step-desc">
                Selamat! Anda resmi menjadi bagian dari transisi ekonomi sirkular.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Pertanyaan Populer (FAQ Accordion) */}
      <section className="mitra-faq">
        <div className="mitra-faq-container">
          <h2 className="mitra-faq-title">Pertanyaan Populer</h2>
          <p className="mitra-faq-subtitle">
            Segala hal yang perlu Anda ketahui sebelum bergabung.
          </p>

          <div className="mitra-faq-list">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`mitra-faq-item ${openFaqIndex === index ? 'mitra-faq-item-active' : ''}`}
              >
                <button
                  className="mitra-faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{item.question}</span>
                  <svg
                    className={`mitra-faq-chevron ${openFaqIndex === index ? 'mitra-faq-chevron-open' : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {openFaqIndex === index && (
                  <div className="mitra-faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8 — Footer */}
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
