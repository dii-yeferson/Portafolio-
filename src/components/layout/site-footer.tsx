import { ArrowUp } from 'lucide-react'

import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { SITE_DEFAULTS } from '@/lib/site'
import type { SiteSettings } from '@/sanity/lib/data'

/** Pie mínimo: sin repetir logo, lema ni redes (ya están en el hero y en contacto). */
export function SiteFooter({ settings, lang }: { settings: SiteSettings; lang: Locale }) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const t = getDictionary(lang).common

  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 text-sm font-semibold text-subtle sm:flex-row">
        <p>
          © {new Date().getFullYear()} {name}. {t.rights}
        </p>
        <a
          href="#inicio"
          className="group inline-flex items-center gap-2 transition-colors hover:text-foreground"
        >
          {t.backToTop}
          <ArrowUp
            className="size-4 transition-transform group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </a>
      </div>
    </footer>
  )
}
