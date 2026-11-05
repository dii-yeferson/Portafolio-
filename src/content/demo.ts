import type {
  BlockContent,
  CERTIFICATIONS_QUERY_RESULT,
  PROJECT_BY_SLUG_QUERY_RESULT,
  SEARCH_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
  SOCIAL_LINKS_QUERY_RESULT,
} from '@/sanity/types'

/**
 * Contenido de demostración basado en el diseño aprobado.
 *
 * Solo se usa cuando Sanity NO está configurado (desarrollo, CI y vistas
 * previas): el sitio se ve completo y la página se marca `noindex`. Con el CMS
 * conectado, todo el contenido proviene exclusivamente de Sanity.
 * `npm run seed` carga este mismo contenido en Sanity como borradores.
 */

const NO_IMAGE = { asset: null, crop: null, hotspot: null, alt: null, lqip: null }

function paragraphs(...texts: string[]): BlockContent {
  return texts.map((text, index) => ({
    _type: 'block' as const,
    _key: `p${index}`,
    style: 'normal' as const,
    markDefs: [],
    children: [{ _type: 'span' as const, _key: `s${index}`, text, marks: [] }],
  }))
}

export const DEMO_SITE_SETTINGS: NonNullable<SITE_SETTINGS_QUERY_RESULT> = {
  displayName: 'Di Yeferson',
  tagline: 'Big Data · Ciencia de Datos · IA Aplicada',
  availability: 'Disponible para nuevos proyectos',
  summary:
    'Apasionado por los datos, la tecnología y la creación de soluciones que generen un impacto real. Me enfoco en el análisis, modelado y visualización de datos para resolver problemas del mundo real.',
  heroPhrases: ['Transformando datos en soluciones reales.'],
  heroBadges: ['Análisis', 'Modelado', 'IA aplicada'],
  heroPortrait: null,
  resume: null,
  contactEmail: '',
  education: [
    {
      _key: 'tecsup',
      institution: 'Tecsup',
      program: 'Big Data y Ciencia de Datos',
      startYear: null,
      endYear: null,
      description:
        'Formación en ingeniería de datos, analítica avanzada, machine learning y visualización.',
      image: null,
    },
  ],
  skillGroups: [
    {
      _key: 'core',
      title: 'Datos e IA',
      skills: [
        'Python',
        'SQL',
        'Power BI',
        'Machine Learning',
        'Análisis de datos',
        'Visualización',
        'Big Data',
        'IA Aplicada',
      ],
    },
  ],
  principles: [
    {
      _key: 'p1',
      title: 'Resolver problemas con datos',
      description: 'Cada análisis parte de una pregunta concreta y termina en una decisión.',
    },
    {
      _key: 'p2',
      title: 'Desarrollar soluciones prácticas',
      description: 'Prototipos que funcionan con datos reales antes que diapositivas.',
    },
    {
      _key: 'p3',
      title: 'Aprendizaje continuo',
      description: 'Nuevas herramientas y certificaciones para mantener el criterio técnico.',
    },
    {
      _key: 'p4',
      title: 'Trabajo en equipo',
      description: 'Comunicación clara entre negocio, datos y tecnología.',
    },
    {
      _key: 'p5',
      title: 'Crear impacto real',
      description: 'Medir resultados y mejorar procesos con evidencia.',
    },
  ],
  seoMeta: null,
}

export const DEMO_SOCIAL_LINKS: SOCIAL_LINKS_QUERY_RESULT = [
  {
    _id: 'demo-linkedin',
    platformName: 'LinkedIn',
    iconKey: 'linkedin',
    label: 'Conectemos',
    url: 'https://www.linkedin.com/',
  },
  {
    _id: 'demo-github',
    platformName: 'GitHub',
    iconKey: 'github',
    label: 'Mis proyectos',
    url: 'https://github.com/dii-yeferson',
  },
  {
    _id: 'demo-instagram',
    platformName: 'Instagram',
    iconKey: 'instagram',
    label: 'Mi día a día',
    url: 'https://www.instagram.com/',
  },
  {
    _id: 'demo-x',
    platformName: 'X (Twitter)',
    iconKey: 'x',
    label: 'Ideas y noticias',
    url: 'https://x.com/',
  },
  {
    _id: 'demo-tiktok',
    platformName: 'TikTok',
    iconKey: 'tiktok',
    label: 'Contenido tech',
    url: 'https://www.tiktok.com/',
  },
  {
    _id: 'demo-youtube',
    platformName: 'YouTube',
    iconKey: 'youtube',
    label: 'Tutoriales y proyectos',
    url: 'https://www.youtube.com/',
  },
  {
    _id: 'demo-email',
    platformName: 'Correo',
    iconKey: 'email',
    label: 'Escríbeme',
    url: 'mailto:hola@example.com',
  },
]

