import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'shorty-url-shortener',
  description: 'Yet Another Url Shortener',
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
