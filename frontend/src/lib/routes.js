export function isMarketplaceRoute(pathname) {
  return (
    pathname === "/" ||
    pathname === "/marketplace" ||
    pathname.startsWith("/marketplace/") ||
    pathname === "/mitra" ||  // Landing page partnership (publik, tanpa sidebar)
    pathname === "/gabung-umkm" ||  // Form pendaftaran UMKM (publik, tanpa sidebar)
    pathname === "/gabung-mitra-pengolah" ||  // Form pendaftaran mitra pengolah (publik, tanpa sidebar)
    pathname === "/akun" ||
    pathname.startsWith("/akun/") ||
    pathname === "/profil-saya"  // B-1: Profil semua role tanpa sidebar UMKM
  );
}
