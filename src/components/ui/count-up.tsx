'use client'

import { useEffect, useRef } from 'react'

/**
 * Cifra que cuenta desde 0 al entrar en pantalla. El HTML del servidor ya trae
 * el valor final (SEO y sin JavaScript); respeta `prefers-reduced-motion`.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || value <= 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const duration = 1300
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration)
          element.textContent = String(Math.round(value * (1 - (1 - progress) ** 3)))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        element.textContent = '0'
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
