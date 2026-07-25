export function isMarketplaceRoute(pathname) {
  return (
    pathname === "/" ||
    pathname === "/marketplace" ||
    pathname.startsWith("/marketplace/") ||
    pathname === "/akun" ||
    pathname.startsWith("/akun/") ||
    pathname === "/profil-saya"  // B-1: Profil semua role tanpa sidebar UMKM
  );
}
