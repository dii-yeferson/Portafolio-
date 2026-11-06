import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CertificationsCatalog } from '@/components/certifications/certifications-catalog'
import { ContactSection } from '@/components/sections/contact-section'
import { PageHero } from '@/components/ui/page-hero'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { toCertificationViews } from '@/lib/certifications'
import { buildPageMetadata } from '@/lib/seo'
import { getCertifications, getSiteSettings, getSocialLinks } from '@/sanity/lib/data'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/certificaciones'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const t = getDictionary(lang).meta
  return buildPageMetadata(
    '/certificaciones',
    lang,
    t.certificationsTitle,
    t.certificationsDescription,
  )
}

export default async function CertificationsPage({ params }: PageProps<'/[lang]/certificaciones'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDictionary(lang)
  const [certifications, settings, socialLinks] = await Promise.all([
    getCertifications(),
    getSiteSettings(lang),
    getSocialLinks(lang),
  ])

  return (
    <>
      <PageHero
        lang={lang}
        label={t.certifications.label}
        title={t.certifications.title}
        description={t.certifications.description}
      />
      <section aria-label={t.certifications.catalog} className="pb-24 lg:pb-32">
        <div className="container-page">
          <CertificationsCatalog certifications={toCertificationViews(certifications, lang)} />
        </div>
      </section>
      <ContactSection settings={settings} socialLinks={socialLinks} lang={lang} />
    </>
  )
}
