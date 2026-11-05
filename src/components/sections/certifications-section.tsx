import { isExpired } from '@/lib/format'
import type { CertificationItem } from '@/sanity/lib/data'

import { CertificationsCatalog } from '../certifications-catalog'
import { SectionHeading } from '../section-heading'

export function CertificationsSection({ certifications }: { certifications: CertificationItem[] }) {
  // El vencimiento se calcula en el servidor para evitar diferencias de hidratación.
  const items = certifications.map((item) => ({ ...item, expired: isExpired(item.expiresAt) }))

  return (
    <section aria-labelledby="certificaciones-title" id="certificaciones" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          id="certificaciones-title"
          eyebrow="Certificaciones"
          title="Credenciales verificadas"
          description="Cada credencial enlaza a la verificación oficial de la entidad emisora."
        />
        {items.length > 0 ? (
          <CertificationsCatalog certifications={items} />
        ) : (
          <p className="text-muted">Las certificaciones se publicarán muy pronto.</p>
        )}
      </div>
    </section>
  )
}
