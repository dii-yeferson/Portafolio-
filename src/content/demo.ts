import type { Locale } from '@/i18n/config'
import type {
  BlockContent,
  CERTIFICATIONS_QUERY_RESULT,
  PROJECT_BY_SLUG_QUERY_RESULT,
  SEARCH_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
  SOCIAL_LINKS_QUERY_RESULT,
} from '@/sanity/types'

/**
 * Contenido de demostración en español e inglés.
 *
 * Solo se usa cuando Sanity NO está configurado (desarrollo, CI y vistas
 * previas): el sitio se ve completo y la página se marca `noindex`. Con el CMS
 * conectado, todo el contenido proviene exclusivamente de Sanity.
 * `npm run seed` carga este mismo contenido en Sanity como borradores.
 *
 * Nunca incluye recomendaciones: solo pueden venir de personas reales
 * verificadas con LinkedIn.
 */

type Bilingual = { es: string; en: string }
const pick = (value: Bilingual, lang: Locale) => value[lang]

const NO_IMAGE = { asset: null, crop: null, hotspot: null, alt: null, lqip: null }

export const DEMO_CONTACT_EMAIL = 'di.yefersonx@gmail.com'
export const DEMO_GITHUB_USERNAME = 'dii-yeferson'

export function paragraphs(...texts: string[]): BlockContent {
  return texts.map((text, index) => ({
    _type: 'block' as const,
    _key: `p${index}`,
    style: 'normal' as const,
    markDefs: [],
    children: [{ _type: 'span' as const, _key: `s${index}`, text, marks: [] }],
  }))
}

/* ------------------------------------------------------------------ */
/* Perfil                                                              */
/* ------------------------------------------------------------------ */

export const DEMO_PROFILE = {
  tagline: {
    es: 'Big Data · Ciencia de Datos · IA Aplicada',
    en: 'Big Data · Data Science · Applied AI',
  },
  availability: { es: 'Abierto a prácticas y proyectos', en: 'Open to internships and projects' },
  summary: {
    es: 'Estudio Big Data y Ciencia de Datos en Tecsup. Construyo modelos, tableros y apps que alguien usa de verdad.',
    en: 'I study Big Data and Data Science at Tecsup. I build models, dashboards and apps that people actually use.',
  },
  heroPhrases: {
    es: ['Detrás de cada dato hay una decisión.', 'Me gusta encontrarla.'],
    en: ['Behind every dataset there is a decision.', 'I like finding it.'],
  },
  heroBadges: {
    es: ['Análisis', 'Modelado', 'IA aplicada'],
    en: ['Analysis', 'Modeling', 'Applied AI'],
  },
  education: [
    {
      _key: 'tecsup',
      institution: 'Tecsup',
      program: { es: 'Big Data y Ciencia de Datos', en: 'Big Data and Data Science' },
      description: {
        es: 'Ingeniería de datos, analítica, machine learning y visualización.',
        en: 'Data engineering, analytics, machine learning and visualization.',
      },
    },
  ],
  skillGroups: [
    {
      _key: 'data',
      title: { es: 'Datos', en: 'Data' },
      skills: ['Python', 'SQL', 'Power BI', 'Excel', 'Databricks'],
    },
    {
      _key: 'ai',
      title: { es: 'IA', en: 'AI' },
      skills: ['Machine Learning', 'Pandas', 'scikit-learn'],
    },
    {
      _key: 'product',
      title: { es: 'Producto', en: 'Product' },
      skills: ['JavaScript', 'FastAPI', 'PostgreSQL', 'PWA'],
    },
  ],
  principles: [
    {
      _key: 'question',
      title: {
        es: 'Empiezo por la pregunta, no por la herramienta.',
        en: 'I start with the question, not the tool.',
      },
    },
    { _key: 'real', title: { es: 'Pruebo con datos reales.', en: 'I test with real data.' } },
    {
      _key: 'explain',
      title: {
        es: 'Si no se puede explicar, no está listo.',
        en: 'If it cannot be explained, it is not done.',
      },
    },
    {
      _key: 'learn',
      title: { es: 'Aprendo algo nuevo cada semana.', en: 'I learn something new every week.' },
    },
    {
      _key: 'impact',
      title: {
        es: 'Mido lo que cambia, no las horas.',
        en: 'I measure what changes, not the hours.',
      },
    },
  ],
}

