"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Home,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useCart } from "@/lib/CartContext";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const router = useRouter();
  const { items, count, removeItem, updateQty, clearCart, subtotal, serviceFee, total } = useCart();
  const [notice, setNotice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  function handleUpdateQty(productId, newQty, stock) {
    const clampedQty = Math.max(1, Math.min(newQty, stock));
    updateQty(productId, clampedQty);
  }

  function handleRemove(productId) {
    removeItem(productId);
    setNotice("Item berhasil dihapus dari keranjang.");
    setTimeout(() => setNotice(""), 3000);
  }

  function handleCheckout() {
    if (items.length === 0) return;

    setIsProcessing(true);

    // Ambil item pertama untuk checkout (PRD: 1 order = 1 produk)
    const firstItem = items[0];

    // Redirect ke halaman checkout dengan product_id dan qty
    // TODO: Item akan dihapus dari keranjang setelah order berhasil dibuat di halaman checkout
    router.push(`/marketplace/checkout?product_id=${firstItem.id}&qty=${firstItem.qty}`);
  }

  return (
    <div style={{ background: "#ffffff", fontFamily: '"Plus Jakarta Sans", sans-serif', minHeight: "100vh" }}>
      {/* Navbar from beranda */}
      <header className="beranda-navbar">
        <div className="beranda-navbar-container">
          <div className="beranda-brand">
            <img
              src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png"
              alt="Savora Logo"
              className="beranda-logo-img"
            />
            <span className="beranda-brand-text">Savora</span>
          </div>
          <nav className="beranda-nav">
            <Link href="/">Home</Link>
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
            <Link
              href="/cart"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: count > 0 ? "#eaf8ec" : "transparent",
                transition: "background-color 0.2s",
              }}
              className="nav-active"
            >
              <ShoppingCart size={20} color={count > 0 ? "#16a34a" : "#6b7280"} />
              {count > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    backgroundColor: "#16a34a",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "700",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid white",
                  }}
                >
                  {count}
                </span>
              )}
            </Link>
            <Link href="/dashboard" className="beranda-btn-secondary" style={{ color: "#1d1d1d" }}>
              Masuk
            </Link>
            <Link href="/marketplace" className="beranda-btn-primary">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1151px", margin: "0 auto", padding: "40px 32px", minHeight: "calc(100vh - 200px)" }}>
        {/* Page title */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#1d1d1d", margin: "0 0 8px 0" }}>
            Keranjang Belanja
          </h1>
          <p style={{ fontSize: "14px", color: "#666666", margin: 0 }}>
            {count > 0 ? `${count} item di keranjang Anda` : "Keranjang Anda kosong"}
          </p>
        </div>

        {items.length === 0 ? (
          // Empty state
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <ShoppingCart size={48} color="#d1d5db" />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#1d1d1d", margin: "0 0 12px 0" }}>
              Keranjang Anda Kosong
            </h2>
            <p style={{ fontSize: "14px", color: "#666666", margin: "0 0 28px 0", maxWidth: "400px" }}>
              Belum ada produk rescue di keranjang Anda. Mulai selamatkan makanan enak dan kurangi food waste sekarang!
            </p>
            <Link
              href="/marketplace"
              className="beranda-btn-primary"
              style={{ display: "inline-block", padding: "12px 28px", fontSize: "14px" }}
            >
              Jelajahi Marketplace
            </Link>
          </div>
        ) : (
          // Cart items + summary
          <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
            {/* Cart items - left column */}
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "16px" }}>
              {items.map((item) => {
                const itemSubtotal = item.rescue_price * item.qty;
                const itemServiceFee = Math.round(itemSubtotal * 0.05);
                const itemTotal = itemSubtotal + itemServiceFee;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e8e8e8",
                      borderRadius: "16px",
                      padding: "20px",
                      display: "flex",
                      gap: "20px",
                    }}
                  >
                    {/* Product image */}
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#eaf8ec",
                      }}
                    >
                      <img
                        src={item.photo_url || "/detail/main.png"}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    {/* Product info */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1d1d1d", margin: "0 0 4px 0" }}>
                            {item.name}
                          </h3>
                          <p style={{ fontSize: "13px", color: "#999999", margin: 0 }}>
                            Stok tersedia: {item.stock} porsi
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            border: "1px solid #e8e8e8",
                            background: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          aria-label="Hapus dari keranjang"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#ef4444";
                            e.currentTarget.style.background = "#fef2f2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e8e8e8";
                            e.currentTarget.style.background = "white";
                          }}
                        >
                          <Trash2 size={14} color="#666666" />
                        </button>
                      </div>

                      {/* Price and quantity */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "20px", fontWeight: "700", color: "#0b7a3b" }}>
                            {formatRupiah(item.rescue_price)}
                          </div>
                          <div style={{ fontSize: "11px", color: "#999999", marginTop: "2px" }}>per porsi</div>
                        </div>

                        {/* Quantity stepper */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            border: "1px solid #e8e8e8",
                            borderRadius: "12px",
                            padding: "6px 12px",
                          }}
                        >
                          <button
                            onClick={() => handleUpdateQty(item.id, item.qty - 1, item.stock)}
                            disabled={item.qty <= 1}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              border: "none",
                              background: item.qty <= 1 ? "#f5f5f5" : "#fff",
                              cursor: item.qty <= 1 ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Minus size={14} color={item.qty <= 1 ? "#d1d5db" : "#666666"} />
                          </button>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "#1d1d1d", minWidth: "24px", textAlign: "center" }}>
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.id, item.qty + 1, item.stock)}
                            disabled={item.qty >= item.stock}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              border: "none",
                              background: item.qty >= item.stock ? "#f5f5f5" : "#fff",
                              cursor: item.qty >= item.stock ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Plus size={14} color={item.qty >= item.stock ? "#d1d5db" : "#666666"} />
                          </button>
                        </div>
                      </div>

                      {/* Item total */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          paddingTop: "12px",
                          borderTop: "1px solid #f5f5f5",
                        }}
                      >
                        <span style={{ fontSize: "13px", color: "#666666" }}>Subtotal item ini:</span>
                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#1d1d1d" }}>
                          {formatRupiah(itemTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary - right column (sticky) */}
            <div
              style={{
                width: "380px",
                flexShrink: 0,
                position: "sticky",
                top: "100px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e8e8e8",
                  borderRadius: "18px",
                  padding: "24px",
                }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1d1d1d", margin: "0 0 20px 0" }}>
                  Ringkasan Belanja
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#666666" }}>Subtotal ({count} item)</span>
                    <span style={{ fontWeight: "600", color: "#1d1d1d" }}>{formatRupiah(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#666666" }}>
                      Service Fee (5%)
                    </span>
                    <span style={{ fontWeight: "600", color: "#1d1d1d" }}>{formatRupiah(serviceFee)}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "16px",
                    borderTop: "2px solid #f5f5f5",
                    marginBottom: "24px",
                  }}
                >
                  <span style={{ fontSize: "16px", fontWeight: "600", color: "#1d1d1d" }}>Total</span>
                  <span style={{ fontSize: "22px", fontWeight: "700", color: "#0b7a3b" }}>{formatRupiah(total)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || items.length === 0}
                  style={{
                    width: "100%",
                    height: "48px",
                    background: isProcessing || items.length === 0 ? "#e8e8e8" : "#0b7a3b",
                    color: isProcessing || items.length === 0 ? "#999999" : "white",
                    border: "none",
                    borderRadius: "16px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isProcessing || items.length === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {isProcessing ? "Memproses..." : "Checkout Sekarang"}
                </button>

                {items.length > 1 && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      background: "#fffbeb",
                      border: "1px solid #fef3c7",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#92400e",
                      lineHeight: "1.5",
                    }}
                  >
                    <strong style={{ display: "block", marginBottom: "4px" }}>Info Checkout</strong>
                    Checkout diproses per item (1 order = 1 produk). Item pertama akan diproses saat Anda klik
                    "Checkout Sekarang", item lainnya tetap ada di keranjang untuk checkout berikutnya.
                  </div>
                )}

                <Link
                  href="/marketplace"
                  style={{
                    display: "block",
                    marginTop: "16px",
                    textAlign: "center",
                    color: "#0b7a3b",
                    fontSize: "13px",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  ← Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer from beranda */}
      <footer className="beranda-footer">
        <div className="beranda-footer-container">
          <div className="beranda-footer-column-brand">
            <div className="beranda-footer-wordmark">Savora</div>
            <p className="beranda-footer-mission">
              Misi kami sederhana: Tidak boleh ada makanan enak yang terbuang sia-sia. Bergabunglah dengan ribuan
              penyelamat makanan lainnya di seluruh Indonesia.
            </p>
            <div className="beranda-footer-social">
              <button className="beranda-footer-social-btn" aria-label="Website">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm5.8 5h-1.9c-.2-1-.5-2-1-2.8 1.5.6 2.6 1.8 2.9 3.3zM8 2c.6 1 1.1 2.2 1.3 3.5H6.7C6.9 4.2 7.4 3 8 2zM2.3 9.5c-.2-.5-.3-1-.3-1.5s.1-1 .3-1.5h2.2c-.1.5-.1 1-.1 1.5s0 1 .1 1.5H2.3zm.9 2h1.9c.2 1 .5 2 1 2.8-1.5-.6-2.6-1.8-2.9-3.3zM5.1 5H3.2c.3-1.5 1.4-2.7 2.9-3.3-.5.8-.8 1.8-1 2.8zm2.9 9c-.6-1-1.1-2.2-1.3-3.5h2.6c-.2 1.3-.7 2.5-1.3 3.5zm1.5-5.5H5.5c-.1-.5-.1-1-.1-1.5s0-1 .1-1.5h4.8c.1.5.1 1 .1 1.5s0 1-.1 1.5zm.6 4.8c.5-.8.8-1.8 1-2.8h1.9c-.3 1.5-1.4 2.7-2.9 3.3zm1.4-4.8c.1-.5.1-1 .1-1.5s0-1-.1-1.5h2.2c.2.5.3 1 .3 1.5s-.1 1-.3 1.5h-2.2z"
                    fill="#006a3f"
                  />
                </svg>
              </button>
              <button className="beranda-footer-social-btn" aria-label="Share">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13 10c-.8 0-1.5.3-2 .8L6.5 8.3c.1-.3.1-.5.1-.8s0-.5-.1-.8L11 4.2c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .3 0 .5.1.8L5 5.3C4.5 4.8 3.8 4.5 3 4.5c-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2-.8l4.5 2.5c-.1.3-.1.5-.1.8 0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3z"
                    fill="#006a3f"
                  />
                </svg>
              </button>
              <button className="beranda-footer-social-btn" aria-label="Chat">
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
              <input type="email" placeholder="Email kamu" className="beranda-footer-newsletter-input" />
              <button className="beranda-footer-newsletter-btn" aria-label="Subscribe">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M15.8 0.2c-.2-.2-.5-.3-.8-.2L0.4 5.6c-.3.1-.5.4-.5.7 0 .3.2.6.5.7l4.8 2.1L7.3 14c.1.3.4.5.7.5.3 0 .6-.2.7-.5L15.8 1c.1-.3.1-.6 0-.8z"
                    fill="white"
                  />
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

      {/* Toast notification */}
      {notice && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 1000,
            maxWidth: "400px",
            padding: "14px 18px",
            background: "#0b7a3b",
            color: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            fontSize: "13px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
          role="status"
        >
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            style={{
              marginLeft: "auto",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Tutup notifikasi"
          >
            <X size={12} color="white" />
          </button>
        </div>
      )}
    </div>
  );
}
