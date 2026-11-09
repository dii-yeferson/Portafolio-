import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { SplitLetters } from '@/components/motion/split-letters'
import { Accent, plainText } from '@/i18n/accent'
import { type Locale, localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n'

type Crumb = { href: string; label: string }

/** Cabecera de páginas internas: migas, etiqueta, título que se arma en 3D y bajada. */
export function PageHero({
  lang,
  label,
  title,
  description,
  crumbs = [],
  children,
}: {
  lang: Locale
  label: string
  title: string
  description?: string
  crumbs?: Crumb[]
  children?: React.ReactNode
}) {
  const t = getDictionary(lang).common
  const hasAccent = title.includes('*')

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_85%_0%,rgb(var(--accent-rgb)/0.11),transparent_65%),radial-gradient(40%_60%_at_0%_0%,rgb(var(--accent-rgb)/0.06),transparent_70%)]"
      />
      <div aria-hidden="true" className="grain absolute inset-0 -z-10 opacity-[0.12]" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-b from-transparent to-background"
      />
      <div className="container-page pt-36 pb-14 lg:pt-44 lg:pb-20">
        <nav aria-label={t.breadcrumbs} className="animate-rise">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.85rem] font-bold text-subtle">
            <li>
              <Link
                href={localePath(lang, '/')}
                className="transition-colors hover:text-foreground"
              >
                {t.home}
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
              {plainText(title)}
            </li>
          </ol>
        </nav>
        <p className="label mt-10 animate-rise [animation-delay:60ms]">{label}</p>
        <h1 className="letters letters-intro mt-3 max-w-4xl text-[clamp(2.8rem,6.5vw,5rem)] leading-[0.98] font-black tracking-[-0.05em]">
          {hasAccent ? (
            <span className="inline-block animate-rise">
              <Accent text={title} className="accent-serif text-aurora pr-1" />
            </span>
          ) : (
            <SplitLetters text={title} />
          )}
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
