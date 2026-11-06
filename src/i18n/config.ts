/**
 * Idiomas del sitio. El español vive sin prefijo (`/proyectos`) y el inglés
 * bajo `/en` (`/en/proyectos`). `proxy.ts` reescribe las rutas sin prefijo
 * hacia el segmento interno `[lang] = es`.
 */
export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'es'

/** Etiquetas Open Graph e `Intl` por idioma. */
export const LOCALE_META: Record<Locale, { og: string; intl: string; label: string }> = {
  es: { og: 'es_PE', intl: 'es-PE', label: 'Español' },
  en: { og: 'en_US', intl: 'en-US', label: 'English' },
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/**
 * Ruta pública para un idioma: `localePath('en', '/proyectos')` → `/en/proyectos`,
 * `localePath('en', '/#contacto')` → `/en#contacto`, `localePath('es', '/')` → `/`.
 */
export function localePath(lang: Locale, path = '/'): string {
  const normalized = path.startsWith('/') || path.startsWith('#') ? path : `/${path}`
  if (lang === DEFAULT_LOCALE) return normalized.startsWith('#') ? `/${normalized}` : normalized
  if (normalized === '/' || normalized === '') return `/${lang}`
  if (normalized.startsWith('#')) return `/${lang}${normalized}`
  if (normalized.startsWith('/#')) return `/${lang}${normalized.slice(1)}`
  return `/${lang}${normalized}`
}

/** Separa el idioma de una ruta pública: `/en/proyectos` → `{ lang: 'en', path: '/proyectos' }`. */
export function splitLocale(pathname: string): { lang: Locale; path: string } {
  const match = /^\/(es|en)(?=\/|$)(.*)$/.exec(pathname)
  if (!match) return { lang: DEFAULT_LOCALE, path: pathname || '/' }
  return { lang: match[1] as Locale, path: match[2] || '/' }
}

/** La misma página en el otro idioma (para el selector ES / EN). */
export function switchLocalePath(pathname: string, target: Locale): string {
  return localePath(target, splitLocale(pathname).path)
}
