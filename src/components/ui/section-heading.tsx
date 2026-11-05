import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

type SectionHeadingProps = {
  id: string
  eyebrow: string
  title: string
  description?: string
  action?: { href: string; label: string }
}

/** Encabezado de sección: antetítulo con barra, título, bajada y acción opcional. */
export function SectionHeading({ id, eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="reveal mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="eyebrow relative pl-4 before:absolute before:top-1/2 before:left-0 before:h-4 before:w-[2px] before:-translate-y-1/2 before:rounded-full before:bg-accent-bright">
          {eyebrow}
        </p>
        <h2
          id={id}
          className="mt-3 pl-4 text-[2rem] leading-tight font-extrabold tracking-[-0.025em] sm:text-[2.35rem]"
        >
          {title}
        </h2>
        {description ? <p className="mt-2 pl-4 text-[0.98rem] text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="btn btn-ghost-accent h-10 shrink-0 self-start rounded-full px-5 text-sm sm:self-auto"
        >
          {action.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  )
}
