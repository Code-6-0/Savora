"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  MapPin,
  ChevronDown,
  ShoppingCart,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { getUser, isAuthenticated, logout, confirmLogout, getRedirectAfterLogin } from "@/lib/auth";
import { useCart } from "@/lib/CartContext";
import NotificationBell from "@/components/organisms/NotificationBell";

// Konstanta demo mode (gampang disembunyikan)
const SHOW_LOCATION = true;

/**
 * SavoraNavbar — Navbar global 2-state (guest vs logged-in)
 *
 * State GUEST: [Logo+Nav] [Lokasi] [Keranjang] [Masuk] [Daftar]
 * State LOGGED-IN: [Logo+Nav] [Lokasi demo] [Keranjang] [Notifikasi] [Avatar+dropdown]
 *
 * PENTING:
 * - Pakai ULANG class beranda-* dari globals.css (jangan duplikasi styling)
 * - Styling baru (inline) HANYA untuk elemen baru: avatar, dropdown
 * - Hindari hydration mismatch: render guest dulu, update setelah mount
 */
export default function SavoraNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useCart();

  // State — default guest untuk hindari hydration mismatch (C5a)
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);

  // Ref untuk dropdown (click outside detection)
  const dropdownRef = useRef(null);
  const addressDropdownRef = useRef(null);

  // Mount: cek auth & get user (C5a)
  useEffect(() => {
    setMounted(true);
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      const userData = getUser();
      setUser(userData);
    }
  }, []);

  // Load address dari localStorage setelah mounted
  useEffect(() => {
    if (mounted) {
      const savedAddress = localStorage.getItem("savora_address");
      if (savedAddress) {
        setAddress(savedAddress);
      }
    }
  }, [mounted]);

  // Close dropdown saat route change (C5b)
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  // Close dropdown saat klik di luar (C5b)
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  // Close address dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(event.target)) {
        setAddressDropdownOpen(false);
      }
    }

    if (addressDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [addressDropdownOpen]);

  // Helper: Generate inisial user (C2 — defensif)
  function getInitials(user) {
    if (!user) return "?";

    // Coba dari name
    if (user.name && typeof user.name === "string" && user.name.trim()) {
      const words = user.name.trim().split(/\s+/);
      if (words.length >= 2) {
        // Dua kata atau lebih: ambil huruf pertama tiap kata, max 2
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      // Satu kata: ambil 2 huruf pertama
      return user.name.trim().substring(0, 2).toUpperCase();
    }

    // Fallback ke email
    if (user.email && typeof user.email === "string" && user.email.trim()) {
      return user.email.trim().substring(0, 1).toUpperCase();
    }

    // Last resort
    return "?";
  }

  // Handler: toggle dropdown avatar
  function handleAvatarClick() {
    setDropdownOpen((prev) => !prev);
  }

  // Handler: logout (F3c — dengan dialog konfirmasi)
  function handleLogout() {
    confirmLogout(); // otomatis redirect ke / jika OK
  }

  // Handler: toggle dropdown alamat
  function handleAddressClick() {
    setAddressDropdownOpen((prev) => !prev);
  }

  // Handler: simpan alamat ke localStorage
  function handleAddressSave(e) {
    e.preventDefault();
    const input = e.target.elements.addressInput;
    if (input && input.value.trim()) {
      const newAddress = input.value.trim();
      localStorage.setItem("savora_address", newAddress);
      setAddress(newAddress);
      setAddressDropdownOpen(false);
    }
  }

  // Helper: cek link aktif
  function isActiveLink(path) {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  }

  // Jangan render sampai mounted (hindari hydration mismatch)
  if (!mounted) {
    // Render skeleton guest state (identik visual, tanpa data user)
    return (
      <header className="beranda-navbar">
        <div className="beranda-navbar-container">
          <Link href="/" className="beranda-brand">
            <img
              src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png"
              alt="Savora Logo"
              className="beranda-logo-img"
            />
            <span className="beranda-brand-text">Savora</span>
          </Link>
          <nav className="beranda-nav">
            <Link href="/">Home</Link>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/mitra">Mitra</Link>
            <a href="#tentang">Tentang</a>
            <Link href="/akun">Impact</Link>
          </nav>
          <button className="beranda-location">
            <MapPin size={14} />
            <span>Masukkan Alamat Kamu</span>
            <ChevronDown size={13} />
          </button>
          <div className="beranda-actions">
            {/* Skeleton cart */}
            <div style={{ width: "40px", height: "40px" }} />
            <div className="beranda-btn-secondary" style={{ opacity: 0.5 }}>Masuk</div>
            <div className="beranda-btn-primary" style={{ opacity: 0.5 }}>Daftar Sekarang</div>
          </div>
        </div>
      </header>
    );
  }

  // === RENDER STATE LOGGED-IN ===
  if (isLoggedIn && user) {
    const initials = getInitials(user);

    // F4: Dashboard role-aware (CUSTOMER → /akun Riwayat & Impact, role lain → getRedirectAfterLogin)
    // Normalisasi case defensif: lowercase untuk role (konsisten dengan useAuthGuard & getRedirectAfterLogin)
    const normalizedRole = String(user.role || '').toLowerCase();
    const dashboardUrl = normalizedRole === 'customer'
      ? '/akun'
      : getRedirectAfterLogin(user.role, user.verification_status);

    // F4: Profil role-aware (UMKM → /profil existing, selain itu → /profil-saya)
    const profilUrl = normalizedRole === 'umkm' ? '/profil' : '/profil-saya';

    return (
      <header className="beranda-navbar">
        <div className="beranda-navbar-container">
          {/* Logo + Wordmark */}
          <Link href="/" className="beranda-brand">
            <img
              src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png"
              alt="Savora Logo"
              className="beranda-logo-img"
            />
            <span className="beranda-brand-text">Savora</span>
          </Link>

          {/* Nav Links */}
          <nav className="beranda-nav">
            <Link href="/" className={isActiveLink("/") ? "nav-active" : ""}>
              Home
            </Link>
            <Link href="/marketplace" className={isActiveLink("/marketplace") ? "nav-active" : ""}>
              Marketplace
            </Link>
            <Link href="/mitra">Mitra</Link>
            <a href="#tentang">Tentang</a>
            <Link href="/akun" className={isActiveLink("/akun") ? "nav-active" : ""}>
              Impact
            </Link>
          </nav>

          {/* Actions — State Logged-In: [Lokasi] [Keranjang] [Notifikasi] [Avatar] */}
          <div className="beranda-actions" style={{ gap: "12px", alignItems: "center" }}>
            {/* 1. Lokasi dengan dropdown */}
            {SHOW_LOCATION && (
              <div style={{ position: "relative" }} ref={addressDropdownRef}>
                <button
                  onClick={handleAddressClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#374151",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <MapPin size={14} color="#374151" />
                  <span style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {address || "Masukkan Alamat Kamu"}
                  </span>
                  <ChevronDown size={12} color="#374151" />
                </button>

                {/* Dropdown */}
                {addressDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "0",
                      marginTop: "8px",
                      minWidth: "320px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 1000,
                      padding: "16px",
                    }}
                  >
                    <form onSubmit={handleAddressSave}>
                      <input
                        type="text"
                        name="addressInput"
                        defaultValue={address}
                        placeholder="Masukkan alamat Anda"
                        autoFocus
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: "14px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          marginBottom: "12px",
                          outline: "none",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#16a34a";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#d1d5db";
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          padding: "10px",
                          backgroundColor: "#16a34a",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Simpan
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 2. Ikon Keranjang (sama seperti navbar existing) */}
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

            {/* 3. Notifikasi (NotificationBell dari organisms — C3 aman) */}
            <NotificationBell />

            {/* 4. Avatar + Dropdown */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={handleAvatarClick}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#1B7A43",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Menu profil"
              >
                {initials}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: "0",
                    width: "240px",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 1000,
                    overflow: "hidden",
                  }}
                >
                  {/* Header: nama + email */}
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1d1d1d",
                        marginBottom: "2px",
                      }}
                    >
                      {user.name || "User"}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      {user.email}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: "8px 0" }}>
                    <Link
                      href={dashboardUrl}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#1d1d1d",
                        textDecoration: "none",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <User size={16} color="#6b7280" />
                      <span>Dashboard Saya</span>
                    </Link>

                    <Link
                      href={profilUrl}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#1d1d1d",
                        textDecoration: "none",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <User size={16} color="#6b7280" />
                      <span>Profil</span>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", backgroundColor: "#e5e7eb" }} />

                  {/* Logout */}
                  <div style={{ padding: "8px 0" }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#ef4444",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <LogOut size={16} />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // === RENDER STATE GUEST ===
  return (
    <header className="beranda-navbar">
      <div className="beranda-navbar-container">
        {/* Logo + Wordmark */}
        <Link href="/" className="beranda-brand">
          <img
            src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png"
            alt="Savora Logo"
            className="beranda-logo-img"
          />
          <span className="beranda-brand-text">Savora</span>
        </Link>

        {/* Nav Links */}
        <nav className="beranda-nav">
          <Link href="/" className={isActiveLink("/") ? "nav-active" : ""}>
            Home
          </Link>
          <Link href="/marketplace" className={isActiveLink("/marketplace") ? "nav-active" : ""}>
            Marketplace
          </Link>
          <Link href="/mitra">Mitra</Link>
          <a href="#tentang">Tentang</a>
          <Link href="/akun" className={isActiveLink("/akun") ? "nav-active" : ""}>
            Impact
          </Link>
        </nav>

        {/* Lokasi dengan dropdown */}
        <div style={{ position: "relative" }} ref={addressDropdownRef}>
          <button
            onClick={handleAddressClick}
            className="beranda-location"
          >
            <MapPin size={14} />
            <span style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {address || "Masukkan Alamat Kamu"}
            </span>
            <ChevronDown size={13} />
          </button>

          {/* Dropdown */}
          {addressDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "0",
                marginTop: "8px",
                minWidth: "320px",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 1000,
                padding: "16px",
              }}
            >
              <form onSubmit={handleAddressSave}>
                <input
                  type="text"
                  name="addressInput"
                  defaultValue={address}
                  placeholder="Masukkan alamat Anda"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#16a34a";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Simpan
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Actions — State Guest: [Keranjang] [Masuk] [Daftar] */}
        <div className="beranda-actions">
          {/* Ikon Keranjang (sama seperti navbar existing) */}
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

          {/* Tombol Masuk */}
          <Link href="/login" className="beranda-btn-secondary">
            Masuk
          </Link>

          {/* Tombol Daftar */}
          <Link href="/register" className="beranda-btn-primary">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </header>
  );
}
