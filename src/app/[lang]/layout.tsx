import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, JetBrains_Mono, Nunito } from 'next/font/google'
import { notFound } from 'next/navigation'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { MotionProvider } from '@/components/motion-provider'
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import { THEME_SCRIPT } from '@/components/theme/theme-script'
import { PointerSpotlight } from '@/components/ui/pointer-spotlight'
import { I18nProvider } from '@/i18n/client'
import { isLocale, LOCALES, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { buildRootMetadata } from '@/lib/seo'
import { getSiteSettings, isDemoContent } from '@/sanity/lib/data'

import '../globals.css'

/** Nunito variable (200–1000): la misma familia de Qurri y Mikuy. */
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', display: 'swap' })

/** Serif itálica de acento para la mezcla tipográfica de la marca. */
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
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
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    { media: '(prefers-color-scheme: light)', color: '#f5f5f1' },
  ],
  viewportFit: 'cover',
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale: Locale = lang
  const t = getDictionary(locale)
  const settings = await getSiteSettings(locale)

  return (
    <html
      lang={locale}
      data-theme="dark"
      suppressHydrationWarning
      className={`${nunito.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <I18nProvider lang={locale}>
          <MotionProvider>
            <a
              href="#contenido"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:font-bold focus:text-background"
            >
              {t.common.skipToContent}
            </a>
            <SiteHeader settings={settings} />
            <main id="contenido">{children}</main>
            <SiteFooter settings={settings} lang={locale} />
            <PointerSpotlight />
            <SmoothScroll />
          </MotionProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
