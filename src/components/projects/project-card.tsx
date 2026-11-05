import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { ProjectCover } from '@/components/project-cover'
import { SanityImage } from '@/components/sanity-image'
import { projectPath } from '@/lib/site'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import { hasImageAsset } from '@/sanity/lib/image'
import type { PROJECTS_QUERY_RESULT } from '@/sanity/types'

export type ProjectCardData = PROJECTS_QUERY_RESULT[number]

/** Tarjeta de proyecto (FR-05): portada, resumen, tecnologías, demo y código. */
export function ProjectCard({ project }: { project: ProjectCardData }) {
  const href = projectPath(project.slug)
  const external = isSafeExternalUrl(project.demoUrl)
    ? project.demoUrl
    : isSafeExternalUrl(project.codeUrl)
      ? project.codeUrl
      : null

  return (
    <article
      className={`panel panel-interactive group flex h-full flex-col overflow-hidden ${
        project.featured
          ? 'border-accent-bright/55 shadow-[0_0_0_1px_rgba(111,224,170,0.12),0_34px_70px_-34px_rgba(59,148,112,0.75)]'
          : ''
      }`}
    >
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[16/10] overflow-hidden border-b border-white/[0.06]"
      >
        {hasImageAsset(project.coverImage) ? (
          <SanityImage
            image={project.coverImage}
            width={720}
            height={450}
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <ProjectCover
            seed={project.slug}
            categories={project.category}
            title={project.title}
            className="size-full transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
        <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#07110d]/70 via-transparent to-transparent" />
        {project.featured ? (
          <span className="absolute top-3 left-3 rounded-md border border-accent-bright/40 bg-[#0a2a1e]/85 px-2.5 py-1 text-[0.6rem] font-extrabold tracking-[0.22em] text-mint uppercase backdrop-blur-md">
            Proyecto destacado
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.08rem] leading-snug font-extrabold tracking-[-0.01em]">
          <Link href={href} className="transition-colors hover:text-accent-bright">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {project.shortDescription}
        </p>
        {project.technologies.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tecnologías">
            {project.technologies.slice(0, 4).map((technology) => (
              <li key={technology} className="chip px-3 py-1 text-[0.72rem]">
                {technology}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto flex items-center gap-2.5 pt-5">
          <Link href={href} className="btn btn-primary h-10 flex-1 rounded-lg text-sm">
            Ver proyecto
          </Link>
          {external ? (
            <a
              href={external}
              {...EXTERNAL_LINK_PROPS}
              aria-label={`Abrir ${project.title} en una pestaña nueva`}
              className="btn btn-outline size-10 shrink-0 rounded-lg p-0"
            >
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
