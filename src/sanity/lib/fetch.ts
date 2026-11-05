import 'server-only'

import type { ClientReturn, QueryParams } from '@sanity/client'

import { getClient } from './client'
import type { CacheTag } from './tags'

/** Revalidación de respaldo (segundos) por si algún webhook no llega. */
export const DEFAULT_REVALIDATE_SECONDS = 3600

type SanityFetchOptions<Query extends string> = {
  query: Query
  params?: QueryParams
  /** Tipos de documento de los que depende la consulta (revalidación on-demand). */
  tags: readonly CacheTag[]
  revalidate?: number | false
}

/**
 * Ejecuta una consulta GROQ tipada (Sanity TypeGen) con caché de Next.js:
 * ISR basada en tiempo + invalidación por etiquetas desde `/api/revalidate`.
 */
export async function sanityFetch<const Query extends string>({
  query,
  params = {},
  tags,
  revalidate = DEFAULT_REVALIDATE_SECONDS,
}: SanityFetchOptions<Query>): Promise<ClientReturn<Query, unknown>> {
  return getClient().fetch<ClientReturn<Query, unknown>>(query, params, {
    next: { revalidate, tags: [...tags] },
  })
}
