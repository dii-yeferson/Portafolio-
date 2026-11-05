import {
  ArrowRight,
  Award,
  ChartColumnIncreasing,
  ChevronDown,
  FolderOpen,
  MoveHorizontal,
} from 'lucide-react'

import { DataGlobe } from '@/components/hero/data-globe'
import { SanityImage } from '@/components/sanity-image'
import { SITE_DEFAULTS } from '@/lib/site'
import { hasImageAsset } from '@/sanity/lib/image'
import type { SiteSettings } from '@/sanity/lib/data'

const QUICK_LINKS = [
  { href: '#proyectos', label: 'Proyectos', icon: FolderOpen },
  { href: '#certificaciones', label: 'Certificaciones', icon: Award },
  { href: '#contacto', label: 'Soluciones', icon: ChartColumnIncreasing },
] as const

/** Hero (FR-02): identidad, llamadas a la acción y el globo de datos detrás del retrato. */
export function HeroSection({ settings }: { settings: SiteSettings }) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const [firstName = name, ...rest] = name.split(' ')
  const lastName = rest.join(' ')
  const tagline = settings?.tagline || SITE_DEFAULTS.tagline
  const eyebrow = settings?.heroEyebrow || 'Datos · Tecnología · Impacto real'
  const motto = settings?.heroPhrases?.[0] || SITE_DEFAULTS.motto
  const badges = settings?.heroBadges?.length
    ? settings.heroBadges
    : ['Análisis', 'Modelado', 'Visualización', 'Soluciones']
  const quote = settings?.heroQuote || 'Los datos también cuentan historias.'
  const portrait = hasImageAsset(settings?.heroPortrait) ? settings?.heroPortrait : null

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden border-b border-white/[0.06]"
    >
      {/* Fondo: viñeta, resplandor esmeralda, retícula y grano. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_78%_35%,rgba(42,120,90,0.32),transparent_62%),radial-gradient(60%_60%_at_10%_100%,rgba(23,75,57,0.35),transparent_70%),linear-gradient(180deg,#07100c_0%,#060c09_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:radial-gradient(70%_70%_at_70%_40%,black,transparent)] bg-[size:64px_64px]" />
        <div className="grain absolute inset-0 opacity-[0.18]" />
      </div>

      <div className="container-page grid min-h-[calc(100svh-4.5rem)] items-center gap-6 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:py-10 xl:min-h-[min(calc(100svh-4.5rem),780px)] xl:pr-24">
        <div className="relative z-10 max-w-[40rem]">
          <p className="eyebrow animate-fade-up">{eyebrow}</p>
          <h1
            id="hero-title"
            className="mt-5 animate-fade-up text-[clamp(3.4rem,9.5vw,7rem)] leading-[0.92] lg:text-[clamp(4rem,7.2vw,6.6rem)] font-black tracking-[-0.045em] [animation-delay:90ms]"
          >
            <span className="text-foreground">{firstName}</span>
            {lastName ? (
              <>
                {' '}
                <span className="text-gradient-accent">{lastName}</span>
              </>
            ) : null}
          </h1>
          <p className="mt-6 animate-fade-up text-[clamp(1.2rem,2.2vw,1.65rem)] font-bold tracking-[-0.01em] text-[#bfe3cf] [animation-delay:180ms]">
            {tagline}
          </p>
          <p className="mt-3 animate-fade-up text-[clamp(1.05rem,1.7vw,1.3rem)] text-foreground/80 [animation-delay:240ms]">
            {motto}
          </p>

          <div className="mt-9 flex animate-fade-up flex-wrap gap-3.5 [animation-delay:320ms]">
            <a href="#proyectos" className="btn btn-primary h-[3.25rem] px-7 text-[1.02rem]">
              Explorar proyectos
              <ArrowRight className="size-[1.1rem]" aria-hidden="true" />
            </a>
            <a href="#sobre-mi" className="btn btn-outline h-[3.25rem] px-7 text-[1.02rem]">
              Conocer perfil
            </a>
          </div>

          <ul className="mt-11 flex animate-fade-up flex-wrap gap-x-6 gap-y-4 [animation-delay:400ms] xl:gap-x-8">
            {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="group flex items-center gap-3 text-sm font-bold text-muted transition-colors hover:text-foreground"
                >
                  <span className="grid size-11 place-items-center rounded-xl border border-white/12 bg-white/[0.03] text-accent-bright transition-[border-color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:border-accent-bright/60">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Visual: el globo gira detrás del retrato. */}
        <div className="relative mx-auto aspect-square w-full max-w-[34rem] animate-fade-in [animation-delay:200ms] lg:max-w-none">
          <DataGlobe
            className={`absolute ${portrait ? '-top-[6%] -right-[10%] size-[92%]' : 'inset-[-8%] size-[116%]'}`}
          />
          {portrait ? (
            <SanityImage
              image={portrait}
              width={960}
              height={1200}
              preload
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="absolute bottom-0 left-[4%] h-[100%] w-auto max-w-[82%] object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_70%,transparent),linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] [mask-composite:intersect]"
            />
          ) : null}
          <div className="glass absolute top-[30%] right-0 animate-float rounded-2xl px-5 py-4 sm:right-[2%]">
            <ul className="space-y-2.5">
              {badges.map((badge) => (
                <li
                  key={badge}
                  className="flex items-center gap-3 text-[0.82rem] font-bold text-foreground/90"
                >
                  <span aria-hidden="true" className="h-px w-4 bg-accent-bright" />
                  {badge}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Riel lateral (pantallas grandes). */}
      <div
        aria-hidden="true"
        className="absolute top-8 right-6 bottom-28 hidden flex-col items-center justify-between xl:flex"
      >
        <MoveHorizontal className="size-5 text-muted" />
        <p className="rotate-180 text-[1.05rem] font-bold tracking-[0.01em] [writing-mode:vertical-rl]">
          <span className="text-muted">{quote.split(' ').slice(0, 3).join(' ')} </span>
          <span className="text-accent-bright">{quote.split(' ').slice(3).join(' ')}</span>
        </p>
        <span className="h-16 w-px bg-linear-to-b from-accent-bright/80 to-transparent" />
      </div>
      <a
        href="#sobre-mi"
        aria-label="Ir a la siguiente sección"
        className="absolute right-6 bottom-8 hidden flex-col items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-accent-bright xl:flex"
      >
        02
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </a>
    </section>
  )
}
