import { SITE_DEFAULTS } from '@/lib/site'
import type { SiteSettings } from '@/sanity/lib/data'

import { HeaderBar } from './header-bar'

/** Barra superior (FR-01): datos del CMS + interacción en el cliente. */
export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return <HeaderBar name={settings?.displayName || SITE_DEFAULTS.displayName} />
}
