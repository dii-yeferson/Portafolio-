import { CommentIcon } from '@sanity/icons/Comment'
import { defineField, defineType } from 'sanity'

import { RECOMMENDATION_RELATIONSHIPS, RECOMMENDATION_STATUSES } from '../../../lib/taxonomy'
import { sortOrderField } from '../objects/fields'

/**
 * Recomendación verificada con LinkedIn. Llega desde `/recomendar` como
 * «Pendiente»; solo aparece en el sitio cuando la marcas como «Aprobada».
 * Nunca se guarda el correo de quien recomienda: solo su nombre y foto
 * públicos de LinkedIn y una huella anónima para evitar duplicados.
 */
export const recommendation = defineType({
  name: 'recommendation',
  title: 'Recomendación',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      description: 'Solo las «Aprobada» se muestran en el sitio.',
      options: { list: [...RECOMMENDATION_STATUSES], layout: 'radio', direction: 'horizontal' },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorName',
      title: 'Nombre (LinkedIn)',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'authorPhoto',
      title: 'Foto (LinkedIn)',
      type: 'image',
      readOnly: true,
    }),
    defineField({
      name: 'relationship',
      title: 'Relación',
      type: 'string',
      options: { list: [...RECOMMENDATION_RELATIONSHIPS] },
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
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'profileUrl',
      title: 'Perfil de LinkedIn',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'message',
      title: 'Recomendación',
      type: 'text',
      rows: 6,
      readOnly: true,
      validation: (rule) => rule.required().min(40).max(700),
    }),
    defineField({
      name: 'language',
      title: 'Idioma del texto',
      type: 'string',
      options: { list: ['es', 'en'] },
      readOnly: true,
    }),
    defineField({
      name: 'verifiedWith',
      title: 'Verificado con',
      type: 'string',
      readOnly: true,
      initialValue: 'linkedin',
    }),
    defineField({
      name: 'authorKey',
      title: 'Huella anónima',
      description: 'Identifica a la misma persona sin guardar sus datos.',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'submittedAt',
      title: 'Recibida',
      type: 'datetime',
      readOnly: true,
    }),
    sortOrderField(),
  ],
  orderings: [
    {
      title: 'Más recientes',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'authorName', role: 'role', status: 'status', media: 'authorPhoto' },
    prepare({ title, role, status, media }) {
      const state = RECOMMENDATION_STATUSES.find((item) => item.value === status)?.title ?? ''
      return {
        title: title ?? 'Sin nombre',
        subtitle: [state, role].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
