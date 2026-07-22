export const metadata = {
  title: 'Savora',
  description: 'Food rescue marketplace untuk UMKM dan customer',
}

import './globals.css'
import LayoutWrapper from './LayoutWrapper'

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
