import 'server-only'

import { createClient, type SanityClient } from '@sanity/client'

import { apiVersion, dataset, isSanityConfigured, projectId } from '../env'

let client: SanityClient | undefined

/**
 * Cliente con permiso de escritura (solo servidor). Lo usan las rutas de
 * «me gusta» y de recomendaciones. Sin `SANITY_API_WRITE_TOKEN` devuelve
 * `null` y esas funciones se desactivan sin romper el sitio.
 */
export function getWriteClient(): SanityClient | null {
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim()
  if (!isSanityConfigured || !token) return null
  client ??= createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
    perspective: 'published',
  })
  return client
}
