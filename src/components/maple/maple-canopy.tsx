'use client'

import { cancelFrame, frame } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { mountCanopy, type Schedule } from './canopy-renderer'

export const CANOPY_SRC = '/images/maple/canopy.webp'

/** Un solo bucle: el viento usa el mismo `frame` de Motion que mueve Lenis. */
const motionSchedule: Schedule = (callback) => {
  const update = () => callback()
  frame.update(update, true)
  return () => cancelFrame(update)
}

/**
 * Copa del arce con viento (ver `canopy-renderer.ts`). Mientras carga, o sin
 * WebGL / con «reducir movimiento», se ve la imagen fija.
 */
export function MapleCanopy() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return mountCanopy(canvas, {
      src: CANOPY_SRC,
      schedule: motionSchedule,
      onLive: () => setLive(true),
    })
  }, [])

  return (
    <div className="maple-canopy" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CANOPY_SRC}
        alt=""
        decoding="async"
        fetchPriority="high"
        className={`absolute inset-0 size-full transition-opacity duration-700 ${live ? 'opacity-0' : 'opacity-100'}`}
      />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}
