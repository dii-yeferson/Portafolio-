import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { DEFAULT_LOCALE, isLocale, localePath } from '@/i18n/config'
import { buildAuthorizeUrl, getLinkedInConfig } from '@/lib/auth/linkedin'
import { COOKIE_BASE, getAuthSecret, randomState, STATE_COOKIE } from '@/lib/auth/session'

/** Inicia «Continuar con LinkedIn»: guarda un `state` anti-CSRF y redirige a LinkedIn. */
export function GET(request: NextRequest) {
  const langParam = request.nextUrl.searchParams.get('lang')
  const lang = isLocale(langParam) ? langParam : DEFAULT_LOCALE
  const config = getLinkedInConfig()
  if (!config || !getAuthSecret()) {
    return NextResponse.redirect(
      new URL(`${localePath(lang, '/recomendar')}?error=config`, request.url),
    )
  }

  const state = randomState()
  const response = NextResponse.redirect(buildAuthorizeUrl(config, state))
  response.cookies.set(STATE_COOKIE, `${state}.${lang}`, { ...COOKIE_BASE, maxAge: 600 })
  return response
}
