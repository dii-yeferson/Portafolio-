import { defineArrayMember, defineField, defineType } from 'sanity'

import { validateHttpsUrl } from '../../lib/validation'
import { altTextField, captionField } from './fields'

/** Texto enriquecido (Portable Text) para los estudios de caso. */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Texto enriquecido',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Subtítulo', value: 'h3' },
        { title: 'Subtítulo menor', value: 'h4' },
        { title: 'Cita', value: 'blockquote' },
      ],
      lists: [
        { title: 'Viñetas', value: 'bullet' },
        { title: 'Numerada', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Negrita', value: 'strong' },
          { title: 'Cursiva', value: 'em' },
          { title: 'Código', value: 'code' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Enlace',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (rule) =>
                  rule
                    .required()
                    .uri({ scheme: ['https'] })
                    .custom((value) => validateHttpsUrl(value)),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [altTextField(), captionField()],
    }),
  ],
})
