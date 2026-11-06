'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { SegmentedControl } from '@/components/ui/segmented-control'
import { useI18n } from '@/i18n/client'
import { projectCategoryLabel } from '@/i18n/labels'
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/taxonomy'

import { FeaturedProject, ProjectCard, type ProjectCardData } from './project-card'

type Filter = 'all' | ProjectCategory

/**
 * Catálogo de proyectos (FR-05): en «Todos» el proyecto insignia ocupa el
 * ancho completo y el resto forma la grilla; los filtros reordenan con
 * transición de layout y sin recargar la página.
 */
export function ProjectsShowcase({
  projects,
  limit,
}: {
  projects: ProjectCardData[]
  limit?: number
}) {
  const { lang, t } = useI18n()
  const [filter, setFilter] = useState<Filter>('all')
  // Solo las categorías que tienen proyectos: ningún filtro lleva a una lista vacía.
  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: t.projects.all },
    ...PROJECT_CATEGORIES.filter(({ value }) =>
      projects.some((project) => project.category.includes(value)),
    ).map(({ value }) => ({ value, label: projectCategoryLabel(value, lang) })),
  ]
  const featured = filter === 'all' ? projects.find((project) => project.featured) : undefined
  const filtered = projects.filter(
    (project) => project !== featured && (filter === 'all' || project.category.includes(filter)),
  )
  const grid = limit ? filtered.slice(0, limit) : filtered

  return (
    <div>
      <div className="reveal">
        <SegmentedControl
          label={t.projects.filterLabel}
          options={filters}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {featured ? (
        <div className="reveal mt-8">
          <FeaturedProject project={featured} lang={lang} />
        </div>
      ) : null}

      {grid.length === 0 && !featured ? (
        <p className="mt-10 text-muted">{t.projects.empty}</p>
      ) : (
        <motion.ul layout className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {grid.map((project) => (
              <motion.li
                key={project._id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              >
                <ProjectCard project={project} lang={lang} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  )
}
