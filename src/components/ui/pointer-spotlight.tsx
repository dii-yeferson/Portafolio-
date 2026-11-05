'use client'

import { useEffect } from 'react'

/**
 * Luz que sigue al puntero sobre las tarjetas `.spotlight`.
 * Un solo listener para toda la página, sincronizado con requestAnimationFrame;
 * solo en dispositivos con puntero fino (no se activa en pantallas táctiles).
 */
export function PointerSpotlight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let frame = 0
    let last: PointerEvent | null = null

    function apply() {
      frame = 0
      const target = (last?.target as Element | null)?.closest<HTMLElement>('.spotlight')
      if (!last || !target) return
      const rect = target.getBoundingClientRect()
      target.style.setProperty('--mx', `${last.clientX - rect.left}px`)
      target.style.setProperty('--my', `${last.clientY - rect.top}px`)
    }

    function onMove(event: PointerEvent) {
      last = event
      if (!frame) frame = requestAnimationFrame(apply)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
