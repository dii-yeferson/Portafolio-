'use client'

import { useId, useState } from 'react'

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
          message: body.message ?? 'No se pudo enviar el mensaje.',
          fieldErrors: body.fieldErrors,
        })
      }
    } catch {
      setStatus({
        state: 'error',
        message: 'Error de red. Revisa tu conexión e inténtalo de nuevo.',
      })
    }
  }

  const field = (name: FieldName) => ({
    id: `${id}-${name}`,
    name,
    'aria-invalid': fieldErrors?.[name] ? true : undefined,
    'aria-describedby': fieldErrors?.[name] ? `${id}-${name}-error` : undefined,
    className:
      'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-semibold outline-none transition-colors placeholder:text-subtle focus:border-accent-bright/70 focus:bg-white/[0.05] aria-invalid:border-red-400',
  })

  const error = (name: FieldName) =>
    fieldErrors?.[name]?.[0] ? (
      <p id={`${id}-${name}-error`} className="mt-1 text-sm text-red-300">
        {fieldErrors[name][0]}
      </p>
    ) : null

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" aria-describedby={`${id}-status`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-bold text-muted">
            Nombre
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
            Correo
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
          Asunto <span className="text-muted/70">(opcional)</span>
        </label>
        <input {...field('subject')} type="text" maxLength={CONTACT_LIMITS.subject.max} />
        {error('subject')}
      </div>
      <div>
        <label htmlFor={`${id}-message`} className="mb-1.5 block text-sm font-bold text-muted">
          Mensaje
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
        <label htmlFor={`${id}-website`}>No completar</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status.state === 'submitting'}
          className="btn btn-primary h-12 px-7 text-base disabled:opacity-60"
        >
          {status.state === 'submitting' ? 'Enviando…' : 'Enviar mensaje'}
        </button>
        {mailto ? (
          <a
            href={mailto}
            className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            o escríbeme a {contactEmail}
          </a>
        ) : null}
      </div>

      <div id={`${id}-status`} role="status" aria-live="polite" className="text-sm">
        {status.state === 'success' ? (
          <p className="text-accent-strong">
            ¡Gracias! Tu mensaje fue enviado. Te responderé pronto.
          </p>
        ) : null}
        {status.state === 'error' ? <p className="text-red-300">{status.message}</p> : null}
        {status.state === 'unavailable' ? (
          <p className="text-muted">
            El formulario no está disponible ahora.{' '}
            {status.fallback ? (
              <a href={status.fallback} className="text-accent-strong underline">
                Escríbeme por correo
              </a>
            ) : null}
          </p>
        ) : null}
      </div>
    </form>
  )
}
