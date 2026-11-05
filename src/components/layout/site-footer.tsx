import Link from 'next/link'

import { LogoMark } from '@/components/brand/logo'
import { BrandGlyph } from '@/components/icons/brand-icons'
import { NAV_ITEMS } from '@/lib/navigation'
import { SITE_DEFAULTS } from '@/lib/site'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import type { SiteSettings, SocialLinkItem } from '@/sanity/lib/data'

export function SiteFooter({
  settings,
  socialLinks,
}: {
  settings: SiteSettings
  socialLinks: SocialLinkItem[]
}) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const tagline = settings?.tagline || SITE_DEFAULTS.tagline
  const links = socialLinks.filter((link) => isSafeExternalUrl(link.url))

  return (
    <footer className="border-t border-white/[0.06] bg-[#040907]">
      <div className="container-page grid items-center gap-8 py-10 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-3.5">
          <LogoMark className="h-8 w-auto" />
          <div>
            <p className="text-lg font-extrabold tracking-[-0.02em]">{name}</p>
            <p className="text-xs font-semibold text-muted">{tagline}</p>
          </div>
        </div>

        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-sm font-semibold text-muted">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="underline-offset-[6px] transition-colors hover:text-foreground hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 lg:items-end">
          {links.length > 0 ? (
            <ul className="flex flex-wrap gap-4" aria-label="Redes sociales">
              {links.map((link) => (
                <li key={link._id}>
                  <a
                    href={link.url}
                    {...(link.iconKey === 'email' ? {} : EXTERNAL_LINK_PROPS)}
                    aria-label={link.platformName}
                    className="block text-foreground/85 transition-[color,transform] hover:-translate-y-0.5 hover:text-accent-bright"
                  >
                    <BrandGlyph platform={link.iconKey} className="size-[1.15rem]" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-xs text-subtle">
            © {new Date().getFullYear()} {name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
