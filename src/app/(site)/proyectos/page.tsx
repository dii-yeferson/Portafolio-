import type { Metadata } from 'next'

import { ProjectsShowcase } from '@/components/projects/projects-showcase'
import { ContactSection } from '@/components/sections/contact-section'
import { PageHero } from '@/components/ui/page-hero'
import { getProjects, getSiteSettings, getSocialLinks } from '@/sanity/lib/data'

export const metadata: Metadata = {
  title: 'Proyectos',
  description:
    'Proyectos de Machine Learning, Big Data, Power BI, aplicaciones web y tesis aplicados a problemas reales.',
  alternates: { canonical: '/proyectos' },
}

export default async function ProjectsPage() {
  const [projects, settings, socialLinks] = await Promise.all([
    getProjects(),
    getSiteSettings(),
    getSocialLinks(),
  ])

  return (
    <>
      <PageHero
        label="Portafolio"
        title="Proyectos"
        description="Cada proyecto es un caso real: el problema, la metodología, la solución implementada y sus resultados."
      />
      <section aria-label="Catálogo de proyectos" className="pb-24 lg:pb-32">
        <div className="container-page">
          <ProjectsShowcase projects={projects} />
        </div>
      </section>
      <ContactSection settings={settings} socialLinks={socialLinks} />
    </>
  )
}
