'use client'

import { useMemo, useState } from 'react'

import { CERTIFICATION_CATEGORIES } from '@/lib/taxonomy'

import { CertificationsGrid, type CertificationView } from './certifications-grid'

const ALL = 'all'

/** Catálogo completo filtrable por categoría y entidad emisora (FR-07). */
export function CertificationsCatalog({ certifications }: { certifications: CertificationView[] }) {
  const [category, setCategory] = useState<string>(ALL)
  const [issuer, setIssuer] = useState<string>(ALL)

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

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2.5">
          {[{ value: ALL, title: 'Todas' }, ...categories].map((item) => {
            const active = category === item.value
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item.value)}
                className={`btn h-9 rounded-full border px-4 text-[0.85rem] ${
                  active
                    ? 'border-mint bg-mint font-extrabold text-[#062a1d]'
                    : 'border-white/12 bg-white/[0.025] text-muted hover:border-white/30 hover:text-foreground'
                }`}
              >
                {item.title}
              </button>
            )
          })}
        </div>
        <label className="flex items-center gap-3 text-sm font-bold text-muted">
          Entidad emisora
          <select
            value={issuer}
            onChange={(event) => setIssuer(event.target.value)}
            className="h-10 rounded-xl border border-white/12 bg-surface px-3 font-semibold text-foreground outline-none focus:border-accent-bright/70"
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
      <p className="mt-6 mb-5 text-sm font-semibold text-subtle" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'certificación' : 'certificaciones'}
      </p>
      {visible.length > 0 ? (
        <CertificationsGrid
          certifications={visible}
          className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      ) : (
        <p className="text-muted">No hay certificaciones con estos filtros.</p>
      )}
    </div>
  )
}
