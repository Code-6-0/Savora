export const metadata = {
  title: 'Savora',
  description: 'Food rescue marketplace untuk UMKM dan customer',
}

import './globals.css'

/**
 * Root layout - minimal structure.
 *
 * Hanya berisi <html>, <body>, dan globals.css.
 * Layout specifics (DashboardLayout, AdminSidebar, dll) ada di route groups:
 * - (auth)/ → auth pages tanpa sidebar
 * - (user)/ → user pages dengan DashboardLayout
 * - admin/ → admin pages dengan AdminSidebar
 */
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  )
}
