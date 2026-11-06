import { z } from 'zod'

/** Slug de proyecto válido (mismo formato que genera Sanity). */
const slug = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const likeBodySchema = z.object({ slug, action: z.enum(['like', 'unlike']) })

/** `?slugs=a,b,c` → lista única y válida (máximo 48). */
export function parseSlugList(value: string | null): string[] | null {
  if (!value) return null
  const items = [
    ...new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ]
  if (items.length === 0 || items.length > 48) return null
  return items.every((item) => slug.safeParse(item).success) ? items : null
}

/** ID del contador. Sin puntos: los IDs con punto no son públicos en Sanity. */
export const likeDocumentId = (projectSlug: string) => `likes-${projectSlug}`
