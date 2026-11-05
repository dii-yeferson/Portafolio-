'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { projectPath } from '@/lib/site'
import { getProjectCategoryLabel, PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/taxonomy'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import type { PROJECTS_QUERY_RESULT } from '@/sanity/types'

import { SanityImage } from './sanity-image'
import { TechTags } from './tech-tags'

type Project = PROJECTS_QUERY_RESULT[number]
type Filter = 'all' | ProjectCategory

/** Catálogo con filtrado instantáneo por categoría, sin recargar la página (FR-05). */
export function ProjectsGallery({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(() => {
    const result = new Map<string, number>()
    for (const project of projects) {
      for (const category of project.category) {
        result.set(category, (result.get(category) ?? 0) + 1)
      }
    }
    return result
  }, [projects])

  const visible =
    filter === 'all' ? projects : projects.filter((project) => project.category.includes(filter))
  const featured = visible.find((project) => project.featured)
  const others = visible.filter((project) => project !== featured)

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'Todos', count: projects.length },
    ...PROJECT_CATEGORIES.map(({ value, title }) => ({
      value,
      label: title,
      count: counts.get(value) ?? 0,
    })),
  ]

  return (
    <div>
      <div
        role="group"
        aria-label="Filtrar proyectos por categoría"
        className="flex flex-wrap gap-2"
      >
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => setFilter(item.value)}
            className="rounded-full border border-border/70 px-4 py-1.5 text-sm text-muted transition-colors hover:text-foreground aria-pressed:border-accent aria-pressed:bg-accent/15 aria-pressed:text-foreground"
          >
            {item.label} <span className="font-mono text-xs">({item.count})</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-muted">Aún no hay proyectos publicados en esta categoría.</p>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured ? (
            <li className="md:col-span-2 lg:col-span-3">
              <ProjectCard project={featured} featured />
            </li>
          ) : null}
          {others.map((project) => (
            <li key={project._id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <article
      className={`card group flex h-full flex-col overflow-hidden transition-colors hover:border-accent/70 ${featured ? 'md:flex-row' : ''}`}
    >
      <div className={featured ? 'md:w-1/2' : ''}>
        <SanityImage
          image={project.coverImage}
          width={featured ? 960 : 640}
          height={featured ? 600 : 400}
          sizes={
            featured
              ? '(min-width: 768px) 50vw, 100vw'
              : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
          }
          className="h-auto w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
        />
      </div>
      <div
        className={`flex flex-1 flex-col gap-4 p-6 ${featured ? 'md:justify-center md:p-10' : ''}`}
      >
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-champagne">
          {featured ? (
            <span className="rounded-full border border-champagne/60 px-2 py-0.5">
              Proyecto insignia
            </span>
          ) : null}
          <span>{project.category.map((value) => getProjectCategoryLabel(value)).join(' · ')}</span>
        </div>
        <h3 className={`font-display font-bold ${featured ? 'text-3xl' : 'text-xl'}`}>
          <Link href={projectPath(project.slug)} className="hover:text-accent-strong">
            {project.title}
          </Link>
        </h3>
        <p className="text-muted">{project.shortDescription}</p>
        <TechTags items={project.technologies} />
        <div className="mt-auto flex flex-wrap gap-4 pt-2 text-sm font-semibold">
          <Link href={projectPath(project.slug)} className="text-accent-strong hover:underline">
            Ver estudio de caso
          </Link>
          {isSafeExternalUrl(project.demoUrl) ? (
            <a href={project.demoUrl} {...EXTERNAL_LINK_PROPS} className="hover:underline">
              Demo
            </a>
          ) : null}
          {isSafeExternalUrl(project.codeUrl) ? (
            <a href={project.codeUrl} {...EXTERNAL_LINK_PROPS} className="hover:underline">
              Código
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
