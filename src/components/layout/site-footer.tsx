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
      <div className="container-page flex justify-center py-8 text-sm font-semibold text-subtle">
        <p>
          © {new Date().getFullYear()} {name}. {t.rights}
        </p>
      </div>
    </footer>
  )
}
