import { ProjectsShowcase } from '@/components/projects/projects-showcase'
import { SectionHeading } from '@/components/ui/section-heading'
import type { ProjectSummary } from '@/sanity/lib/data'

export function ProjectsSection({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section
      id="proyectos"
      aria-labelledby="proyectos-title"
      className="border-t border-line py-20 lg:py-28"
    >
      <div className="container-page">
        <SectionHeading
          id="proyectos-title"
          label="Trabajo seleccionado"
          title="Proyectos"
          description="Casos reales contados de principio a fin: el problema, la metodología, la solución y sus resultados."
          action={{ href: '/proyectos', label: 'Ver todos' }}
        />
        <ProjectsShowcase projects={projects} limit={3} />
      </div>
    </section>
  )
}
