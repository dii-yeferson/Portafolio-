import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { notFound } from 'next/navigation'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { MotionProvider } from '@/components/motion-provider'
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import { AmbientSoundProvider } from '@/components/sound/ambient-sound'
import { THEME_SCRIPT } from '@/components/theme/theme-script'
import { PointerSpotlight } from '@/components/ui/pointer-spotlight'
import { I18nProvider } from '@/i18n/client'
import { isLocale, LOCALES, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { buildRootMetadata } from '@/lib/seo'
import { getAmbientMusic, getSiteSettings, isDemoContent } from '@/sanity/lib/data'

import '../globals.css'

const geist = localFont({
  src: '../../fonts/geist.woff2',
  weight: '100 900',
  variable: '--font-geist',
  display: 'swap',
  adjustFontFallback: false,
})

/** Serif editorial: normal para el nombre y cursiva para los acentos. */
const instrumentSerif = localFont({
  src: [
    { path: '../../fonts/instrument-serif-regular.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/instrument-serif-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-instrument-serif',
  display: 'swap',
  adjustFontFallback: false,
})

const jetbrainsMono = localFont({
  src: '../../fonts/jetbrains-mono.woff2',
  weight: '100 800',
  variable: '--font-jetbrains-mono',
  display: 'swap',
  adjustFontFallback: false,
})

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  return buildRootMetadata(await getSiteSettings(lang), lang, !isDemoContent)
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#10110f' },
    { media: '(prefers-color-scheme: light)', color: '#f6f2ec' },
  ],
  viewportFit: 'cover',
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale: Locale = lang
  const t = getDictionary(locale)
  const [settings, music] = await Promise.all([getSiteSettings(locale), getAmbientMusic()])

  return (
    <html
      lang={locale}
      data-theme="dark"
      suppressHydrationWarning
      className={`${geist.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <I18nProvider lang={locale}>
          <AmbientSoundProvider config={music}>
            <MotionProvider>
              <a
                href="#contenido"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:font-bold focus:text-background"
              >
                {t.common.skipToContent}
              </a>
              <SiteHeader />
              <main id="contenido">{children}</main>
              <SiteFooter settings={settings} lang={locale} />
              <PointerSpotlight />
              <SmoothScroll />
            </MotionProvider>
          </AmbientSoundProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
