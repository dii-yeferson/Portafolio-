import type { Metadata } from 'next'

import { getOpenGraphImageUrl, hasImageAsset, urlForImage } from '@/sanity/lib/image'
import type { ProjectDetail, SiteSettings, SocialLinkItem } from '@/sanity/lib/data'

import { truncate } from './format'
import { absoluteUrl, getSiteUrl, projectPath, SITE_DEFAULTS } from './site'

/** Normaliza el usuario de X a `@usuario`. */
export function normalizeTwitterHandle(handle: string | null | undefined): string | undefined {
  const value = handle?.trim().replace(/^@/, '')
  return value && /^[A-Za-z0-9_]{1,15}$/.test(value) ? `@${value}` : undefined
}

function resolveSiteIdentity(settings: SiteSettings) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const tagline = settings?.tagline || SITE_DEFAULTS.tagline
  const title = settings?.seoMeta?.metaTitle || `${name} · ${tagline}`
  const description =
    settings?.seoMeta?.metaDescription ||
    (settings?.summary ? truncate(settings.summary, 160) : SITE_DEFAULTS.description)
  return { name, tagline, title, description }
}

/** Metadatos globales del sitio (layout raíz): SEO, Open Graph y Twitter Cards. */
export function buildRootMetadata(settings: SiteSettings): Metadata {
  const { name, title, description } = resolveSiteIdentity(settings)
  const ogSource = hasImageAsset(settings?.seoMeta?.ogImage)
    ? settings?.seoMeta?.ogImage
    : settings?.heroPortrait
  const ogImage = getOpenGraphImageUrl(ogSource)
  const images = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, alt: ogSource?.alt || name }]
    : undefined

  return {
    metadataBase: getSiteUrl(),
    title: { default: title, template: `%s | ${name}` },
    description,
    applicationName: name,
    authors: [{ name }],
    creator: name,
    keywords: settings?.seoMeta?.keywords ?? undefined,
    openGraph: {
      type: 'website',
      locale: SITE_DEFAULTS.locale,
      siteName: name,
      title,
      description,
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      creator: normalizeTwitterHandle(settings?.seoMeta?.twitterHandle),
      images: images?.map((image) => image.url),
    },
    robots: { index: true, follow: true },
    formatDetection: { email: false, address: false, telephone: false },
  }
}

/** Metadatos dinámicos de `/proyectos/[slug]` (FR-06). */
export function buildProjectMetadata(project: ProjectDetail, settings: SiteSettings): Metadata {
  const { name } = resolveSiteIdentity(settings)
  const path = projectPath(project.slug)
  const description = truncate(project.shortDescription, 160)
  const ogImage = getOpenGraphImageUrl(project.coverImage)
  const images = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, alt: project.coverImage.alt || project.title }]
    : undefined

  return {
    title: project.title,
    description,
    keywords: project.technologies,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      locale: SITE_DEFAULTS.locale,
      siteName: name,
      url: path,
      title: project.title,
      description,
      modifiedTime: project._updatedAt,
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: project.title,
      description,
      creator: normalizeTwitterHandle(settings?.seoMeta?.twitterHandle),
      images: images?.map((image) => image.url),
    },
  }
}

/** Datos estructurados `Person` (schema.org) para buscadores y reclutadores. */
export function buildPersonJsonLd(settings: SiteSettings, socialLinks: SocialLinkItem[]) {
  const { name, tagline } = resolveSiteIdentity(settings)
  const institutions = [...new Set(settings?.education?.map((item) => item.institution) ?? [])]
  const skills = [...new Set(settings?.skillGroups?.flatMap((group) => group.skills) ?? [])]

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: absoluteUrl('/'),
    jobTitle: tagline,
    description: settings?.summary || undefined,
    image: hasImageAsset(settings?.heroPortrait)
      ? urlForImage(settings.heroPortrait).width(800).height(800).url()
      : undefined,
    alumniOf: institutions.length
      ? institutions.map((institution) => ({
          '@type': 'EducationalOrganization',
          name: institution,
        }))
      : undefined,
    knowsAbout: skills.length ? skills : undefined,
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
