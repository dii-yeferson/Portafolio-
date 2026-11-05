import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { defineField, defineType } from 'sanity'

import {
  CERTIFICATION_CATEGORIES,
  CERTIFICATION_ICONS,
  getCertificationCategoryLabel,
} from '../../../lib/taxonomy'
import {
  validateExpiryAfterIssue,
  validateHttpsUrl,
  validateNotFutureDate,
} from '../../lib/validation'
import { altTextField, featuredField, sortOrderField } from '../objects/fields'

type CertificationDraft = {
  verificationUrl?: string
  certificateImage?: { asset?: unknown }
  issueDate?: string
}

/** CMS-03 · Certificación verificable (FR-07). */
export const certification = defineType({
  name: 'certification',
  title: 'Certificación',
  type: 'document',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'issuer',
      title: 'Entidad emisora',
      type: 'string',
      description: 'Ej.: Tecsup, Google, Microsoft, IBM.',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: { list: [...CERTIFICATION_CATEGORIES], layout: 'dropdown' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'iconKey',
      title: 'Ícono',
      description: 'Ícono tecnológico de la tarjeta.',
      type: 'string',
      options: { list: [...CERTIFICATION_ICONS], layout: 'dropdown' },
      initialValue: 'analytics',
    }),
    defineField({
      name: 'issueDate',
      title: 'Fecha de emisión',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: (rule) => rule.required().custom((value) => validateNotFutureDate(value)),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Fecha de vencimiento',
      type: 'date',
      description: 'Opcional. Déjalo vacío si la credencial no vence.',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: (rule) =>
        rule.custom((value, context) =>
          validateExpiryAfterIssue(
            (context.document as CertificationDraft | undefined)?.issueDate,
            value,
          ),
        ),
    }),
    defineField({
      name: 'credentialId',
      title: 'ID de credencial',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'verificationUrl',
      title: 'URL de verificación',
      type: 'url',
      description: 'Enlace oficial de la entidad emisora (solo HTTPS).',
      validation: (rule) => rule.uri({ scheme: ['https'] }).custom((v) => validateHttpsUrl(v)),
    }),
    defineField({
      name: 'certificateImage',
      title: 'Imagen del certificado',
      type: 'image',
      options: { hotspot: true },
      fields: [altTextField()],
    }),
    featuredField('Resalta la certificación en el catálogo.'),
    sortOrderField(),
  ],
  validation: (rule) =>
    rule.custom((document) => {
      const doc = document as CertificationDraft | undefined
      if (!doc) return true
      return doc.verificationUrl || doc.certificateImage?.asset
        ? true
        : 'Agrega una URL de verificación o una imagen del certificado.'
    }),
  orderings: [
    {
      title: 'Orden manual',
      name: 'sortOrderAsc',
      by: [
        { field: 'sortOrder', direction: 'asc' },
        { field: 'issueDate', direction: 'desc' },
      ],
    },
    {
      title: 'Más recientes',
      name: 'issueDateDesc',
      by: [{ field: 'issueDate', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      issuer: 'issuer',
      category: 'category',
      issueDate: 'issueDate',
      media: 'certificateImage',
    },
    prepare({ title, issuer, category, issueDate, media }) {
      const year = typeof issueDate === 'string' ? issueDate.slice(0, 4) : ''
      return {
        title,
        subtitle: [issuer, getCertificationCategoryLabel(category), year]
          .filter(Boolean)
          .join(' · '),
        media,
      }
    },
  },
})
