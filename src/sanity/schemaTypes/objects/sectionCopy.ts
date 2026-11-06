import { defineField, defineType } from 'sanity'

/** Textos editables de una sección (etiqueta, título y bajada). Vacío = texto por defecto. */
export const sectionCopy = defineType({
  name: 'sectionCopy',
  title: 'Textos de la sección',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fieldsets: [{ name: 'en', title: 'English', options: { collapsible: true, collapsed: true } }],
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
      description:
        'Pon entre asteriscos lo que quieres en serif itálica: Proyectos que *resuelven algo.*',
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
    defineField({
      name: 'labelEn',
      title: 'Label',
      type: 'string',
      fieldset: 'en',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'titleEn',
      title: 'Title',
      type: 'string',
      fieldset: 'en',
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: 'descriptionEn',
      title: 'Description',
      type: 'text',
      rows: 2,
      fieldset: 'en',
      validation: (rule) => rule.max(220),
    }),
  ],
})
