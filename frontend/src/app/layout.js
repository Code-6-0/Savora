<<<<<<< HEAD
import { Inter } from 'next/font/google'
import './globals.css'
import DashboardLayout from '@/components/templates/DashboardLayout'

=======
>>>>>>> feat/customer-pages
export const metadata = {
  title: 'Savora - UMKM Dashboard',
  description: 'Kelola produk makanan surplus Anda',
}

<<<<<<< HEAD
// Font utama dashboard. Sebelumnya globals.css menyebut 'Inter' tetapi
// font-nya tidak pernah dimuat, sehingga UI jatuh ke font sistem.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

import { UmkmProvider } from '@/context/UmkmContext'

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <UmkmProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </UmkmProvider>
=======
import './globals.css'
import DashboardLayout from '@/components/templates/DashboardLayout'

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <DashboardLayout>
          {children}
        </DashboardLayout>
>>>>>>> feat/customer-pages
      </body>
    </html>
  )
}
