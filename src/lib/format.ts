import { parseIsoDate } from '@/sanity/lib/validation'

const monthYear = new Intl.DateTimeFormat('es-PE', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** `2025-03-14` → `marzo de 2025`. Cadena vacía si la fecha no es válida. */
export function formatMonthYear(value: string | null | undefined): string {
  const date = parseIsoDate(value)
  return date ? monthYear.format(date) : ''
}

/** `true` si la credencial tiene vencimiento y ya pasó. */
export function isExpired(expiresAt: string | null | undefined, now: Date = new Date()): boolean {
  const date = parseIsoDate(expiresAt)
  if (!date) return false
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return date.getTime() < today
}

/** Recorta un texto en el último espacio antes de `max` caracteres. */
export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
