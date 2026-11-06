'use client'

import { BadgeCheck } from 'lucide-react'
import { useId, useState } from 'react'

import { useI18n } from '@/i18n/client'
import { RECOMMENDATION_LIMITS } from '@/lib/recommendations'
import { RECOMMENDATION_RELATIONSHIPS } from '@/lib/taxonomy'

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'expired'

/** Formulario de recomendación: la identidad ya viene verificada por LinkedIn. */
export function RecommendationForm({ name, picture }: { name: string; picture: string | null }) {
  const { lang, t } = useI18n()
  const copy = t.recommendations.page
  const id = useId()
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setStatus('submitting')
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship: form.get('relationship'),
          role: form.get('role'),
          organization: form.get('organization') || undefined,
          profileUrl: form.get('profileUrl') || undefined,
          message: form.get('message'),
          consent: form.get('consent') === 'on',
          lang,
        }),
      })
      setStatus(response.ok ? 'success' : response.status === 401 ? 'expired' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const input =
    'w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 font-semibold outline-none transition-[border-color,background-color,box-shadow] placeholder:text-subtle focus:border-aqua/60 focus:bg-surface-3 focus:shadow-[0_0_0_4px_rgb(107_222_238/0.14)]'

  if (status === 'success') {
    return (
      <p role="status" className="surface-card p-8 text-[1.15rem] font-bold text-success">
        {copy.success}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="surface-card grid grid-cols-1 gap-5 p-6 sm:p-9">
      <div className="flex items-center gap-4">
        {picture ? (
          // Foto pública de LinkedIn mostrada tal cual (no se optimiza con next/image).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={picture} alt="" className="size-14 rounded-full object-cover" />
        ) : (
          <span className="grid size-14 place-items-center rounded-full bg-surface-3 text-xl font-black">
            {name.slice(0, 1)}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-subtle">{copy.signedInAs}</p>
          <p className="truncate text-[1.15rem] font-extrabold">{name}</p>
          <p className="inline-flex items-center gap-1.5 text-[0.8rem] font-bold text-aqua">
            <BadgeCheck className="size-4" aria-hidden="true" />
            {t.recommendations.verified}
          </p>
        </div>
        <a
          href={`/api/auth/linkedin/logout?lang=${lang}`}
          className="ml-auto shrink-0 text-sm font-bold text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          {copy.signOut}
        </a>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${id}-relationship`}
            className="mb-1.5 block text-sm font-bold text-muted"
          >
            {copy.relationship}
          </label>
          <select id={`${id}-relationship`} name="relationship" required className={input}>
            {RECOMMENDATION_RELATIONSHIPS.map((item) => (
              <option key={item.value} value={item.value}>
                {t.recommendations.relationships[item.value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-role`} className="mb-1.5 block text-sm font-bold text-muted">
            {copy.role}
          </label>
          <input
            id={`${id}-role`}
            name="role"
            required
            minLength={2}
            maxLength={RECOMMENDATION_LIMITS.role}
            placeholder={copy.rolePlaceholder}
            className={input}
          />
        </div>
        <div>
          <label
            htmlFor={`${id}-organization`}
            className="mb-1.5 block text-sm font-bold text-muted"
          >
            {copy.organization}
          </label>
          <input
            id={`${id}-organization`}
            name="organization"
            maxLength={RECOMMENDATION_LIMITS.organization}
            placeholder={copy.organizationPlaceholder}
            className={input}
          />
        </div>
        <div>
          <label htmlFor={`${id}-profile`} className="mb-1.5 block text-sm font-bold text-muted">
            {copy.profileUrl}
          </label>
          <input
            id={`${id}-profile`}
            name="profileUrl"
            type="url"
            inputMode="url"
            pattern="https://(www\.)?([a-z]{2,3}\.)?linkedin\.com/in/.+"
            placeholder="https://www.linkedin.com/in/…"
            aria-describedby={`${id}-profile-hint`}
            className={input}
          />
          <p id={`${id}-profile-hint`} className="mt-1 text-xs font-semibold text-subtle">
            {copy.profileUrlHint}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="mb-1.5 block text-sm font-bold text-muted">
          {copy.message}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={6}
          minLength={RECOMMENDATION_LIMITS.message.min}
          maxLength={RECOMMENDATION_LIMITS.message.max}
          placeholder={copy.messagePlaceholder}
          className={input}
        />
      </div>

      <label className="flex items-start gap-3 text-sm font-semibold text-muted">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 size-4 accent-[var(--color-aqua)]"
        />
        {copy.consent}
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn btn-primary h-12 px-7 text-base disabled:opacity-60"
        >
          {status === 'submitting' ? copy.submitting : copy.submit}
        </button>
        <p role="status" aria-live="polite" className="text-sm font-semibold text-danger">
          {status === 'error' ? copy.error : status === 'expired' ? copy.expired : ''}
        </p>
      </div>
    </form>
  )
}
