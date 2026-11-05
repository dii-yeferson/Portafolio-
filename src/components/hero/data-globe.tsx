'use client'

import { useEffect, useRef } from 'react'

import { mountGlobe } from './globe-renderer'

/**
 * Globo terráqueo de nodos de datos (FR-02). La lógica de dibujo vive en
 * `globe-renderer.ts`; este componente solo lo monta y desmonta con el canvas.
 */
export function DataGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return mountGlobe(canvas)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`cursor-grab touch-pan-y active:cursor-grabbing ${className ?? ''}`}
    />
  )
}
