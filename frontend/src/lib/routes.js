/**
 * Cek apakah pathname adalah halaman customer-facing (bukan dashboard UMKM/Admin).
 * Halaman customer: marketplace, cart, checkout, orders, akun, auth, help center.
 * Halaman UMKM: dashboard, produk, pesanan, analitik, promosi, iklan, profil, insight.
 */
export function isCustomerRoute(pathname) {
  return (
    pathname === "/" ||
    pathname === "/marketplace" ||
    pathname.startsWith("/marketplace/") ||
    pathname === "/mitra" ||  // Landing page partnership (publik, tanpa sidebar)
    pathname === "/gabung-umkm" ||  // Form pendaftaran UMKM (publik, tanpa sidebar)
    pathname === "/gabung-mitra-pengolah" ||  // Form pendaftaran mitra pengolah (publik, tanpa sidebar)
    pathname === "/cart" ||
    pathname.startsWith("/cart/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/") ||
    pathname === "/akun" ||
    pathname.startsWith("/akun/") ||
    pathname === "/profil-saya" ||  // B-1: Profil semua role tanpa sidebar UMKM
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/help-center" ||
    pathname.startsWith("/help-center/")
  );
}
