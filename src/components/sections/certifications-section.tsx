import { CertificationsGrid } from '@/components/certifications/certifications-grid'
import { SectionHeading } from '@/components/ui/section-heading'
import { type Locale, localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { toCertificationViews } from '@/lib/certifications'
import { resolveCopy } from '@/lib/copy'
import type { CertificationItem, SiteSettings } from '@/sanity/lib/data'

export function CertificationsSection({
  certifications,
  settings,
  lang,
}: {
  certifications: CertificationItem[]
  settings: SiteSettings
  lang: Locale
}) {
  const t = getDictionary(lang).certifications
  const items = toCertificationViews(certifications, lang).slice(0, 6)
  const copy = resolveCopy(settings?.certificationsCopy, {
    label: t.label,
    title: t.title,
    description: t.description,
  })

  return (
    <section
      id="certificaciones"
      aria-labelledby="certificaciones-title"
      className="border-t border-line py-20 lg:py-28"
    >
      <div className="container-page">
        <SectionHeading
          id="certificaciones-title"
          label={copy.label}
          title={copy.title}
          description={copy.description}
          action={{ href: localePath(lang, '/certificaciones'), label: t.viewAll }}
        />
        {items.length > 0 ? (
          <CertificationsGrid certifications={items} />
        ) : (
          <p className="text-muted">{t.empty}</p>
        )}
      </div>
    </section>
  )
}