type DemoProject = NonNullable<PROJECT_BY_SLUG_QUERY_RESULT>

export const DEMO_PROJECTS: DemoProject[] = [
  {
    _id: 'demo-analisis-mineros',
    _updatedAt: '2026-10-01T00:00:00Z',
    title: 'Análisis de Datos Mineros y Visualización',
    slug: 'analisis-datos-mineros',
    category: ['power-bi', 'big-data'],
    shortDescription: 'Dashboard interactivo para el análisis de datos del sector minero.',
    technologies: ['Power BI', 'Análisis de datos'],
    featured: false,
    demoUrl: null,
    codeUrl: 'https://github.com/dii-yeferson',
    coverImage: NO_IMAGE,
    gallery: null,
    metrics: null,
    problem: paragraphs(
      'La información de producción, costos y seguridad estaba dispersa en hojas de cálculo y reportes manuales, lo que retrasaba la toma de decisiones.',
    ),
    approach: paragraphs(
      'Modelado de datos en estrella, limpieza y estandarización de fuentes, y medidas DAX para los indicadores clave del negocio.',
    ),
    solution: paragraphs(
      'Un tablero interactivo en Power BI con filtros por unidad, periodo y proceso, listo para reuniones operativas.',
    ),
    results: paragraphs(
      'Una sola fuente de verdad para los indicadores del área y reportes que antes tomaban días disponibles al instante.',
    ),
  },
  {
    _id: 'demo-modelo-prediccion',
    _updatedAt: '2026-10-01T00:00:00Z',
    title: 'Modelo de Predicción',
    slug: 'modelo-de-prediccion',
    category: ['machine-learning'],
    shortDescription: 'Modelo de machine learning para predicción de resultados.',
    technologies: ['Python', 'Machine Learning'],
    featured: false,
    demoUrl: null,
    codeUrl: 'https://github.com/dii-yeferson',
    coverImage: NO_IMAGE,
    gallery: null,
    metrics: null,
    problem: paragraphs(
      'Anticipar resultados a partir de datos históricos para planificar con evidencia en lugar de intuición.',
    ),
    approach: paragraphs(
      'Análisis exploratorio, ingeniería de variables y comparación de modelos con validación cruzada en Python.',
    ),
    solution: paragraphs(
      'Un pipeline reproducible de entrenamiento y evaluación con métricas claras y visualizaciones del error.',
    ),
    results: paragraphs(
      'Predicciones interpretables y un flujo listo para reentrenar cuando lleguen nuevos datos.',
    ),
  },
  {
    _id: 'demo-aplicacion-web',
    _updatedAt: '2026-10-01T00:00:00Z',
    title: 'Aplicación Web',
    slug: 'aplicacion-web',
    category: ['web-apps'],
    shortDescription: 'Plataforma web para gestión y visualización de datos.',
    technologies: ['React', 'FastAPI'],
    featured: false,
    demoUrl: null,
    codeUrl: 'https://github.com/dii-yeferson',
    coverImage: NO_IMAGE,
    gallery: null,
    metrics: null,
    problem: paragraphs(
      'Los equipos necesitaban consultar y actualizar datos sin depender de archivos compartidos.',
    ),
    approach: paragraphs(
      'Frontend en React y una API en FastAPI con validación de datos y autenticación.',
    ),
    solution: paragraphs(
      'Una plataforma web con paneles, tablas filtrables y gráficos actualizados en tiempo real.',
    ),
    results: paragraphs(
      'Gestión centralizada de la información con acceso desde cualquier dispositivo.',
    ),
  },
  {
    _id: 'demo-centinela-minero',
    _updatedAt: '2026-10-01T00:00:00Z',
    title: 'Centinela Minero',
    slug: 'centinela-minero',
    category: ['machine-learning', 'big-data', 'thesis'],
    shortDescription: 'Sistema de monitoreo y predicción para entornos mineros.',
    technologies: ['Python', 'IA Aplicada', 'Machine Learning'],
    featured: true,
    demoUrl: null,
    codeUrl: 'https://github.com/dii-yeferson',
    coverImage: NO_IMAGE,
    gallery: null,
    metrics: null,
    problem: paragraphs(
      'Las operaciones mineras generan grandes volúmenes de datos de sensores que suelen revisarse de forma tardía, cuando el riesgo ya se materializó.',
    ),
    approach: paragraphs(
      'Ingesta y limpieza de series temporales, detección de anomalías y modelos predictivos entrenados con datos históricos de operación.',
    ),
    solution: paragraphs(
      'Un sistema de monitoreo con alertas tempranas y paneles que priorizan los equipos y zonas con mayor riesgo.',
    ),
    results: paragraphs(
      'Visibilidad continua de la operación y alertas que permiten actuar antes de que ocurra una falla.',
    ),
  },
]

