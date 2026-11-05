import { defineField, defineType } from 'sanity'

/** Textos editables de una sección (etiqueta, título y bajada). Vacío = texto por defecto. */
export const sectionCopy = defineType({
  name: 'sectionCopy',
  title: 'Textos de la sección',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'label',
      title: 'Etiqueta',
      type: 'string',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(220),
    }),
  ],
})
