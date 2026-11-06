import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LiveCaption } from '@/components/about/live-caption'
import { Timeline } from '@/components/about/timeline'
import { ContactSection } from '@/components/sections/contact-section'
import { PageHero } from '@/components/ui/page-hero'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { buildPageMetadata } from '@/lib/seo'
import { SITE_DEFAULTS } from '@/lib/site'
import { getSiteSettings, getSocialLinks } from '@/sanity/lib/data'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/sobre-mi'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const t = getDictionary(lang).meta
  return buildPageMetadata('/sobre-mi', lang, t.aboutTitle, t.aboutDescription)
}

/** Perfil extendido (FR-03): destino de «Ver perfil completo». */
export default async function AboutPage({ params }: PageProps<'/[lang]/sobre-mi'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDictionary(lang)
  const [settings, socialLinks] = await Promise.all([getSiteSettings(lang), getSocialLinks(lang)])
  const skillGroups = settings?.skillGroups ?? []
  const principles = settings?.principles ?? []
  const hasExperience = (settings?.experience?.length ?? 0) > 0

  return (
    <>
      <PageHero
        lang={lang}
        label={settings?.tagline || SITE_DEFAULTS.tagline}
        title={t.meta.aboutTitle}
        description={settings?.summary || t.meta.description}
      />

      {principles.length > 0 ? (
        <section aria-label={t.about.howIWork} className="pb-16">
          <div className="container-page">
            <div className="border-y border-line py-8">
              <LiveCaption
                phrases={principles.map((item) => item.title)}
                label={t.about.howIWork}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section aria-label={t.about.journey} className="pb-24 lg:pb-28">
        <div className="container-page grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="surface-card spotlight reveal p-8">
            <h2 className="label mb-7">{hasExperience ? t.about.journey : t.about.education}</h2>
            <Timeline settings={settings} lang={lang} />
          </div>
          <div className="surface-card spotlight reveal p-8">
            <h2 className="label mb-7">{t.about.stack}</h2>
            <div className="space-y-6">
              {skillGroups.map((group) => (
                <div key={group._key}>
                  <p className="text-[0.95rem] font-extrabold">{group.title}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <li key={skill} className="chip">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          {principles.some((item) => item.description) ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
              {principles.map((principle) => (
                <li key={principle._key} className="surface-card spotlight reveal p-6">
                  <h3 className="accent-serif text-[1.45rem] leading-snug">{principle.title}</h3>
                  {principle.description ? (
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                      {principle.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <ContactSection settings={settings} socialLinks={socialLinks} lang={lang} />
    </>
  )
}
