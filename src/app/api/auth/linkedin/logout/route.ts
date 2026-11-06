import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { DEFAULT_LOCALE, isLocale, localePath } from '@/i18n/config'
import { SESSION_COOKIE } from '@/lib/auth/session'

/** «No soy yo»: cierra la sesión de quien recomienda. */
export function GET(request: NextRequest) {
  const langParam = request.nextUrl.searchParams.get('lang')
  const lang = isLocale(langParam) ? langParam : DEFAULT_LOCALE
  const response = NextResponse.redirect(new URL(localePath(lang, '/recomendar'), request.url))
  response.cookies.delete(SESSION_COOKIE)
  return response
}
