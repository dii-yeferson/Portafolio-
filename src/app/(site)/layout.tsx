import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { getSiteSettings, getSocialLinks } from '@/sanity/lib/data'

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getSocialLinks()])

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-bold focus:text-white"
      >
        Saltar al contenido
      </a>
      <SiteHeader settings={settings} socialLinks={socialLinks} />
      <main id="contenido">{children}</main>
      <SiteFooter settings={settings} socialLinks={socialLinks} />
    </>
  )
}
