import {
  ArrowUpRight,
  ChartNoAxesCombined,
  CircleAlert,
  Code,
  Lightbulb,
  Workflow,
} from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PortableTextContent } from '@/components/portable-text'
import { ProjectCover } from '@/components/project-cover'
import { ProjectCard } from '@/components/projects/project-card'
import { SanityImage } from '@/components/sanity-image'
import { ContactSection } from '@/components/sections/contact-section'
import { TechTags } from '@/components/tech-tags'
import { PageHero } from '@/components/ui/page-hero'
import { buildProjectMetadata } from '@/lib/seo'
import { getProjectCategoryLabel } from '@/lib/taxonomy'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import { hasImageAsset } from '@/sanity/lib/image'
import {
  getProjectBySlug,
  getProjects,
  getProjectSlugs,
  getSiteSettings,
  getSocialLinks,
} from '@/sanity/lib/data'

type ProjectPageProps = { params: Promise<{ slug: string }> }

/** Pre-renderiza los proyectos publicados; los nuevos se generan bajo demanda (ISR). */
export async function generateStaticParams() {
  const projects = await getProjectSlugs()
  return projects.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()])
  if (!project) return { title: 'Proyecto no encontrado', robots: { index: false, follow: false } }
  return buildProjectMetadata(project, settings)
}

const SECTION_ICONS = {
  problema: CircleAlert,
  metodologia: Workflow,
  solucion: Lightbulb,
  resultados: ChartNoAxesCombined,
} as const

/** Ficha de estudio de caso (FR-06). */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const [project, allProjects, settings, socialLinks] = await Promise.all([
    getProjectBySlug(slug),
    getProjects(),
    getSiteSettings(),
    getSocialLinks(),
  ])
  if (!project) notFound()

  const sections = (
    [
      { id: 'problema', title: 'El problema', value: project.problem },
      { id: 'metodologia', title: 'Metodología y arquitectura', value: project.approach },
      { id: 'solucion', title: 'Solución implementada', value: project.solution },
      { id: 'resultados', title: 'Resultados', value: project.results },
    ] as const
  ).filter((section) => section.value && section.value.length > 0)
  const metrics = project.metrics ?? []
  const gallery = project.gallery ?? []
  const related = allProjects
    .filter(
      (item) => item._id !== project._id && item.category.some((c) => project.category.includes(c)),
    )
    .slice(0, 3)

  return (
    <>
      <PageHero
        label={project.category.map((value) => getProjectCategoryLabel(value)).join(' · ')}
        title={project.title}
        description={project.shortDescription}
        crumbs={[{ href: '/proyectos', label: 'Proyectos' }]}
      >
        <div className="flex flex-col gap-6">
          <TechTags items={project.technologies} />
          <div className="flex flex-wrap gap-3">
            {isSafeExternalUrl(project.demoUrl) ? (
              <a
                href={project.demoUrl}
                {...EXTERNAL_LINK_PROPS}
                className="btn btn-primary h-12 px-6"
              >
                Ver demo
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            ) : null}
            {isSafeExternalUrl(project.codeUrl) ? (
              <a
                href={project.codeUrl}
                {...EXTERNAL_LINK_PROPS}
                className="btn btn-glass h-12 px-6"
              >
                <Code className="size-4" aria-hidden="true" />
                Ver código
              </a>
            ) : null}
          </div>
        </div>
      </PageHero>

      <article className="pb-24 lg:pb-28">
        <div className="container-page">
          <div className="surface-card overflow-hidden rounded-[1.75rem] p-2">
            {hasImageAsset(project.coverImage) ? (
              <SanityImage
                image={project.coverImage}
                width={1600}
                height={900}
                preload
                sizes="(min-width: 1240px) 1160px, 100vw"
                className="h-auto w-full rounded-[1.4rem]"
              />
            ) : (
              <ProjectCover
                seed={project.slug}
                categories={project.category}
                title={project.title}
                className="aspect-[16/8] w-full rounded-[1.4rem]"
              />
            )}
          </div>

          {metrics.length > 0 ? (
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric._key} className="surface-card spotlight reveal p-6">
                  <dt className="label">{metric.label}</dt>
                  <dd className="text-aurora mt-3 text-[2.6rem] leading-none font-black tracking-[-0.045em]">
                    {metric.value}
                  </dd>
                  {metric.context ? (
                    <dd className="mt-3 text-sm text-muted">{metric.context}</dd>
                  ) : null}
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sections.map((section) => {
              const Icon = SECTION_ICONS[section.id]
              return (
                <section
                  key={section.id}
                  aria-labelledby={section.id}
                  className="surface-card spotlight reveal p-8"
                >
                  <h2
                    id={section.id}
                    className="mb-5 flex items-center gap-3 text-[1.3rem] font-black tracking-[-0.025em]"
                  >
                    <span className="grid size-10 place-items-center rounded-2xl border border-line bg-surface-2 text-aqua">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    {section.title}
                  </h2>
                  <PortableTextContent value={section.value} />
                </section>
              )
            })}
          </div>

          {gallery.length > 0 ? (
            <section aria-labelledby="galeria" className="mt-16">
              <h2 id="galeria" className="text-[1.6rem] font-black tracking-[-0.03em]">
                Galería
              </h2>
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {gallery.map((image) => (
                  <li key={image._key} className="surface-card reveal overflow-hidden p-2">
                    <figure>
                      <SanityImage
                        image={image}
                        width={1200}
                        height={750}
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="h-auto w-full rounded-[1.1rem]"
                      />
                      {image.caption ? (
                        <figcaption className="px-3 pt-3 pb-2 text-sm text-muted">
                          {image.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>

      {related.length > 0 ? (
        <section aria-labelledby="relacionados" className="border-t border-line py-24">
          <div className="container-page">
            <p className="label">Sigue explorando</p>
            <h2
              id="relacionados"
              className="mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)] font-black tracking-[-0.04em]"
            >
              Proyectos relacionados
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item._id}>
                  <ProjectCard project={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ContactSection settings={settings} socialLinks={socialLinks} />
    </>
  )
}
