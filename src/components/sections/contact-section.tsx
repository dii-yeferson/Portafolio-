import { ArrowUpRight, Download } from 'lucide-react'

import { ContactDialog } from '@/components/contact/contact-dialog'
import { BrandIcon } from '@/components/icons/brand-icons'
import { Accent } from '@/i18n/accent'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { resolveCopy } from '@/lib/copy'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import type { SiteSettings, SocialLinkItem } from '@/sanity/lib/data'

/** Cierre (FR-04 + FR-08): invitación, formulario, CV y redes en un solo lugar. */
export function ContactSection({
  settings,
  socialLinks,
  lang,
}: {
  settings: SiteSettings
  socialLinks: SocialLinkItem[]
  lang: Locale
}) {
  const t = getDictionary(lang)
  const links = socialLinks.filter((link) => isSafeExternalUrl(link.url))
  const copy = resolveCopy(settings?.contactCopy, {
    label: t.contact.label,
    title: t.contact.title,
    description: t.contact.description,
  })

  return (
    <section
      id="contacto"
      aria-labelledby="contacto-title"
      className="border-t border-line py-20 lg:py-28"
    >
      <div className="container-page">
        <div className="border-aurora reveal relative isolate overflow-hidden rounded-[2rem] px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(45%_70%_at_0%_0%,rgb(var(--accent-rgb)/0.1),transparent_70%),radial-gradient(45%_70%_at_100%_100%,rgb(var(--accent-rgb)/0.12),transparent_70%)]"
          />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <p className="label">{copy.label}</p>
              <h2
                id="contacto-title"
                className="mt-4 text-[clamp(2.5rem,5.2vw,4.2rem)] leading-[0.98] font-black tracking-[-0.045em]"
              >
                <Accent text={copy.title} className="accent-serif text-aurora pr-1" />
              </h2>
              <p className="mt-5 max-w-lg text-[1.08rem] leading-relaxed text-muted">
                {copy.description}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ContactDialog contactEmail={settings?.contactEmail || null} />
                {/* Solo con CV cargado en el panel. /cv es una descarga (API), no una página. */}
                {settings?.resume?.url ? (
                  // eslint-disable-next-line @next/next/no-html-link-for-pages
                  <a href="/cv" rel="nofollow" className="btn btn-glass h-14 px-7 text-[1rem]">
                    <Download className="size-[1.1rem]" aria-hidden="true" />
                    {t.header.downloadCv}
                  </a>
                ) : null}
              </div>
            </div>

            {links.length > 0 ? (
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2" aria-label={t.contact.social}>
                {links.map((link) => (
                  <li key={link._id}>
                    <a
                      href={link.url}
                      {...(link.iconKey === 'email' ? {} : EXTERNAL_LINK_PROPS)}
                      className="group flex items-center gap-3 rounded-2xl border border-line bg-ink/[0.025] p-3 pr-4 transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:bg-ink/[0.05]"
                    >
                      <BrandIcon platform={link.iconKey} className="size-9 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.92rem] font-extrabold">
                          {link.platformName}
                        </span>
                        {link.label ? (
                          <span className="block truncate text-[0.78rem] font-semibold text-subtle">
                            {link.label}
                          </span>
                        ) : null}
                      </span>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-subtle transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
