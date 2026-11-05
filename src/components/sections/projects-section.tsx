import { ProjectsShowcase } from '@/components/projects/projects-showcase'
import { SectionHeading } from '@/components/ui/section-heading'
import type { ProjectSummary } from '@/sanity/lib/data'

export function ProjectsSection({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section
      id="proyectos"
      aria-labelledby="proyectos-title"
      className="border-b border-white/[0.06]"
    >
      <div className="container-page py-14 lg:py-16">
        <SectionHeading
          id="proyectos-title"
          eyebrow="Trabajos destacados"
          title="Proyectos"
          description="Explora algunos de mis proyectos. Cada uno representa un aprendizaje y una solución a un problema real."
          action={{ href: '/proyectos', label: 'Ver todos los proyectos' }}
        />
        <ProjectsShowcase projects={projects} limit={4} />
      </div>
    </section>
  )
}
