export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <header className="mb-10 max-w-2xl">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-muted">{description}</p> : null}
    </header>
  )
}
