import { HeartIcon } from '@sanity/icons/Heart'
import { defineField, defineType } from 'sanity'

/**
 * Contador de «me gusta» de un proyecto (`_id = likes-<slug>`). Lo escribe
 * solo la API del sitio; en el panel es de solo lectura.
 */
export const likeCounter = defineType({
  name: 'likeCounter',
  title: 'Me gusta',
  type: 'document',
  icon: HeartIcon,
  readOnly: true,
  fields: [
    defineField({ name: 'slug', title: 'Proyecto (slug)', type: 'string' }),
    defineField({ name: 'count', title: 'Me gusta', type: 'number', initialValue: 0 }),
  ],
  preview: {
    select: { title: 'slug', count: 'count' },
    prepare: ({ title, count }) => ({
      title: title ?? 'Proyecto',
      subtitle: `${count ?? 0} me gusta`,
    }),
  },
})
