import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProjectsShowcase } from '@/components/projects/projects-showcase'
import { ContactSection } from '@/components/sections/contact-section'
import { PageHero } from '@/components/ui/page-hero'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { buildPageMetadata } from '@/lib/seo'
import { getProjects, getSiteSettings, getSocialLinks } from '@/sanity/lib/data'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/proyectos'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const t = getDictionary(lang).meta
  return buildPageMetadata('/proyectos', lang, t.projectsTitle, t.projectsDescription)
}

export default async function ProjectsPage({ params }: PageProps<'/[lang]/proyectos'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDictionary(lang)
  const [projects, settings, socialLinks] = await Promise.all([
    getProjects(lang),
    getSiteSettings(lang),
    getSocialLinks(lang),
  ])

  return (
    <>
      <PageHero
        lang={lang}
        label={t.projects.pageLabel}
        title={t.meta.projectsTitle}
        description={t.projects.pageDescription}
      />
      <section aria-label={t.projects.catalog} className="pb-24 lg:pb-32">
        <div className="container-page">
          <ProjectsShowcase projects={projects} />
        </div>
      </section>
      <ContactSection settings={settings} socialLinks={socialLinks} lang={lang} />
    </>
  )
}
