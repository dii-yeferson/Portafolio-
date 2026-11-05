import type { MetadataRoute } from 'next'

import { absoluteUrl, projectPath } from '@/lib/site'
import { getProjectSlugs } from '@/sanity/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjectSlugs()
  const latestUpdate = projects
    .map((project) => project._updatedAt)
    .sort()
    .at(-1)

  return [
    {
      url: absoluteUrl('/'),
      lastModified: latestUpdate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...['/proyectos', '/certificaciones', '/sobre-mi'].map((path) => ({
      url: absoluteUrl(path),
      lastModified: latestUpdate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(projectPath(project.slug)),
      lastModified: project._updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
