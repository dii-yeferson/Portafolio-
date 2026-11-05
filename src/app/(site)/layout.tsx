import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { PointerSpotlight } from '@/components/ui/pointer-spotlight'
import { getSiteSettings } from '@/sanity/lib/data'

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings()

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:font-bold focus:text-background"
      >
        Saltar al contenido
      </a>
      <SiteHeader settings={settings} />
      <main id="contenido">{children}</main>
      <SiteFooter settings={settings} />
      <PointerSpotlight />
    </>
  )
}
