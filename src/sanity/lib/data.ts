import 'server-only'

import { cache } from 'react'

import {
  DEMO_AMBIENT_MUSIC,
  DEMO_CERTIFICATIONS,
  getDemoProjects,
  getDemoSiteSettings,
  getDemoSocialLinks,
  searchDemoContent,
} from '@/content/demo'
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config'

import { isSanityConfigured } from '../env'
import { parseYouTubeId } from '@/lib/youtube'

import type { RECOMMENDATIONS_QUERY_RESULT, SEARCH_QUERY_RESULT } from '../types'
import { sanityFetch } from './fetch'
import {
  AMBIENT_MUSIC_QUERY,
  CERTIFICATIONS_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PROJECT_SLUGS_QUERY,
  PROJECTS_QUERY,
  RECOMMENDATIONS_QUERY,
  SEARCH_QUERY,
  SITE_SETTINGS_QUERY,
  SOCIAL_LINKS_QUERY,
} from './queries'

/**
 * Repositorio de contenido: única puerta de entrada del sitio a Sanity.
 *
 * - Cada función recibe el idioma; las consultas GROQ eligen el campo en
 *   inglés cuando existe y si no, usan el español.
 * - `cache()` de React deduplica llamadas dentro de un mismo render.
 * - Sin proyecto de Sanity configurado se sirve el contenido de demostración
 *   (`src/content/demo.ts`) y las páginas se marcan `noindex`.
 */

/** `true` cuando se está mostrando contenido de demostración. */
export const isDemoContent = !isSanityConfigured

let hasWarned = false

function shouldUseDemo(): boolean {
  if (isSanityConfigured) return false
  if (!hasWarned) {
    hasWarned = true
    console.warn(
      '[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID no está definido: se muestra contenido de demostración (noindex).',
    )
  }
  return true
}

/** Formato válido de slug generado por Sanity. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const getSiteSettings = cache(async (lang: Locale = DEFAULT_LOCALE) => {
  if (shouldUseDemo()) return getDemoSiteSettings(lang)
  return sanityFetch({ query: SITE_SETTINGS_QUERY, params: { lang }, tags: ['siteSettings'] })
})

export const getProjects = cache(async (lang: Locale = DEFAULT_LOCALE) => {
  if (shouldUseDemo()) return getDemoProjects(lang)
  return sanityFetch({ query: PROJECTS_QUERY, params: { lang }, tags: ['project'] })
})

export const getProjectBySlug = cache(async (slug: string, lang: Locale = DEFAULT_LOCALE) => {
  if (!SLUG_PATTERN.test(slug)) return null
  if (shouldUseDemo()) return getDemoProjects(lang).find((project) => project.slug === slug) ?? null
  return sanityFetch({ query: PROJECT_BY_SLUG_QUERY, params: { slug, lang }, tags: ['project'] })
})

export const getProjectSlugs = cache(async () => {
  if (shouldUseDemo()) {
    return getDemoProjects(DEFAULT_LOCALE).map(({ slug, _updatedAt }) => ({ slug, _updatedAt }))
  }
  return sanityFetch({ query: PROJECT_SLUGS_QUERY, tags: ['project'] })
})

export const getCertifications = cache(async () => {
  if (shouldUseDemo()) return DEMO_CERTIFICATIONS
  return sanityFetch({ query: CERTIFICATIONS_QUERY, tags: ['certification'] })
})

export const getSocialLinks = cache(async (lang: Locale = DEFAULT_LOCALE) => {
  if (shouldUseDemo()) return getDemoSocialLinks(lang)
  return sanityFetch({ query: SOCIAL_LINKS_QUERY, params: { lang }, tags: ['socialLink'] })
})

/** Recomendaciones aprobadas. El modo demostración nunca inventa recomendaciones. */
export const getRecommendations = cache(async (): Promise<RECOMMENDATIONS_QUERY_RESULT> => {
  if (shouldUseDemo()) return []
  return sanityFetch({ query: RECOMMENDATIONS_QUERY, tags: ['recommendation'] })
})

export type AmbientMusic = { youtubeId: string | null; audioUrl: string | null; volume: number }

/** Música ambiental lista para el reproductor, o `null` si está apagada o sin fuente válida. */
export const getAmbientMusic = cache(async (): Promise<AmbientMusic | null> => {
  const raw = shouldUseDemo()
    ? DEMO_AMBIENT_MUSIC
    : await sanityFetch({ query: AMBIENT_MUSIC_QUERY, tags: ['ambientMusic'] })
  if (!raw?.enabled) return null
  const youtubeId = parseYouTubeId(raw.youtubeUrl)
  const audioUrl = raw.audioUrl?.startsWith('https://') ? raw.audioUrl : null
  if (!youtubeId && !audioUrl) return null
  const volume = Math.min(100, Math.max(0, Math.round(raw.volume ?? 20)))
  return { youtubeId, audioUrl, volume }
})

/** Búsqueda de proyectos y certificaciones. `term` debe venir de `buildSearchTerm`. */
export async function searchContent(
  term: string,
  limit: number,
  lang: Locale = DEFAULT_LOCALE,
): Promise<SEARCH_QUERY_RESULT> {
  if (shouldUseDemo()) return searchDemoContent(term, limit, lang)
  return sanityFetch({
    query: SEARCH_QUERY,
    params: { term, limit, lang },
    tags: ['project', 'certification'],
    revalidate: 300,
  })
}

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>
export type ProjectSummary = Awaited<ReturnType<typeof getProjects>>[number]
export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>
export type CertificationItem = Awaited<ReturnType<typeof getCertifications>>[number]
export type SocialLinkItem = Awaited<ReturnType<typeof getSocialLinks>>[number]
export type RecommendationItem = RECOMMENDATIONS_QUERY_RESULT[number]
