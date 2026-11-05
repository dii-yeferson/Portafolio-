export type SectionCopyInput =
  { label?: string | null; title?: string | null; description?: string | null } | null | undefined

export type SectionCopy = { label: string; title: string; description: string }

/** Textos de sección editables desde el panel, con el texto por defecto si quedan vacíos. */
export function resolveCopy(copy: SectionCopyInput, defaults: SectionCopy): SectionCopy {
  return {
    label: copy?.label?.trim() || defaults.label,
    title: copy?.title?.trim() || defaults.title,
    description: copy?.description?.trim() || defaults.description,
  }
}

/** Separa la última palabra de un título para resaltarla («¿Trabajamos juntos?» → ['¿Trabajamos ', 'juntos', '?']). */
export function splitHighlight(title: string): [string, string, string] {
  const match = /^(.*\s)?(\S+?)([?!.]*)$/u.exec(title.trim())
  if (!match) return ['', title, '']
  return [match[1] ?? '', match[2] ?? '', match[3] ?? '']
}
