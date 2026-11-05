import 'server-only'

import { cache } from 'react'

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
 * - Sin proyecto de Sanity configurado se devuelve contenido vacío, de modo
 *   que la aplicación compila y se prueba en CI sin credenciales.
 */

let hasWarned = false

function canQuery(): boolean {
  if (isSanityConfigured) return true
  if (!hasWarned) {
    hasWarned = true
    console.warn(
      '[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID no está definido: se servirá contenido vacío.',
    )
  }
  return false
}

/** Formato válido de slug generado por Sanity. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const getSiteSettings = cache(async () => {
  if (!canQuery()) return null
  return sanityFetch({ query: SITE_SETTINGS_QUERY, tags: ['siteSettings'] })
})

export const getProjects = cache(async () => {
  if (!canQuery()) return []
  return sanityFetch({ query: PROJECTS_QUERY, tags: ['project'] })
})

export const getProjectBySlug = cache(async (slug: string) => {
  if (!SLUG_PATTERN.test(slug) || !canQuery()) return null
  return sanityFetch({ query: PROJECT_BY_SLUG_QUERY, params: { slug }, tags: ['project'] })
})

export const getProjectSlugs = cache(async () => {
  if (!canQuery()) return []
  return sanityFetch({ query: PROJECT_SLUGS_QUERY, tags: ['project'] })
})

export const getCertifications = cache(async () => {
  if (!canQuery()) return []
  return sanityFetch({ query: CERTIFICATIONS_QUERY, tags: ['certification'] })
})

export const getSocialLinks = cache(async () => {
  if (!canQuery()) return []
  return sanityFetch({ query: SOCIAL_LINKS_QUERY, tags: ['socialLink'] })
})

/** Búsqueda de proyectos y certificaciones. `term` debe venir de `buildSearchTerm`. */
export async function searchContent(term: string, limit: number): Promise<SEARCH_QUERY_RESULT> {
  if (!canQuery()) return []
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
