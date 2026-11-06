import { ProjectsShowcase } from '@/components/projects/projects-showcase'
import { SectionHeading } from '@/components/ui/section-heading'
import { type Locale, localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { resolveCopy } from '@/lib/copy'
import type { ProjectSummary, SiteSettings } from '@/sanity/lib/data'

export function ProjectsSection({
  projects,
  settings,
  lang,
  children,
}: {
  projects: ProjectSummary[]
  settings: SiteSettings
  lang: Locale
  /** Bloque opcional al final (repositorios de GitHub). */
  children?: React.ReactNode
}) {
  const t = getDictionary(lang).projects
  const copy = resolveCopy(settings?.projectsCopy, {
    label: t.label,
    title: t.title,
    description: t.description,
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
          action={{ href: localePath(lang, '/proyectos'), label: t.viewAll }}
        />
        <ProjectsShowcase projects={projects} limit={3} />
        {children}
      </div>
    </section>
  )
}
