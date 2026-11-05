import { ArrowRight } from 'lucide-react'

import { DataGlobe } from '@/components/hero/data-globe'
import { SanityImage } from '@/components/sanity-image'
import { CountUp } from '@/components/ui/count-up'
import { SITE_DEFAULTS } from '@/lib/site'
import { hasImageAsset } from '@/sanity/lib/image'
import type { SiteSettings } from '@/sanity/lib/data'

/** Posiciones de las insignias que orbitan el globo. */
const BADGE_POSITIONS = [
  'top-[12%] left-[2%] [animation-delay:0s]',
  'top-[44%] -right-1 [animation-delay:1.2s]',
  'bottom-[10%] left-[14%] [animation-delay:2.4s]',
]

type HeroStats = { projects: number; certifications: number; technologies: number }

/** Hero (FR-02): identidad, cifras clave y el globo de datos girando detrás del retrato. */
export function HeroSection({ settings, stats }: { settings: SiteSettings; stats: HeroStats }) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const tagline = settings?.tagline || SITE_DEFAULTS.tagline
  const motto = settings?.heroPhrases?.[0] || SITE_DEFAULTS.motto
  const badges = (settings?.heroBadges ?? []).slice(0, 3)
  const portrait = hasImageAsset(settings?.heroPortrait) ? settings?.heroPortrait : null
  const figures = [
    { label: 'Proyectos', value: stats.projects },
    { label: 'Certificaciones', value: stats.certifications },
    { label: 'Tecnologías', value: stats.technologies },
  ].filter((figure) => figure.value > 0)

  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(55%_65%_at_78%_42%,rgba(98,210,248,0.16),transparent_65%),radial-gradient(40%_45%_at_88%_20%,rgba(139,156,255,0.14),transparent_70%),radial-gradient(45%_50%_at_8%_100%,rgba(149,251,223,0.07),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] [mask-image:radial-gradient(65%_60%_at_70%_45%,black,transparent)] bg-[size:72px_72px]" />
        <div className="grain absolute inset-0 opacity-[0.14]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
      </div>

      <div className="container-page grid grid-cols-1 min-h-[min(100svh,58rem)] items-center gap-10 pt-32 pb-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-4 lg:pt-28 lg:pb-16">
        <div className="relative z-10">
          {settings?.availability ? (
            <p className="glass inline-flex animate-rise items-center gap-2.5 rounded-full py-1.5 pr-4 pl-3 text-[0.82rem] font-bold text-foreground/90">
              <span className="status-dot" aria-hidden="true" />
              {settings.availability}
            </p>
          ) : null}

          <h1
            id="hero-title"
            className="text-satin mt-7 text-[clamp(3.5rem,11vw,6.9rem)] leading-[0.9] font-black tracking-[-0.05em] lg:text-[clamp(4.2rem,7.4vw,6.9rem)]"
          >
            {name}
          </h1>
          <p className="text-aurora mt-6 animate-rise text-[clamp(1.15rem,2.1vw,1.6rem)] font-extrabold tracking-[-0.015em] [animation-delay:120ms]">
            {tagline}
          </p>
          <p className="mt-3 max-w-xl animate-rise text-[clamp(1.05rem,1.5vw,1.22rem)] leading-relaxed text-muted [animation-delay:180ms]">
            {motto}
          </p>

          <div className="mt-10 flex animate-rise flex-wrap gap-3 [animation-delay:260ms]">
            <a href="#proyectos" className="btn btn-primary h-[3.25rem] px-7 text-[1rem]">
              Ver proyectos
              <ArrowRight className="size-[1.1rem]" aria-hidden="true" />
            </a>
            <a href="#contacto" className="btn btn-glass h-[3.25rem] px-7 text-[1rem]">
              Contactar
            </a>
          </div>

          {figures.length > 0 ? (
            <dl className="mt-14 grid max-w-md animate-rise grid-cols-3 gap-6 border-t border-line pt-7 [animation-delay:340ms]">
              {figures.map((figure) => (
                <div key={figure.label} className="flex flex-col-reverse gap-1.5">
                  <dt className="text-[0.8rem] font-bold text-subtle">{figure.label}</dt>
                  <dd className="text-[2.35rem] leading-none font-black tracking-[-0.045em] tabular-nums">
                    <CountUp value={figure.value} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[36rem] animate-fade [animation-delay:150ms] lg:max-w-none">
          <DataGlobe
            className={`absolute ${portrait ? '-top-[4%] -right-[10%] size-[92%]' : 'inset-[-7%] size-[114%]'}`}
          />
          {portrait ? (
            <SanityImage
              image={portrait}
              width={960}
              height={1200}
              preload
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="absolute bottom-0 left-[4%] h-full w-auto max-w-[82%] object-contain object-bottom [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,black_72%,transparent),linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
            />
          ) : null}
          {badges.map((badge, index) => (
            <span
              key={badge}
              className={`glass absolute hidden animate-float items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.8rem] font-bold text-foreground/90 sm:inline-flex ${BADGE_POSITIONS[index] ?? ''}`}
            >
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-aqua shadow-[0_0_10px_rgba(107,222,238,0.9)]"
              />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
