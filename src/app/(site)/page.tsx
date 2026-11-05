import type { Metadata } from 'next'

import { JsonLd } from '@/components/json-ld'
import { AboutSection } from '@/components/sections/about-section'
import { CertificationsSection } from '@/components/sections/certifications-section'
import { ContactSection } from '@/components/sections/contact-section'
import { HeroSection } from '@/components/sections/hero-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { SocialSection } from '@/components/sections/social-section'
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

  return (
    <>
      <JsonLd data={buildPersonJsonLd(settings, socialLinks)} />
      <HeroSection settings={settings} />
      <AboutSection settings={settings} />
      <SocialSection socialLinks={socialLinks} />
      <ProjectsSection projects={projects} />
      <CertificationsSection certifications={certifications} />
      <ContactSection settings={settings} />
    </>
  )
}
