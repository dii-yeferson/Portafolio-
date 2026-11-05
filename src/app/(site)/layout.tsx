import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getSiteSettings, getSocialLinks } from '@/sanity/lib/data'

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getSocialLinks()])

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-background"
      >
        Saltar al contenido
      </a>
      <SiteHeader settings={settings} />
      <main id="contenido">{children}</main>
      <SiteFooter settings={settings} socialLinks={socialLinks} />
    </>
  )
}
