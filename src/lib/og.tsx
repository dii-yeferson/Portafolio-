import 'server-only'

import { createElement, Fragment, isValidElement } from 'react'

/** Piezas compartidas de las imágenes Open Graph (1200 × 630, listas para LinkedIn). */
export const OG_SIZE = { width: 1200, height: 630 } as const

export const OG_COLORS = {
  background: '#09090b',
  foreground: '#f4f4f2',
  muted: '#a1a1aa',
  subtle: '#6b6b75',
  line: 'rgba(255,255,255,0.12)',
  aurora: 'linear-gradient(110deg, #95fbdf 0%, #6bdeee 45%, #62d2f8 70%, #8b9cff 100%)',
} as const

export function OgBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: OG_COLORS.background,
        backgroundImage:
          'radial-gradient(circle at 85% 18%, rgba(98,210,248,0.24), rgba(9,9,11,0) 55%), radial-gradient(circle at 0% 100%, rgba(149,251,223,0.14), rgba(9,9,11,0) 50%)',
      }}
    />
  )
}

export function OgSignature({ name, host }: { name: string; host: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          background: '#6bdeee',
          boxShadow: '0 0 18px rgba(107,222,238,0.9)',
        }}
      />
      <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: OG_COLORS.foreground }}>
        {name}
      </div>
      <div style={{ display: 'flex', fontSize: 24, color: OG_COLORS.subtle }}>{host}</div>
    </div>
  )
}

/**
 * Satori (motor de `next/og`) solo acepta elementos SVG nativos dentro de
 * `<svg>`. Esta función «aplana» un árbol de componentes sin hooks en
 * elementos intrínsecos para poder reutilizar las portadas del sitio.
 */
export function toIntrinsic(node: React.ReactNode): React.ReactNode {
  if (Array.isArray(node)) return node.map(toIntrinsic)
  if (!isValidElement(node)) return node
  const element = node as React.ReactElement<{ children?: React.ReactNode }>
  if (typeof element.type === 'function') {
    const render = element.type as (props: unknown) => React.ReactNode
    return toIntrinsic(render(element.props))
  }
  if ((element.type as unknown) === Fragment) return toIntrinsic(element.props.children)
  const { children, ...rest } = element.props
  return createElement(
    element.type as string,
    { ...rest, key: element.key ?? undefined },
    toIntrinsic(children),
  )
}
