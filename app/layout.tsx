import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CircuitPath - Learn Robotics Through Play',
  description: 'Master robotics with interactive lessons, AI tutoring, and hands-on circuit building. Better than YouTube tutorials.',
  keywords: 'robotics, learn robotics, circuit building, AI tutor, education, STEM',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="circuit-bg min-h-screen">
        {children}
      </body>
    </html>
  )
}
