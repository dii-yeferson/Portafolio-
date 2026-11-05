import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Manrope } from 'next/font/google'

import { buildRootMetadata } from '@/lib/seo'
import { SITE_DEFAULTS } from '@/lib/site'
import { getSiteSettings } from '@/sanity/lib/data'

import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata(await getSiteSettings())
}

export const viewport: Viewport = {
  themeColor: SITE_DEFAULTS.themeColor,
  colorScheme: 'dark',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={SITE_DEFAULTS.language}
      className={`${manrope.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
