'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { SoundToggle } from '@/components/sound/ambient-sound'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { useI18n } from '@/i18n/client'
import { LOCALE_META, LOCALES, switchLocalePath } from '@/i18n/config'

/** Píldora de vidrio con el idioma (ES / EN), el tema (claro / oscuro) y la música. */
export function PreferencesPill({ className = '' }: { className?: string }) {
  const { lang, t } = useI18n()
  const pathname = usePathname() ?? '/'

  return (
    <div
      role="group"
      aria-label={t.header.preferences}
      className={`glass liquid relative flex items-center gap-0.5 rounded-full p-1 ${className}`}
    >
      <nav aria-label={t.header.language} className="flex items-center">
        {LOCALES.map((locale) => {
          const active = locale === lang
          return (
            <Link
              key={locale}
              href={switchLocalePath(pathname, locale)}
              hrefLang={locale}
              lang={locale}
              aria-current={active ? 'true' : undefined}
              aria-label={LOCALE_META[locale].label}
              scroll={false}
              className={`mono-caps grid h-8 min-w-9 place-items-center rounded-full px-2 text-[0.825rem] transition-[color,background-color] duration-200 ${
                active
                  ? 'bg-ink/[0.1] text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]'
                  : 'text-subtle hover:text-foreground'
              }`}
            >
              {locale}
            </Link>
          )
        })}
      </nav>
      <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-line-strong" />
      <ThemeToggle />
      <SoundToggle />
    </div>
  )
}
