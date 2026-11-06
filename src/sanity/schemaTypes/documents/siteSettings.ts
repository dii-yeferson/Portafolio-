import { CogIcon } from '@sanity/icons/Cog'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { EXPERIENCE_KINDS } from '../../../lib/taxonomy'
import { validateDateOrder, validatePdfFile, validateYearRange } from '../../lib/validation'
import { altTextField } from '../objects/fields'

/** CMS-01 · Documento único (singleton) con los textos globales y el CV activo. */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configuración del sitio',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'identity', title: 'Identidad', default: true },
    { name: 'hero', title: 'Hero' },
    { name: 'about', title: 'Sobre mí' },
    { name: 'contact', title: 'Contacto y CV' },
    { name: 'texts', title: 'Textos del sitio' },
    { name: 'seo', title: 'SEO' },
    { name: 'english', title: 'English' },
  ],
  fields: [
    defineField({
      name: 'displayName',
      title: 'Nombre visible',
      type: 'string',
      group: 'identity',
      initialValue: 'Di Yeferson',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'tagline',
      title: 'Subtítulo profesional',
      type: 'string',
      group: 'identity',
      initialValue: 'Big Data · Ciencia de Datos · IA Aplicada',
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: 'availability',
      title: 'Disponibilidad',
      description:
        'Estado visible en el hero, p. ej. «Disponible para nuevos proyectos». Déjalo vacío para ocultarlo.',
      type: 'string',
      group: 'hero',
      validation: (rule) => rule.max(48),
    }),
    defineField({
      name: 'summary',
      title: 'Resumen profesional',
      type: 'text',
      rows: 5,
      group: ['identity', 'about'],
      validation: (rule) => rule.required().min(40).max(900),
    }),
    defineField({
      name: 'heroPortrait',
      title: 'Retrato',
      description:
        'Ideal: PNG vertical con fondo transparente (mín. 1200 × 1500 px) para que el globo gire detrás.',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [altTextField()],
    }),
    defineField({
      name: 'heroPhrases',
      title: 'Frases del hero',
      description:
        'La primera es el lema. La segunda, si existe, aparece al lado en serif itálica (p. ej. «Detrás de cada dato hay una decisión.» + «Me gusta encontrarla.»).',
      type: 'array',
      group: 'hero',
      of: [defineArrayMember({ type: 'string', validation: (rule) => rule.required().max(90) })],
      initialValue: ['Transformando datos en soluciones reales'],
      validation: (rule) => rule.required().min(1).max(6).unique(),
    }),
    defineField({
      name: 'heroBadges',
      title: 'Palabras del anillo',
      description:
        'Hasta 5 palabras que giran en el anillo alrededor del globo, p. ej. Análisis, Modelado, IA aplicada.',
      type: 'array',
      group: 'hero',
      of: [defineArrayMember({ type: 'string', validation: (rule) => rule.max(30) })],
      options: { layout: 'tags' },
      validation: (rule) => rule.max(5).unique(),
    }),
    defineField({
      name: 'resumeFile',
      title: 'CV (PDF)',
      description: 'El botón «Descargar CV» siempre entrega la versión cargada aquí.',
      type: 'file',
      group: 'contact',
      options: { accept: 'application/pdf' },
      validation: (rule) => [
        rule.custom((value) => validatePdfFile(value)),
        rule.required().warning('Sin CV, el botón «Descargar CV» no se mostrará.'),
      ],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Correo de contacto',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'education',
      title: 'Formación académica',
      type: 'array',
      group: 'about',
      of: [
        defineArrayMember({
          name: 'educationItem',
          title: 'Formación',
          type: 'object',
          fields: [
            defineField({
              name: 'institution',
              title: 'Institución',
              type: 'string',
              validation: (rule) => rule.required().max(100),
            }),
            defineField({
              name: 'program',
              title: 'Programa o carrera',
              type: 'string',
              validation: (rule) => rule.required().max(120),
            }),
            defineField({
              name: 'startYear',
              title: 'Año de inicio',
              type: 'number',
              validation: (rule) => rule.integer().min(1990).max(2100),
            }),
            defineField({
              name: 'endYear',
              title: 'Año de fin',
              description: 'Déjalo vacío si está en curso.',
              type: 'number',
              validation: (rule) =>
                rule
                  .integer()
                  .min(1990)
                  .max(2100)
                  .custom((endYear, context) =>
                    validateYearRange(
                      (context.parent as { startYear?: number } | undefined)?.startYear,
                      endYear,
                    ),
                  ),
            }),
            defineField({
              name: 'description',
              title: 'Descripción',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.max(400),
            }),
            defineField({
              name: 'programEn',
              title: 'Programa (English)',
              type: 'string',
              validation: (rule) => rule.max(120),
            }),
            defineField({
              name: 'descriptionEn',
              title: 'Descripción (English)',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.max(400),
            }),
            defineField({
              name: 'image',
              title: 'Imagen de fondo',
              description: 'Opcional: foto del campus o de la institución.',
              type: 'image',
              options: { hotspot: true },
              fields: [altTextField()],
            }),
          ],
          preview: { select: { title: 'program', subtitle: 'institution', media: 'image' } },
        }),
      ],
    }),
    defineField({
      name: 'experience',
      title: 'Experiencia',
      description:
        'Prácticas, empleos, proyectos independientes o voluntariado. Mientras esté vacío, la línea de tiempo muestra tu formación.',
      type: 'array',
      group: 'about',
      of: [
        defineArrayMember({
          name: 'experienceItem',
          title: 'Experiencia',
          type: 'object',
          fields: [
            defineField({
              name: 'kind',
              title: 'Tipo',
              type: 'string',
              options: { list: [...EXPERIENCE_KINDS], layout: 'radio', direction: 'horizontal' },
              initialValue: 'internship',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Cargo',
              type: 'string',
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: 'organization',
              title: 'Organización',
              type: 'string',
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: 'startDate',
              title: 'Inicio',
              type: 'date',
              options: { dateFormat: 'MM/YYYY' },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'endDate',
              title: 'Fin',
              description: 'Déjalo vacío si sigue en curso.',
              type: 'date',
              options: { dateFormat: 'MM/YYYY' },
              validation: (rule) =>
                rule.custom((endDate, context) =>
                  validateDateOrder(
                    (context.parent as { startDate?: string } | undefined)?.startDate,
                    endDate,
                  ),
                ),
            }),
            defineField({
              name: 'description',
              title: 'Qué hiciste',
              description: 'Una o dos frases, en primera persona.',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.max(300),
            }),
            defineField({
              name: 'roleEn',
              title: 'Cargo (English)',
              type: 'string',
              validation: (rule) => rule.max(80),
            }),
            defineField({
              name: 'descriptionEn',
              title: 'Qué hiciste (English)',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.max(300),
            }),
          ],
          preview: { select: { title: 'role', subtitle: 'organization' } },
        }),
      ],
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: 'githubUsername',
      title: 'Usuario de GitHub',
      description:
        'Tus repositorios públicos aparecen solos en el sitio (sin forks ni archivados). Ejemplo: dii-yeferson',
      type: 'string',
      group: 'contact',
      validation: (rule) =>
        rule.regex(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/, {
          name: 'usuario de GitHub',
        }),
    }),
    defineField({
      name: 'skillGroups',
      title: 'Habilidades técnicas',
      description: 'Agrupa las habilidades (p. ej. «Big Data»: Spark, Hadoop, Kafka).',
      type: 'array',
      group: 'about',
      of: [
        defineArrayMember({
          name: 'skillGroup',
          title: 'Grupo de habilidades',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Grupo',
              type: 'string',
              validation: (rule) => rule.required().max(60),
            }),
            defineField({
              name: 'titleEn',
              title: 'Grupo (English)',
              type: 'string',
              validation: (rule) => rule.max(60),
            }),
            defineField({
              name: 'skills',
              title: 'Habilidades',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              options: { layout: 'tags' },
              validation: (rule) => rule.required().min(1).unique(),
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'skills' } },
        }),
      ],
    }),
    defineField({
      name: 'principles',
      title: 'Principios de trabajo',
      type: 'array',
      group: 'about',
      of: [
        defineArrayMember({
          name: 'principle',
          title: 'Principio',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Título',
              type: 'string',
              validation: (rule) => rule.required().max(60),
            }),
            defineField({
              name: 'description',
              title: 'Descripción',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.max(300),
            }),
            defineField({
              name: 'titleEn',
              title: 'Título (English)',
              type: 'string',
              validation: (rule) => rule.max(60),
            }),
            defineField({
              name: 'descriptionEn',
              title: 'Descripción (English)',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.max(300),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'aboutCopy',
      title: 'Sección «Sobre mí»',
      description: 'Deja vacío cualquier campo para usar el texto por defecto.',
      type: 'sectionCopy',
      group: 'texts',
    }),
    defineField({
      name: 'projectsCopy',
      title: 'Sección «Proyectos»',
      type: 'sectionCopy',
      group: 'texts',
    }),
    defineField({
      name: 'certificationsCopy',
      title: 'Sección «Certificaciones»',
      type: 'sectionCopy',
      group: 'texts',
    }),
    defineField({
      name: 'contactCopy',
      title: 'Sección «Contacto»',
      description: 'La última palabra del título se resalta con el degradado.',
      type: 'sectionCopy',
      group: 'texts',
    }),
    defineField({
      name: 'taglineEn',
      title: 'Tagline',
      description: 'Versión en inglés. Cualquier campo vacío usa el texto en español.',
      type: 'string',
      group: 'english',
      validation: (rule) => rule.max(90),
    }),
    defineField({
      name: 'availabilityEn',
      title: 'Availability',
      type: 'string',
      group: 'english',
      validation: (rule) => rule.max(48),
    }),
    defineField({
      name: 'summaryEn',
      title: 'Summary',
      type: 'text',
      rows: 5,
      group: 'english',
      validation: (rule) => rule.max(900),
    }),
    defineField({
      name: 'heroPhrasesEn',
      title: 'Hero phrases',
      type: 'array',
      group: 'english',
      of: [defineArrayMember({ type: 'string', validation: (rule) => rule.max(90) })],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'heroBadgesEn',
      title: 'Orbit words',
      type: 'array',
      group: 'english',
      of: [defineArrayMember({ type: 'string', validation: (rule) => rule.max(30) })],
      options: { layout: 'tags' },
      validation: (rule) => rule.max(5),
    }),
    defineField({
      name: 'seoMeta',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Configuración del sitio' }),
  },
})
