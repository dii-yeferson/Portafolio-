import type { MetadataRoute } from 'next'

import { DEFAULT_LOCALE, LOCALES, localePath } from '@/i18n/config'
import { absoluteUrl } from '@/lib/site'
import { getProjectSlugs } from '@/sanity/lib/data'

/** Sitemap bilingüe: cada URL declara su versión en el otro idioma (hreflang). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjectSlugs()
  const latestUpdate = projects
    .map((project) => project._updatedAt)
    .sort()
    .at(-1)

  const entry = (
    path: string,
    priority: number,
    changeFrequency: 'weekly' | 'monthly',
    lastModified?: string,
  ) =>
    LOCALES.map((lang) => ({
      url: absoluteUrl(localePath(lang, path)),
      lastModified,
      changeFrequency,
      priority: lang === DEFAULT_LOCALE ? priority : priority - 0.1,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((locale) => [locale, absoluteUrl(localePath(locale, path))]),
        ),
      },
    }))

  return [
    ...entry('/', 1, 'weekly', latestUpdate),
    ...['/proyectos', '/certificaciones', '/sobre-mi'].flatMap((path) =>
      entry(path, 0.7, 'monthly', latestUpdate),
    ),
    ...projects.flatMap((project) =>
      entry(`/proyectos/${encodeURIComponent(project.slug)}`, 0.8, 'monthly', project._updatedAt),
    ),
  ]
}
