'use client'

import { usePathname } from 'next/navigation'
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
  const user = getUser()

  // Daftar path yang TIDAK menggunakan DashboardLayout (standalone pages)
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/register')
  const isAdminPage = pathname?.startsWith('/admin')
  const isStandalonePage = isCustomerRoute(pathname)

  // SECURITY CHECK: DashboardLayout hanya untuk UMKM
  // Customer dan role lain (atau tidak login) tidak boleh dapat sidebar UMKM
  // Normalisasi case defensif: lowercase untuk role
  const normalizedRole = String(user?.role || '').toLowerCase();
  const shouldUseDashboardLayout = normalizedRole === 'umkm'

  // Render children langsung untuk:
  // 1. Auth pages (login/register)
  // 2. Admin pages (punya layout sendiri AdminSidebar dari app/admin/layout.js)
  // 3. Standalone pages (marketplace, mitra, gabung-mitra-pengolah)
  // 4. User bukan UMKM (CUSTOMER/MITRA_DONASI/MITRA_PENGOLAH atau tidak login)
  if (isAuthPage || isAdminPage || isStandalonePage || !shouldUseDashboardLayout) {
    return children
  }

  // Hanya UMKM yang sampai sini → render dengan DashboardLayout (sidebar UMKM)
  return <DashboardLayout>{children}</DashboardLayout>
}
