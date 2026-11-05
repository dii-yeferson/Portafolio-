import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Nunito } from 'next/font/google'

import { MotionProvider } from '@/components/motion-provider'
import { buildRootMetadata } from '@/lib/seo'
import { SITE_DEFAULTS } from '@/lib/site'
import { getSiteSettings, isDemoContent } from '@/sanity/lib/data'

import './globals.css'

/** Nunito variable (200–1000): la misma familia de Qurri y Mikuy. */
const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata(await getSiteSettings(), !isDemoContent)
}

export const viewport: Viewport = {
  themeColor: SITE_DEFAULTS.themeColor,
  colorScheme: 'dark',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={SITE_DEFAULTS.language} className={`${nunito.variable} ${jetbrainsMono.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  )
}
