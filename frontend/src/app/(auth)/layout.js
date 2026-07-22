export const metadata = {
  title: 'Savora - Autentikasi',
  description: 'Login atau daftar ke Savora',
}

/**
 * Auth route group layout - hanya wrapper untuk isolated pages.
 * Tidak perlu membuat <html> dan <body> lagi (sudah ada di root layout).
 * Conditional rendering di root layout (via LayoutWrapper) memastikan
 * auth pages tidak dibungkus DashboardLayout.
 */
export default function AuthLayout({ children }) {
  return children
}
