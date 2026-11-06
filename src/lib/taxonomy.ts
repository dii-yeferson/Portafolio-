/**
 * Taxonomías compartidas entre Sanity Studio, el servidor y la interfaz.
 *
 * Es la única fuente de verdad para categorías, estados y plataformas: el
 * Studio valida contra estas listas y el frontend las usa para los filtros.
 */

export type Option<V extends string = string> = { readonly title: string; readonly value: V }

/** Categorías de proyecto (FR-05). */
export const PROJECT_CATEGORIES = [
  { title: 'Machine Learning', value: 'machine-learning' },
  { title: 'Big Data', value: 'big-data' },
  { title: 'Power BI', value: 'power-bi' },
  { title: 'Aplicaciones web', value: 'web-apps' },
  { title: 'Tesis', value: 'thesis' },
] as const satisfies readonly Option[]

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]['value']

/** Ciclo de vida editorial de un proyecto (CMS-02). Solo `published` es público. */
export const PROJECT_STATUSES = [
  { title: 'Borrador', value: 'draft' },
  { title: 'Publicado', value: 'published' },
  { title: 'Archivado', value: 'archived' },
] as const satisfies readonly Option[]

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]['value']

/** Categorías de certificación (FR-07). */
export const CERTIFICATION_CATEGORIES = [
  { title: 'Ciencia de Datos', value: 'data-science' },
  { title: 'Big Data', value: 'big-data' },
  { title: 'Machine Learning e IA', value: 'machine-learning' },
  { title: 'Business Intelligence', value: 'business-intelligence' },
  { title: 'Cloud', value: 'cloud' },
  { title: 'Programación', value: 'programming' },
  { title: 'Otros', value: 'other' },
] as const satisfies readonly Option[]

export type CertificationCategory = (typeof CERTIFICATION_CATEGORIES)[number]['value']

/** Ícono tecnológico que acompaña a cada certificación en las tarjetas. */
export const CERTIFICATION_ICONS = [
  { title: 'Python', value: 'python' },
  { title: 'SQL / Bases de datos', value: 'sql' },
  { title: 'Power BI', value: 'power-bi' },
  { title: 'Excel', value: 'excel' },
  { title: 'Machine Learning / IA', value: 'machine-learning' },
  { title: 'Big Data', value: 'big-data' },
  { title: 'Cloud', value: 'cloud' },
  { title: 'Analítica', value: 'analytics' },
] as const satisfies readonly Option[]

export type CertificationIcon = (typeof CERTIFICATION_ICONS)[number]['value']

/** Tipos de experiencia para la línea de tiempo. */
export const EXPERIENCE_KINDS = [
  { title: 'Prácticas', value: 'internship' },
  { title: 'Empleo', value: 'work' },
  { title: 'Independiente', value: 'freelance' },
  { title: 'Investigación', value: 'research' },
  { title: 'Voluntariado', value: 'volunteer' },
] as const satisfies readonly Option[]

export type ExperienceKind = (typeof EXPERIENCE_KINDS)[number]['value']

/** Relación de quien recomienda (sección de recomendaciones). */
export const RECOMMENDATION_RELATIONSHIPS = [
  { title: 'Docente', value: 'teacher' },
  { title: 'Mentor', value: 'mentor' },
  { title: 'Compañero de estudios', value: 'classmate' },
  { title: 'Compañero de trabajo', value: 'colleague' },
  { title: 'Jefe directo', value: 'manager' },
  { title: 'Cliente', value: 'client' },
] as const satisfies readonly Option[]

export type RecommendationRelationship = (typeof RECOMMENDATION_RELATIONSHIPS)[number]['value']

/** Estados de una recomendación: solo `approved` es pública. */
export const RECOMMENDATION_STATUSES = [
  { title: 'Pendiente', value: 'pending' },
  { title: 'Aprobada', value: 'approved' },
  { title: 'Oculta', value: 'hidden' },
] as const satisfies readonly Option[]

/** Plataformas del ecosistema social (FR-04 / CMS-04). */
export const SOCIAL_PLATFORMS = [
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'GitHub', value: 'github' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'X (Twitter)', value: 'x' },
  { title: 'TikTok', value: 'tiktok' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'Correo', value: 'email' },
  { title: 'Sitio web', value: 'website' },
] as const satisfies readonly Option[]

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]['value']

function labelFrom(options: readonly Option[], value: string | null | undefined): string {
  if (!value) return ''
  return options.find((option) => option.value === value)?.title ?? value
}

export const getProjectCategoryLabel = (value: string | null | undefined) =>
  labelFrom(PROJECT_CATEGORIES, value)

export const getProjectStatusLabel = (value: string | null | undefined) =>
  labelFrom(PROJECT_STATUSES, value)

export const getCertificationCategoryLabel = (value: string | null | undefined) =>
  labelFrom(CERTIFICATION_CATEGORIES, value)

export const getSocialPlatformLabel = (value: string | null | undefined) =>
  labelFrom(SOCIAL_PLATFORMS, value)
