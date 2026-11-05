import { ArrowUp } from 'lucide-react'

import { SITE_DEFAULTS } from '@/lib/site'
import type { SiteSettings } from '@/sanity/lib/data'

/** Pie mínimo: sin repetir logo, lema ni redes (ya están en el hero y en contacto). */
export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName

  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 text-sm font-semibold text-subtle sm:flex-row">
        <p>
          © {new Date().getFullYear()} {name}. Todos los derechos reservados.
        </p>
        <a
          href="#inicio"
          className="group inline-flex items-center gap-2 transition-colors hover:text-foreground"
        >
          Volver arriba
          <ArrowUp
            className="size-4 transition-transform group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </a>
      </div>
    </footer>
  )
}
