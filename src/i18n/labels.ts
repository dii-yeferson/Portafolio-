import type { Locale } from './config'
import { getDictionary } from './index'

/** Etiqueta de una categoría de proyecto en el idioma activo. */
export function projectCategoryLabel(value: string | null | undefined, lang: Locale): string {
  if (!value) return ''
  const labels: Record<string, string> = getDictionary(lang).taxonomy.projectCategories
  return labels[value] ?? value
}

/** Etiqueta de una categoría de certificación en el idioma activo. */
export function certificationCategoryLabel(value: string | null | undefined, lang: Locale): string {
  if (!value) return ''
  const labels: Record<string, string> = getDictionary(lang).taxonomy.certificationCategories
  return labels[value] ?? value
}
