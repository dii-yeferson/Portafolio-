import { LinkIcon } from '@sanity/icons/Link'
import { defineField, defineType } from 'sanity'

import { getSocialPlatformLabel, SOCIAL_PLATFORMS } from '../../../lib/taxonomy'
import { validateSocialUrl } from '../../lib/validation'
import { sortOrderField } from '../objects/fields'

/** CMS-04 · Canal del ecosistema social (FR-04). */
export const socialLink = defineType({
  name: 'socialLink',
  title: 'Red social',
  type: 'document',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'platformName',
      title: 'Plataforma',
      type: 'string',
      description: 'Nombre visible, p. ej. «LinkedIn».',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'iconKey',
      title: 'Ícono',
      type: 'string',
      options: { list: [...SOCIAL_PLATFORMS], layout: 'dropdown' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'HTTPS para redes; mailto:correo@dominio.com para «Correo».',
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ['https', 'mailto'] })
          .custom((value, context) =>
            validateSocialUrl(
              value,
              (context.document as { iconKey?: string } | undefined)?.iconKey,
            ),
          ),
    }),
    defineField({
      name: 'label',
      title: 'Etiqueta',
      type: 'string',
      description: 'Texto de vista previa al pasar el cursor, p. ej. «@usuario».',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'visibility',
      title: 'Visible en el sitio',
      type: 'boolean',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    sortOrderField(),
  ],
  orderings: [
    {
      title: 'Orden manual',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'platformName', url: 'url', iconKey: 'iconKey', visibility: 'visibility' },
    prepare({ title, url, iconKey, visibility }) {
      return {
        title: `${title ?? getSocialPlatformLabel(iconKey)}${visibility === false ? ' (oculto)' : ''}`,
        subtitle: url,
      }
    },
  },
})
