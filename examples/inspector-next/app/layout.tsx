import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UnoCSS Inspector — Next.js',
  description: 'UnoCSS inspector hosted by a Next.js app through devframe',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
