/**
 * Contenido inicial del CMS (idempotente), basado en el diseño aprobado.
 *
 *   npx sanity login   # una sola vez
 *   npm run seed
 *
 * Usa el token del usuario autenticado en la CLI (`--with-user-token`) y
 * `createIfNotExists`, por lo que nunca sobrescribe contenido existente.
 *
 * - Configuración del sitio, proyectos y certificaciones se crean como
 *   BORRADORES: agrega fotos, portadas y enlaces de verificación en /studio
 *   y publícalos (el Studio no deja publicar si falta algo obligatorio).
 * - Las redes se crean ocultas, salvo GitHub; edita cada URL y actívala.
 */
import type { IdentifiedSanityDocumentStub } from '@sanity/client'
import { getCliClient } from 'sanity/cli'

import {
  DEMO_CERTIFICATIONS,
  DEMO_PROJECTS,
  DEMO_SITE_SETTINGS,
  DEMO_SOCIAL_LINKS,
} from '../src/content/demo'
import { apiVersion } from '../src/sanity/env'

const VERIFIED_SOCIAL_URLS = new Set(['https://github.com/dii-yeferson'])

function buildDocuments(): IdentifiedSanityDocumentStub[] {
  const settings = DEMO_SITE_SETTINGS
  const siteSettings: IdentifiedSanityDocumentStub = {
    _id: 'drafts.siteSettings',
    _type: 'siteSettings',
    displayName: settings.displayName,
    tagline: settings.tagline,
    availability: settings.availability,
    summary: settings.summary,
    heroPhrases: settings.heroPhrases,
    heroBadges: settings.heroBadges,
    education: settings.education?.map((item) => ({
      _key: item._key,
      _type: 'educationItem',
      institution: item.institution,
      program: item.program,
      startYear: item.startYear,
      endYear: item.endYear,
      description: item.description,
    })),
    skillGroups: settings.skillGroups?.map((group) => ({ ...group, _type: 'skillGroup' })),
    principles: settings.principles?.map((principle) => ({ ...principle, _type: 'principle' })),
  }

  const socialLinks = DEMO_SOCIAL_LINKS.map((link, index) => ({
    _id: `socialLink-${link.iconKey}`,
    _type: 'socialLink',
    platformName: link.platformName,
    iconKey: link.iconKey,
    label: link.label,
    url: link.iconKey === 'email' ? 'mailto:correo@ejemplo.com' : link.url,
    visibility: VERIFIED_SOCIAL_URLS.has(link.url),
    sortOrder: (index + 1) * 10,
  }))

  const projects = DEMO_PROJECTS.map((project, index) => ({
    _id: `drafts.project-${project.slug}`,
    _type: 'project',
    title: project.title,
    slug: { _type: 'slug', current: project.slug },
    category: project.category,
    shortDescription: project.shortDescription,
    technologies: project.technologies,
    problem: project.problem,
    approach: project.approach,
    solution: project.solution,
    results: project.results,
    featured: project.featured ?? false,
    status: 'published',
    sortOrder: (index + 1) * 10,
  }))

  const certifications = DEMO_CERTIFICATIONS.map((item, index) => ({
    _id: `drafts.certification-${item._id.replace(/^demo-cert-/, '')}`,
    _type: 'certification',
    title: item.title,
    issuer: item.issuer,
    category: item.category,
    iconKey: item.iconKey,
    issueDate: item.issueDate,
    featured: item.featured ?? false,
    sortOrder: (index + 1) * 10,
  }))

  return [siteSettings, ...socialLinks, ...projects, ...certifications]
}

async function seed() {
  const client = getCliClient({ apiVersion })
  const { projectId, dataset } = client.config()
  const documents = buildDocuments()
  console.log(`Sembrando ${documents.length} documentos en ${projectId}/${dataset}…`)

  const transaction = client.transaction()
  for (const document of documents) transaction.createIfNotExists(document)
  await transaction.commit({ visibility: 'sync' })

  console.log('Listo. Revisa los borradores en /studio, completa imágenes y enlaces, y publícalos.')
}

seed().catch((error: unknown) => {
  console.error(
    'No se pudo sembrar el contenido. Verifica NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET en .env.local',
    'y que hayas iniciado sesión con `npx sanity login`.\n',
    error instanceof Error ? error.message : error,
  )
  process.exitCode = 1
})
