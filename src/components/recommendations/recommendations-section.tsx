import { ArrowUpRight, BadgeCheck, Quote } from 'lucide-react'

import { SanityImage } from '@/components/sanity-image'
import { SectionHeading } from '@/components/ui/section-heading'
import { type Locale, localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import { hasImageAsset } from '@/sanity/lib/image'
import type { RecommendationItem } from '@/sanity/lib/data'

/**
 * Recomendaciones de personas reales, verificadas con LinkedIn y aprobadas
 * en el panel. Sin recomendaciones aprobadas, la sección no existe.
 */
export function RecommendationsSection({
  items,
  lang,
}: {
  items: RecommendationItem[]
  lang: Locale
}) {
  if (items.length === 0) return null
  const t = getDictionary(lang).recommendations

  return (
    <section
      id="recomendaciones"
      aria-labelledby="recomendaciones-title"
      className="border-t border-line py-20 lg:py-28"
    >
      <div className="container-page">
        <SectionHeading
          id="recomendaciones-title"
          label={t.label}
          title={t.title}
          action={{ href: localePath(lang, '/recomendar'), label: t.leave }}
        />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => {
            const profile = isSafeExternalUrl(item.profileUrl) ? item.profileUrl : null
            return (
              <li key={item._id} className="reveal">
                <figure className="surface-card spotlight flex h-full flex-col p-7">
                  <Quote className="size-6 text-aqua" aria-hidden="true" />
                  <blockquote
                    lang={item.language ?? undefined}
                    className="accent-serif mt-4 flex-1 text-[1.35rem] leading-[1.4] text-foreground"
                  >
                    {item.message}
                  </blockquote>
                  <figcaption className="mt-7 flex items-center gap-4 border-t border-line pt-5">
                    {hasImageAsset(item.authorPhoto) ? (
                      <SanityImage
                        image={item.authorPhoto}
                        width={112}
                        height={112}
                        alt=""
                        className="size-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid size-12 place-items-center rounded-full bg-surface-3 font-black">
                        {item.authorName.slice(0, 1)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-extrabold">{item.authorName}</p>
                      <p className="truncate text-sm font-semibold text-muted">
                        {[item.role, item.organization].filter(Boolean).join(' · ')}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-aqua">
                        <BadgeCheck className="size-3.5" aria-hidden="true" />
                        {t.verified}
                        {item.relationship ? (
                          <span className="text-subtle">
                            ·{' '}
                            {t.relationships[item.relationship as keyof typeof t.relationships] ??
                              ''}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    {profile ? (
                      <a
                        href={profile}
                        {...EXTERNAL_LINK_PROPS}
                        aria-label={t.viewProfile(item.authorName)}
                        className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:bg-ink/[0.08] hover:text-foreground"
                      >
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </a>
                    ) : null}
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
