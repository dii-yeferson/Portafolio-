import Link from 'next/link'

import { SITE_DEFAULTS } from '@/lib/site'
import type { SiteSettings } from '@/sanity/lib/data'

import { SearchDialog } from './search-dialog'

const NAV_ITEMS = [
  { href: '/#sobre-mi', label: 'Sobre mí' },
  { href: '/#proyectos', label: 'Proyectos' },
  { href: '/#certificaciones', label: 'Certificaciones' },
  { href: '/#contacto', label: 'Contacto' },
] as const

/** Barra superior fija con efecto glass, buscador y descarga de CV (FR-01). */
export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
          {name}
        </Link>
        <nav
          aria-label="Principal"
          className="order-last w-full overflow-x-auto md:order-none md:w-auto"
        >
          <ul className="flex gap-5 text-sm text-muted">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="whitespace-nowrap transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <SearchDialog />
          {settings?.resume?.url ? (
            <a
              href="/cv"
              rel="nofollow"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-accent-strong"
            >
              Descargar CV
            </a>
          ) : null}
        </div>
      </div>
    </header>
  )
}
