import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { isAllowedOrigin, jsonError, NO_STORE_HEADERS } from '@/lib/http'
import { likeBodySchema, likeDocumentId, parseSlugList } from '@/lib/likes'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import { getProjectSlugs } from '@/sanity/lib/data'
import { getWriteClient } from '@/sanity/lib/write-client'

/** Lecturas: 120 por minuto. Votos: 30 por minuto por IP. */
const readLimiter = createRateLimiter({ limit: 120, windowMs: 60 * 1000 })
const writeLimiter = createRateLimiter({ limit: 30, windowMs: 60 * 1000 })

const DISABLED = { enabled: false } as const

/** Mensaje corto del error, sin cabeceras ni cuerpos de la respuesta. */
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : 'error desconocido'
}

/** Conteos de «me gusta» de varios proyectos: `GET /api/likes?slugs=a,b`. */
export async function GET(request: NextRequest) {
  const rate = readLimiter.check(getClientIp(request.headers))
  if (!rate.allowed) {
    return jsonError(429, 'rate_limited', 'Demasiadas peticiones.', {
      headers: { 'Retry-After': String(rate.retryAfterSeconds) },
    })
  }

  const slugs = parseSlugList(request.nextUrl.searchParams.get('slugs'))
  if (!slugs) return jsonError(400, 'invalid_slugs', 'Parámetro slugs inválido.')

  const client = getWriteClient()
  if (!client) return NextResponse.json(DISABLED, { headers: NO_STORE_HEADERS })

  let rows: { slug: string; count: number }[]
  try {
    rows = await client.fetch<{ slug: string; count: number }[]>(
      '*[_type == "likeCounter" && _id in $ids]{ slug, count }',
      { ids: slugs.map(likeDocumentId) },
    )
  } catch (error) {
    // Token vencido o revocado: el corazón sigue funcionando en el navegador.
    console.error('[likes] No se pudieron leer los conteos:', describeError(error))
    return NextResponse.json(DISABLED, { headers: NO_STORE_HEADERS })
  }
  const counts = Object.fromEntries(slugs.map((slug) => [slug, 0]))
  for (const row of rows) if (row.slug in counts) counts[row.slug] = Math.max(0, row.count ?? 0)

  return NextResponse.json(
    { enabled: true, counts },
    { headers: { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30' } },
  )
}

/** Suma o resta un «me gusta»: `POST { slug, action: 'like' | 'unlike' }`. */
export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return jsonError(403, 'forbidden_origin', 'Origen no permitido.')

  const rate = writeLimiter.check(getClientIp(request.headers))
  if (!rate.allowed) {
    return jsonError(429, 'rate_limited', 'Demasiados votos seguidos.', {
      headers: { 'Retry-After': String(rate.retryAfterSeconds) },
    })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonError(400, 'invalid_json', 'El cuerpo no es JSON válido.')
  }
  const parsed = likeBodySchema.safeParse(payload)
  if (!parsed.success) return jsonError(422, 'validation_error', 'Datos inválidos.')

  const client = getWriteClient()
  // Sin token de escritura: el corazón funciona solo en este navegador.
  if (!client) return NextResponse.json(DISABLED, { headers: NO_STORE_HEADERS })

  // Solo proyectos publicados: nadie puede crear contadores arbitrarios.
  const published = await getProjectSlugs()
  if (!published.some((project) => project.slug === parsed.data.slug)) {
    return jsonError(404, 'not_found', 'Proyecto no encontrado.')
  }

  const id = likeDocumentId(parsed.data.slug)
  const delta = parsed.data.action === 'like' ? 1 : -1
  try {
    const result = await client
      .transaction()
      .createIfNotExists({ _id: id, _type: 'likeCounter', slug: parsed.data.slug, count: 0 })
      .patch(id, (patch) => patch.inc({ count: delta }))
      .commit({ returnDocuments: true, visibility: 'sync' })

    const document = result.find((item) => item._id === id) as { count?: number } | undefined
    let count = document?.count ?? 0
    if (count < 0) {
      await client.patch(id).set({ count: 0 }).commit()
      count = 0
    }

    return NextResponse.json({ enabled: true, count }, { headers: NO_STORE_HEADERS })
  } catch (error) {
    console.error('[likes] No se pudo guardar el voto:', describeError(error))
    return NextResponse.json(DISABLED, { headers: NO_STORE_HEADERS })
  }
}
