'use client'

import { Award, FolderOpen, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

type SearchResult = {
  type: 'project' | 'certification'
  id: string
  title: string
  description: string
  href: string
}

type SearchState = {
  term: string
  status: 'loading' | 'done' | 'error'
  results: SearchResult[]
}

const TYPE_LABEL: Record<SearchResult['type'], string> = {
  project: 'Proyecto',
  certification: 'Certificación',
}

/** Buscador de proyectos y certificaciones sobre `/api/search` (FR-01). Atajo: Ctrl/⌘ + K. */
export function SearchDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputId = useId()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState<SearchState | null>(null)
  const term = query.trim()

  useEffect(() => {
    if (term.length < 2) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearch({ term, status: 'loading', results: [] })
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = (await response.json()) as { results: SearchResult[] }
        setSearch({ term, status: 'done', results: data.results })
      } catch {
        if (!controller.signal.aborted) setSearch({ term, status: 'error', results: [] })
      }
    }, 250)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [term])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        dialogRef.current?.showModal()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const current = term.length >= 2 && search?.term === term ? search : null
  const close = () => dialogRef.current?.close()

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Buscar proyectos y certificaciones"
        aria-haspopup="dialog"
        className="glass grid size-10 place-items-center rounded-full text-muted transition-[color,transform] hover:text-foreground active:scale-95"
      >
        <Search className="size-[1.05rem]" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${inputId}-title`}
        className="glass mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] rounded-2xl p-0 text-foreground backdrop:bg-background/75 backdrop:backdrop-blur-sm"
      >
        <h2 id={`${inputId}-title`} className="sr-only">
          Buscar proyectos y certificaciones
        </h2>
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-5">
          <Search className="size-5 shrink-0 text-accent-bright" aria-hidden="true" />
          <label htmlFor={inputId} className="sr-only">
            Término de búsqueda
          </label>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar: Power BI, minería, Python…"
            maxLength={64}
            autoComplete="off"
            className="h-16 w-full bg-transparent text-lg font-semibold outline-none placeholder:text-subtle"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar búsqueda"
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-3">
          <div aria-live="polite" className="px-2 py-1 text-sm">
            {!current ? (
              <p className="text-subtle">Escribe al menos 2 caracteres. Atajo: Ctrl / ⌘ + K.</p>
            ) : null}
            {current?.status === 'loading' ? <p className="text-muted">Buscando…</p> : null}
            {current?.status === 'error' ? (
              <p className="text-red-300">No se pudo completar la búsqueda.</p>
            ) : null}
            {current?.status === 'done' && current.results.length === 0 ? (
              <p className="text-muted">Sin resultados para «{current.term}».</p>
            ) : null}
          </div>
          {current?.status === 'done' && current.results.length > 0 ? (
            <ul className="mt-1 space-y-1.5">
              {current.results.map((result) => {
                const Icon = result.type === 'project' ? FolderOpen : Award
                return (
                  <li key={result.id}>
                    <Link
                      href={result.href}
                      onClick={close}
                      className="flex items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-accent/40 hover:bg-white/[0.04]"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-accent-bright">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.7rem] font-extrabold tracking-[0.2em] text-champagne-light uppercase">
                          {TYPE_LABEL[result.type]}
                        </span>
                        <span className="block truncate font-bold">{result.title}</span>
                        <span className="block truncate text-sm text-muted">
                          {result.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      </dialog>
    </>
  )
}
