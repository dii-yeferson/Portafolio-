'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/taxonomy'

import { ProjectCard, type ProjectCardData } from './project-card'

type Filter = 'all' | ProjectCategory

/** En la portada el proyecto insignia ocupa la última posición (como en el diseño). */
function arrange(projects: ProjectCardData[], limit?: number) {
  if (!limit) return projects
  const featured = projects.find((project) => project.featured)
  if (!featured) return projects.slice(0, limit)
  return [...projects.filter((project) => project !== featured).slice(0, limit - 1), featured]
}

/** Catálogo con filtrado instantáneo y transición de layout, sin recargar (FR-05). */
export function ProjectsShowcase({
  projects,
  limit,
}: {
  projects: ProjectCardData[]
  limit?: number
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const filtered =
    filter === 'all' ? projects : projects.filter((project) => project.category.includes(filter))
  const visible = arrange(filtered, limit)
  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    ...PROJECT_CATEGORIES.map(({ value, title }) => ({ value, label: title })),
  ]

  return (
    <div>
      <div
        role="group"
        aria-label="Filtrar proyectos por categoría"
        className="reveal flex flex-wrap gap-2.5"
      >
        {filters.map((item) => {
          const active = filter === item.value
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(item.value)}
              className={`btn h-9 rounded-full border px-4 text-[0.85rem] ${
                active
                  ? 'border-mint bg-mint font-extrabold text-[#062a1d] shadow-[0_8px_24px_-10px_rgba(169,236,203,0.7)]'
                  : 'border-white/12 bg-white/[0.025] text-muted hover:border-white/30 hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-muted">Aún no hay proyectos publicados en esta categoría.</p>
      ) : (
        <motion.ul layout className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project) => (
              <motion.li
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
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
