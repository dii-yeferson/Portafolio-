import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DEFAULT_LOCALE, isLocale, localePath } from '@/i18n/config'
import { jsonError } from '@/lib/http'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import { buildSearchTerm, searchParamsSchema } from '@/lib/search'
import { projectPath } from '@/lib/site'
import { isSafeExternalUrl } from '@/lib/url'
import { searchContent } from '@/sanity/lib/data'

/** 60 búsquedas por minuto por IP. */
const limiter = createRateLimiter({ limit: 60, windowMs: 60 * 1000 })

/** Buscador dinámico de proyectos y certificaciones (FR-01). */
export async function GET(request: NextRequest) {
  const rate = limiter.check(getClientIp(request.headers))
  if (!rate.allowed) {
    return jsonError(429, 'rate_limited', 'Demasiadas búsquedas. Espera un momento.', {
      headers: { 'Retry-After': String(rate.retryAfterSeconds) },
    })
  }

  const { searchParams } = request.nextUrl
  const parsed = searchParamsSchema.safeParse({
    q: searchParams.get('q') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })
  if (!parsed.success) {
    return jsonError(400, 'invalid_query', 'Parámetros de búsqueda inválidos.', {
      extra: { fieldErrors: z.flattenError(parsed.error).fieldErrors },
    })
  }

  const term = buildSearchTerm(parsed.data.q)
  if (!term) {
    return jsonError(400, 'invalid_query', 'Escribe al menos una palabra de 2 caracteres.')
  }

  const langParam = searchParams.get('lang')
  const lang = isLocale(langParam) ? langParam : DEFAULT_LOCALE
  const results = await searchContent(term, parsed.data.limit, lang)

  return NextResponse.json(
    {
      query: parsed.data.q,
      results: results.map((item) =>
        item._type === 'project'
          ? {
              type: 'project' as const,
              id: item._id,
              title: item.title,
              description: item.shortDescription,
              href: projectPath(item.slug, lang),
            }
          : {
              type: 'certification' as const,
              id: item._id,
              title: item.title,
              description: item.issuer,
              href: isSafeExternalUrl(item.verificationUrl)
                ? item.verificationUrl
                : localePath(lang, '/#certificaciones'),
            },
      ),
    },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  )
}
