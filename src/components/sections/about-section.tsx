import { ArrowRight, ChartColumnIncreasing, GraduationCap, Target } from 'lucide-react'
import Link from 'next/link'

import { SanityImage } from '@/components/sanity-image'
import { hasImageAsset } from '@/sanity/lib/image'
import type { SiteSettings } from '@/sanity/lib/data'

function CardTitle({ icon: Icon, children }: { icon: typeof Target; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-3 text-[1.05rem] font-extrabold">
      <Icon className="size-6 text-accent-bright" strokeWidth={2} aria-hidden="true" />
      {children}
    </h3>
  )
}

/** Sobre mí y perfil técnico (FR-03): resumen, formación, habilidades y enfoque. */
export function AboutSection({ settings }: { settings: SiteSettings }) {
  const education = settings?.education?.[0]
  const skills = [...new Set(settings?.skillGroups?.flatMap((group) => group.skills) ?? [])].slice(
    0,
    10,
  )
  const principles = settings?.principles ?? []

  return (
    <section
      id="sobre-mi"
      aria-labelledby="sobre-mi-title"
      className="border-b border-white/[0.06]"
    >
      <div className="container-page grid gap-5 py-14 md:grid-cols-2 lg:py-16 xl:grid-cols-[1.12fr_1fr_1fr_1fr]">
        <div className="reveal flex flex-col md:col-span-2 xl:col-span-1 xl:pr-4">
          <p className="eyebrow relative pl-4 before:absolute before:top-1/2 before:left-0 before:h-4 before:w-[2px] before:-translate-y-1/2 before:rounded-full before:bg-accent-bright">
            Conoce más
          </p>
          <h2
            id="sobre-mi-title"
            className="mt-3 pl-4 text-[2.35rem] leading-tight font-extrabold tracking-[-0.025em]"
          >
            Sobre mí
          </h2>
          <p className="mt-4 pl-4 leading-relaxed text-muted">
            {settings?.summary || 'El perfil profesional se publicará muy pronto.'}
          </p>
          <Link href="/sobre-mi" className="btn btn-primary mt-7 ml-4 h-11 self-start px-5 text-sm">
            Más sobre mí
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <article className="panel panel-interactive reveal overflow-hidden p-6">
          {hasImageAsset(education?.image) ? (
            <SanityImage
              image={education?.image}
              width={640}
              height={480}
              alt=""
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 100vw"
              className="absolute inset-0 size-full object-cover opacity-25 [mask-image:linear-gradient(to_top,black,transparent)]"
            />
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 200 120"
              className="absolute right-0 bottom-0 w-[85%] text-accent/15"
            >
              <path
                d="M10 118V60l40-22 40 22v58M90 118V40l50-28 50 28v78"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              {[0, 1, 2, 3].map((row) =>
                [0, 1, 2].map((col) => (
                  <rect
                    key={`${row}-${col}`}
                    x={104 + col * 22}
                    y={52 + row * 16}
                    width="10"
                    height="8"
                    fill="currentColor"
                  />
                )),
              )}
            </svg>
          )}
          <div className="relative">
            <CardTitle icon={GraduationCap}>Educación</CardTitle>
            {education ? (
              <>
                <p className="mt-6 text-[1.05rem] font-extrabold">{education.program}</p>
                <p className="mt-1 font-bold text-accent-bright">{education.institution}</p>
                <span className="mt-5 inline-flex rounded-md border border-accent/45 bg-accent/10 px-2.5 py-1 text-xs font-bold text-mint">
                  {education.endYear
                    ? `${education.startYear ? `${education.startYear} – ` : ''}${education.endYear}`
                    : 'En formación'}
                </span>
              </>
            ) : (
              <p className="mt-6 text-sm text-muted">Formación académica próximamente.</p>
            )}
          </div>
        </article>

        <article className="panel panel-interactive reveal p-6">
          <CardTitle icon={ChartColumnIncreasing}>Habilidades</CardTitle>
          {skills.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Habilidades">
              {skills.map((skill) => (
                <li
                  key={skill}
                  className="chip hover:border-accent-bright/60 hover:text-foreground"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted">Habilidades próximamente.</p>
          )}
        </article>

        <article className="panel panel-interactive reveal p-6 md:col-span-2 xl:col-span-1">
          <CardTitle icon={Target}>Mi enfoque</CardTitle>
          {principles.length > 0 ? (
            <ul className="mt-6 space-y-3.5">
              {principles.map((principle) => (
                <li
                  key={principle._key}
                  className="flex items-start gap-3 text-[0.9rem] font-semibold text-foreground/85"
                >
                  <svg
                    viewBox="0 0 8 8"
                    aria-hidden="true"
                    className="mt-[0.42rem] size-2 shrink-0 fill-accent-bright"
                  >
                    <path d="M0 0l8 4-8 4z" />
                  </svg>
                  {principle.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted">Principios de trabajo próximamente.</p>
          )}
        </article>
      </div>
    </section>
  )
}
