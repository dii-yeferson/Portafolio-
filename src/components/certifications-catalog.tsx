'use client'

import { useMemo, useRef, useState } from 'react'

import { formatMonthYear } from '@/lib/format'
import {
  CERTIFICATION_CATEGORIES,
  getCertificationCategoryLabel,
  type CertificationCategory,
} from '@/lib/taxonomy'
import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import { hasImageAsset } from '@/sanity/lib/image'
import type { CERTIFICATIONS_QUERY_RESULT } from '@/sanity/types'

import { SanityImage } from './sanity-image'

export type CertificationView = CERTIFICATIONS_QUERY_RESULT[number] & { expired: boolean }

const ALL = 'all'

/** Catálogo de certificaciones filtrable por categoría y entidad emisora (FR-07). */
export function CertificationsCatalog({ certifications }: { certifications: CertificationView[] }) {
  const [category, setCategory] = useState<CertificationCategory | typeof ALL>(ALL)
  const [issuer, setIssuer] = useState<string>(ALL)
  const [selected, setSelected] = useState<CertificationView | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const issuers = useMemo(
    () =>
      [...new Set(certifications.map((item) => item.issuer))].sort((a, b) =>
        a.localeCompare(b, 'es'),
      ),
    [certifications],
  )
  const categories = CERTIFICATION_CATEGORIES.filter(({ value }) =>
    certifications.some((item) => item.category === value),
  )

  const visible = certifications.filter(
    (item) =>
      (category === ALL || item.category === category) &&
      (issuer === ALL || item.issuer === issuer),
  )

  function openCertificate(item: CertificationView) {
    setSelected(item)
    dialogRef.current?.showModal()
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Categoría
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as CertificationCategory | typeof ALL)
            }
            className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          >
            <option value={ALL}>Todas</option>
            {categories.map(({ value, title }) => (
              <option key={value} value={value}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Entidad emisora
          <select
            value={issuer}
            onChange={(event) => setIssuer(event.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          >
            <option value={ALL}>Todas</option>
            {issuers.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-muted">No hay certificaciones con estos filtros.</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item._id}>
              <article className="card flex h-full flex-col gap-3 p-6 transition-colors hover:border-champagne/60">
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-champagne/60 bg-champagne/10 font-mono text-xs text-champagne"
                  >
                    ✓
                  </span>
                  {item.featured ? (
                    <span className="font-mono text-xs text-champagne">Destacada</span>
                  ) : null}
                </div>
                <h3 className="font-display text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-muted">
                  {item.issuer} · {getCertificationCategoryLabel(item.category)}
                </p>
                <p className="font-mono text-xs text-muted">
                  Emitida: <time dateTime={item.issueDate}>{formatMonthYear(item.issueDate)}</time>
                  {item.expiresAt ? (
                    <>
                      {' · '}
                      {item.expired ? 'Venció' : 'Vence'}:{' '}
                      <time dateTime={item.expiresAt}>{formatMonthYear(item.expiresAt)}</time>
                    </>
                  ) : null}
                </p>
                {item.credentialId ? (
                  <p className="font-mono text-xs break-all text-muted">ID: {item.credentialId}</p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-4 pt-2 text-sm font-semibold">
                  {isSafeExternalUrl(item.verificationUrl) ? (
                    <a
                      href={item.verificationUrl}
                      {...EXTERNAL_LINK_PROPS}
                      className="text-accent-strong hover:underline"
                    >
                      Verificar credencial
                    </a>
                  ) : null}
                  {hasImageAsset(item.certificateImage) ? (
                    <button
                      type="button"
                      onClick={() => openCertificate(item)}
                      className="hover:underline"
                    >
                      Ver certificado
                    </button>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setSelected(null)}
        aria-label={selected ? `Certificado: ${selected.title}` : 'Certificado'}
        className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-4 text-foreground backdrop:bg-background/85"
      >
        {selected ? (
          <figure>
            <SanityImage
              image={selected.certificateImage}
              width={1600}
              height={1131}
              sizes="(min-width: 960px) 56rem, 100vw"
              className="h-auto w-full rounded-lg"
            />
            <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-muted">
              <span>{selected.title}</span>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="rounded-full border border-border px-3 py-1 text-foreground"
              >
                Cerrar
              </button>
            </figcaption>
          </figure>
        ) : null}
      </dialog>
    </div>
  )
}
