import { CertificationsGrid } from '@/components/certifications/certifications-grid'
import { SectionHeading } from '@/components/ui/section-heading'
import { toCertificationViews } from '@/lib/certifications'
import type { CertificationItem } from '@/sanity/lib/data'

export function CertificationsSection({ certifications }: { certifications: CertificationItem[] }) {
  const items = toCertificationViews(certifications).slice(0, 6)

  return (
    <section
      id="certificaciones"
      aria-labelledby="certificaciones-title"
      className="border-t border-line py-20 lg:py-28"
    >
      <div className="container-page">
        <SectionHeading
          id="certificaciones-title"
          label="Aprendizaje continuo"
          title="Certificaciones"
          description="Credenciales con fecha real de emisión y enlace a la verificación oficial."
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
