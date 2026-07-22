export function isMarketplaceRoute(pathname) {
<<<<<<< HEAD
  return pathname === "/marketplace" || pathname.startsWith("/marketplace/");
=======
  return (
    pathname === "/marketplace" ||
    pathname.startsWith("/marketplace/") ||
    pathname === "/akun" ||
    pathname.startsWith("/akun/")
  );
>>>>>>> feat/customer-pages
}
