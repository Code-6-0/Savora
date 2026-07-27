'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/templates/DashboardLayout'
import { isCustomerRoute } from '@/lib/routes'
import { getUser } from '@/lib/auth'

/**
 * Client component wrapper untuk conditional rendering DashboardLayout.
 * Auth pages (/login, /register), marketplace routes (/mitra, /gabung-mitra-pengolah),
 * admin pages, dan mitra-donasi pages tidak dibungkus DashboardLayout.
 *
 * SECURITY: DashboardLayout (sidebar UMKM) HANYA untuk user role UMKM.
 * Customer dan role lain tidak boleh melihat sidebar UMKM.
 * Admin punya AdminSidebar, Mitra Donasi punya MitraSidebar (dari layout.js masing-masing).
 */
export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const [isUserUmkm, setIsUserUmkm] = useState(true) // Default true untuk hydration match
  const [isHydrated, setIsHydrated] = useState(false)

  // Check user role AFTER hydration to prevent mismatch
  useEffect(() => {
    const user = getUser()
    setIsUserUmkm(String(user?.role || '').toUpperCase() === 'UMKM')
    setIsHydrated(true)
  }, [])

  // Daftar path yang TIDAK menggunakan DashboardLayout (punya layout sendiri atau standalone)
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/register')
  const isAdminPage = pathname?.startsWith('/admin')
  const isMitraDonasiPage = pathname?.startsWith('/mitra-donasi')
  const isStandalonePage = isCustomerRoute(pathname)

  // Render children langsung untuk:
  // 1. Auth pages (login/register)
  // 2. Admin pages (punya layout sendiri AdminSidebar dari app/admin/layout.js)
  // 3. Mitra Donasi pages (punya layout sendiri MitraSidebar dari app/mitra-donasi/layout.js)
  // 4. Standalone pages (marketplace, mitra, gabung-mitra-pengolah)
  if (isAuthPage || isAdminPage || isMitraDonasiPage || isStandalonePage) {
    return children
  }

  // SECURITY CHECK moved to useEffect - after hydration only
  // During hydration: render DashboardLayout (will be correct for UMKM users)
  // After hydration: client-side check validates user role
  if (isHydrated && !isUserUmkm) {
    return children
  }

  // Render with DashboardLayout for UMKM paths
  return <DashboardLayout>{children}</DashboardLayout>
}

