'use client'

import { MotionConfig } from 'motion/react'

/** Las animaciones de Motion respetan `prefers-reduced-motion` en todo el sitio. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
      {children}
    </MotionConfig>
  )
}
