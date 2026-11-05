import { ArrowUpRight } from 'lucide-react'

import { BrandIcon } from '@/components/icons/brand-icons'
import { SectionHeading } from '@/components/ui/section-heading'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import type { SocialLinkItem } from '@/sanity/lib/data'

/** Ecosistema social (FR-04): canales visibles con íconos de marca y vista previa. */
export function SocialSection({ socialLinks }: { socialLinks: SocialLinkItem[] }) {
  const links = socialLinks.filter((link) => isSafeExternalUrl(link.url))
  if (links.length === 0) return null

  return (
    <section id="redes" aria-labelledby="redes-title" className="border-b border-white/[0.06]">
      <div className="container-page py-14 lg:py-16">
        <SectionHeading
          id="redes-title"
          eyebrow="Redes sociales"
          title="Conéctate conmigo"
          description="Puedes encontrarme en estas plataformas o escribirme directamente."
          action={{ href: '/sobre-mi#redes', label: 'Ver todas' }}
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
          {links.map((link) => (
            <li key={link._id} className="reveal">
              <a
                href={link.url}
                {...(link.iconKey === 'email' ? {} : EXTERNAL_LINK_PROPS)}
                title={link.label ? `${link.platformName}: ${link.label}` : link.platformName}
                className="panel panel-interactive group flex h-full items-center gap-2.5 rounded-xl p-3 pr-6"
              >
                <BrandIcon platform={link.iconKey} className="size-8 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-[0.84rem] leading-tight font-extrabold">
                    {link.platformName}
                  </span>
                  {link.label ? (
                    <span className="mt-0.5 block text-[0.7rem] leading-tight font-semibold text-muted">
                      {link.label}
                    </span>
                  ) : null}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="absolute top-2.5 right-2.5 size-3.5 text-subtle transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-bright"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
