'use client'

import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/templates/DashboardLayout'

/**
 * Client component wrapper untuk conditional rendering DashboardLayout.
 * Auth pages (/login, /register) tidak dibungkus DashboardLayout.
 * Admin dan Mitra Donasi punya layout sendiri (MitraSidebar dari app/mitra-donasi/layout.js).
 * Halaman lain (UMKM, Customer) dibungkus DashboardLayout (sidebar UMKM).
 */
export default function LayoutWrapper({ children }) {
  const pathname = usePathname()

  // Daftar path yang TIDAK menggunakan DashboardLayout (punya layout sendiri atau standalone)
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/register')
  const isAdminPage = pathname?.startsWith('/admin')
  const isMitraDonasiPage = pathname?.startsWith('/mitra-donasi')

  // Render children langsung untuk:
  // - Auth pages (login, register) - standalone
  // - Admin pages (punya AdminSidebar dari app/admin/layout.js)
  // - Mitra Donasi pages (punya MitraSidebar dari app/mitra-donasi/layout.js)
  return (isAuthPage || isAdminPage || isMitraDonasiPage) ? children : <DashboardLayout>{children}</DashboardLayout>
}
