import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

import { DataGlobe } from '@/components/hero/data-globe'
import { SplitLetters } from '@/components/motion/split-letters'
import { SanityImage } from '@/components/sanity-image'
import { CountUp } from '@/components/ui/count-up'
import { type Locale, localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { SITE_DEFAULTS } from '@/lib/site'
import { hasImageAsset } from '@/sanity/lib/image'
import type { SiteSettings } from '@/sanity/lib/data'

type HeroStats = { projects: number; certifications: number; technologies: number }

const PORTRAIT_MASK =
  '[mask-composite:intersect] [mask-image:linear-gradient(to_bottom,black_84%,transparent),linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]'

/**
 * Portada (FR-02): el nombre se arma letra por letra y el retrato queda
 * delante del globo de datos, que gira detrás con un halo suave y un solo
 * punto de luz en órbita.
 */
export function HeroSection({
  settings,
  stats,
  lang,
}: {
  settings: SiteSettings
  stats: HeroStats
  lang: Locale
}) {
  const t = getDictionary(lang)
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const heroName = name.trim().replace(/^(?:D\.?|Di|Diego)\s+(?=Yeferson$)/i, '')
  const tagline = settings?.tagline || SITE_DEFAULTS.tagline
  const [motto, mottoAccent] = settings?.heroPhrases?.length
    ? settings.heroPhrases
    : [SITE_DEFAULTS.motto]
  const portrait = hasImageAsset(settings?.heroPortrait) ? settings?.heroPortrait : null
  const figures = [
    { label: t.hero.stats.projects, value: stats.projects },
    { label: t.hero.stats.certifications, value: stats.certifications },
    { label: t.hero.stats.technologies, value: stats.technologies },
  ].filter((figure) => figure.value > 0)

  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(55%_65%_at_78%_42%,rgb(var(--accent-rgb)/0.13),transparent_65%),radial-gradient(40%_45%_at_88%_20%,rgb(var(--accent-rgb)/0.09),transparent_70%),radial-gradient(45%_50%_at_8%_100%,rgb(var(--accent-rgb)/0.045),transparent_70%)]" />
        <div className="aurora-blob absolute top-[8%] right-[2%] size-[38rem] max-w-[90vw] rounded-full bg-[conic-gradient(from_120deg,rgb(var(--accent-rgb)/0.12),rgb(var(--accent-rgb)/0.035),rgb(var(--accent-rgb)/0.14),rgb(var(--accent-rgb)/0.12))] opacity-80 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--ink-rgb)/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--ink-rgb)/0.03)_1px,transparent_1px)] [mask-image:radial-gradient(65%_60%_at_70%_45%,black,transparent)] bg-[size:72px_72px]" />
        <div className="grain absolute inset-0 opacity-[0.12]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
      </div>

      <div className="container-page grid min-h-[min(100svh,60rem)] grid-cols-1 items-center gap-6 pt-32 pb-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-4 lg:pt-28 lg:pb-16">
        <div className="relative z-10">
          {settings?.availability ? (
            <p className="glass liquid relative inline-flex animate-rise items-center gap-2.5 rounded-full py-2 pr-4 pl-3 text-sm font-bold text-foreground/90">
              <span className="status-dot" aria-hidden="true" />
              {settings.availability}
            </p>
          ) : null}

          <h1
            id="hero-title"
            className="letters letters-intro mt-7 text-[clamp(3rem,11vw,6.5rem)] leading-[0.92] font-[750] tracking-[-0.055em] lg:text-[clamp(4.2rem,8.2vw,7.5rem)]"
          >
            <SplitLetters text={heroName} />
          </h1>
          <p className="mt-6 animate-rise text-[clamp(0.875rem,1.2vw,1rem)] font-semibold tracking-[0.085em] text-muted uppercase [animation-delay:520ms]">
            <span className="text-aurora">{tagline}</span>
          </p>
          <p className="mt-4 max-w-xl animate-rise text-[clamp(1.35rem,2.4vw,1.85rem)] leading-[1.2] font-extrabold tracking-[-0.025em] [animation-delay:600ms]">
            {motto}{' '}
            {mottoAccent ? (
              <em className="accent-serif text-aurora pr-1 text-[1.12em]">{mottoAccent}</em>
            ) : null}
          </p>

          <div className="mt-9 flex animate-rise flex-wrap gap-3 [animation-delay:680ms]">
            <a href="#proyectos" className="btn btn-primary h-[3.25rem] px-7 text-[1rem]">
              {t.hero.viewProjects}
              <ArrowRight className="size-[1.1rem]" aria-hidden="true" />
            </a>
            <a
              href={localePath(lang, '/#contacto')}
              className="btn btn-glass h-[3.25rem] px-7 text-[1rem]"
            >
              {t.hero.contact}
            </a>
          </div>

          {figures.length > 0 ? (
            <dl className="glass liquid relative mt-10 flex max-w-[29rem] animate-rise divide-x divide-line-strong rounded-[1.25rem] px-2 py-4 [animation-delay:760ms] max-[23rem]:flex-col max-[23rem]:divide-x-0 max-[23rem]:divide-y">
              {figures.map((figure) => (
                <div
                  key={figure.label}
                  className="flex flex-[1_0_auto] flex-col-reverse gap-1.5 px-2 max-[23rem]:flex-row-reverse max-[23rem]:items-center max-[23rem]:justify-end max-[23rem]:gap-3 max-[23rem]:py-2 sm:px-5"
                >
                  <dt className="text-sm font-semibold text-muted">{figure.label}</dt>
                  <dd className="text-[2.15rem] leading-none font-bold tracking-[-0.045em] tabular-nums">
                    <CountUp value={figure.value} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[36rem] animate-fade [animation-delay:150ms] lg:max-w-none">
          <div className="absolute -top-[2%] -right-[8%] size-[92%]">
            <DataGlobe className="absolute inset-0 size-full" />
            {/* Halo suave y un anillo fino con un punto de luz en órbita: limpio, sin texto. */}
            <div
              aria-hidden="true"
              className="globe-halo absolute inset-[6%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/0.16),rgb(var(--accent-rgb)/0.065)_55%,transparent)] blur-2xl"
            />
            <svg aria-hidden="true" viewBox="0 0 100 100" className="orbit size-full">
              <circle
                cx="50"
                cy="50"
                r="46.5"
                fill="none"
                stroke="rgb(255 255 255 / 0.07)"
                strokeWidth="0.15"
              />
              <path
                d="M72 6a49 49 0 0 1 24 25m1 35a50 50 0 0 1-26 27"
                fill="none"
                stroke="rgb(var(--accent-rgb) / 0.34)"
                strokeLinecap="round"
                strokeWidth="0.17"
              />
            </svg>
            <div aria-hidden="true" className="orbit orbit-dot">
              <span className="absolute top-[3.5%] left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-aqua shadow-[0_0_12px_rgb(var(--accent-rgb)/0.75)]" />
            </div>
          </div>
          {portrait ? (
            <SanityImage
              image={portrait}
              width={960}
              height={1200}
              preload
              sizes="(min-width: 1024px) 40vw, 90vw"
              className={`absolute bottom-0 left-[2%] h-[96%] w-auto max-w-[84%] object-contain object-bottom ${PORTRAIT_MASK}`}
            />
          ) : (
            <Image
              src={SITE_DEFAULTS.portrait.src}
              width={SITE_DEFAULTS.portrait.width}
              height={SITE_DEFAULTS.portrait.height}
              alt={t.hero.portraitAlt(name)}
              preload
              sizes="(min-width: 1024px) 40vw, 90vw"
              className={`absolute bottom-0 left-[2%] h-[96%] w-auto max-w-[84%] object-contain object-bottom ${PORTRAIT_MASK}`}
            />
          )}
        </div>
      </div>
    </section>
  )
}
