import { ArrowUp } from 'lucide-react'

import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { SITE_DEFAULTS } from '@/lib/site'
import type { SiteSettings } from '@/sanity/lib/data'

/** Pie mínimo sobre el suelo del arce: sin repetir logo, lema ni redes. */
export function SiteFooter({ settings, lang }: { settings: SiteSettings; lang: Locale }) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const t = getDictionary(lang).common

  return (
    // El pie se apoya en el suelo del arce: raíces y hojas caídas detrás.
    <footer className="pt-[calc(var(--tree-w)*0.16)]">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 text-sm font-semibold text-foreground/80 [text-shadow:0_1px_8px_rgb(0_0_0/0.8)] sm:flex-row">
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
