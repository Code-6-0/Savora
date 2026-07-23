export function isMarketplaceRoute(pathname) {
  return (
    pathname === "/" ||
    pathname === "/marketplace" ||
    pathname.startsWith("/marketplace/") ||
    pathname === "/akun" ||
    pathname.startsWith("/akun/")
  );
}
