import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

import { jsonError, NO_STORE_HEADERS } from '@/lib/http'
import { isCacheTag } from '@/sanity/lib/tags'

type WebhookPayload = { _type?: unknown; _id?: unknown }

/**
 * Webhook de Sanity → revalidación on-demand (ISR por etiquetas).
 *
 * Verifica la firma HMAC (`SANITY_REVALIDATE_SECRET`), espera la consistencia
 * eventual del Content Lake y expira la etiqueta del `_type` modificado.
 * Configuración del webhook: ver README («Revalidación con webhooks»).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim()
  if (!secret) {
    console.error('[revalidate] Falta la variable SANITY_REVALIDATE_SECRET.')
    return jsonError(500, 'not_configured', 'El webhook de revalidación no está configurado.')
  }

  let parsed: Awaited<ReturnType<typeof parseBody<WebhookPayload>>>
  try {
    parsed = await parseBody<WebhookPayload>(request, secret)
  } catch (error) {
    // JSON inválido → 400; cabecera de firma con formato inválido → 401.
    return error instanceof SyntaxError
      ? jsonError(400, 'invalid_body', 'El cuerpo del webhook no es JSON válido.')
      : jsonError(401, 'invalid_signature', 'Firma del webhook inválida o ausente.')
  }

  if (parsed.isValidSignature !== true) {
    return jsonError(401, 'invalid_signature', 'Firma del webhook inválida o ausente.')
  }

  const type = parsed.body?._type
  if (typeof type !== 'string' || type.length === 0) {
    return jsonError(400, 'missing_type', 'El webhook debe incluir el campo _type.')
  }

  if (!isCacheTag(type)) {
    // 200 para que Sanity no reintente eventos de tipos que el sitio no usa.
    return NextResponse.json(
      { revalidated: false, ignored: type, now: Date.now() },
      { headers: NO_STORE_HEADERS },
    )
  }

  // Desde un webhook se expira de inmediato: la siguiente visita obtiene datos frescos.
  revalidateTag(type, { expire: 0 })

  return NextResponse.json(
    { revalidated: true, tags: [type], now: Date.now() },
    { headers: NO_STORE_HEADERS },
  )
}
