import { ArrowUpRight, Star } from 'lucide-react'

import { BrandGlyph } from '@/components/icons/brand-icons'
import { Accent } from '@/i18n/accent'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { formatRelative } from '@/lib/format'
import { type GithubRepo, LANGUAGE_COLORS } from '@/lib/github'
import { EXTERNAL_LINK_PROPS } from '@/lib/url'

/** Repositorios públicos que llegan solos desde GitHub (se actualizan cada hora). */
export function GithubRepos({
  repos,
  username,
  lang,
}: {
  repos: GithubRepo[]
  username: string
  lang: Locale
}) {
  if (repos.length === 0) return null
  const t = getDictionary(lang).github
  const profileUrl = `https://github.com/${username}`

  return (
    <div id="github" className="mt-20 border-t border-line pt-14">
      <div className="reveal flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="label">{t.label}</p>
          <h3 className="mt-3 text-[clamp(1.8rem,3.2vw,2.5rem)] leading-[1.05] font-black tracking-[-0.04em]">
            <Accent text={t.title} className="accent-serif text-aurora pr-1" />
          </h3>
          <p className="mt-3 text-muted">{t.description}</p>
        </div>
        <a
          href={profileUrl}
          {...EXTERNAL_LINK_PROPS}
          className="btn btn-glass h-11 shrink-0 self-start px-5 text-[0.9rem] md:self-auto"
        >
          <BrandGlyph platform="github" className="size-4" />@{username}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo) => (
          <li key={repo.name} className="reveal">
            <a
              href={repo.url}
              {...EXTERNAL_LINK_PROPS}
              className="surface-card card-hover spotlight group flex h-full flex-col rounded-[1.25rem] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-[0.95rem] font-medium break-all">
                  <span className="text-subtle">{username}/</span>
                  {repo.name}
                </p>
                <ArrowUpRight
                  className="size-4 shrink-0 text-subtle transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 line-clamp-2 text-[0.92rem] leading-relaxed text-muted">
                {repo.description ?? t.noDescription}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 text-[0.8rem] font-bold text-subtle">
                {repo.language ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full"
                      style={{ background: LANGUAGE_COLORS[repo.language] ?? 'var(--color-aqua)' }}
                    />
                    {repo.language}
                  </span>
                ) : null}
                {repo.stars > 0 ? (
                  <span className="inline-flex items-center gap-1" aria-label={t.stars(repo.stars)}>
                    <Star className="size-3.5" aria-hidden="true" />
                    {repo.stars}
                  </span>
                ) : null}
                <span>{t.updated(formatRelative(repo.pushedAt, lang))}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
