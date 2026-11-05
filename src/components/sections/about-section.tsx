import type { SiteSettings } from '@/sanity/lib/data'

import { SectionHeading } from '../section-heading'
import { TechTags } from '../tech-tags'

/** Sobre mí y perfil técnico (FR-03), sin barras de porcentaje. */
export function AboutSection({ settings }: { settings: SiteSettings }) {
  const education = settings?.education ?? []
  const skillGroups = settings?.skillGroups ?? []
  const principles = settings?.principles ?? []

  return (
    <section aria-labelledby="sobre-mi-title" id="sobre-mi" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading id="sobre-mi-title" eyebrow="Sobre mí" title="Perfil profesional" />
        {settings?.summary ? (
          <p className="max-w-3xl text-lg leading-relaxed text-foreground/90">{settings.summary}</p>
        ) : (
          <p className="text-muted">El perfil profesional se publicará muy pronto.</p>
        )}

        {education.length > 0 ? (
          <div className="mt-12">
            <h3 className="font-display text-xl font-bold">Formación académica</h3>
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {education.map((item) => (
                <li key={item._key} className="card p-5 transition-colors hover:border-accent/70">
                  <p className="font-semibold">{item.program}</p>
                  <p className="text-sm text-muted">
                    {item.institution}
                    {item.startYear ? ` · ${item.startYear} – ${item.endYear ?? 'actualidad'}` : ''}
                  </p>
                  {item.description ? (
                    <p className="mt-2 text-sm text-muted">{item.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {skillGroups.length > 0 ? (
          <div className="mt-12">
            <h3 className="font-display text-xl font-bold">Habilidades técnicas</h3>
            <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {skillGroups.map((group) => (
                <li key={group._key} className="card p-5 transition-colors hover:border-accent/70">
                  <p className="mb-3 font-semibold">{group.title}</p>
                  <TechTags items={group.skills} label={group.title} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {principles.length > 0 ? (
          <div className="mt-12">
            <h3 className="font-display text-xl font-bold">Cómo trabajo</h3>
            <ul className="mt-4 grid gap-4 md:grid-cols-3">
              {principles.map((principle) => (
                <li
                  key={principle._key}
                  className="card p-5 transition-colors hover:border-accent/70"
                >
                  <p className="font-semibold">{principle.title}</p>
                  {principle.description ? (
                    <p className="mt-2 text-sm text-muted">{principle.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
