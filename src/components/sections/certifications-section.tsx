import { CertificationsGrid } from '@/components/certifications/certifications-grid'
import { SectionHeading } from '@/components/ui/section-heading'
import { toCertificationViews } from '@/lib/certifications'
import type { CertificationItem } from '@/sanity/lib/data'

export function CertificationsSection({ certifications }: { certifications: CertificationItem[] }) {
  const items = toCertificationViews(certifications).slice(0, 5)

  return (
    <section
      id="certificaciones"
      aria-labelledby="certificaciones-title"
      className="border-b border-white/[0.06]"
    >
      <div className="container-page py-14 lg:py-16">
        <SectionHeading
          id="certificaciones-title"
          eyebrow="Aprendizaje continuo"
          title="Certificaciones"
          description="Conocimientos respaldados por certificaciones en diversas áreas de la tecnología y análisis de datos."
          action={{ href: '/certificaciones', label: 'Ver todas las certificaciones' }}
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
