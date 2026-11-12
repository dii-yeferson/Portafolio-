import { BadgeCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

import { BrandGlyph } from '@/components/icons/brand-icons'
import { RecommendationForm } from '@/components/recommendations/recommendation-form'
import { PageHero } from '@/components/ui/page-hero'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { getLinkedInConfig } from '@/lib/auth/linkedin'
import { decodeSession, getAuthSecret, SESSION_COOKIE } from '@/lib/auth/session'
import { buildPageMetadata } from '@/lib/seo'
import { getWriteClient } from '@/sanity/lib/write-client'

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/recomendar'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const t = getDictionary(lang).meta
  return {
    ...buildPageMetadata('/recomendar', lang, t.recommendTitle, t.recommendDescription),
    robots: { index: false, follow: true },
  }
}

/**
 * Página para dejar una recomendación verificada (se comparte por enlace,
 * p. ej. con un docente). Sin LinkedIn configurado, explica que se activa pronto.
 */
export default async function RecommendPage({
  params,
  searchParams,
}: PageProps<'/[lang]/recomendar'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const { error } = await searchParams
  const t = getDictionary(lang).recommendations
  const copy = t.page
  const enabled = Boolean(getLinkedInConfig() && getAuthSecret() && getWriteClient())
  const session = decodeSession((await cookies()).get(SESSION_COOKIE)?.value, getAuthSecret())

  return (
    <>
      <PageHero lang={lang} label={copy.label} title={copy.title} description={copy.description} />
      <section aria-label={t.leave} className="pb-24 lg:pb-32">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.35fr]">
          <ul className="space-y-6">
            {copy.steps.map((step) => (
              <li key={step} className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="mt-2 size-2 shrink-0 rounded-full bg-aqua shadow-[0_0_10px_rgb(var(--accent-rgb)/0.8)]"
                />
                <p className="text-[1.15rem] font-bold">{step}</p>
              </li>
            ))}
            <li className="flex items-start gap-3 border-t border-line pt-6 text-sm font-semibold text-subtle">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-aqua" aria-hidden="true" />
              {copy.privacy}
            </li>
          </ul>

          <div>
            {error === 'auth' ? (
              <p role="alert" className="mb-4 font-semibold text-danger">
                {copy.authError}
              </p>
            ) : null}
            {session && enabled ? (
              <RecommendationForm name={session.name} picture={session.picture} />
            ) : enabled ? (
              <div className="surface-card flex flex-col items-start gap-5 p-8">
                <p className="text-[1.1rem] font-bold text-muted">{copy.description}</p>
                <a
                  href={`/api/auth/linkedin?lang=${lang}`}
                  className="btn h-14 bg-[#0A66C2] px-7 text-[1rem] text-white shadow-[0_14px_34px_-14px_rgba(10,102,194,0.8)] hover:brightness-110"
                >
                  <BrandGlyph platform="linkedin" className="size-5" />
                  {copy.continueWithLinkedIn}
                </a>
              </div>
            ) : (
              <div className="surface-card p-8">
                <p className="text-[1.1rem] font-bold">{copy.notConfigured}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
