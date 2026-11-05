import { SearchIcon } from '@sanity/icons/Search'
import { defineField, defineType } from 'sanity'

import { altTextField } from './fields'

export const seo = defineType({
  name: 'seo',
  title: 'SEO y redes sociales',
  type: 'object',
  icon: SearchIcon,
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Título SEO',
      type: 'string',
      description: 'Recomendado: 50–60 caracteres.',
      validation: (rule) =>
        rule.max(60).warning('Los buscadores recortan títulos de más de 60 caracteres.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta descripción',
      type: 'text',
      rows: 3,
      description: 'Recomendado: 120–160 caracteres.',
      validation: (rule) =>
        rule.max(160).warning('Los buscadores recortan descripciones de más de 160 caracteres.'),
    }),
    defineField({
      name: 'keywords',
      title: 'Palabras clave',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      validation: (rule) => rule.unique().max(15),
    }),
    defineField({
      name: 'ogImage',
      title: 'Imagen para compartir (Open Graph)',
      type: 'image',
      description: '1200 × 630 px. Se muestra al compartir en LinkedIn, X o WhatsApp.',
      options: { hotspot: true },
      fields: [altTextField()],
    }),
    defineField({
      name: 'twitterHandle',
      title: 'Usuario de X (Twitter)',
      type: 'string',
      description: 'Ej.: @usuario. Se usa en las Twitter Cards.',
      validation: (rule) =>
        rule.regex(/^@?[A-Za-z0-9_]{1,15}$/, { name: 'usuario de X', invert: false }),
    }),
  ],
})
