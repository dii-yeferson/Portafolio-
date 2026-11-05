import type { Metadata } from 'next'

import { JsonLd } from '@/components/json-ld'
import { AboutSection } from '@/components/sections/about-section'
import { CertificationsSection } from '@/components/sections/certifications-section'
import { ContactSection } from '@/components/sections/contact-section'
import { HeroSection } from '@/components/sections/hero-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { buildPersonJsonLd } from '@/lib/seo'
import { getCertifications, getProjects, getSiteSettings, getSocialLinks } from '@/sanity/lib/data'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [settings, projects, certifications, socialLinks] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getCertifications(),
    getSocialLinks(),
  ])

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
      <JsonLd data={buildPersonJsonLd(settings, socialLinks)} />
      <HeroSection settings={settings} stats={stats} />
      <AboutSection settings={settings} />
      <ProjectsSection projects={projects} />
      <CertificationsSection certifications={certifications} />
      <ContactSection settings={settings} socialLinks={socialLinks} />
    </>
  )
}
