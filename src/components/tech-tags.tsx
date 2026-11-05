/** Etiquetas de tecnologías. */
export function TechTags({ items, label = 'Tecnologías' }: { items: string[]; label?: string }) {
  if (items.length === 0) return null
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <li key={item} className="chip">
          {item}
        </li>
      ))}
    </ul>
  )
}
