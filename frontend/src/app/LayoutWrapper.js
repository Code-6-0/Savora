'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/templates/DashboardLayout'
import { isCustomerRoute } from '@/lib/routes'
import { getUser } from '@/lib/auth'

/**
 * Client component wrapper untuk conditional rendering DashboardLayout.
 * Auth pages (/login, /register), marketplace routes (/mitra, /gabung-mitra-pengolah),
 * dan admin pages tidak dibungkus DashboardLayout.
 *
 * SECURITY: DashboardLayout (sidebar UMKM) HANYA untuk user role UMKM.
 * Customer dan role lain tidak boleh melihat sidebar UMKM.
 */
export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const [isUserUmkm, setIsUserUmkm] = useState(true) // Default true untuk hydration match
  const [isHydrated, setIsHydrated] = useState(false)

  // Check user role AFTER hydration to prevent mismatch
  useEffect(() => {
    const user = getUser()
    setIsUserUmkm(user?.role === 'UMKM')
    setIsHydrated(true)
  }, [])

  // Daftar path yang TIDAK menggunakan DashboardLayout (standalone pages)
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/register')
  const isAdminPage = pathname?.startsWith('/admin')
  const isStandalonePage = isCustomerRoute(pathname)

  // Render children langsung untuk:
  // 1. Auth pages (login/register)
  // 2. Admin pages (punya layout sendiri AdminSidebar dari app/admin/layout.js)
  // 3. Standalone pages (marketplace, mitra, gabung-mitra-pengolah)
  if (isAuthPage || isAdminPage || isStandalonePage) {
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

