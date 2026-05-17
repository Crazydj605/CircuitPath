'use client'

import { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { analytics } from '@/lib/analytics'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  product: string
  children: ReactNode
}

// Wraps an outbound affiliate link. Fires `affiliate_link_click` to PostHog
// before the browser follows the href, so we have a click count we control
// — independent of Amazon's (often delayed and self-click-filtered) reports.
export default function AffiliateLink({ href, product, children, onClick, ...rest }: Props) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    analytics.affiliateLinkClick(product, href)
    onClick?.(e)
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  )
}
