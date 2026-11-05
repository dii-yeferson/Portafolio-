/** Textos de marca definidos en el PRD; se usan si el CMS aún no tiene contenido. */
export const SITE_DEFAULTS = {
  displayName: 'Di Yeferson',
  tagline: 'Big Data · Ciencia de Datos · IA Aplicada',
  motto: 'Transformando datos en soluciones reales',
  description:
    'Portafolio de Di Yeferson: proyectos de Big Data, Ciencia de Datos e IA aplicada a problemas reales.',
  locale: 'es_PE',
  language: 'es',
  themeColor: '#080E0B',
} as const

const LOCAL_URL = 'http://localhost:3000'

type SiteEnv = Partial<Record<'NEXT_PUBLIC_SITE_URL' | 'VERCEL_PROJECT_PRODUCTION_URL', string>>

/**
 * URL canónica del sitio. Prioridad: `NEXT_PUBLIC_SITE_URL` →
 * dominio de producción de Vercel → `http://localhost:3000`.
 */
export function getSiteUrl(
  env: SiteEnv = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  },
): URL {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim()
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  const candidate = explicit || (vercel ? `https://${vercel}` : LOCAL_URL)
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return new URL(LOCAL_URL)
    return new URL(url.origin)
  } catch {
    return new URL(LOCAL_URL)
  }
}

/** Convierte una ruta relativa en URL absoluta del sitio. */
export function absoluteUrl(path = '/'): string {
  return new URL(path, getSiteUrl()).toString()
}

export function projectPath(slug: string): string {
  return `/proyectos/${encodeURIComponent(slug)}`
}
