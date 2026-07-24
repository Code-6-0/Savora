import { Inter } from 'next/font/google'
import './globals.css'
import LayoutWrapper from './LayoutWrapper'
import { UmkmProvider } from '@/context/UmkmContext'
import { NotificationProvider } from '@/context/NotificationContext'

export const metadata = {
  title: 'Savora - UMKM Dashboard',
  description: 'Kelola produk makanan surplus Anda',
}

// Font utama dashboard. Sebelumnya globals.css menyebut 'Inter' tetapi
// font-nya tidak pernah dimuat, sehingga UI jatuh ke font sistem.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body>
        <UmkmProvider>
          <NotificationProvider userId={1} userRole="umkm">
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </NotificationProvider>
        </UmkmProvider>
      </body>
    </html>
  )
}
