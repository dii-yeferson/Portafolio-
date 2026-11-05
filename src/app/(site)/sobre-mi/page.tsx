import { ArrowUpRight, GraduationCap, Target } from 'lucide-react'
import type { Metadata } from 'next'

import { BrandIcon } from '@/components/icons/brand-icons'
import { ContactSection } from '@/components/sections/contact-section'
import { PageHero } from '@/components/ui/page-hero'
import { SITE_DEFAULTS } from '@/lib/site'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import { getSiteSettings, getSocialLinks } from '@/sanity/lib/data'

export const metadata: Metadata = {
  title: 'Sobre mí',
  description:
    'Perfil profesional, formación académica, habilidades técnicas y principios de trabajo.',
  alternates: { canonical: '/sobre-mi' },
}

/** Perfil extendido (FR-03): destino de «Más sobre mí» y «Ver todas» las redes. */
export default async function AboutPage() {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getSocialLinks()])
  const education = settings?.education ?? []
  const skillGroups = settings?.skillGroups ?? []
  const principles = settings?.principles ?? []
  const links = socialLinks.filter((link) => isSafeExternalUrl(link.url))

  return (
    <>
      <PageHero
        eyebrow={settings?.tagline || SITE_DEFAULTS.tagline}
        title="Sobre mí"
        description={settings?.summary || SITE_DEFAULTS.description}
      />

      <section aria-labelledby="formacion" className="border-b border-white/[0.06]">
        <div className="container-page grid gap-5 py-14 lg:grid-cols-[1fr_1.4fr] lg:py-16">
          <div className="panel p-7">
            <h2 id="formacion" className="flex items-center gap-3 text-xl font-extrabold">
              <GraduationCap className="size-6 text-accent-bright" aria-hidden="true" />
              Formación académica
            </h2>
            {education.length > 0 ? (
              <ol className="mt-7 space-y-6 border-l border-accent/30 pl-6">
                {education.map((item) => (
                  <li key={item._key} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute top-1.5 -left-[1.95rem] size-3 rounded-full border-2 border-accent-bright bg-background"
                    />
                    <p className="text-lg font-extrabold">{item.program}</p>
                    <p className="font-bold text-accent-bright">{item.institution}</p>
                    <p className="mt-1 text-sm font-semibold text-muted">
                      {item.startYear ? `${item.startYear} – ` : ''}
                      {item.endYear ?? 'En formación'}
                    </p>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 text-muted">Formación académica próximamente.</p>
            )}
          </div>

          <div className={`grid gap-5 ${skillGroups.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {skillGroups.map((group) => (
              <div key={group._key} className="panel p-7">
                <h2 className="text-lg font-extrabold">{group.title}</h2>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {group.skills.map((skill) => (
                    <li key={skill} className="chip">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {principles.length > 0 ? (
        <section aria-labelledby="enfoque" className="border-b border-white/[0.06]">
          <div className="container-page py-14 lg:py-16">
            <h2
              id="enfoque"
              className="flex items-center gap-3 text-[2rem] font-extrabold tracking-[-0.025em]"
            >
              <Target className="size-7 text-accent-bright" aria-hidden="true" />
              Mi enfoque
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {principles.map((principle, index) => (
                <li key={principle._key} className="panel panel-interactive reveal p-6">
                  <span className="font-mono text-sm text-accent-bright">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 text-lg leading-snug font-extrabold">{principle.title}</h3>
                  {principle.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {principle.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {links.length > 0 ? (
        <section id="redes" aria-labelledby="redes-title" className="border-b border-white/[0.06]">
          <div className="container-page py-14 lg:py-16">
            <h2 id="redes-title" className="text-[2rem] font-extrabold tracking-[-0.025em]">
              Redes y contacto
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
                <li key={link._id}>
                  <a
                    href={link.url}
                    {...(link.iconKey === 'email' ? {} : EXTERNAL_LINK_PROPS)}
                    className="panel panel-interactive group flex items-center gap-4 p-5"
                  >
                    <BrandIcon platform={link.iconKey} className="size-11 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold">{link.platformName}</span>
                      <span className="block truncate text-sm text-muted">
                        {link.label ?? link.url.replace(/^(https:\/\/|mailto:)/, '')}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="size-4 text-subtle transition-colors group-hover:text-accent-bright"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ContactSection settings={settings} />
    </>
  )
}
