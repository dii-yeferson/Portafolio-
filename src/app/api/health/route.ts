import { NextResponse } from 'next/server'

import { NO_STORE_HEADERS } from '@/lib/http'
import { isSanityConfigured } from '@/sanity/env'

export const dynamic = 'force-dynamic'

/** Sonda de disponibilidad para monitoreo y para las pruebas E2E. */
export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      sanity: isSanityConfigured ? 'configured' : 'not_configured',
      timestamp: new Date().toISOString(),
    },
    { headers: NO_STORE_HEADERS },
  )
}
