/** Etiquetas de tecnologías en tipografía monoespaciada. */
export function TechTags({ items, label = 'Tecnologías' }: { items: string[]; label?: string }) {
  if (items.length === 0) return null
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md border border-border/70 bg-background/60 px-2 py-1 font-mono text-xs text-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
