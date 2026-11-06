import 'server-only'

import { z } from 'zod'

/** Repositorio público tal como lo muestra el sitio. */
export type GithubRepo = {
  name: string
  description: string | null
  url: string
  homepage: string | null
  language: string | null
  stars: number
  pushedAt: string
}

const repoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.string().url(),
  homepage: z.string().nullable().optional(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  pushed_at: z.string(),
  fork: z.boolean(),
  archived: z.boolean().optional(),
  private: z.boolean().optional(),
})

export const GITHUB_USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/

/** Colores oficiales de lenguajes en GitHub (los más comunes en datos). */
export const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3572A5',
  'Jupyter Notebook': '#DA5B0B',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#663399',
  R: '#198CE7',
  SQL: '#e38c00',
  Java: '#b07219',
  Scala: '#c22d40',
  Shell: '#89e051',
}

/** Ordena por estrellas y luego por actividad reciente; sin forks, archivados ni el repo de perfil. */
export function selectRepos(raw: unknown, username: string, limit = 6): GithubRepo[] {
  const parsed = z.array(repoSchema).safeParse(raw)
  if (!parsed.success) return []
  return parsed.data
    .filter(
      (repo) =>
        !repo.fork &&
        !repo.archived &&
        !repo.private &&
        repo.name.toLowerCase() !== username.toLowerCase(),
    )
    .sort(
      (a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at),
    )
    .slice(0, limit)
    .map((repo) => ({
      name: repo.name,
      description: repo.description?.trim() || null,
      url: repo.html_url,
      homepage: repo.homepage && /^https:\/\//.test(repo.homepage) ? repo.homepage : null,
      language: repo.language,
      stars: repo.stargazers_count,
      pushedAt: repo.pushed_at,
    }))
}

/**
 * Repositorios públicos de un usuario (API REST de GitHub).
 *
 * - Caché de una hora (ISR): cada repo nuevo aparece solo, sin tocar el panel.
 * - `GITHUB_TOKEN` (opcional) sube el límite de la API; no necesita permisos.
 * - Si GitHub no responde, la sección simplemente no se muestra.
 */
export async function getGithubRepos(username: string | null | undefined): Promise<GithubRepo[]> {
  const user = username?.trim()
  if (!user || !GITHUB_USERNAME_PATTERN.test(user)) return []
  const base = process.env.GITHUB_API_BASE?.trim() || 'https://api.github.com'
  const token = process.env.GITHUB_TOKEN?.trim()
  try {
    const response = await fetch(
      `${base}/users/${encodeURIComponent(user)}/repos?type=owner&sort=pushed&per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'portafolio-di-yeferson',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        next: { revalidate: 3600, tags: ['github'] },
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!response.ok) return []
    return selectRepos(await response.json(), user)
  } catch {
    return []
  }
}

/** Usuario de GitHub: el del panel o, si falta, el del enlace de GitHub en redes. */
export function resolveGithubUsername(
  explicit: string | null | undefined,
  socialUrls: string[],
): string | null {
  if (explicit && GITHUB_USERNAME_PATTERN.test(explicit.trim())) return explicit.trim()
  for (const url of socialUrls) {
    const match = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/?$/.exec(url)
    if (match?.[1] && GITHUB_USERNAME_PATTERN.test(match[1])) return match[1]
  }
  return null
}
