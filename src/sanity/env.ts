/**
 * Configuración de Sanity leída desde variables de entorno.
 *
 * Las variables `NEXT_PUBLIC_*` se referencian de forma literal para que
 * Next.js pueda incrustarlas en el bundle del navegador (Sanity Studio).
 */

/** Versión fija de la API de Sanity (AAAA-MM-DD). */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-10-01'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

/** Ruta donde se monta Sanity Studio dentro de la aplicación. */
export const studioBasePath = '/studio'

/**
 * `true` cuando hay un `projectId` con formato válido. Si es `false`, la capa
 * de datos devuelve contenido vacío en lugar de fallar, lo que permite
 * compilar y probar el proyecto (CI) sin credenciales.
 */
export const isSanityConfigured = /^[a-z0-9-]+$/i.test(projectId)
