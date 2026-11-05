'use client'

import { ArrowUpRight, Eye, X } from 'lucide-react'
import { useRef, useState } from 'react'

import { Medal, TechIcon } from '@/components/icons/tech-icons'
import { SanityImage } from '@/components/sanity-image'
import { getCertificationCategoryLabel } from '@/lib/taxonomy'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import { hasImageAsset } from '@/sanity/lib/image'
import type { CERTIFICATIONS_QUERY_RESULT } from '@/sanity/types'

export type CertificationView = CERTIFICATIONS_QUERY_RESULT[number] & {
  expired: boolean
  issuedLabel: string
}

/** Tarjetas de certificaciones con visor del certificado (FR-07). */
export function CertificationsGrid({
  certifications,
  className = 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
}: {
  certifications: CertificationView[]
  className?: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState<CertificationView | null>(null)

  function open(item: CertificationView) {
    setSelected(item)
    dialogRef.current?.showModal()
  }

  return (
    <>
      <ul className={`grid gap-4 ${className}`}>
        {certifications.map((item) => (
          <li key={item._id} className="reveal">
            <article className="panel panel-interactive flex h-full flex-col p-5 hover:border-champagne/55">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-12 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                  <TechIcon icon={item.iconKey} className="size-7" />
                </span>
                <Medal className="h-10 w-8 drop-shadow-[0_6px_14px_rgba(156,137,108,0.35)]" />
              </div>
              <h3 className="mt-5 text-[1rem] leading-snug font-extrabold">{item.title}</h3>
              <p className="mt-1.5 text-xs font-semibold text-muted">{item.issuer}</p>
              <p className="sr-only">Categoría: {getCertificationCategoryLabel(item.category)}</p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                <p className="text-xs font-bold text-foreground/80">
                  <time dateTime={item.issueDate} title={item.issuedLabel}>
                    {item.issueDate.slice(0, 4)}
                  </time>
                  {item.expired ? (
                    <span className="ml-2 text-champagne-light">· Vencida</span>
                  ) : null}
                </p>
                {isSafeExternalUrl(item.verificationUrl) ? (
                  <a
                    href={item.verificationUrl}
                    {...EXTERNAL_LINK_PROPS}
                    aria-label={`Verificar ${item.title}`}
                    className="btn btn-outline size-9 rounded-lg p-0"
                  >
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                ) : hasImageAsset(item.certificateImage) ? (
                  <button
                    type="button"
                    onClick={() => open(item)}
                    aria-label={`Ver certificado ${item.title}`}
                    className="btn btn-outline size-9 rounded-lg p-0"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setSelected(null)}
        aria-label={selected ? `Certificado: ${selected.title}` : 'Certificado'}
        className="glass m-auto w-[min(60rem,calc(100vw-2rem))] rounded-2xl p-4 text-foreground backdrop:bg-background/85 backdrop:backdrop-blur-sm"
      >
        {selected ? (
          <figure>
            <SanityImage
              image={selected.certificateImage}
              width={1600}
              height={1131}
              sizes="(min-width: 1000px) 60rem, 100vw"
              className="h-auto w-full rounded-xl"
            />
            <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm font-semibold text-muted">
              <span>
                {selected.title} · {selected.issuer} · {selected.issuedLabel}
              </span>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="glass grid size-9 place-items-center rounded-full text-foreground"
                aria-label="Cerrar"
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
