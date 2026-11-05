import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PortableTextContent } from '@/components/portable-text'
import { SanityImage } from '@/components/sanity-image'
import { TechTags } from '@/components/tech-tags'
import { buildProjectMetadata } from '@/lib/seo'
import { getProjectCategoryLabel } from '@/lib/taxonomy'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import { getProjectBySlug, getProjectSlugs, getSiteSettings } from '@/sanity/lib/data'

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

/** Ficha de estudio de caso (FR-06). */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const sections = [
    { id: 'problema', title: 'El problema', value: project.problem },
    { id: 'metodologia', title: 'Metodología y arquitectura', value: project.approach },
    { id: 'solucion', title: 'Solución implementada', value: project.solution },
    { id: 'resultados', title: 'Resultados', value: project.results },
  ].filter((section) => section.value && section.value.length > 0)

  const metrics = project.metrics ?? []
  const gallery = project.gallery ?? []

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link href="/#proyectos" className="text-sm text-muted hover:text-foreground">
        ← Volver a proyectos
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs text-champagne">
          {project.category.map((value) => getProjectCategoryLabel(value)).join(' · ')}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{project.shortDescription}</p>
        <div className="mt-6">
          <TechTags items={project.technologies} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          {isSafeExternalUrl(project.demoUrl) ? (
            <a
              href={project.demoUrl}
              {...EXTERNAL_LINK_PROPS}
              className="rounded-full bg-accent px-5 py-2.5 text-background transition-colors hover:bg-accent-strong"
            >
              Ver demo
            </a>
          ) : null}
          {isSafeExternalUrl(project.codeUrl) ? (
            <a
              href={project.codeUrl}
              {...EXTERNAL_LINK_PROPS}
              className="rounded-full border border-border px-5 py-2.5 transition-colors hover:border-accent"
            >
              Ver código
            </a>
          ) : null}
        </div>
      </header>

      <SanityImage
        image={project.coverImage}
        width={1600}
        height={900}
        preload
        sizes="(min-width: 896px) 896px, 100vw"
        className="mt-10 h-auto w-full rounded-2xl border border-border/60"
      />

      {sections.map((section) => (
        <section key={section.id} aria-labelledby={section.id} className="mt-14">
          <h2 id={section.id} className="mb-5 font-display text-2xl font-bold">
            {section.title}
          </h2>
          <PortableTextContent value={section.value} />
        </section>
      ))}

      {metrics.length > 0 ? (
        <section aria-labelledby="metricas" className="mt-14">
          <h2 id="metricas" className="mb-5 font-display text-2xl font-bold">
            Resultados cuantitativos
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric._key} className="card p-5">
                <dt className="text-sm text-muted">{metric.label}</dt>
                <dd className="mt-1 font-display text-3xl font-extrabold text-accent-strong">
                  {metric.value}
                </dd>
                {metric.context ? (
                  <dd className="mt-1 text-xs text-muted">{metric.context}</dd>
                ) : null}
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {gallery.length > 0 ? (
        <section aria-labelledby="galeria" className="mt-14">
          <h2 id="galeria" className="mb-5 font-display text-2xl font-bold">
            Galería
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {gallery.map((image) => (
              <li key={image._key}>
                <figure>
                  <SanityImage
                    image={image}
                    width={960}
                    height={600}
                    sizes="(min-width: 640px) 448px, 100vw"
                    className="h-auto w-full rounded-xl border border-border/60"
                  />
                  {image.caption ? (
                    <figcaption className="mt-2 text-sm text-muted">{image.caption}</figcaption>
                  ) : null}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
