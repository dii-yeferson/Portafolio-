import { DEFAULT_LOCALE, type Locale, LOCALE_META } from '@/i18n/config'
import { parseIsoDate } from '@/sanity/lib/validation'

/** `2025-03-14` → `marzo de 2025` / `March 2025`. Cadena vacía si la fecha no es válida. */
export function formatMonthYear(
  value: string | null | undefined,
  lang: Locale = DEFAULT_LOCALE,
): string {
  const date = parseIsoDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(LOCALE_META[lang].intl, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** `2025-03-14` → `mar 2025` / `Mar 2025` (líneas de tiempo). */
export function formatShortMonthYear(
  value: string | null | undefined,
  lang: Locale = DEFAULT_LOCALE,
): string {
  const date = parseIsoDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(LOCALE_META[lang].intl, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(date)
    .replace('.', '')
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

/** Fecha relativa: «hace 3 días» / «3 days ago». */
export function formatRelative(
  value: string | null | undefined,
  lang: Locale = DEFAULT_LOCALE,
  now: Date = new Date(),
): string {
  if (!value) return ''
  const time = Date.parse(value)
  if (Number.isNaN(time)) return ''
  const seconds = Math.round((time - now.getTime()) / 1000)
  const formatter = new Intl.RelativeTimeFormat(LOCALE_META[lang].intl, { numeric: 'auto' })
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit)
  }
  return formatter.format(0, 'minute')
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
