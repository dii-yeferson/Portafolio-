'use client'

import { useEffect, useState } from 'react'

import { Accent } from '@/i18n/accent'

/**
 * Lema de la portada que cambia cada pocos segundos. Todas las frases se
 * apilan en la misma celda (la altura no salta) y solo la activa es visible;
 * el cambio es un fundido con un pequeño desplazamiento. Lo que va entre
 * asteriscos sale en serif itálica. Las frases se editan en el panel.
 */
export function RotatingMotto({
  phrases,
  interval = 4800,
}: {
  phrases: string[]
  interval?: number
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (phrases.length < 2) return
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % phrases.length),
      interval,
    )
    return () => window.clearInterval(timer)
  }, [phrases.length, interval])

  return (
    <span className="grid">
      {phrases.map((phrase, position) => (
        <span
          key={phrase}
          aria-hidden={position === index ? undefined : true}
          className={`[grid-area:1/1] transition-[opacity,transform] duration-700 ease-[cubic-bezier(.23,1,.32,1)] ${
            position === index
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-2 opacity-0'
          }`}
        >
          <Accent text={phrase} className="accent-serif text-aurora pr-1 text-[1.12em]" />
        </span>
      ))}
    </span>
  )
}
