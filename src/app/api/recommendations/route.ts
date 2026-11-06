import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { isLinkedInPicture } from '@/lib/auth/linkedin'
import { authorKey, decodeSession, getAuthSecret, SESSION_COOKIE } from '@/lib/auth/session'
import { getMailerConfig, sendEmail } from '@/lib/contact/mailer'
import { isAllowedOrigin, jsonError, NO_STORE_HEADERS } from '@/lib/http'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import { RECOMMENDATION_LIMITS, recommendationSchema } from '@/lib/recommendations'
import { getWriteClient } from '@/sanity/lib/write-client'

/** 3 envíos cada 10 minutos por IP. */
const limiter = createRateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 })

/**
 * Guarda una recomendación como «Pendiente». La identidad viene de la sesión
 * firmada de LinkedIn (nunca del cuerpo de la petición): nadie puede firmar
 * en nombre de otra persona.
 */
export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return jsonError(403, 'forbidden_origin', 'Origen no permitido.')

  const secret = getAuthSecret()
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value, secret)
  if (!secret || !session) return jsonError(401, 'session_expired', 'Inicia sesión con LinkedIn.')

  const rate = limiter.check(getClientIp(request.headers))
  if (!rate.allowed) {
    return jsonError(429, 'rate_limited', 'Demasiados envíos.', {
      headers: { 'Retry-After': String(rate.retryAfterSeconds) },
    })
  }

  const raw = await request.text()
  if (new TextEncoder().encode(raw).byteLength > RECOMMENDATION_LIMITS.bodyBytes) {
    return jsonError(413, 'payload_too_large', 'El texto es demasiado largo.')
  }
  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return jsonError(400, 'invalid_json', 'El cuerpo no es JSON válido.')
  }
  const parsed = recommendationSchema.safeParse(payload)
  if (!parsed.success) {
    return jsonError(422, 'validation_error', 'Revisa los campos.', {
      extra: { fieldErrors: z.flattenError(parsed.error).fieldErrors },
    })
  }

  const client = getWriteClient()
  if (!client) return jsonError(503, 'not_configured', 'Las recomendaciones no están activas.')

  const key = authorKey(session.sub, secret)
  let photo: { _type: 'image'; asset: { _type: 'reference'; _ref: string } } | undefined
  if (isLinkedInPicture(session.picture)) {
    try {
      const image = await fetch(session.picture, { signal: AbortSignal.timeout(8000) })
      if (image.ok && (image.headers.get('content-type') ?? '').startsWith('image/')) {
        const asset = await client.assets.upload('image', Buffer.from(await image.arrayBuffer()), {
          filename: `recommendation-${key}.jpg`,
        })
        photo = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
      }
    } catch (error) {
      console.warn(
        '[recommendations] foto no disponible:',
        error instanceof Error ? error.message : error,
      )
    }
  }

  const data = parsed.data
  await client.createOrReplace({
    _id: `recommendation-${key}`,
    _type: 'recommendation',
    status: 'pending',
    authorKey: key,
    authorName: session.name,
    ...(photo ? { authorPhoto: photo } : {}),
    relationship: data.relationship,
    role: data.role,
    organization: data.organization || undefined,
    profileUrl: data.profileUrl || undefined,
    message: data.message,
    language: data.lang,
    verifiedWith: 'linkedin',
    submittedAt: new Date().toISOString(),
    sortOrder: 100,
  })

  // Aviso al dueño del sitio (opcional).
  const mailer = getMailerConfig()
  const recipient = process.env.CONTACT_TO_EMAIL?.trim()
  if (mailer && recipient) {
    await sendEmail(mailer, {
      to: recipient,
      replyTo: recipient,
      subject: `Nueva recomendación de ${session.name}`,
      text: `${session.name} (${data.role}${data.organization ? `, ${data.organization}` : ''}) dejó una recomendación.\n\n${data.message}\n\nApruébala en /studio → Recomendaciones → Pendiente.`,
    }).catch((error: unknown) => console.warn('[recommendations] aviso no enviado:', error))
  }

  return NextResponse.json({ ok: true }, { status: 201, headers: NO_STORE_HEADERS })
}
