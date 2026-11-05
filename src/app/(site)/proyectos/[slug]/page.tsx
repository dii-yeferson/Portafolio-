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
import { getProjectBySlug, getProjects, getProjectSlugs, getSiteSettings } from '@/sanity/lib/data'

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
  const [project, allProjects, settings] = await Promise.all([
    getProjectBySlug(slug),
    getProjects(),
    getSiteSettings(),
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
        eyebrow={project.category.map((value) => getProjectCategoryLabel(value)).join(' · ')}
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
                className="btn btn-outline h-12 px-6"
              >
                <Code className="size-4" aria-hidden="true" />
                Ver código
              </a>
            ) : null}
          </div>
        </div>
      </PageHero>

      <article className="border-b border-white/[0.06]">
        <div className="container-page py-14 lg:py-16">
          <div className="panel overflow-hidden p-2">
            {hasImageAsset(project.coverImage) ? (
              <SanityImage
                image={project.coverImage}
                width={1600}
                height={900}
                preload
                sizes="(min-width: 1320px) 1240px, 100vw"
                className="h-auto w-full rounded-xl"
              />
            ) : (
              <ProjectCover
                seed={project.slug}
                categories={project.category}
                title={project.title}
                className="aspect-[16/8] w-full rounded-xl"
              />
            )}
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {sections.map((section) => {
              const Icon = SECTION_ICONS[section.id]
              return (
                <section key={section.id} aria-labelledby={section.id} className="panel reveal p-7">
                  <h2
                    id={section.id}
                    className="mb-5 flex items-center gap-3 text-xl font-extrabold"
                  >
                    <span className="grid size-10 place-items-center rounded-xl border border-accent/40 bg-accent/10 text-accent-bright">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    {section.title}
                  </h2>
                  <PortableTextContent value={section.value} />
                </section>
              )
            })}
          </div>

          {metrics.length > 0 ? (
            <section aria-labelledby="metricas" className="mt-12">
              <h2 id="metricas" className="text-2xl font-extrabold tracking-[-0.02em]">
                Resultados cuantitativos
              </h2>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric._key} className="panel reveal p-6">
                    <dt className="text-sm font-bold text-muted">{metric.label}</dt>
                    <dd className="mt-2 text-4xl font-black tracking-[-0.03em] text-gradient-accent">
                      {metric.value}
                    </dd>
                    {metric.context ? (
                      <dd className="mt-2 text-xs text-subtle">{metric.context}</dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {gallery.length > 0 ? (
            <section aria-labelledby="galeria" className="mt-12">
              <h2 id="galeria" className="text-2xl font-extrabold tracking-[-0.02em]">
                Galería
              </h2>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                {gallery.map((image) => (
                  <li key={image._key} className="panel reveal overflow-hidden p-2">
                    <figure>
                      <SanityImage
                        image={image}
                        width={1200}
                        height={750}
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="h-auto w-full rounded-xl"
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
        <section aria-labelledby="relacionados" className="border-b border-white/[0.06]">
          <div className="container-page py-14 lg:py-16">
            <h2 id="relacionados" className="text-2xl font-extrabold tracking-[-0.02em]">
              Proyectos relacionados
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <li key={item._id}>
                  <ProjectCard project={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ContactSection settings={settings} />
    </>
  )
}
