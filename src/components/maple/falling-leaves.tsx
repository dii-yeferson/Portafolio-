'use client'

import { cancelFrame, frame } from 'motion/react'
import { useEffect, useRef } from 'react'

import type { Schedule } from './canopy-renderer'
import { mountLeaves } from './leaves-renderer'

const motionSchedule: Schedule = (callback) => {
  const update = () => callback()
  frame.update(update, true)
  return () => cancelFrame(update)
}

/**
 * Lienzo de hojas que caen (ver `leaves-renderer.ts`). `back` va detrás del
 * contenido; `front` deja pasar unas pocas hojas pequeñas por delante sin
 * estorbar la lectura.
 */
export function FallingLeaves({ layer = 'back' }: { layer?: 'back' | 'front' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return mountLeaves(canvas, { layer, schedule: motionSchedule })
  }, [layer])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-leaves={layer}
      className={`pointer-events-none fixed inset-0 size-full ${layer === 'front' ? 'z-40' : '-z-[1]'}`}
    />
  )
}
