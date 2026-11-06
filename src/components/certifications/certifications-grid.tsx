'use client'

import { ArrowUpRight, Eye, X } from 'lucide-react'
import { useRef, useState } from 'react'

import { Medal, TechIcon } from '@/components/icons/tech-icons'
import { SanityImage } from '@/components/sanity-image'
import { useI18n } from '@/i18n/client'
import { certificationCategoryLabel } from '@/i18n/labels'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import { hasImageAsset } from '@/sanity/lib/image'
import type { CERTIFICATIONS_QUERY_RESULT } from '@/sanity/types'

export type CertificationView = CERTIFICATIONS_QUERY_RESULT[number] & {
  expired: boolean
  issuedLabel: string
}

/** Lista elegante de certificaciones con visor del certificado (FR-07). */
export function CertificationsGrid({
  certifications,
  className = 'lg:grid-cols-2',
}: {
  certifications: CertificationView[]
  className?: string
}) {
  const { lang, t } = useI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState<CertificationView | null>(null)

  function open(item: CertificationView) {
    setSelected(item)
    dialogRef.current?.showModal()
  }

  return (
    <>
      <ul className={`grid grid-cols-1 gap-3 ${className}`}>
        {certifications.map((item) => {
          const verifyUrl = isSafeExternalUrl(item.verificationUrl) ? item.verificationUrl : null
          const hasImage = hasImageAsset(item.certificateImage)
          return (
            <li key={item._id} className="reveal">
              <article className="surface-card card-hover spotlight group flex h-full items-center gap-4 rounded-[1.25rem] p-4 pr-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-line bg-surface-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
                  <TechIcon icon={item.iconKey} className="size-7" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-[1.02rem] leading-snug font-extrabold tracking-[-0.01em] sm:truncate">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-[0.86rem] font-semibold text-muted sm:truncate">
                    {item.issuer}
                    <span aria-hidden="true" className="mx-1.5 text-subtle">
                      ·
                    </span>
                    <time dateTime={item.issueDate} title={item.issuedLabel}>
                      {item.issueDate.slice(0, 4)}
                    </time>
                    {item.expired ? (
                      <span className="ml-1.5 text-champagne">· {t.certifications.expired}</span>
                    ) : null}
                  </p>
                  <p className="sr-only">
                    {t.certifications.category(certificationCategoryLabel(item.category, lang))}
                  </p>
                </div>
                <Medal className="hidden h-9 w-7 shrink-0 opacity-90 sm:block transition-transform duration-500 ease-[cubic-bezier(.22,1.12,.36,1)] group-hover:-rotate-6" />
                {verifyUrl ? (
                  <a
                    href={verifyUrl}
                    {...EXTERNAL_LINK_PROPS}
                    aria-label={t.certifications.verify(item.title)}
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:bg-ink/[0.08] hover:text-foreground"
                  >
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                ) : hasImage ? (
                  <button
                    type="button"
                    onClick={() => open(item)}
                    aria-label={t.certifications.viewCertificate(item.title)}
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:bg-ink/[0.08] hover:text-foreground"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </article>
            </li>
          )
        })}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setSelected(null)}
        aria-label={selected ? t.certifications.certificate(selected.title) : undefined}
        className="glass m-auto w-[min(60rem,calc(100vw-2rem))] rounded-[1.75rem] p-4 text-foreground backdrop:bg-scrim backdrop:backdrop-blur-sm"
      >
        {selected ? (
          <figure>
            <SanityImage
              image={selected.certificateImage}
              width={1600}
              height={1131}
              sizes="(min-width: 1000px) 60rem, 100vw"
              className="h-auto w-full rounded-2xl"
            />
            <figcaption className="mt-3 flex items-center justify-between gap-4 px-1 text-sm font-semibold text-muted">
              <span>
                {selected.title} · {selected.issuer} · {selected.issuedLabel}
              </span>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="glass grid size-9 place-items-center rounded-full text-foreground"
                aria-label={t.common.close}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </figcaption>
          </figure>
        ) : null}
      </dialog>
    </>
  )
}
