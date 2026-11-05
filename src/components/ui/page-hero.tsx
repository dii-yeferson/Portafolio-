import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Crumb = { href: string; label: string }

/** Cabecera de páginas internas con migas de pan y resplandor de marca. */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs = [],
  children,
}: {
  eyebrow: string
  title: string
  description?: string
  crumbs?: Crumb[]
  children?: React.ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_80%_0%,rgba(42,120,90,0.28),transparent_65%),linear-gradient(180deg,#07100c,#060c09)]"
      />
      <div aria-hidden="true" className="grain absolute inset-0 -z-10 opacity-[0.15]" />
      <div className="container-page py-14 lg:py-20">
        <nav aria-label="Migas de pan" className="animate-fade-up">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-muted">
            <li>
              <Link href="/" className="hover:text-foreground">
                Inicio
              </Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5 text-subtle" aria-hidden="true" />
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-1.5" aria-current="page">
              <ChevronRight className="size-3.5 text-subtle" aria-hidden="true" />
              <span className="text-foreground/80">{title}</span>
            </li>
          </ol>
        </nav>
        <p className="eyebrow mt-8 animate-fade-up [animation-delay:60ms]">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl animate-fade-up text-[clamp(2.5rem,6vw,4.4rem)] leading-[1.02] font-black tracking-[-0.04em] [animation-delay:120ms]">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl animate-fade-up text-lg leading-relaxed text-muted [animation-delay:180ms]">
            {description}
          </p>
        ) : null}
        {children ? (
          <div className="mt-8 animate-fade-up [animation-delay:240ms]">{children}</div>
        ) : null}
      </div>
    </section>
  )
}
