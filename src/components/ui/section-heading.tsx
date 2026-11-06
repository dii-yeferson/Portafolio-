import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Accent } from '@/i18n/accent'

type SectionHeadingProps = {
  id: string
  label: string
  title: string
  description?: string
  action?: { href: string; label: string }
}

/** Encabezado de sección: etiqueta discreta, título firme y acción opcional. */
export function SectionHeading({ id, label, title, description, action }: SectionHeadingProps) {
  return (
    <div className="reveal mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="label">{label}</p>
        <h2
          id={id}
          className="mt-3 text-[clamp(2.2rem,4.2vw,3.25rem)] leading-[1.02] font-black tracking-[-0.04em]"
        >
          <Accent text={title} className="accent-serif text-aurora pr-1" />
        </h2>
        {description ? (
          <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 text-[0.95rem] font-extrabold text-foreground"
        >
          {action.label}
          <span className="grid size-8 place-items-center rounded-full border border-line-strong transition-[transform,background-color] duration-300 group-hover:translate-x-0.5 group-hover:bg-ink/[0.07]">
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
      ) : null}
    </div>
  )
}
