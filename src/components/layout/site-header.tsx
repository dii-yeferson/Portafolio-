import type { SiteSettings, SocialLinkItem } from '@/sanity/lib/data'
import { SITE_DEFAULTS } from '@/lib/site'
import { isSafeExternalUrl } from '@/lib/url'

import { HeaderBar } from './header-bar'

/** Barra superior fija (FR-01): datos del CMS + interacción en el cliente. */
export function SiteHeader({
  settings,
  socialLinks,
}: {
  settings: SiteSettings
  socialLinks: SocialLinkItem[]
}) {
  return (
    <HeaderBar
      name={settings?.displayName || SITE_DEFAULTS.displayName}
      socialLinks={socialLinks
        .filter((link) => isSafeExternalUrl(link.url))
        .map(({ _id, platformName, iconKey, url }) => ({ _id, platformName, iconKey, url }))}
    />
  )
}
