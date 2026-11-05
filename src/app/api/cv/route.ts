import { NextResponse } from 'next/server'

import { jsonError, NO_STORE_HEADERS } from '@/lib/http'
import { buildResumeDownloadUrl } from '@/lib/resume'
import { getSiteSettings } from '@/sanity/lib/data'

/**
 * Descarga directa del CV activo (FR-01 / FR-08).
 * Redirige al PDF alojado en Sanity Assets con `?dl=` para forzar la descarga;
 * así el enlace del sitio (`/cv`) nunca cambia aunque se reemplace el archivo.
 */
export async function GET() {
  const settings = await getSiteSettings()
  const target = buildResumeDownloadUrl(settings?.resume?.url, settings?.displayName)

  if (!target) {
    return jsonError(404, 'resume_not_found', 'El CV aún no está disponible.')
  }

  return NextResponse.redirect(target, { status: 307, headers: NO_STORE_HEADERS })
}
