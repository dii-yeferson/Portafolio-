/**
 * Estado de «me gusta» en el navegador.
 *
 * - Los conteos se piden en lote: todas las tarjetas visibles comparten una
 *   sola petición a `/api/likes`.
 * - Si este navegador ya dio «me gusta» se recuerda en `localStorage`.
 */
type Snapshot = { count: number | null; liked: boolean }

const counts = new Map<string, number | null>()
const listeners = new Set<() => void>()
const snapshots = new Map<string, Snapshot>()
let pending = new Set<string>()
let timer: ReturnType<typeof setTimeout> | null = null

const storageKey = (slug: string) => `liked:${slug}`

function readLiked(slug: string): boolean {
  try {
    return localStorage.getItem(storageKey(slug)) === '1'
  } catch {
    return false
  }
}

function writeLiked(slug: string, liked: boolean) {
  try {
    if (liked) localStorage.setItem(storageKey(slug), '1')
    else localStorage.removeItem(storageKey(slug))
  } catch {
    // Navegación privada: el estado dura lo que dure la visita.
  }
}

function emit() {
  snapshots.clear()
  for (const listener of listeners) listener()
}

async function flush() {
  timer = null
  const slugs = [...pending]
  pending = new Set()
  if (slugs.length === 0) return
  try {
    const response = await fetch(`/api/likes?slugs=${encodeURIComponent(slugs.join(','))}`)
    const data = (await response.json()) as { enabled?: boolean; counts?: Record<string, number> }
    for (const slug of slugs) counts.set(slug, data.enabled ? (data.counts?.[slug] ?? 0) : null)
  } catch {
    for (const slug of slugs) counts.set(slug, null)
  }
  emit()
}

export function requestCount(slug: string) {
  if (counts.has(slug) || pending.has(slug)) return
  pending.add(slug)
  timer ??= setTimeout(flush, 40)
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(slug: string): Snapshot {
  let snapshot = snapshots.get(slug)
  if (!snapshot) {
    snapshot = { count: counts.get(slug) ?? null, liked: readLiked(slug) }
    snapshots.set(slug, snapshot)
  }
  return snapshot
}

export const SERVER_SNAPSHOT: Snapshot = { count: null, liked: false }

/** Alterna el «me gusta»: actualiza al instante y confirma con el servidor. */
export async function toggleLike(slug: string): Promise<boolean> {
  const liked = !readLiked(slug)
  writeLiked(slug, liked)
  const current = counts.get(slug)
  if (typeof current === 'number') counts.set(slug, Math.max(0, current + (liked ? 1 : -1)))
  emit()
  try {
    const response = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, action: liked ? 'like' : 'unlike' }),
    })
    if (response.ok) {
      const data = (await response.json()) as { count?: number }
      if (typeof data.count === 'number') counts.set(slug, data.count)
      emit()
    }
  } catch {
    // Sin conexión: el corazón queda marcado localmente.
  }
  return liked
}
