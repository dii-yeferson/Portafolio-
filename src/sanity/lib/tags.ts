/**
 * Etiquetas de caché de Next.js. Cada consulta se etiqueta con los tipos de
 * documento de los que depende y el webhook de Sanity invalida por `_type`.
 */
export const CACHE_TAGS = [
  'siteSettings',
  'project',
  'certification',
  'socialLink',
  'recommendation',
  'ambientMusic',
] as const

export type CacheTag = (typeof CACHE_TAGS)[number]

export function isCacheTag(value: unknown): value is CacheTag {
  return typeof value === 'string' && (CACHE_TAGS as readonly string[]).includes(value)
}
