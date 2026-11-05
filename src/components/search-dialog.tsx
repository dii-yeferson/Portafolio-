'use client'

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
        className="rounded-full border border-border/70 px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
        aria-haspopup="dialog"
      >
        Buscar
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${inputId}-title`}
        className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-0 text-foreground backdrop:bg-background/80 backdrop:backdrop-blur-sm"
      >
        <div className="p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 id={`${inputId}-title`} className="font-display text-lg font-bold">
              Buscar proyectos y certificaciones
            </h2>
            <button
              type="button"
              onClick={close}
              className="text-sm text-muted hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
          <label htmlFor={inputId} className="sr-only">
            Término de búsqueda
          </label>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej.: Power BI, minería, Python…"
            maxLength={64}
            autoComplete="off"
            className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
          />
          <div aria-live="polite" className="mt-4 min-h-6 text-sm">
            {current?.status === 'loading' ? <p className="text-muted">Buscando…</p> : null}
            {current?.status === 'error' ? (
              <p className="text-red-300">No se pudo completar la búsqueda.</p>
            ) : null}
            {current?.status === 'done' && current.results.length === 0 ? (
              <p className="text-muted">Sin resultados para «{current.term}».</p>
            ) : null}
          </div>
          {current?.status === 'done' && current.results.length > 0 ? (
            <ul className="mt-2 max-h-80 space-y-2 overflow-y-auto">
              {current.results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={result.href}
                    onClick={close}
                    className="block rounded-xl border border-border/50 p-3 transition-colors hover:border-accent"
                  >
                    <span className="font-mono text-xs text-champagne">
                      {TYPE_LABEL[result.type]}
                    </span>
                    <span className="mt-1 block font-semibold">{result.title}</span>
                    <span className="mt-1 block text-sm text-muted">{result.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </dialog>
    </>
  )
}