export function getDemoSiteSettings(lang: Locale): NonNullable<SITE_SETTINGS_QUERY_RESULT> {
  const profile = DEMO_PROFILE
  return {
    displayName: 'Di Yeferson',
    tagline: pick(profile.tagline, lang),
    availability: pick(profile.availability, lang),
    summary: pick(profile.summary, lang),
    heroPhrases: profile.heroPhrases[lang],
    heroBadges: profile.heroBadges[lang],
    heroPortrait: null,
    resume: null,
    contactEmail: DEMO_CONTACT_EMAIL,
    githubUsername: DEMO_GITHUB_USERNAME,
    education: profile.education.map((item) => ({
      _key: item._key,
      institution: item.institution,
      program: pick(item.program, lang),
      startYear: null,
      endYear: null,
      description: pick(item.description, lang),
      image: null,
    })),
    experience: null,
    skillGroups: profile.skillGroups.map((group) => ({
      _key: group._key,
      title: pick(group.title, lang),
      skills: group.skills,
    })),
    principles: profile.principles.map((principle) => ({
      _key: principle._key,
      title: pick(principle.title, lang),
      description: null,
    })),
    aboutCopy: null,
    projectsCopy: null,
    certificationsCopy: null,
    contactCopy: null,
    seoMeta: null,
  }
}

export function getDemoSocialLinks(lang: Locale): SOCIAL_LINKS_QUERY_RESULT {
  return [
    {
      _id: 'demo-linkedin',
      platformName: 'LinkedIn',
      iconKey: 'linkedin',
      label: lang === 'en' ? "Let's connect" : 'Conectemos',
      url: 'https://www.linkedin.com/',
    },
    {
      _id: 'demo-github',
      platformName: 'GitHub',
      iconKey: 'github',
      label: '@dii-yeferson',
      url: 'https://github.com/dii-yeferson',
    },
    {
      _id: 'demo-email',
      platformName: lang === 'en' ? 'Email' : 'Correo',
      iconKey: 'email',
      label: DEMO_CONTACT_EMAIL,
      url: `mailto:${DEMO_CONTACT_EMAIL}`,
    },
  ]
}

/* ------------------------------------------------------------------ */
/* Proyectos                                                           */
/* ------------------------------------------------------------------ */

type DemoProject = NonNullable<PROJECT_BY_SLUG_QUERY_RESULT>

type DemoProjectSource = Omit<
  DemoProject,
  'title' | 'shortDescription' | 'problem' | 'approach' | 'solution' | 'results'
> & {
  title: Bilingual
  shortDescription: Bilingual
  problem: Bilingual
  approach: Bilingual
  solution: Bilingual
  results: Bilingual
}

const base = {
  _updatedAt: '2026-11-01T00:00:00Z',
  demoUrl: null,
  codeUrl: 'https://github.com/dii-yeferson',
  coverImage: NO_IMAGE,
  gallery: null,
  metrics: null,
}

