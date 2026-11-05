import { CertificationsGrid } from '@/components/certifications/certifications-grid'
import { SectionHeading } from '@/components/ui/section-heading'
import { toCertificationViews } from '@/lib/certifications'
import { resolveCopy } from '@/lib/copy'
import type { CertificationItem, SiteSettings } from '@/sanity/lib/data'

export function CertificationsSection({
  certifications,
  settings,
}: {
  certifications: CertificationItem[]
  settings: SiteSettings
}) {
  const items = toCertificationViews(certifications).slice(0, 6)
  const copy = resolveCopy(settings?.certificationsCopy, {
    label: 'Aprendizaje continuo',
    title: 'Certificaciones',
    description: 'Credenciales con fecha real de emisión y enlace a la verificación oficial.',
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
          action={{ href: '/certificaciones', label: 'Ver todas' }}
        />
        {items.length > 0 ? (
          <CertificationsGrid certifications={items} />
        ) : (
          <p className="text-muted">Las certificaciones se publicarán muy pronto.</p>
        )}
      </div>
    </section>
  )
}
