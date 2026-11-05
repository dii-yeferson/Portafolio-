import { ProjectsShowcase } from '@/components/projects/projects-showcase'
import { SectionHeading } from '@/components/ui/section-heading'
import { resolveCopy } from '@/lib/copy'
import type { ProjectSummary, SiteSettings } from '@/sanity/lib/data'

export function ProjectsSection({
  projects,
  settings,
}: {
  projects: ProjectSummary[]
  settings: SiteSettings
}) {
  const copy = resolveCopy(settings?.projectsCopy, {
    label: 'Trabajo seleccionado',
    title: 'Proyectos',
    description:
      'Casos reales contados de principio a fin: el problema, la metodología, la solución y sus resultados.',
  })

  return (
    <section
      id="proyectos"
      aria-labelledby="proyectos-title"
      className="border-t border-line py-20 lg:py-28"
    >
      <div className="container-page">
        <SectionHeading
          id="proyectos-title"
          label={copy.label}
          title={copy.title}
          description={copy.description}
          action={{ href: '/proyectos', label: 'Ver todos' }}
        />
        <ProjectsShowcase projects={projects} limit={3} />
      </div>
    </section>
  )
}
