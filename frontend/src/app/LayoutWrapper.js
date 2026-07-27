'use client'

import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/templates/DashboardLayout'

/**
 * Client component wrapper untuk conditional rendering DashboardLayout.
 * Auth pages (/login, /register) tidak dibungkus DashboardLayout.
 * Admin dan Mitra Donasi punya layout sendiri (standalone).
 * Halaman lain (UMKM, Customer) dibungkus DashboardLayout (sidebar, header, logout, dst).
 */
export default function LayoutWrapper({ children }) {
  const pathname = usePathname()

  // Daftar path yang TIDAK menggunakan DashboardLayout (standalone pages)
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/register')
  const isAdminPage = pathname?.startsWith('/admin')
  const isMitraDonasiPage = pathname?.startsWith('/mitra-donasi')

  // Render children langsung untuk:
  // - Auth pages (login, register)
  // - Admin pages (punya AdminSidebar sendiri dari app/admin/layout.js)
  // - Mitra Donasi pages (standalone, TopHeader per page, no sidebar)
  return (isAuthPage || isAdminPage || isMitraDonasiPage) ? children : <DashboardLayout>{children}</DashboardLayout>
}
