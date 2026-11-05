import { createClient, type SanityClient } from '@sanity/client'

import { apiVersion, dataset, isSanityConfigured, projectId } from '../env'

let client: SanityClient | undefined

/**
 * Cliente de solo lectura para contenido publicado.
 *
 * `useCdn: false`: las respuestas ya se guardan en la Data Cache de Next.js
 * (ISR + etiquetas), así que consultar la API en vivo solo ocurre al
 * revalidar y garantiza datos frescos justo después de cada webhook.
 */
export function getClient(): SanityClient {
  if (!isSanityConfigured) {
    throw new Error(
      'Sanity no está configurado: define NEXT_PUBLIC_SANITY_PROJECT_ID (ver .env.example).',
    )
  }
  client ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: 'published',
  })
  return client
}
