import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Crumb = { href: string; label: string }

/** Cabecera de páginas internas: migas, etiqueta, título y bajada. */
export function PageHero({
  label,
  title,
  description,
  crumbs = [],
  children,
}: {
  label: string
  title: string
  description?: string
  crumbs?: Crumb[]
  children?: React.ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_85%_0%,rgba(98,210,248,0.13),transparent_65%),radial-gradient(40%_60%_at_0%_0%,rgba(149,251,223,0.07),transparent_70%)]"
      />
      <div aria-hidden="true" className="grain absolute inset-0 -z-10 opacity-[0.12]" />
      <div className="container-page pt-36 pb-14 lg:pt-44 lg:pb-20">
        <nav aria-label="Migas de pan" className="animate-rise">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.85rem] font-bold text-subtle">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Inicio
              </Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5" aria-hidden="true" />
                <Link href={crumb.href} className="transition-colors hover:text-foreground">
                  {crumb.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-1.5 text-muted" aria-current="page">
              <ChevronRight className="size-3.5" aria-hidden="true" />
              {title}
            </li>
          </ol>
        </nav>
        <p className="label mt-10 animate-rise [animation-delay:60ms]">{label}</p>
        <h1 className="text-satin mt-3 max-w-4xl text-[clamp(2.8rem,6.5vw,5rem)] leading-[0.98] font-black tracking-[-0.05em]">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl animate-rise text-[1.12rem] leading-relaxed text-muted [animation-delay:160ms]">
            {description}
          </p>
        ) : null}
        {children ? (
          <div className="mt-9 animate-rise [animation-delay:220ms]">{children}</div>
        ) : null}
      </div>
    </section>
  )
}
