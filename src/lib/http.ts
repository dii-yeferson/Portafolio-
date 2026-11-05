import { NextResponse } from 'next/server'

import { getSiteUrl } from './site'

export const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const

/** Respuesta JSON de error con forma uniforme: `{ error, message, ...extra }`. */
export function jsonError(
  status: number,
  error: string,
  message: string,
  init: { extra?: Record<string, unknown>; headers?: Record<string, string> } = {},
) {
  return NextResponse.json(
    { error, message, ...init.extra },
    { status, headers: { ...NO_STORE_HEADERS, ...init.headers } },
  )
}

/**
 * Acepta peticiones sin `Origin` (clientes no navegador) o del mismo origen
 * que la propia petición o que la URL canónica del sitio.
 */
export function isAllowedOrigin(request: Request, siteUrl: URL = getSiteUrl()): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    return false
  }
  const allowedHosts = new Set([new URL(request.url).host, siteUrl.host])
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost) allowedHosts.add(forwardedHost)
  return allowedHosts.has(originHost)
}
