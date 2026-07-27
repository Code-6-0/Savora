/**
 * Layout untuk halaman customer orders (status pembayaran, history, dll.)
 * Override DashboardLayout dari parent - TANPA sidebar UMKM
 *
 * Halaman /orders/[id]/pay adalah halaman customer-facing, bukan dashboard UMKM.
 * Layout ini memastikan customer hanya melihat header sederhana tanpa sidebar.
 */
export default function OrdersLayout({ children }) {
  return <>{children}</>;
}
