'use client'

import { Award, FolderOpen, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

import { useI18n } from '@/i18n/client'

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

/** Buscador de proyectos y certificaciones sobre `/api/search` (FR-01). Atajo: Ctrl/⌘ + K. */
export function SearchDialog() {
  const { lang, t } = useI18n()
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
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}&lang=${lang}`, {
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
  }, [term, lang])

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
        aria-label={t.search.open}
        aria-haspopup="dialog"
        className="glass liquid relative grid size-10 place-items-center rounded-full text-muted transition-[color,background-color,transform] duration-150 hover:text-foreground active:scale-[0.96]"
      >
        <Search className="size-[1.05rem]" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${inputId}-title`}
        data-lenis-prevent
        className="search-glass liquid relative mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] rounded-[1.5rem] p-0 text-foreground backdrop:bg-[rgb(0_6_10/0.35)] backdrop:backdrop-blur-[3px]"
      >
        <h2 id={`${inputId}-title`} className="sr-only">
          {t.search.open}
        </h2>
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search className="size-5 shrink-0 text-aqua" aria-hidden="true" />
          <label htmlFor={inputId} className="sr-only">
            {t.search.inputLabel}
          </label>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search.placeholder}
            maxLength={64}
            autoComplete="off"
            className="h-16 w-full bg-transparent text-lg font-bold outline-none placeholder:text-subtle"
          />
          <button
            type="button"
            onClick={close}
            aria-label={t.search.close}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/10 hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-3">
          <div aria-live="polite" className="px-2 py-1 text-sm font-semibold">
            {!current ? <p className="text-subtle">{t.search.hint}</p> : null}
            {current?.status === 'loading' ? (
              <p className="animate-pulse text-muted">{t.search.loading}</p>
            ) : null}
            {current?.status === 'error' ? <p className="text-danger">{t.search.error}</p> : null}
            {current?.status === 'done' && current.results.length === 0 ? (
              <p className="text-muted">{t.search.empty(current.term)}</p>
            ) : null}
          </div>
          {current?.status === 'done' && current.results.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {current.results.map((result) => {
                const Icon = result.type === 'project' ? FolderOpen : Award
                return (
                  <li key={result.id}>
                    <Link
                      href={result.href}
                      onClick={close}
                      className="flex items-center gap-4 rounded-2xl border border-transparent px-3 py-3 transition-colors hover:border-line hover:bg-ink/[0.05]"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-aqua">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="label block text-[0.64rem]!">
                          {t.search.types[result.type]}
                        </span>
                        <span className="block truncate font-extrabold">{result.title}</span>
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
