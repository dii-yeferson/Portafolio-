'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { SegmentedControl } from '@/components/ui/segmented-control'
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/taxonomy'

import { FeaturedProject, ProjectCard, type ProjectCardData } from './project-card'

type Filter = 'all' | ProjectCategory

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  ...PROJECT_CATEGORIES.map(({ value, title }) => ({ value, label: title })),
]

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
  const [filter, setFilter] = useState<Filter>('all')
  const featured = filter === 'all' ? projects.find((project) => project.featured) : undefined
  const filtered = projects.filter(
    (project) => project !== featured && (filter === 'all' || project.category.includes(filter)),
  )
  const grid = limit ? filtered.slice(0, limit) : filtered

  return (
    <div>
      <div className="reveal">
        <SegmentedControl
          label="Filtrar proyectos por categoría"
          options={FILTERS}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {featured ? (
        <div className="reveal mt-8">
          <FeaturedProject project={featured} />
        </div>
      ) : null}

      {grid.length === 0 && !featured ? (
        <p className="mt-10 text-muted">Aún no hay proyectos publicados en esta categoría.</p>
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
                <ProjectCard project={project} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  )
}
