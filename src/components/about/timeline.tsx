import { type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n'
import { formatShortMonthYear } from '@/lib/format'
import type { SiteSettings } from '@/sanity/lib/data'

type Entry = {
  key: string
  kind: string
  title: string
  place: string
  period: string
  description: string | null
  current: boolean
  sort: string
}

/** Une experiencia y formación en una sola línea de tiempo, de lo más reciente a lo más antiguo. */
export function buildTimeline(settings: SiteSettings, lang: Locale): Entry[] {
  const t = getDictionary(lang).about
  const experience: Entry[] = (settings?.experience ?? []).map((item) => {
    const start = formatShortMonthYear(item.startDate, lang)
    const end = item.endDate ? formatShortMonthYear(item.endDate, lang) : t.present
    return {
      key: item._key,
      kind: t.experienceTypes[item.kind] ?? item.kind,
      title: item.role,
      place: item.organization,
      period: `${start} · ${end}`,
      description: item.description,
      current: !item.endDate,
      sort: item.endDate ?? '9999',
    }
  })
  const education: Entry[] = (settings?.education ?? []).map((item) => ({
    key: item._key,
    kind: t.experienceTypes.education,
    title: item.program,
    place: item.institution,
    period: item.endYear
      ? `${item.startYear ? `${item.startYear} · ` : ''}${item.endYear}`
      : `${item.startYear ? `${item.startYear} · ` : ''}${t.ongoing}`,
    description: item.description,
    current: !item.endYear,
    sort: item.endYear ? `${item.endYear}-12-31` : '9999',
  }))
  return [...experience, ...education].sort((a, b) => b.sort.localeCompare(a.sort))
}

/** Línea de tiempo vertical con un nodo que brilla en lo que está en curso. */
export function Timeline({ settings, lang }: { settings: SiteSettings; lang: Locale }) {
  const entries = buildTimeline(settings, lang)
  if (entries.length === 0) return null

  return (
    <ol className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[0.3rem] before:w-px before:bg-linear-to-b before:from-aqua/60 before:via-line-strong before:to-transparent">
      {entries.map((entry) => (
        <li key={entry.key} className="relative pl-8">
          <span
            aria-hidden="true"
            className={`absolute top-[0.45rem] left-0 size-[0.65rem] rounded-full border-2 border-background ${
              entry.current
                ? 'bg-aqua shadow-[0_0_0_4px_rgba(107,222,238,0.18),0_0_14px_rgba(107,222,238,0.8)]'
                : 'bg-subtle'
            }`}
          />
          <p className="mono-caps text-[0.66rem] text-subtle">
            {entry.kind} · {entry.period}
          </p>
          <h3 className="mt-1.5 text-[1.2rem] leading-snug font-extrabold tracking-[-0.02em]">
            {entry.title}
          </h3>
          <p className="font-bold text-muted">{entry.place}</p>
          {entry.description ? (
            <p className="mt-2 max-w-md leading-relaxed text-muted">{entry.description}</p>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