export const DEMO_CERTIFICATIONS: CERTIFICATIONS_QUERY_RESULT = [
  {
    _id: 'demo-cert-python',
    title: 'Python para Ciencia de Datos',
    issuer: 'Plataforma de aprendizaje',
    category: 'data-science',
    iconKey: 'python',
    issueDate: '2024-03-15',
    expiresAt: null,
    credentialId: null,
    verificationUrl: null,
    featured: true,
    certificateImage: null,
  },
  {
    _id: 'demo-cert-sql',
    title: 'Análisis de Datos con SQL',
    issuer: 'Plataforma de aprendizaje',
    category: 'data-science',
    iconKey: 'sql',
    issueDate: '2024-05-20',
    expiresAt: null,
    credentialId: null,
    verificationUrl: null,
    featured: false,
    certificateImage: null,
  },
  {
    _id: 'demo-cert-powerbi',
    title: 'Power BI Avanzado',
    issuer: 'Plataforma de aprendizaje',
    category: 'business-intelligence',
    iconKey: 'power-bi',
    issueDate: '2024-08-10',
    expiresAt: null,
    credentialId: null,
    verificationUrl: null,
    featured: false,
    certificateImage: null,
  },
  {
    _id: 'demo-cert-excel',
    title: 'Excel para Análisis de Datos',
    issuer: 'Plataforma de aprendizaje',
    category: 'business-intelligence',
    iconKey: 'excel',
    issueDate: '2023-11-05',
    expiresAt: null,
    credentialId: null,
    verificationUrl: null,
    featured: false,
    certificateImage: null,
  },
  {
    _id: 'demo-cert-ml',
    title: 'Machine Learning Aplicado',
    issuer: 'Plataforma de aprendizaje',
    category: 'machine-learning',
    iconKey: 'machine-learning',
    issueDate: '2024-10-01',
    expiresAt: null,
    credentialId: null,
    verificationUrl: null,
    featured: false,
    certificateImage: null,
  },
]

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
}

/** Búsqueda local equivalente a SEARCH_QUERY para el modo demostración. */
export function searchDemoContent(term: string, limit: number): SEARCH_QUERY_RESULT {
  const tokens = normalize(term)
    .split(/\s+/)
    .map((token) => token.replace(/\*$/, ''))
    .filter(Boolean)
  const matches = (fields: string[]) => {
    const haystack = normalize(fields.join(' '))
    return tokens.every((token) => haystack.includes(token))
  }

  const projects = DEMO_PROJECTS.filter((project) =>
    matches([
      project.title,
      project.shortDescription,
      ...project.technologies,
      ...project.category,
    ]),
  ).map((project) => ({
    _id: project._id,
    _type: 'project' as const,
    title: project.title,
    _score: 1,
    slug: project.slug,
    shortDescription: project.shortDescription,
    category: project.category,
  }))

  const certifications = DEMO_CERTIFICATIONS.filter((item) =>
    matches([item.title, item.issuer, item.category]),
  ).map((item) => ({
    _id: item._id,
    _type: 'certification' as const,
    title: item.title,
    _score: 1,
    issuer: item.issuer,
    category: item.category,
    issueDate: item.issueDate,
    verificationUrl: item.verificationUrl,
  }))

  return [...projects, ...certifications].slice(0, limit)
}
