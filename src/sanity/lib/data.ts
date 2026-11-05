import 'server-only'

import { cache } from 'react'

import {
  DEMO_CERTIFICATIONS,
  DEMO_PROJECTS,
  DEMO_SITE_SETTINGS,
  DEMO_SOCIAL_LINKS,
  searchDemoContent,
} from '@/content/demo'

import { isSanityConfigured } from '../env'
import type { SEARCH_QUERY_RESULT } from '../types'
import { sanityFetch } from './fetch'
import {
  CERTIFICATIONS_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PROJECT_SLUGS_QUERY,
  PROJECTS_QUERY,
  SEARCH_QUERY,
  SITE_SETTINGS_QUERY,
  SOCIAL_LINKS_QUERY,
} from './queries'

/**
 * Repositorio de contenido: única puerta de entrada del sitio a Sanity.
 *
 * - `cache()` de React deduplica llamadas dentro de un mismo render
 *   (layout, página y `generateMetadata` comparten resultado).
 * - Sin proyecto de Sanity configurado se sirve el contenido de demostración
 *   (`src/content/demo.ts`) y las páginas se marcan `noindex`, de modo que el
 *   diseño se puede revisar y probar en CI sin credenciales.
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
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const getSiteSettings = cache(async () => {
  if (shouldUseDemo()) return DEMO_SITE_SETTINGS
  return sanityFetch({ query: SITE_SETTINGS_QUERY, tags: ['siteSettings'] })
})

export const getProjects = cache(async () => {
  if (shouldUseDemo()) return DEMO_PROJECTS
  return sanityFetch({ query: PROJECTS_QUERY, tags: ['project'] })
})

export const getProjectBySlug = cache(async (slug: string) => {
  if (!SLUG_PATTERN.test(slug)) return null
  if (shouldUseDemo()) return DEMO_PROJECTS.find((project) => project.slug === slug) ?? null
  return sanityFetch({ query: PROJECT_BY_SLUG_QUERY, params: { slug }, tags: ['project'] })
})

export const getProjectSlugs = cache(async () => {
  if (shouldUseDemo()) return DEMO_PROJECTS.map(({ slug, _updatedAt }) => ({ slug, _updatedAt }))
  return sanityFetch({ query: PROJECT_SLUGS_QUERY, tags: ['project'] })
})

export const getCertifications = cache(async () => {
  if (shouldUseDemo()) return DEMO_CERTIFICATIONS
  return sanityFetch({ query: CERTIFICATIONS_QUERY, tags: ['certification'] })
})

export const getSocialLinks = cache(async () => {
  if (shouldUseDemo()) return DEMO_SOCIAL_LINKS
  return sanityFetch({ query: SOCIAL_LINKS_QUERY, tags: ['socialLink'] })
})

/** Búsqueda de proyectos y certificaciones. `term` debe venir de `buildSearchTerm`. */
export async function searchContent(term: string, limit: number): Promise<SEARCH_QUERY_RESULT> {
  if (shouldUseDemo()) return searchDemoContent(term, limit)
  return sanityFetch({
    query: SEARCH_QUERY,
    params: { term, limit },
    tags: ['project', 'certification'],
    revalidate: 300,
  })
}

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>
export type ProjectSummary = Awaited<ReturnType<typeof getProjects>>[number]
export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>
export type CertificationItem = Awaited<ReturnType<typeof getCertifications>>[number]
export type SocialLinkItem = Awaited<ReturnType<typeof getSocialLinks>>[number]
