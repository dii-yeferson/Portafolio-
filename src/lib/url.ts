/**
 * Defensa en profundidad: aunque el CMS ya valida las URLs, el sitio solo
 * renderiza enlaces externos con esquemas seguros.
 */
const SAFE_EXTERNAL_PROTOCOLS = new Set(['https:', 'mailto:'])

export function isSafeExternalUrl(value: string | null | undefined): value is string {
  if (!value) return false
  try {
    return SAFE_EXTERNAL_PROTOCOLS.has(new URL(value).protocol)
  } catch {
    return false
  }
}

/** Atributos obligatorios para enlaces externos (FR-04). */
export const EXTERNAL_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

/** Convierte texto en un segmento seguro para nombres de archivo. */
export function toFileSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
