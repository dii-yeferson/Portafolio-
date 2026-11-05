import { ArrowRight, GraduationCap, Layers, Target } from 'lucide-react'
import Link from 'next/link'

import type { SiteSettings } from '@/sanity/lib/data'

function CardIcon({ icon: Icon }: { icon: typeof Target }) {
  return (
    <span className="grid size-11 place-items-center rounded-2xl border border-line bg-surface-2 text-aqua shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
    </span>
  )
}

/** Sobre mí (FR-03): declaración principal y tres tarjetas — formación, stack y enfoque. */
export function AboutSection({ settings }: { settings: SiteSettings }) {
  const education = settings?.education?.[0]
  const skills = [...new Set(settings?.skillGroups?.flatMap((group) => group.skills) ?? [])].slice(
    0,
    12,
  )
  const principles = (settings?.principles ?? []).slice(0, 5)

  return (
    <section
      id="sobre-mi"
      aria-labelledby="sobre-mi-title"
      className="pt-14 pb-20 lg:pt-16 lg:pb-28"
    >
      <div className="container-page">
        <p className="label reveal">Perfil</p>
        <h2
          id="sobre-mi-title"
          className="reveal mt-3 text-[clamp(2.2rem,4.2vw,3.25rem)] leading-[1.02] font-black tracking-[-0.04em]"
        >
          Sobre mí
        </h2>
        <p className="reveal mt-8 max-w-4xl text-[clamp(1.35rem,2.5vw,2.05rem)] leading-[1.38] font-bold tracking-[-0.02em] text-foreground/90">
          {settings?.summary || 'El perfil profesional se publicará muy pronto.'}
        </p>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article className="surface-card card-hover spotlight reveal flex flex-col p-7">
            <CardIcon icon={GraduationCap} />
            <p className="label mt-6">Formación</p>
            {education ? (
              <>
                <h3 className="mt-2 text-[1.35rem] leading-snug font-extrabold tracking-[-0.02em]">
                  {education.program}
                </h3>
                <p className="mt-1 font-bold text-muted">{education.institution}</p>
                <span className="mt-6 inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface-2 px-3 py-1 text-[0.78rem] font-bold text-foreground/85">
                  <span className="status-dot size-1.5!" aria-hidden="true" />
                  {education.endYear
                    ? `${education.startYear ? `${education.startYear} – ` : ''}${education.endYear}`
                    : 'En formación'}
                </span>
              </>
            ) : (
              <p className="mt-2 text-muted">Formación académica próximamente.</p>
            )}
          </article>

          <article className="surface-card card-hover spotlight reveal p-7">
            <CardIcon icon={Layers} />
            <p className="label mt-6">Stack técnico</p>
            {skills.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Habilidades">
                {skills.map((skill) => (
                  <li
                    key={skill}
                    className="chip transition-colors hover:border-line-strong hover:text-foreground"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-muted">Habilidades próximamente.</p>
            )}
          </article>

          <article className="surface-card card-hover spotlight reveal p-7 md:col-span-2 lg:col-span-1">
            <CardIcon icon={Target} />
            <p className="label mt-6">Cómo trabajo</p>
            {principles.length > 0 ? (
              <ol className="mt-4 space-y-3">
                {principles.map((principle, index) => (
                  <li
                    key={principle._key}
                    className="flex items-baseline gap-3.5 text-[0.98rem] font-bold text-foreground/90"
                  >
                    <span className="text-aurora w-6 shrink-0 text-[0.8rem] font-black tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {principle.title}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-muted">Principios de trabajo próximamente.</p>
            )}
          </article>
        </div>

        <Link
          href="/sobre-mi"
          className="group reveal mt-10 inline-flex items-center gap-2 text-[0.95rem] font-extrabold"
        >
          Ver perfil completo
          <span className="grid size-8 place-items-center rounded-full border border-line-strong transition-[transform,background-color] duration-300 group-hover:translate-x-0.5 group-hover:bg-white/[0.07]">
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  )
}
