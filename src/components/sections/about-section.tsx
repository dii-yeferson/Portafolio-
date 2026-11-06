import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { LiveCaption } from '@/components/about/live-caption'
import { Timeline } from '@/components/about/timeline'
import { Accent } from '@/i18n/accent'
import { type Locale, localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { resolveCopy } from '@/lib/copy'
import type { SiteSettings } from '@/sanity/lib/data'

/**
 * Sobre mí (FR-03): una idea grande, un subtítulo vivo con mi forma de
 * trabajar, la trayectoria (experiencia + formación) y con qué trabajo.
 */
export function AboutSection({ settings, lang }: { settings: SiteSettings; lang: Locale }) {
  const t = getDictionary(lang).about
  const copy = resolveCopy(settings?.aboutCopy, { label: t.label, title: t.title, description: '' })
  const principles = (settings?.principles ?? []).map((principle) => principle.title)
  const hasExperience = (settings?.experience?.length ?? 0) > 0
  const skillGroups = settings?.skillGroups ?? []

  return (
    <section
      id="sobre-mi"
      aria-labelledby="sobre-mi-title"
      className="pt-14 pb-20 lg:pt-20 lg:pb-28"
    >
      <div className="container-page">
        <p className="label reveal">{copy.label}</p>
        <h2
          id="sobre-mi-title"
          className="reveal mt-3 max-w-4xl text-[clamp(2.4rem,5vw,4rem)] leading-[1] font-black tracking-[-0.045em]"
        >
          <Accent text={copy.title} className="accent-serif text-aurora pr-1" />
        </h2>
        {settings?.summary ? (
          <p className="reveal mt-7 max-w-3xl text-[clamp(1.15rem,2vw,1.5rem)] leading-[1.45] font-bold tracking-[-0.015em] text-muted">
            {settings.summary}
          </p>
        ) : null}

        {principles.length > 0 ? (
          <div className="reveal mt-12 border-y border-line py-8">
            <LiveCaption phrases={principles} label={t.howIWork} />
          </div>
        ) : null}

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="reveal">
            <p className="label mb-6">{hasExperience ? t.journey : t.education}</p>
            <Timeline settings={settings} lang={lang} />
          </div>
          {skillGroups.length > 0 ? (
            <div className="reveal">
              <p className="label mb-6">{t.stack}</p>
              <div className="space-y-6">
                {skillGroups.map((group) => (
                  <div key={group._key}>
                    <p className="text-[0.95rem] font-extrabold">{group.title}</p>
                    <ul className="mt-3 flex flex-wrap gap-2" aria-label={group.title}>
                      {group.skills.map((skill) => (
                        <li
                          key={skill}
                          className="chip transition-colors hover:border-line-strong hover:text-foreground"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <Link
          href={localePath(lang, '/sobre-mi')}
          className="group reveal mt-12 inline-flex items-center gap-2 text-[0.95rem] font-extrabold"
        >
          {t.fullProfile}
          <span className="grid size-8 place-items-center rounded-full border border-line-strong transition-[transform,background-color] duration-300 group-hover:translate-x-0.5 group-hover:bg-ink/[0.07]">
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  )
}
