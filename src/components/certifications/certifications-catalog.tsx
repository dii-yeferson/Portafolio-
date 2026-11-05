'use client'

import { useMemo, useState } from 'react'

import { SegmentedControl } from '@/components/ui/segmented-control'
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
  const options = [
    { value: ALL, label: 'Todas' },
    ...CERTIFICATION_CATEGORIES.filter(({ value }) =>
      certifications.some((item) => item.category === value),
    ).map(({ value, title }) => ({ value: value as string, label: title })),
  ]
  const visible = certifications.filter(
    (item) =>
      (category === ALL || item.category === category) &&
      (issuer === ALL || item.issuer === issuer),
  )

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          label="Filtrar por categoría"
          options={options}
          value={category}
          onChange={setCategory}
        />
        <label className="flex items-center gap-3 text-sm font-bold text-muted">
          Entidad emisora
          <select
            value={issuer}
            onChange={(event) => setIssuer(event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-4 font-bold text-foreground outline-none focus:border-aqua/60"
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
      <p className="mt-7 mb-5 text-sm font-bold text-subtle" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'certificación' : 'certificaciones'}
      </p>
      {visible.length > 0 ? (
        <CertificationsGrid certifications={visible} />
      ) : (
        <p className="text-muted">No hay certificaciones con estos filtros.</p>
      )}
    </div>
  )
}
