import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { DEFAULT_LOCALE, isLocale, type Locale, localePath } from '@/i18n/config'
import { fetchLinkedInProfile, getLinkedInConfig } from '@/lib/auth/linkedin'
import {
  COOKIE_BASE,
  encodeSession,
  getAuthSecret,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  STATE_COOKIE,
} from '@/lib/auth/session'

function back(request: NextRequest, lang: Locale, error?: string) {
  const target = `${localePath(lang, '/recomendar')}${error ? `?error=${error}` : ''}`
  const response = NextResponse.redirect(new URL(target, request.url))
  response.cookies.delete(STATE_COOKIE)
  return response
}

/** Vuelta desde LinkedIn: verifica el `state`, lee el perfil y abre una sesión firmada de 30 min. */
export async function GET(request: NextRequest) {
  const stored = request.cookies.get(STATE_COOKIE)?.value ?? ''
  const [expectedState, storedLang] = stored.split('.')
  const lang = isLocale(storedLang) ? storedLang : DEFAULT_LOCALE
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const config = getLinkedInConfig()
  const secret = getAuthSecret()
  if (!config || !secret) return back(request, lang, 'config')
  if (!code || !state || !expectedState || state !== expectedState)
    return back(request, lang, 'auth')

  try {
    const profile = await fetchLinkedInProfile(config, code)
    const response = back(request, lang)
    response.cookies.set(
      SESSION_COOKIE,
      encodeSession(
        { ...profile, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS },
        secret,
      ),
      { ...COOKIE_BASE, maxAge: SESSION_TTL_SECONDS },
    )
    return response
  } catch (error) {
    console.error('[linkedin]', error instanceof Error ? error.message : error)
    return back(request, lang, 'auth')
  }
}
