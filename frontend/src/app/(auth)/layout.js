export const metadata = {
  title: 'Savora - Autentikasi',
  description: 'Login atau daftar ke Savora',
}

import '@/app/globals.css'

export default function AuthLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  )
}
