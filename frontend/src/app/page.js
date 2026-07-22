<<<<<<< HEAD
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/produk');
=======
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  CreditCard,
  Gauge,
  Leaf,
  MapPin,
  Package,
  Shield,
  ShieldCheck,
  Tag,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="savora-landing">
      {/* ── Topbar ── */}
      <header className="savora-landing-topbar">
        <span className="savora-brand">
          <span className="savora-brand-mark">S</span>
          <span>
            {" "}
            Savora <small>FOOD RESCUE</small>
          </span>
        </span>
        <nav className="savora-landing-nav" aria-label="Navigasi utama">
          <a href="#cara-kerja">Cara Kerja</a>
          <a href="#fitur">Fitur</a>
          <Link href="/marketplace">Marketplace</Link>
        </nav>
        <div className="savora-landing-topbar-actions">
          <Link href="/dashboard" className="savora-landing-login">
            Masuk UMKM
          </Link>
          <Link href="/marketplace" className="savora-landing-signup">
            Lihat Deals
          </Link>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="savora-landing-hero" aria-labelledby="hero-title">
          <div className="savora-landing-hero-copy">
            <p className="savora-eyebrow">
              <Leaf size={14} aria-hidden="true" /> Food Rescue Marketplace
            </p>
            <h1 id="hero-title">
              Selamatkan makanan surplus UMKM,
              <br />
              <em>harga lebih hemat.</em>
            </h1>
            <p className="savora-landing-hero-desc">
              Savora menghubungkan kamu dengan UMKM kuliner lokal yang punya
              makanan surplus berkualitas. Beli dengan harga lebih murah, bantu
              kurangi food waste — satu porsi selamat dalam satu klik.
            </p>
            <div className="savora-landing-hero-actions">
              <Link href="/marketplace" className="savora-primary-action">
                Lihat Rescue Deals <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/dashboard" className="savora-secondary-action">
                Masuk sebagai UMKM
              </Link>
            </div>
          </div>
          <div className="savora-landing-hero-visual" aria-hidden="true">
            <div className="savora-landing-card-stack">
              <div className="savora-landing-card">
                <span className="savora-landing-card-icon savora-landing-green">
                  <Gauge size={20} />
                </span>
                <b>Food Score 92</b>
                <small>Sangat Layak — skor menurun otomatis</small>
              </div>
              <div className="savora-landing-card">
                <span className="savora-landing-card-icon savora-landing-yellow">
                  <Clock3 size={20} />
                </span>
                <b>Rescue Timer 2j 15m</b>
                <small>Ambil sebelum waktu habis</small>
              </div>
              <div className="savora-landing-card">
                <span className="savora-landing-card-icon savora-landing-lime">
                  <Tag size={20} />
                </span>
                <b>Hemat 52%</b>
                <small>Harga transparan + service fee 5%</small>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cara Kerja ── */}
        <section
          id="cara-kerja"
          className="savora-landing-steps"
          aria-labelledby="cara-kerja-title"
        >
          <p className="savora-eyebrow savora-green">CARA KERJA</p>
          <h2 id="cara-kerja-title">
            Tiga langkah menyelamatkan makanan
          </h2>
          <div className="savora-landing-steps-grid">
            <div className="savora-landing-step">
              <span className="savora-landing-step-number">1</span>
              <div className="savora-landing-step-icon">
                <Package size={28} aria-hidden="true" />
              </div>
              <h3>Pilih Rescue Deal</h3>
              <p>
                Jelajahi makanan surplus berkualitas dari UMKM terdekat. Lihat
                Food Score yang menurun mengikuti Rescue Timer dan badge
                keamanan dari ulasan customer.
              </p>
            </div>
            <div className="savora-landing-step">
              <span className="savora-landing-step-number">2</span>
              <div className="savora-landing-step-icon">
                <CreditCard size={28} aria-hidden="true" />
              </div>
              <h3>Bayar Cashless</h3>
              <p>
                Checkout dengan pembayaran cashless via Midtrans. Harga
                transparan — sudah termasuk breakdown service fee 5% sebelum
                kamu bayar.
              </p>
            </div>
            <div className="savora-landing-step">
              <span className="savora-landing-step-number">3</span>
              <div className="savora-landing-step-icon">
                <MapPin size={28} aria-hidden="true" />
              </div>
              <h3>Ambil dengan Kode Pickup</h3>
              <p>
                Datang ke lokasi UMKM, tunjukkan kode pickup unik dari
                aplikasi. Pastikan kondisi makanan sesuai — selesai, makanan
                terselamatkan!
              </p>
            </div>
          </div>
        </section>

        {/* ── Highlight Fitur ── */}
        <section
          id="fitur"
          className="savora-landing-features"
          aria-labelledby="fitur-title"
        >
          <p className="savora-eyebrow savora-green">KENAPA SAVORA?</p>
          <h2 id="fitur-title">Transparan, aman, dan hemat</h2>
          <div className="savora-landing-features-grid">
            <div className="savora-landing-feature">
              <div className="savora-landing-feature-icon">
                <Gauge size={24} aria-hidden="true" />
              </div>
              <h3>Food Score &amp; Rescue Timer</h3>
              <p>
                Setiap produk punya Food Score (0–100) yang menurun otomatis
                mendekati batas layak konsumsi, plus Rescue Timer real-time
                dengan indikator warna — hijau, kuning, merah — agar kamu tahu
                urgensinya.
              </p>
            </div>
            <div className="savora-landing-feature">
              <div className="savora-landing-feature-icon">
                <ShieldCheck size={24} aria-hidden="true" />
              </div>
              <h3>Badge Keyword Safety</h3>
              <p>
                Sistem mengklasifikasikan keyword dari ulasan customer (Aman,
                Warning, Gawat) per UMKM. Badge keamanan tampil transparan
                sehingga kamu bisa membeli dengan lebih percaya diri.
              </p>
            </div>
            <div className="savora-landing-feature">
              <div className="savora-landing-feature-icon">
                <Shield size={24} aria-hidden="true" />
              </div>
              <h3>Harga Transparan + Service Fee 5%</h3>
              <p>
                Breakdown harga jelas sebelum checkout: subtotal, service fee
                5%, dan total akhir. Tidak ada biaya tersembunyi — UMKM
                menerima subtotal penuh, platform mendapat service fee.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA Penutup ── */}
        <section className="savora-landing-cta">
          <h2>Mulai selamatkan makanan hari ini</h2>
          <p>
            Temukan rescue deal dari UMKM lokal terdekat. Lebih hemat, lebih
            bermakna.
          </p>
          <div className="savora-landing-cta-actions">
            <Link href="/marketplace" className="savora-primary-action">
              Lihat Rescue Deals <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/dashboard" className="savora-secondary-action">
              Masuk sebagai UMKM
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="savora-landing-footer">
        <div className="savora-brand">
          <span className="savora-brand-mark">S</span>
          <span>
            Savora <small>FOOD RESCUE</small>
          </span>
        </div>
        <p>
          Selamatkan makanan, hemat biaya, kurangi limbah.
          <br />
          Marketplace food rescue untuk UMKM kuliner lokal.
        </p>
        <span>© 2026 Savora. Karya CODE 6.0.</span>
      </footer>
    </div>
  );
>>>>>>> feat/customer-pages
}
