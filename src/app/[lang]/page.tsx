import { notFound } from 'next/navigation'

import { GithubRepos } from '@/components/github/github-repos'
import { JsonLd } from '@/components/json-ld'
import { RecommendationsSection } from '@/components/recommendations/recommendations-section'
import { AboutSection } from '@/components/sections/about-section'
import { CertificationsSection } from '@/components/sections/certifications-section'
import { ClosingMotion } from '@/components/sections/closing-motion'
import { ContactSection } from '@/components/sections/contact-section'
import { HeroSection } from '@/components/sections/hero-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { isLocale } from '@/i18n/config'
import { getGithubRepos, resolveGithubUsername } from '@/lib/github'
import { buildPersonJsonLd } from '@/lib/seo'
import {
  getCertifications,
  getProjects,
  getRecommendations,
  getSiteSettings,
  getSocialLinks,
} from '@/sanity/lib/data'

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const [settings, projects, certifications, socialLinks, recommendations] = await Promise.all([
    getSiteSettings(lang),
    getProjects(lang),
    getCertifications(),
    getSocialLinks(lang),
    getRecommendations(),
  ])
  const githubUser = resolveGithubUsername(
    settings?.githubUsername,
    socialLinks.map((link) => link.url),
  )
  const repos = await getGithubRepos(githubUser)

  const stats = {
    projects: projects.length,
    certifications: certifications.length,
    technologies: new Set([
      ...(settings?.skillGroups?.flatMap((group) => group.skills) ?? []),
      ...projects.flatMap((project) => project.technologies),
    ]).size,
  }

  return (
    <>
      <JsonLd data={buildPersonJsonLd(settings, socialLinks, lang)} />
      <HeroSection settings={settings} stats={stats} lang={lang} />
      <AboutSection settings={settings} lang={lang} />
      <ProjectsSection projects={projects} settings={settings} lang={lang}>
        {githubUser ? <GithubRepos repos={repos} username={githubUser} lang={lang} /> : null}
      </ProjectsSection>
      <CertificationsSection certifications={certifications} settings={settings} lang={lang} />
      <RecommendationsSection items={recommendations} lang={lang} />
      <ClosingMotion lang={lang} />
      <ContactSection settings={settings} socialLinks={socialLinks} lang={lang} />
    </>
  )
}