export const DEMO_PROJECT_SOURCES: DemoProjectSource[] = [
  {
    ...base,
    _id: 'demo-centinela-minero',
    slug: 'centinela-minero',
    category: ['machine-learning', 'big-data', 'thesis'],
    technologies: ['Python', 'Machine Learning', 'Pandas'],
    featured: true,
    title: { es: 'Centinela Minero', en: 'Centinela Minero' },
    shortDescription: {
      es: 'Alertas tempranas para operaciones mineras: detecta lo raro en los sensores antes de que sea una falla.',
      en: 'Early warnings for mining operations: it spots unusual sensor behavior before it becomes a failure.',
    },
    problem: {
      es: 'Las minas generan miles de lecturas de sensores por hora. Casi siempre se revisan tarde, cuando el riesgo ya ocurrió.',
      en: 'Mines produce thousands of sensor readings per hour. They are usually reviewed too late, after the risk has happened.',
    },
    approach: {
      es: 'Limpié y ordené las series temporales, entrené modelos de detección de anomalías y los comparé con datos históricos de operación.',
      en: 'I cleaned and aligned the time series, trained anomaly detection models and tested them against historical operating data.',
    },
    solution: {
      es: 'Un panel que prioriza equipos y zonas por nivel de riesgo y avisa cuando algo se sale de lo normal.',
      en: 'A dashboard that ranks equipment and zones by risk and raises an alert when something drifts from normal.',
    },
    results: {
      es: 'Visibilidad continua de la operación y alertas que llegan con tiempo para actuar.',
      en: 'Continuous visibility of the operation and alerts that arrive early enough to act.',
    },
  },
  {
    ...base,
    _id: 'demo-qurri',
    slug: 'qurri',
    category: ['web-apps'],
    technologies: ['JavaScript', 'PWA', 'Supabase'],
    featured: false,
    title: { es: 'Qurri', en: 'Qurri' },
    shortDescription: {
      es: 'Registro de gastos por voz: lo dices y queda guardado con monto y categoría. Funciona sin conexión.',
      en: 'Voice expense tracker: say it and it is saved with amount and category. Works offline.',
    },
    problem: {
      es: 'Anotar cada gasto da pereza. Si registrarlo toma más de unos segundos, la gente deja de hacerlo.',
      en: 'Logging every expense is tedious. If it takes more than a few seconds, people stop doing it.',
    },
    approach: {
      es: 'Diseñé un flujo de un toque y una pantalla de voz que extrae monto, propósito y categoría de una frase.',
      en: 'I designed a one-tap flow and a voice screen that extracts amount, purpose and category from one sentence.',
    },
    solution: {
      es: 'Una app instalable con presupuestos por categoría, búsqueda instantánea y modo sin conexión.',
      en: 'An installable app with category budgets, instant search and offline mode.',
    },
    results: {
      es: 'Registrar un gasto pasó de un formulario a una frase.',
      en: 'Logging an expense went from a form to a single sentence.',
    },
  },
  {
    ...base,
    _id: 'demo-mikuy',
    slug: 'mikuy',
    codeUrl: 'https://github.com/dii-yeferson/Mikuy-Ai',
    category: ['web-apps'],
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'PWA'],
    featured: false,
    title: { es: 'Mikuy', en: 'Mikuy' },
    shortDescription: {
      es: 'Planifica qué cocinar con tu presupuesto en soles, arma la lista de compras y consulta a un asistente.',
      en: 'Plan what to cook on a budget in soles, build the shopping list and ask an assistant.',
    },
    problem: {
      es: 'Decidir qué cocinar cada día, con un presupuesto real y gustos distintos, consume tiempo y dinero.',
      en: 'Deciding what to cook every day, on a real budget and with different tastes, costs time and money.',
    },
    approach: {
      es: 'Una API en FastAPI con PostgreSQL y un frontend móvil que guía del perfil al plan, a las compras y al registro.',
      en: 'A FastAPI service with PostgreSQL and a mobile frontend that guides from profile to plan, shopping and tracking.',
    },
    solution: {
      es: 'Menús según presupuesto y preferencias, lista de compras y un asistente que conoce tu cuenta.',
      en: 'Menus based on budget and preferences, a shopping list and an assistant that knows your account.',
    },
    results: {
      es: 'Un recorrido completo, de planificar a cocinar, pensado para el contexto peruano.',
      en: 'A complete journey, from planning to cooking, designed for the Peruvian context.',
    },
  },
  {
    ...base,
    _id: 'demo-analisis-mineros',
    slug: 'analisis-datos-mineros',
    category: ['power-bi', 'big-data'],
    technologies: ['Power BI', 'SQL', 'Excel'],
    featured: false,
    title: { es: 'Tablero minero en Power BI', en: 'Mining dashboard in Power BI' },
    shortDescription: {
      es: 'Producción, costos y seguridad en un solo tablero, listo para la reunión de la mañana.',
      en: 'Production, costs and safety in one dashboard, ready for the morning meeting.',
    },
    problem: {
      es: 'La información estaba repartida en hojas de cálculo y reportes manuales que tomaban días.',
      en: 'The data lived in spreadsheets and manual reports that took days to put together.',
    },
    approach: {
      es: 'Modelo en estrella, limpieza de fuentes y medidas DAX para los indicadores clave.',
      en: 'A star schema, cleaned sources and DAX measures for the key indicators.',
    },
    solution: {
      es: 'Un tablero con filtros por unidad, periodo y proceso.',
      en: 'A dashboard filtered by unit, period and process.',
    },
    results: {
      es: 'Una sola fuente de verdad y reportes al instante.',
      en: 'A single source of truth and instant reports.',
    },
  },
]

export function getDemoProjects(lang: Locale): DemoProject[] {
  return DEMO_PROJECT_SOURCES.map((project) => ({
    ...project,
    title: pick(project.title, lang),
    shortDescription: pick(project.shortDescription, lang),
    problem: paragraphs(pick(project.problem, lang)),
    approach: paragraphs(pick(project.approach, lang)),
    solution: paragraphs(pick(project.solution, lang)),
    results: paragraphs(pick(project.results, lang)),
  }))
}

/* ------------------------------------------------------------------ */
/* Certificaciones                                                     */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Búsqueda                                                            */
/* ------------------------------------------------------------------ */

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
}

/** Búsqueda local equivalente a SEARCH_QUERY para el modo demostración. */
export function searchDemoContent(
  term: string,
  limit: number,
  lang: Locale = 'es',
): SEARCH_QUERY_RESULT {
  const tokens = normalize(term)
    .split(/\s+/)
    .map((token) => token.replace(/\*$/, ''))
    .filter(Boolean)
  const matches = (fields: string[]) => {
    const haystack = normalize(fields.join(' '))
    return tokens.every((token) => haystack.includes(token))
  }

  const projects = getDemoProjects(lang)
    .filter((project) =>
      matches([
        project.title,
        project.shortDescription,
        ...project.technologies,
        ...project.category,
      ]),
    )
    .map((project) => ({
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
