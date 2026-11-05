import { SITE_DEFAULTS } from '@/lib/site'
import { hasImageAsset } from '@/sanity/lib/image'
import type { SiteSettings } from '@/sanity/lib/data'

import { RotatingPhrases } from '../rotating-phrases'
import { SanityImage } from '../sanity-image'

/** Globo de nodos estático: respaldo ligero del globo 3D (FR-02). */
function DataGlobe() {
  const nodes = [
    [50, 8],
    [78, 22],
    [92, 50],
    [78, 78],
    [50, 92],
    [22, 78],
    [8, 50],
    [22, 22],
    [64, 40],
    [36, 60],
  ] as const
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="absolute inset-0 size-full text-border"
    >
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.4" />
      <ellipse
        cx="50"
        cy="50"
        rx="18"
        ry="42"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="42"
        ry="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
      />
      {nodes.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.2" className="fill-accent" />
      ))}
    </svg>
  )
}

export function HeroSection({ settings }: { settings: SiteSettings }) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const tagline = settings?.tagline || SITE_DEFAULTS.tagline
  const phrases = settings?.heroPhrases?.length ? settings.heroPhrases : [SITE_DEFAULTS.motto]
  const badges = settings?.heroBadges ?? []

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,148,112,0.16),transparent_60%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-28">
        <div>
          <p className="font-mono text-sm text-accent">{tagline}</p>
          <h1
            id="hero-title"
            className="mt-4 font-display text-5xl font-extrabold tracking-tight sm:text-6xl"
          >
            {name}
          </h1>
          <RotatingPhrases phrases={phrases} />
          {badges.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Especialidades">
              {badges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full border border-border/80 bg-surface px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-foreground"
                >
                  {badge}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#proyectos"
              className="rounded-full bg-accent px-6 py-3 font-semibold text-background transition-colors hover:bg-accent-strong"
            >
              Ver proyectos
            </a>
            <a
              href="#contacto"
              className="rounded-full border border-border px-6 py-3 font-semibold transition-colors hover:border-accent"
            >
              Contáctame
            </a>
            {settings?.resume?.url ? (
              <a
                href="/cv"
                rel="nofollow"
                className="rounded-full border border-champagne/60 px-6 py-3 font-semibold text-champagne transition-colors hover:bg-champagne/10"
              >
                Descargar CV
              </a>
            ) : null}
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <DataGlobe />
          {hasImageAsset(settings?.heroPortrait) ? (
            <SanityImage
              image={settings.heroPortrait}
              width={640}
              height={640}
              preload
              sizes="(min-width: 768px) 384px, 80vw"
              className="absolute inset-[12%] size-[76%] rounded-full border border-border object-cover"
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
