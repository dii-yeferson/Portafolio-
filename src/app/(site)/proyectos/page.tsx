import type { Metadata } from 'next'

import { ProjectsShowcase } from '@/components/projects/projects-showcase'
import { ContactSection } from '@/components/sections/contact-section'
import { PageHero } from '@/components/ui/page-hero'
import { getProjects, getSiteSettings } from '@/sanity/lib/data'

export const metadata: Metadata = {
  title: 'Proyectos',
  description:
    'Proyectos de Machine Learning, Big Data, Power BI, aplicaciones web y tesis aplicados a problemas reales.',
  alternates: { canonical: '/proyectos' },
}

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()])

  return (
    <>
      <PageHero
        eyebrow="Portafolio"
        title="Proyectos"
        description="Cada proyecto es un caso real: el problema, la metodología, la solución implementada y sus resultados."
      />
      <section aria-label="Catálogo de proyectos" className="border-b border-white/[0.06]">
        <div className="container-page py-14 lg:py-16">
          <ProjectsShowcase projects={projects} />
        </div>
      </section>
      <ContactSection settings={settings} />
    </>
  )
}
