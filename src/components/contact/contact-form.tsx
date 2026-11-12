'use client'

import { useId, useState } from 'react'

import { useI18n } from '@/i18n/client'
import { CONTACT_LIMITS } from '@/lib/contact/limits'

type FieldName = 'name' | 'email' | 'subject' | 'message'
type FieldErrors = Partial<Record<FieldName, string[]>>

type Status =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'success' }
  | { state: 'error'; message: string; fieldErrors?: FieldErrors }
  | { state: 'unavailable'; fallback: string | null }

type ApiResponse = { message?: string; fieldErrors?: FieldErrors; fallback?: string | null }

/** Formulario de contacto conectado a `/api/contact`, con alternativa `mailto:` (FR-08). */
export function ContactForm({ contactEmail }: { contactEmail: string | null }) {
  const { t: dict } = useI18n()
  const t = dict.contact
  const id = useId()
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const mailto = contactEmail ? `mailto:${contactEmail}` : null
  const fieldErrors = status.state === 'error' ? status.fieldErrors : undefined

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form))
    setStatus({ state: 'submitting' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = (await response.json().catch(() => ({}))) as ApiResponse

      if (response.ok) {
        form.reset()
        setStatus({ state: 'success' })
      } else if (response.status === 503) {
        setStatus({ state: 'unavailable', fallback: body.fallback ?? mailto })
      } else {
        setStatus({
          state: 'error',
          message: t.error,
          fieldErrors: body.fieldErrors,
        })
      }
    } catch {
      setStatus({
        state: 'error',
        message: t.network,
      })
    }
  }

  const field = (name: FieldName) => ({
    id: `${id}-${name}`,
    name,
    'aria-invalid': fieldErrors?.[name] ? true : undefined,
    'aria-describedby': fieldErrors?.[name] ? `${id}-${name}-error` : undefined,
    className:
      'w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 font-semibold outline-none transition-[border-color,background-color,box-shadow] placeholder:text-subtle focus:border-aqua/60 focus:bg-surface-3 focus:shadow-[0_0_0_4px_rgb(var(--accent-rgb)/0.16)] aria-invalid:border-danger',
  })

  const error = (name: FieldName) =>
    fieldErrors?.[name]?.[0] ? (
      <p id={`${id}-${name}-error`} className="mt-1 text-sm font-semibold text-danger">
        {t.fieldErrors[name]}
      </p>
    ) : null

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4"
      aria-describedby={`${id}-status`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-bold text-muted">
            {t.name}
          </label>
          <input
            {...field('name')}
            type="text"
            required
            autoComplete="name"
            minLength={CONTACT_LIMITS.name.min}
            maxLength={CONTACT_LIMITS.name.max}
          />
          {error('name')}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-bold text-muted">
            {t.email}
          </label>
          <input
            {...field('email')}
            type="email"
            required
            autoComplete="email"
            maxLength={CONTACT_LIMITS.email.max}
          />
          {error('email')}
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-subject`} className="mb-1.5 block text-sm font-bold text-muted">
          {t.subject} <span className="text-subtle">{t.optional}</span>
        </label>
        <input {...field('subject')} type="text" maxLength={CONTACT_LIMITS.subject.max} />
        {error('subject')}
      </div>
      <div>
        <label htmlFor={`${id}-message`} className="mb-1.5 block text-sm font-bold text-muted">
          {t.message}
        </label>
        <textarea
          {...field('message')}
          required
          rows={5}
          minLength={CONTACT_LIMITS.message.min}
          maxLength={CONTACT_LIMITS.message.max}
        />
        {error('message')}
      </div>

      {/* Honeypot: oculto para personas, visible para bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>{t.honeypot}</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status.state === 'submitting'}
          className="btn btn-primary h-12 px-7 text-base disabled:opacity-60"
        >
          {status.state === 'submitting' ? t.sending : t.send}
        </button>
        {mailto ? (
          <a
            href={mailto}
            className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            {t.orEmail(contactEmail ?? '')}
          </a>
        ) : null}
      </div>

      <div id={`${id}-status`} role="status" aria-live="polite" className="text-sm">
        {status.state === 'success' ? <p className="font-bold text-success">{t.success}</p> : null}
        {status.state === 'error' ? (
          <p className="font-semibold text-danger">{status.message}</p>
        ) : null}
        {status.state === 'unavailable' ? (
          <p className="text-muted">
            {t.unavailable}{' '}
            {status.fallback ? (
              <a href={status.fallback} className="font-bold text-aqua underline">
                {t.emailInstead}
              </a>
            ) : null}
          </p>
        ) : null}
      </div>
    </form>
  )
}
