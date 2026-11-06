'use client'

import { useMemo, useState } from 'react'

import { SegmentedControl } from '@/components/ui/segmented-control'
import { useI18n } from '@/i18n/client'
import { certificationCategoryLabel } from '@/i18n/labels'
import { LOCALE_META } from '@/i18n/config'
import { CERTIFICATION_CATEGORIES } from '@/lib/taxonomy'

import { CertificationsGrid, type CertificationView } from './certifications-grid'

const ALL = 'all'

/** Catálogo completo filtrable por categoría y entidad emisora (FR-07). */
export function CertificationsCatalog({ certifications }: { certifications: CertificationView[] }) {
  const { lang, t } = useI18n()
  const [category, setCategory] = useState<string>(ALL)
  const [issuer, setIssuer] = useState<string>(ALL)

  const issuers = useMemo(
    () =>
      [...new Set(certifications.map((item) => item.issuer))].sort((a, b) =>
        a.localeCompare(b, LOCALE_META[lang].intl),
      ),
    [certifications, lang],
  )
  const options = [
    { value: ALL, label: t.certifications.all },
    ...CERTIFICATION_CATEGORIES.filter(({ value }) =>
      certifications.some((item) => item.category === value),
    ).map(({ value }) => ({
      value: value as string,
      label: certificationCategoryLabel(value, lang),
    })),
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
          label={t.certifications.filterCategory}
          options={options}
          value={category}
          onChange={setCategory}
        />
        <label className="flex items-center gap-3 text-sm font-bold text-muted">
          {t.certifications.issuer}
          <select
            value={issuer}
            onChange={(event) => setIssuer(event.target.value)}
            className="h-11 rounded-full border border-line bg-surface px-4 font-bold text-foreground outline-none focus:border-aqua/60"
          >
            <option value={ALL}>{t.certifications.all}</option>
            {issuers.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-7 mb-5 text-sm font-bold text-subtle" aria-live="polite">
        {t.certifications.count(visible.length)}
      </p>
      {visible.length > 0 ? (
        <CertificationsGrid certifications={visible} />
      ) : (
        <p className="text-muted">{t.certifications.noResults}</p>
      )}
    </div>
  )
}
