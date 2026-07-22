export const metadata = {
  title: 'Savora - UMKM Dashboard',
  description: 'Kelola produk makanan surplus Anda',
}

import './globals.css'
import DashboardLayout from '@/components/templates/DashboardLayout'

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  )
}
