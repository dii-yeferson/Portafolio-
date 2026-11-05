import type { Metadata } from 'next'

import { CertificationsCatalog } from '@/components/certifications/certifications-catalog'
import { ContactSection } from '@/components/sections/contact-section'
import { PageHero } from '@/components/ui/page-hero'
import { toCertificationViews } from '@/lib/certifications'
import { getCertifications, getSiteSettings, getSocialLinks } from '@/sanity/lib/data'

export const metadata: Metadata = {
  title: 'Certificaciones',
  description:
    'Certificaciones en ciencia de datos, Big Data, machine learning y business intelligence con verificación oficial.',
  alternates: { canonical: '/certificaciones' },
}

export default async function CertificationsPage() {
  const [certifications, settings, socialLinks] = await Promise.all([
    getCertifications(),
    getSiteSettings(),
    getSocialLinks(),
  ])

  return (
    <>
      <PageHero
        label="Aprendizaje continuo"
        title="Certificaciones"
        description="Credenciales con fecha real de emisión y enlace a la verificación oficial de cada entidad."
      />
      <section aria-label="Catálogo de certificaciones" className="pb-24 lg:pb-32">
        <div className="container-page">
          <CertificationsCatalog certifications={toCertificationViews(certifications)} />
        </div>
      </section>
      <ContactSection settings={settings} socialLinks={socialLinks} />
    </>
  )
}
