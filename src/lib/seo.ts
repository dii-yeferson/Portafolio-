import type { Metadata } from 'next'

import { plainText } from '@/i18n/accent'
import { DEFAULT_LOCALE, type Locale, LOCALE_META, LOCALES, localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { getOpenGraphImageUrl, hasImageAsset, urlForImage } from '@/sanity/lib/image'
import type { ProjectDetail, SiteSettings, SocialLinkItem } from '@/sanity/lib/data'

import { truncate } from './format'
import { absoluteUrl, getSiteUrl, projectPath, SITE_DEFAULTS } from './site'

/** Normaliza el usuario de X a `@usuario`. */
export function normalizeTwitterHandle(handle: string | null | undefined): string | undefined {
  const value = handle?.trim().replace(/^@/, '')
  return value && /^[A-Za-z0-9_]{1,15}$/.test(value) ? `@${value}` : undefined
}

function resolveSiteIdentity(settings: SiteSettings, lang: Locale = DEFAULT_LOCALE) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const tagline = settings?.tagline || SITE_DEFAULTS.tagline
  const useSeo = lang === DEFAULT_LOCALE
  const title = (useSeo && settings?.seoMeta?.metaTitle) || `${name} · ${tagline}`
  const description =
    (useSeo && settings?.seoMeta?.metaDescription) ||
    (settings?.summary ? truncate(settings.summary, 160) : getDictionary(lang).meta.description)
  return { name, tagline, title, description }
}

/** `canonical` + `hreflang` para una ruta pública (sin prefijo de idioma). */
export function localeAlternates(path: string, lang: Locale): NonNullable<Metadata['alternates']> {
  return {
    canonical: localePath(lang, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((locale) => [locale, localePath(locale, path)])),
      'x-default': localePath(DEFAULT_LOCALE, path),
    },
  }
}

/** Imagen Open Graph generada (1200 × 630) para la portada o un proyecto. */
export function generatedOgImage(lang: Locale, slug?: string): string {
  const params = new URLSearchParams({ lang })
  return slug
    ? `/api/og/project/${encodeURIComponent(slug)}?${params}`
    : `/api/og?${params.toString()}`
}

/**
 * Metadatos globales del sitio (layout raíz): SEO, Open Graph y Twitter Cards.
 * Con `indexable: false` (contenido de demostración) se pide no indexar.
 */
export function buildRootMetadata(
  settings: SiteSettings,
  lang: Locale = DEFAULT_LOCALE,
  indexable = true,
): Metadata {
  const { name, title, description } = resolveSiteIdentity(settings, lang)
  const custom = hasImageAsset(settings?.seoMeta?.ogImage)
    ? getOpenGraphImageUrl(settings?.seoMeta?.ogImage)
    : null
  const images = [
    {
      url: custom ?? generatedOgImage(lang),
      width: 1200,
      height: 630,
      alt: settings?.seoMeta?.ogImage?.alt || name,
    },
  ]

  return {
    metadataBase: getSiteUrl(),
    title: { default: title, template: `%s | ${name}` },
    description,
    applicationName: name,
    authors: [{ name }],
    creator: name,
    keywords: settings?.seoMeta?.keywords ?? undefined,
    alternates: localeAlternates('/', lang),
    openGraph: {
      type: 'website',
      locale: LOCALE_META[lang].og,
      alternateLocale: LOCALES.filter((locale) => locale !== lang).map(
        (locale) => LOCALE_META[locale].og,
      ),
      siteName: name,
      title,
      description,
      url: localePath(lang, '/'),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: normalizeTwitterHandle(settings?.seoMeta?.twitterHandle),
      images: images.map((image) => image.url),
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    formatDetection: { email: false, address: false, telephone: false },
  }
}

/** Metadatos de una página interna con su título y descripción. */
export function buildPageMetadata(
  path: string,
  lang: Locale,
  title: string,
  description: string,
): Metadata {
  return {
    title: plainText(title),
    description,
    alternates: localeAlternates(path, lang),
    openGraph: { title: plainText(title), description, url: localePath(lang, path) },
  }
}

/** Metadatos dinámicos de `/proyectos/[slug]` (FR-06) con imagen lista para LinkedIn. */
export function buildProjectMetadata(
  project: ProjectDetail,
  settings: SiteSettings,
  lang: Locale = DEFAULT_LOCALE,
): Metadata {
  const { name } = resolveSiteIdentity(settings, lang)
  const path = `/proyectos/${encodeURIComponent(project.slug)}`
  const description = truncate(project.shortDescription, 160)
  const image = {
    url: generatedOgImage(lang, project.slug),
    width: 1200,
    height: 630,
    alt: project.title,
  }

  return {
    title: project.title,
    description,
    keywords: project.technologies,
    alternates: localeAlternates(path, lang),
    openGraph: {
      type: 'article',
      locale: LOCALE_META[lang].og,
      siteName: name,
      url: projectPath(project.slug, lang),
      title: project.title,
      description,
      modifiedTime: project._updatedAt,
      authors: [name],
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      creator: normalizeTwitterHandle(settings?.seoMeta?.twitterHandle),
      images: [image.url],
    },
  }
}

/** Datos estructurados `Person` (schema.org) para buscadores y reclutadores. */
export function buildPersonJsonLd(
  settings: SiteSettings,
  socialLinks: SocialLinkItem[],
  lang: Locale = DEFAULT_LOCALE,
) {
  const { name, tagline } = resolveSiteIdentity(settings, lang)
  const institutions = [...new Set(settings?.education?.map((item) => item.institution) ?? [])]
  const skills = [...new Set(settings?.skillGroups?.flatMap((group) => group.skills) ?? [])]

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: absoluteUrl(localePath(lang, '/')),
    jobTitle: tagline,
    description: settings?.summary || undefined,
    image: hasImageAsset(settings?.heroPortrait)
      ? urlForImage(settings.heroPortrait).width(800).height(800).url()
      : absoluteUrl(SITE_DEFAULTS.portrait.src),
    alumniOf: institutions.length
      ? institutions.map((institution) => ({
          '@type': 'EducationalOrganization',
          name: institution,
        }))
      : undefined,
    knowsAbout: skills.length ? skills : undefined,
    knowsLanguage: ['es', 'en'],
    sameAs: socialLinks.map((link) => link.url).filter((url) => url.startsWith('https://')),
  }
}

/**
 * Serializa JSON-LD para incrustarlo en `<script>` sin riesgo de XSS:
 * escapa `<`, `>`, `&` y los separadores de línea U+2028/U+2029.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\p{Zl}/gu, '\\u2028')
    .replace(/\p{Zp}/gu, '\\u2029')
}
