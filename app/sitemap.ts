import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.circuitpath.net'

// Static, well-known public routes. Lesson + component pages can be added
// dynamically later by reading from Supabase if SEO traffic warrants it.
const STATIC_PATHS = [
  '',
  '/learn',
  '/paths',
  '/components',
  '/boards',
  '/simulator',
  '/workshop',
  '/code',
  '/community',
  '/certificates',
  '/tutoring',
  '/pricing',
  '/referral',
  '/ask-creator',
  '/privacy',
  '/terms',
  '/cookies',
  '/disclaimer',
  '/acceptable-use',
]

const LESSON_SLUGS = [
  'blink-led',
  'button-input',
  'pwm-fade-led',
  'serial-monitor',
  'servo-motor',
  'analog-sensor',
]

const BOARD_SLUGS = [
  'uno-r3',
  'nano',
  'mega-2560',
  'esp32-devkit',
  'pi-pico',
  'portenta-h7',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.7,
  }))
  const lessonEntries = LESSON_SLUGS.map((slug) => ({
    url: `${SITE_URL}/learn/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  const boardEntries = BOARD_SLUGS.map((slug) => ({
    url: `${SITE_URL}/boards/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  return [...staticEntries, ...lessonEntries, ...boardEntries]
}
