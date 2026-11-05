/**
 * Contenido inicial del CMS (idempotente).
 *
 *   npx sanity login   # una sola vez
 *   npm run seed
 *
 * Usa el token del usuario autenticado en la CLI (`--with-user-token`) y
 * `createIfNotExists`, por lo que nunca sobrescribe contenido existente.
 * La configuración del sitio y el proyecto insignia se crean como
 * BORRADORES para completarlos y publicarlos desde /studio.
 */
import type { IdentifiedSanityDocumentStub } from '@sanity/client'
import { getCliClient } from 'sanity/cli'

import { apiVersion } from '../src/sanity/env'

const documents: IdentifiedSanityDocumentStub[] = [
  {
    _id: 'drafts.siteSettings',
    _type: 'siteSettings',
    displayName: 'Di Yeferson',
    tagline: 'Big Data · Ciencia de Datos · IA Aplicada',
    heroPhrases: ['Transformando datos en soluciones reales'],
  },
  {
    _id: 'drafts.project-centinela-minero',
    _type: 'project',
    title: 'Centinela Minero',
    slug: { _type: 'slug', current: 'centinela-minero' },
    category: ['machine-learning', 'big-data'],
    shortDescription: 'Plataforma de monitoreo y predicción para operaciones mineras.',
    status: 'draft',
    featured: true,
    sortOrder: 0,
  },
  {
    _id: 'socialLink-github',
    _type: 'socialLink',
    platformName: 'GitHub',
    iconKey: 'github',
    url: 'https://github.com/dii-yeferson',
    label: '@dii-yeferson',
    visibility: true,
    sortOrder: 10,
  },
]

async function seed() {
  const client = getCliClient({ apiVersion })
  const { projectId, dataset } = client.config()
  console.log(`Sembrando contenido en ${projectId}/${dataset}…`)

  const transaction = client.transaction()
  for (const document of documents) transaction.createIfNotExists(document)
  await transaction.commit({ visibility: 'sync' })

  console.log(
    `Listo: ${documents.length} documentos verificados (los existentes no se modificaron).`,
  )
}

seed().catch((error: unknown) => {
  console.error(
    'No se pudo sembrar el contenido. Verifica NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET en .env.local',
    'y que hayas iniciado sesión con `npx sanity login`.\n',
    error instanceof Error ? error.message : error,
  )
  process.exitCode = 1
})
