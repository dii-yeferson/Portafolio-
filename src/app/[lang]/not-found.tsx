import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { lang } from 'next/root-params'

import { LogoMark } from '@/components/brand/logo'
import { DEFAULT_LOCALE, isLocale, localePath } from '@/i18n/config'
import { getDictionary } from '@/i18n'

export default async function NotFound() {
  const current = await lang()
  const locale = isLocale(current) ? current : DEFAULT_LOCALE
  const t = getDictionary(locale).notFound

  return (
    <section className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-6 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_50%_40%,rgb(var(--accent-rgb)/0.12),transparent_70%)]"
      />
      <div className="flex max-w-xl flex-col items-center gap-5">
        <LogoMark className="h-7 w-auto text-foreground" />
        <p className="label mt-4">{t.label}</p>
        <h1 className="text-[clamp(2.6rem,6vw,3.8rem)] leading-tight font-black tracking-[-0.045em]">
          {t.title}
        </h1>
        <p className="text-lg text-muted">{t.description}</p>
        <Link href={localePath(locale, '/')} className="btn btn-primary mt-3 h-12 px-6">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.back}
        </Link>
      </div>
    </section>
  )
}
