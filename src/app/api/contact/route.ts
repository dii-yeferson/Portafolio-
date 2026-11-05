import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { MailerError, getMailerConfig, sendEmail } from '@/lib/contact/mailer'
import { buildContactEmail, CONTACT_LIMITS, contactSchema } from '@/lib/contact/schema'
import { isAllowedOrigin, jsonError, NO_STORE_HEADERS } from '@/lib/http'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import { SITE_DEFAULTS } from '@/lib/site'
import { getSiteSettings } from '@/sanity/lib/data'

/** 5 mensajes cada 10 minutos por IP. */
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

/** Formulario de contacto (FR-08): valida, limita abuso y entrega por correo. */
export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return jsonError(403, 'forbidden_origin', 'Origen no permitido.')
  }

  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return jsonError(415, 'unsupported_media_type', 'Envía el formulario como application/json.')
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > CONTACT_LIMITS.bodyBytes) {
    return jsonError(413, 'payload_too_large', 'El mensaje es demasiado grande.')
  }

  const rate = limiter.check(getClientIp(request.headers))
  if (!rate.allowed) {
    return jsonError(429, 'rate_limited', 'Demasiados mensajes. Inténtalo más tarde.', {
      headers: { 'Retry-After': String(rate.retryAfterSeconds) },
    })
  }

  const raw = await request.text()
  if (new TextEncoder().encode(raw).byteLength > CONTACT_LIMITS.bodyBytes) {
    return jsonError(413, 'payload_too_large', 'El mensaje es demasiado grande.')
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return jsonError(400, 'invalid_json', 'El cuerpo de la petición no es JSON válido.')
  }

  const parsed = contactSchema.safeParse(payload)
  if (!parsed.success) {
    return jsonError(422, 'validation_error', 'Revisa los campos del formulario.', {
      extra: { fieldErrors: z.flattenError(parsed.error).fieldErrors },
    })
  }

  // Honeypot completado: se responde éxito sin enviar nada para no alertar al bot.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS })
  }

  const settings = await getSiteSettings()
  const recipient = process.env.CONTACT_TO_EMAIL?.trim() || settings?.contactEmail
  const mailer = getMailerConfig()

  if (!mailer || !recipient) {
    return jsonError(503, 'contact_unavailable', 'El formulario no está disponible ahora mismo.', {
      extra: { fallback: settings?.contactEmail ? `mailto:${settings.contactEmail}` : null },
    })
  }

  const email = buildContactEmail(parsed.data, settings?.displayName ?? SITE_DEFAULTS.displayName)

  try {
    await sendEmail(mailer, { to: recipient, replyTo: parsed.data.email, ...email })
  } catch (error) {
    console.error('[contact]', error instanceof MailerError ? error.message : error)
    return jsonError(502, 'delivery_failed', 'No se pudo enviar el mensaje. Inténtalo de nuevo.')
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS })
}
