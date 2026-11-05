import type { ProjectSummary } from '@/sanity/lib/data'

import { ProjectsGallery } from '../projects-gallery'
import { SectionHeading } from '../section-heading'

export function ProjectsSection({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section aria-labelledby="proyectos-title" id="proyectos" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          id="proyectos-title"
          eyebrow="Proyectos"
          title="Soluciones con datos reales"
          description="Machine Learning, Big Data, Power BI y aplicaciones web aplicadas a problemas concretos."
        />
        <ProjectsGallery projects={projects} />
      </div>
    </section>
  )
}
