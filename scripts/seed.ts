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
 * - Las redes se crean visibles salvo LinkedIn: pega la URL de tu perfil y actívala.
 */
import type { IdentifiedSanityDocumentStub } from '@sanity/client'
import { getCliClient } from 'sanity/cli'

import {
  DEMO_CERTIFICATIONS,
  DEMO_CONTACT_EMAIL,
  DEMO_GITHUB_USERNAME,
  DEMO_PROFILE,
  DEMO_PROJECT_SOURCES,
  getDemoSocialLinks,
  paragraphs,
} from '../src/content/demo'
import { apiVersion } from '../src/sanity/env'

const VERIFIED_SOCIAL_URLS = new Set(['https://github.com/dii-yeferson'])

function buildDocuments(): IdentifiedSanityDocumentStub[] {
  const profile = DEMO_PROFILE
  const siteSettings: IdentifiedSanityDocumentStub = {
    _id: 'drafts.siteSettings',
    _type: 'siteSettings',
    displayName: 'Di Yeferson',
    tagline: profile.tagline.es,
    taglineEn: profile.tagline.en,
    availability: profile.availability.es,
    availabilityEn: profile.availability.en,
    summary: profile.summary.es,
    summaryEn: profile.summary.en,
    heroPhrases: profile.heroPhrases.es,
    heroPhrasesEn: profile.heroPhrases.en,
    heroBadges: profile.heroBadges.es,
    heroBadgesEn: profile.heroBadges.en,
    contactEmail: DEMO_CONTACT_EMAIL,
    githubUsername: DEMO_GITHUB_USERNAME,
    education: profile.education.map((item) => ({
      _key: item._key,
      _type: 'educationItem',
      institution: item.institution,
      program: item.program.es,
      programEn: item.program.en,
      description: item.description.es,
      descriptionEn: item.description.en,
    })),
    skillGroups: profile.skillGroups.map((group) => ({
      _key: group._key,
      _type: 'skillGroup',
      title: group.title.es,
      titleEn: group.title.en,
      skills: group.skills,
    })),
    principles: profile.principles.map((principle) => ({
      _key: principle._key,
      _type: 'principle',
      title: principle.title.es,
      titleEn: principle.title.en,
    })),
  }

  const socialLinks = getDemoSocialLinks('es').map((link, index) => ({
    _id: `socialLink-${link.iconKey}`,
    _type: 'socialLink',
    platformName: link.platformName,
    iconKey: link.iconKey,
    label: link.label,
    labelEn: getDemoSocialLinks('en')[index]?.label,
    url: link.url,
    visibility: link.iconKey !== 'linkedin' || VERIFIED_SOCIAL_URLS.has(link.url),
    sortOrder: (index + 1) * 10,
  }))

  const projects = DEMO_PROJECT_SOURCES.map((project, index) => ({
    _id: `drafts.project-${project.slug}`,
    _type: 'project',
    title: project.title.es,
    titleEn: project.title.en,
    slug: { _type: 'slug', current: project.slug },
    category: project.category,
    shortDescription: project.shortDescription.es,
    shortDescriptionEn: project.shortDescription.en,
    technologies: project.technologies,
    problem: paragraphs(project.problem.es),
    problemEn: paragraphs(project.problem.en),
    approach: paragraphs(project.approach.es),
    approachEn: paragraphs(project.approach.en),
    solution: paragraphs(project.solution.es),
    solutionEn: paragraphs(project.solution.en),
    results: paragraphs(project.results.es),
    resultsEn: paragraphs(project.results.en),
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
