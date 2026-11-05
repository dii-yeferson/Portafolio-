import { CogIcon } from '@sanity/icons/Cog'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { validatePdfFile, validateYearRange } from '../../lib/validation'
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
    { name: 'seo', title: 'SEO' },
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
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [altTextField()],
    }),
    defineField({
      name: 'heroPhrases',
      title: 'Frases del hero',
      description: 'Lema y frases rotativas. La primera es el lema principal.',
      type: 'array',
      group: 'hero',
      of: [defineArrayMember({ type: 'string', validation: (rule) => rule.required().max(90) })],
      initialValue: ['Transformando datos en soluciones reales'],
      validation: (rule) => rule.required().min(1).max(6).unique(),
    }),
    defineField({
      name: 'heroBadges',
      title: 'Insignias del hero',
      description: 'Etiquetas cortas, p. ej. «Python», «Spark», «Power BI».',
      type: 'array',
      group: 'hero',
      of: [defineArrayMember({ type: 'string', validation: (rule) => rule.max(30) })],
      options: { layout: 'tags' },
      validation: (rule) => rule.max(8).unique(),
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
          ],
          preview: { select: { title: 'program', subtitle: 'institution' } },
        }),
      ],
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
          ],
        }),
      ],
      validation: (rule) => rule.max(6),
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
