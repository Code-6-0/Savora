'use client'

import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/templates/DashboardLayout'

/**
 * Client component wrapper untuk conditional rendering DashboardLayout.
 * Auth pages (/login, /register, /mitra-donasi/register) tidak dibungkus DashboardLayout.
 * Halaman lain dibungkus DashboardLayout (sidebar, header, logout, dst).
 */
export default function LayoutWrapper({ children }) {
  const pathname = usePathname()

  // Daftar path yang TIDAK menggunakan DashboardLayout (standalone pages)
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/register')

  // Render children langsung untuk auth pages, wrap dengan DashboardLayout untuk lainnya
  return isAuthPage ? children : <DashboardLayout>{children}</DashboardLayout>
}
