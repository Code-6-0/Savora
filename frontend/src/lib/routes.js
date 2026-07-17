export function isMarketplaceRoute(pathname) {
  return pathname === "/marketplace" || pathname.startsWith("/marketplace/");
}
