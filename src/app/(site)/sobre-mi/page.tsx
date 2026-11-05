import { GraduationCap, Layers, Target } from 'lucide-react'
import type { Metadata } from 'next'

import { ContactSection } from '@/components/sections/contact-section'
import { PageHero } from '@/components/ui/page-hero'
import { SITE_DEFAULTS } from '@/lib/site'
import { getSiteSettings, getSocialLinks } from '@/sanity/lib/data'

export const metadata: Metadata = {
  title: 'Sobre mí',
  description:
    'Perfil profesional, formación académica, habilidades técnicas y principios de trabajo.',
  alternates: { canonical: '/sobre-mi' },
}

function BlockTitle({
  icon: Icon,
  children,
  id,
}: {
  icon: typeof Target
  children: React.ReactNode
  id: string
}) {
  return (
    <h2 id={id} className="flex items-center gap-3 text-[1.5rem] font-black tracking-[-0.03em]">
      <span className="grid size-10 place-items-center rounded-2xl border border-line bg-surface-2 text-aqua">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      {children}
    </h2>
  )
}

/** Perfil extendido (FR-03): destino de «Ver perfil completo». */
export default async function AboutPage() {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getSocialLinks()])
  const education = settings?.education ?? []
  const skillGroups = settings?.skillGroups ?? []
  const principles = settings?.principles ?? []

  return (
    <>
      <PageHero
        label={settings?.tagline || SITE_DEFAULTS.tagline}
        title="Sobre mí"
        description={settings?.summary || SITE_DEFAULTS.description}
      />

      <section aria-label="Formación y habilidades" className="pb-20">
        <div className="container-page grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="surface-card spotlight reveal p-8">
            <BlockTitle icon={GraduationCap} id="formacion">
              Formación académica
            </BlockTitle>
            {education.length > 0 ? (
              <ol className="mt-8 space-y-7 border-l border-line-strong pl-6">
                {education.map((item) => (
                  <li key={item._key} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute top-2 -left-[1.86rem] size-2.5 rounded-full bg-aqua shadow-[0_0_12px_rgba(107,222,238,0.9)]"
                    />
                    <p className="text-[1.15rem] font-extrabold">{item.program}</p>
                    <p className="font-bold text-muted">{item.institution}</p>
                    <p className="mt-1 text-sm font-bold text-subtle">
                      {item.startYear ? `${item.startYear} – ` : ''}
                      {item.endYear ?? 'En formación'}
                    </p>
                    {item.description ? (
                      <p className="mt-3 leading-relaxed text-muted">{item.description}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 text-muted">Formación académica próximamente.</p>
            )}
          </div>

          <div className="surface-card spotlight reveal p-8">
            <BlockTitle icon={Layers} id="habilidades">
              Habilidades
            </BlockTitle>
            <div className="mt-8 space-y-6">
              {skillGroups.map((group) => (
                <div key={group._key}>
                  <p className="label">{group.title}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
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
        </div>
      </section>

      {principles.length > 0 ? (
        <section aria-labelledby="enfoque" className="pb-24 lg:pb-28">
          <div className="container-page">
            <BlockTitle icon={Target} id="enfoque">
              Cómo trabajo
            </BlockTitle>
            <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {principles.map((principle, index) => (
                <li key={principle._key} className="surface-card card-hover spotlight reveal p-6">
                  <span className="text-aurora text-[0.95rem] font-black tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 text-[1.08rem] leading-snug font-extrabold">
                    {principle.title}
                  </h3>
                  {principle.description ? (
                    <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">
                      {principle.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <ContactSection settings={settings} socialLinks={socialLinks} />
    </>
  )
}
