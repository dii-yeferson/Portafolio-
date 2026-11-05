import { ProjectsIcon } from '@sanity/icons/Projects'
import { defineArrayMember, defineField, defineType } from 'sanity'

import {
  getProjectCategoryLabel,
  getProjectStatusLabel,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
} from '../../../lib/taxonomy'
import { validateHttpsUrl } from '../../lib/validation'
import { altTextField, captionField, featuredField, sortOrderField } from '../objects/fields'

/** CMS-02 · Proyecto con estructura de estudio de caso (FR-05 / FR-06). */
export const project = defineType({
  name: 'project',
  title: 'Proyecto',
  type: 'document',
  icon: ProjectsIcon,
  groups: [
    { name: 'card', title: 'Tarjeta', default: true },
    { name: 'caseStudy', title: 'Estudio de caso' },
    { name: 'media', title: 'Imágenes' },
    { name: 'links', title: 'Enlaces' },
    { name: 'publishing', title: 'Publicación' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      group: 'card',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      group: 'card',
      description: 'Se usa en /proyectos/[slug]. Genéralo desde el título.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categorías',
      type: 'array',
      group: 'card',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: [...PROJECT_CATEGORIES], layout: 'grid' },
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Resumen corto',
      type: 'text',
      rows: 3,
      group: 'card',
      description: 'Se muestra en la tarjeta y como meta descripción.',
      validation: (rule) => rule.required().min(20).max(200),
    }),
    defineField({
      name: 'technologies',
      title: 'Tecnologías',
      type: 'array',
      group: 'card',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
      validation: (rule) => rule.required().min(1).max(15).unique(),
    }),
    defineField({
      name: 'problem',
      title: 'El problema',
      type: 'blockContent',
      group: 'caseStudy',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'approach',
      title: 'Metodología y arquitectura',
      type: 'blockContent',
      group: 'caseStudy',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'solution',
      title: 'Solución implementada',
      type: 'blockContent',
      group: 'caseStudy',
    }),
    defineField({
      name: 'results',
      title: 'Resultados',
      type: 'blockContent',
      group: 'caseStudy',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'metrics',
      title: 'Resultados cuantitativos',
      description: 'Indicadores clave, p. ej. «Precisión del modelo: 94 %».',
      type: 'array',
      group: 'caseStudy',
      of: [
        defineArrayMember({
          name: 'metric',
          title: 'Métrica',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Indicador',
              type: 'string',
              validation: (rule) => rule.required().max(60),
            }),
            defineField({
              name: 'value',
              title: 'Valor',
              type: 'string',
              validation: (rule) => rule.required().max(20),
            }),
            defineField({
              name: 'context',
              title: 'Contexto',
              type: 'string',
              validation: (rule) => rule.max(120),
            }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'coverImage',
      title: 'Imagen de portada',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      fields: [altTextField()],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Galería',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [altTextField(), captionField()],
        }),
      ],
      options: { layout: 'grid' },
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: 'demoUrl',
      title: 'URL de la demo',
      type: 'url',
      group: 'links',
      validation: (rule) => rule.uri({ scheme: ['https'] }).custom((v) => validateHttpsUrl(v)),
    }),
    defineField({
      name: 'codeUrl',
      title: 'URL del repositorio',
      type: 'url',
      group: 'links',
      validation: (rule) => rule.uri({ scheme: ['https'] }).custom((v) => validateHttpsUrl(v)),
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      group: 'publishing',
      description: 'Solo los proyectos «Publicado» aparecen en el sitio.',
      options: { list: [...PROJECT_STATUSES], layout: 'radio', direction: 'horizontal' },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    {
      ...featuredField('Muestra el proyecto como tarjeta insignia (p. ej. Centinela Minero).'),
      group: 'publishing',
    },
    { ...sortOrderField(), group: 'publishing' },
  ],
  orderings: [
    {
      title: 'Orden manual',
      name: 'sortOrderAsc',
      by: [
        { field: 'sortOrder', direction: 'asc' },
        { field: '_createdAt', direction: 'desc' },
      ],
    },
    { title: 'Título (A–Z)', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      category: 'category',
      featured: 'featured',
      media: 'coverImage',
    },
    prepare({ title, status, category, featured, media }) {
      const categories = Array.isArray(category)
        ? category.map((value: string) => getProjectCategoryLabel(value)).join(' · ')
        : ''
      return {
        title: `${featured ? '★ ' : ''}${title ?? 'Sin título'}`,
        subtitle: [getProjectStatusLabel(status), categories].filter(Boolean).join(' — '),
        media,
      }
    },
  },
})
