'use client'

import Lenis from 'lenis'
import { cancelFrame, frame } from 'motion/react'
import { useEffect } from 'react'

/**
 * Scroll suave con Lenis sobre el scroll NATIVO (nunca virtual).
 *
 * - Solo con puntero fino y sin «reducir movimiento»: en táctil manda la
 *   inercia del dedo (`syncTouch: false`).
 * - `lerp: 0.09`, el rango que se siente premium sin flotar.
 * - Un solo bucle de animación: Lenis se mueve dentro del `frame` de Motion,
 *   el mismo que usan el resto de animaciones del sitio.
 * - Los diálogos y menús marcan `data-lenis-prevent` para su propio scroll.
 */
export function SmoothScroll() {
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduce) return

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      anchors: { offset: -96 },
      prevent: (node) => node.closest('dialog, [data-lenis-prevent]') !== null,
    })

    const update = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp)
    frame.update(update, true)

    // Con un `<dialog>` modal abierto, Lenis se detiene.
    const observer = new MutationObserver(() => {
      if (document.querySelector('dialog[open]')) lenis.stop()
      else lenis.start()
    })
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })

    return () => {
      cancelFrame(update)
      observer.disconnect()
      lenis.destroy()
    }
  }, [])

  return null
}
