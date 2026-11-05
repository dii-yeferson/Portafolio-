import { defineField } from 'sanity'

import { validateAltText } from '../../lib/validation'

/** Campo `alt` reutilizable: obligatorio solo si la imagen tiene archivo. */
export function altTextField() {
  return defineField({
    name: 'alt',
    title: 'Texto alternativo',
    type: 'string',
    description: 'Describe la imagen para lectores de pantalla y buscadores.',
    validation: (rule) =>
      rule
        .max(160)
        .custom((alt, context) =>
          validateAltText(alt, context.parent as { asset?: unknown } | undefined),
        ),
  })
}

export function captionField() {
  return defineField({
    name: 'caption',
    title: 'Leyenda',
    type: 'string',
    validation: (rule) => rule.max(200),
  })
}

/** Orden manual ascendente (menor = primero). */
export function sortOrderField() {
  return defineField({
    name: 'sortOrder',
    title: 'Orden',
    type: 'number',
    description: 'Los números menores aparecen primero.',
    initialValue: 100,
    validation: (rule) => rule.required().integer().min(0).max(9999),
  })
}

export function featuredField(description: string) {
  return defineField({
    name: 'featured',
    title: 'Destacado',
    type: 'boolean',
    description,
    initialValue: false,
  })
}
