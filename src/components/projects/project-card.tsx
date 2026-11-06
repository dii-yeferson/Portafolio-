import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import Link from 'next/link'

import { LikeButton } from '@/components/likes/like-button'
import { ProjectCover } from '@/components/project-cover'
import { SanityImage } from '@/components/sanity-image'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { projectCategoryLabel } from '@/i18n/labels'
import { projectPath } from '@/lib/site'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import { hasImageAsset } from '@/sanity/lib/image'
import type { PROJECTS_QUERY_RESULT } from '@/sanity/types'

export type ProjectCardData = PROJECTS_QUERY_RESULT[number]

function externalUrl(project: ProjectCardData) {
  if (isSafeExternalUrl(project.demoUrl)) return project.demoUrl
  if (isSafeExternalUrl(project.codeUrl)) return project.codeUrl
  return null
}

function Cover({
  project,
  sizes,
  large = false,
}: {
  project: ProjectCardData
  sizes: string
  large?: boolean
}) {
  return hasImageAsset(project.coverImage) ? (
    <SanityImage
      image={project.coverImage}
      width={large ? 1200 : 720}
      height={large ? 800 : 450}
      sizes={sizes}
      className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.035]"
    />
  ) : (
    <ProjectCover
      seed={project.slug}
      categories={project.category}
      title={project.title}
      className="size-full transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.035]"
    />
  )
}

/** Tarjeta de proyecto (FR-05): toda la tarjeta enlaza al estudio de caso. */
export function ProjectCard({ project, lang }: { project: ProjectCardData; lang: Locale }) {
  const t = getDictionary(lang)
  const href = projectPath(project.slug, lang)
  const external = externalUrl(project)

  return (
    <article className="surface-card card-hover spotlight group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
        <Cover project={project} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        {project.featured ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-champagne/40 bg-black/55 px-2.5 py-1 text-[0.68rem] font-extrabold text-[#ead3a2] backdrop-blur-md">
            <Star className="size-3 fill-current" aria-hidden="true" />
            {t.projects.featured}
          </span>
        ) : null}
        <LikeButton slug={project.slug} title={project.title} className="absolute top-3 right-3" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="label text-[0.66rem]!">
          {project.category.map((value) => projectCategoryLabel(value, lang)).join(' · ')}
        </p>
        <h3 className="mt-2.5 text-[1.2rem] leading-snug font-extrabold tracking-[-0.02em]">
          <Link href={href} className="after:absolute after:inset-0 after:z-0 after:content-['']">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-muted">
          {project.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="inline-flex items-center gap-1.5 text-[0.9rem] font-extrabold text-foreground">
            {t.projects.viewCase}
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
          {external ? (
            <a
              href={external}
              {...EXTERNAL_LINK_PROPS}
              aria-label={t.common.openInNewTab(project.title)}
              className="relative z-10 grid size-9 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:bg-ink/[0.08] hover:text-foreground"
            >
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}

/** Proyecto insignia a todo lo ancho (FR-05: Centinela Minero). */
export function FeaturedProject({ project, lang }: { project: ProjectCardData; lang: Locale }) {
  const t = getDictionary(lang)
  const href = projectPath(project.slug, lang)
  const external = externalUrl(project)

  return (
    <article className="border-aurora spotlight group relative isolate grid overflow-hidden rounded-[1.75rem] shadow-[0_40px_80px_-50px_rgba(98,210,248,0.45)] lg:grid-cols-[1.2fr_1fr]">
      <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[26rem]">
        <Cover project={project} sizes="(min-width: 1024px) 55vw, 100vw" large />
        <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-transparent to-surface/90 max-lg:hidden" />
        <LikeButton slug={project.slug} title={project.title} className="absolute top-4 left-4" />
      </div>
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-champagne/35 bg-champagne/10 px-3 py-1 text-[0.72rem] font-extrabold text-champagne">
          <Star className="size-3.5 fill-current" aria-hidden="true" />
          {t.projects.flagship}
        </span>
        <h3 className="mt-5 text-[clamp(1.9rem,3.2vw,2.6rem)] leading-[1.05] font-black tracking-[-0.04em]">
          <Link href={href} className="after:absolute after:inset-0 after:z-0 after:content-['']">
            {project.title}
          </Link>
        </h3>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">{project.shortDescription}</p>
        {project.technologies.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label={t.projects.technologies}>
            {project.technologies.map((technology) => (
              <li key={technology} className="chip">
                {technology}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-8 flex items-center gap-3">
          <span className="btn btn-primary h-12 px-6 text-[0.95rem]">
            {t.projects.viewCaseStudy}
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
          {external ? (
            <a
              href={external}
              {...EXTERNAL_LINK_PROPS}
              aria-label={t.common.openInNewTab(project.title)}
              className="btn btn-glass relative z-10 size-12 p-0"
            >
              <ArrowUpRight className="size-[1.1rem]" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
