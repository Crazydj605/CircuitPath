import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AnalyticsBootstrap from '@/components/AnalyticsBootstrap'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = 'https://www.circuitpath.net'
const SITE_NAME = 'CircuitPath'
const SITE_DESC =
  'Learn Arduino and electronics with interactive lessons, an AI tutor, circuit simulator, and a community of builders. Free to start.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CircuitPath — Learn Arduino & Electronics, hands-on',
    template: '%s · CircuitPath',
  },
  description: SITE_DESC,
  keywords: [
    'Arduino',
    'electronics',
    'robotics',
    'learn Arduino',
    'circuit simulator',
    'Arduino lessons',
    'beginner electronics',
    'STEM',
    'maker',
    'breadboard',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'CircuitPath — Learn Arduino & Electronics, hands-on',
    description: SITE_DESC,
    images: [
      {
        url: '/logo-wordmark.png',
        width: 1200,
        height: 630,
        alt: 'CircuitPath',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CircuitPath — Learn Arduino & Electronics, hands-on',
    description: SITE_DESC,
    images: ['/logo-wordmark.png'],
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnalyticsBootstrap />
        {children}
      </body>
    </html>
  )
}
