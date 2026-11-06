'use client'

import { useEffect, useState } from 'react'

/**
 * Subtítulo vivo: una sola frase en serif itálica que cambia sola, con un
 * punto que late. Reemplaza a las listas numeradas. Todas las frases quedan
 * disponibles para lectores de pantalla.
 */
export function LiveCaption({ phrases, label }: { phrases: string[]; label: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (phrases.length < 2) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % phrases.length), 3400)
    return () => window.clearInterval(timer)
  }, [phrases.length])

  if (phrases.length === 0) return null

  return (
    <div className="flex items-start gap-3.5">
      <span
        aria-hidden="true"
        className="status-dot mt-[0.72em] shrink-0 bg-aqua! after:bg-aqua!"
      />
      <div className="min-w-0">
        <p className="label">{label}</p>
        <ul className="sr-only">
          {phrases.map((phrase) => (
            <li key={phrase}>{phrase}</li>
          ))}
        </ul>
        <p
          key={index}
          aria-hidden="true"
          className="live-caption accent-serif mt-2 text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.15] text-foreground"
        >
          {phrases[index]}
        </p>
      </div>
    </div>
  )
}
