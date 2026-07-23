export const metadata = {
  title: 'Savora - UMKM Dashboard',
  description: 'Kelola produk makanan surplus Anda',
}

import '@/app/globals.css'
import DashboardLayout from '@/components/templates/DashboardLayout'

/**
 * User route group layout - untuk halaman UMKM/Customer.
 *
 * Route group (user) membungkus semua halaman user (dashboard, produk,
 * pesanan, analitik, insight, profil) dengan DashboardLayout yang berisi
 * sidebar user, header, dan navigation.
 *
 * Route group tidak mengubah URL - /dashboard tetap /dashboard, bukan /(user)/dashboard.
 */
export default function UserLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
