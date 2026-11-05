'use client'

import { useEffect, useState } from 'react'

const INTERVAL_MS = 3500

/** Frases del hero que rotan suavemente; se detienen con `prefers-reduced-motion`. */
export function RotatingPhrases({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (phrases.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % phrases.length), INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [phrases.length])

  const [motto] = phrases
  return (
    <>
      <p className="sr-only">{motto}</p>
      <p aria-hidden="true" className="mt-5 min-h-8 text-xl text-foreground/90 sm:text-2xl">
        <span key={index} className="inline-block motion-safe:animate-fade-in">
          {phrases[index % phrases.length]}
        </span>
      </p>
    </>
  )
}
