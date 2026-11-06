import { type NextRequest, NextResponse } from 'next/server'

/**
 * Enrutado por idioma (Next 16 `proxy`).
 *
 * - `/en/...` se sirve tal cual (segmento `[lang] = en`).
 * - `/es/...` se sirve igual; su `canonical` apunta a la versión sin prefijo.
 * - El resto se reescribe en silencio a `/es/...`: el español no lleva prefijo.
 */
const PASSTHROUGH = new Set(['/cv'])

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (PASSTHROUGH.has(pathname)) return NextResponse.next()

  if (pathname === '/en' || pathname.startsWith('/en/')) return NextResponse.next()

  // `/es/...` también se sirve (la URL canónica de esas páginas es la que no lleva prefijo).
  if (pathname === '/es' || pathname.startsWith('/es/')) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/es${pathname === '/' ? '' : pathname}`
  url.search = search
  return NextResponse.rewrite(url)
}

export const config = {
  // Fuera: API, Studio, recursos de Next y archivos con extensión (imágenes, robots.txt, sitemap.xml…).
  matcher: ['/((?!api|studio|_next|.*\\..*).*)'],
}
