import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import type { SocialLinkItem } from '@/sanity/lib/data'

import { SectionHeading } from '../section-heading'
import { SocialIcon } from '../social-icon'

/** Ecosistema social (FR-04): solo canales visibles y con URL segura. */
export function SocialSection({ socialLinks }: { socialLinks: SocialLinkItem[] }) {
  const links = socialLinks.filter((link) => isSafeExternalUrl(link.url))
  if (links.length === 0) return null

  return (
    <section aria-labelledby="redes-title" id="redes" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading id="redes-title" eyebrow="Conecta" title="Ecosistema social" />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {links.map((link) => (
            <li key={link._id}>
              <a
                href={link.url}
                {...(link.iconKey === 'email' ? {} : EXTERNAL_LINK_PROPS)}
                title={link.label ?? link.platformName}
                className="card group flex items-center gap-3 p-4 transition-colors hover:border-accent/70"
              >
                <SocialIcon
                  platform={link.iconKey}
                  className="size-6 shrink-0 text-accent transition-colors group-hover:text-accent-strong"
                />
                <span className="min-w-0">
                  <span className="block font-semibold">{link.platformName}</span>
                  {link.label ? (
                    <span className="block truncate text-xs text-muted">{link.label}</span>
                  ) : null}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
