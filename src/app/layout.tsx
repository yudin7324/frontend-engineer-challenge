import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orbitto Auth',
  description: 'Frontend challenge solution for Orbitto auth flows powered by Ory Kratos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
