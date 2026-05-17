import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.circuitpath.net'

// Static, well-known public routes. Lesson + component pages can be added
// dynamically later by reading from Supabase if SEO traffic warrants it.
const STATIC_PATHS = [
  '',
  '/learn',
  '/paths',
  '/components',
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
  return [...staticEntries, ...lessonEntries]
}
