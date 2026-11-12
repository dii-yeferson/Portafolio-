import { toFileSlug } from './url'

const SANITY_CDN_HOST = 'cdn.sanity.io'

/** Nombre de descarga del CV, p. ej. `CV-Diego-Yeferson.pdf`. */
export function buildResumeFilename(displayName: string | null | undefined): string {
  const slug = toFileSlug(displayName ?? '')
  return slug ? `CV-${slug}.pdf` : 'CV.pdf'
}

/**
 * Construye la URL de descarga directa del CV alojado en Sanity Assets.
 * El parámetro `dl` hace que el CDN responda con
 * `Content-Disposition: attachment` y el nombre indicado.
 *
 * Devuelve `null` si la URL no es HTTPS del CDN de Sanity (evita redirecciones abiertas).
 */
export function buildResumeDownloadUrl(
  assetUrl: string | null | undefined,
  displayName: string | null | undefined,
): string | null {
  if (!assetUrl) return null
  let url: URL
  try {
    url = new URL(assetUrl)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || url.hostname !== SANITY_CDN_HOST) return null
  if (!url.pathname.startsWith('/files/')) return null
  url.searchParams.set('dl', buildResumeFilename(displayName))
  return url.toString()
}
