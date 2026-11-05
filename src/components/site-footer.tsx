import { SITE_DEFAULTS } from '@/lib/site'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import type { SiteSettings, SocialLinkItem } from '@/sanity/lib/data'

import { SocialIcon } from './social-icon'

export function SiteFooter({
  settings,
  socialLinks,
}: {
  settings: SiteSettings
  socialLinks: SocialLinkItem[]
}) {
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const links = socialLinks.filter((link) => isSafeExternalUrl(link.url))

  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} {name}. Todos los derechos reservados.
        </p>
        {links.length > 0 ? (
          <ul className="flex gap-3" aria-label="Redes sociales">
            {links.map((link) => (
              <li key={link._id}>
                <a
                  href={link.url}
                  {...(link.iconKey === 'email' ? {} : EXTERNAL_LINK_PROPS)}
                  aria-label={link.platformName}
                  className="block rounded-full p-2 transition-colors hover:text-accent-strong"
                >
                  <SocialIcon platform={link.iconKey} className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </footer>
  )
}
