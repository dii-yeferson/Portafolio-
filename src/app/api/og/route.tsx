import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

import { splitAccent } from '@/i18n/accent'
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config'
import { normalizeMottos } from '@/lib/mottos'
import { OG_COLORS, OG_SIZE, OgBackground, OgSignature } from '@/lib/og'
import { getSiteUrl, SITE_DEFAULTS } from '@/lib/site'
import { getSiteSettings } from '@/sanity/lib/data'

export const revalidate = 3600

/** Imagen para compartir la portada: nombre, especialidad, lema y retrato. */
export async function GET(request: NextRequest) {
  const langParam = request.nextUrl.searchParams.get('lang')
  const lang = isLocale(langParam) ? langParam : DEFAULT_LOCALE
  const settings = await getSiteSettings(lang)
  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const tagline = settings?.tagline || SITE_DEFAULTS.tagline
  const [first] = normalizeMottos(settings?.heroPhrases, SITE_DEFAULTS.motto)
  const parts = splitAccent(first ?? SITE_DEFAULTS.motto)
  const motto = parts
    .filter((part) => !part.accent)
    .map((part) => part.text)
    .join('')
    .trim()
  const accent = parts.find((part) => part.accent)?.text
  const portrait = await readFile(path.join(process.cwd(), 'public/images/portrait-og.png'))
  const portraitSrc = `data:image/png;base64,${portrait.toString('base64')}`

  return new ImageResponse(
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        color: OG_COLORS.foreground,
        backgroundColor: OG_COLORS.background,
      }}
    >
      <OgBackground />
      <div
        style={{
          position: 'absolute',
          right: 70,
          top: 70,
          display: 'flex',
          width: 470,
          height: 470,
          borderRadius: 999,
          border: '1px solid rgba(201,142,110,0.35)',
          background:
            'radial-gradient(circle at 35% 30%, rgba(70,48,36,0.9), rgba(16,17,15,0.95) 70%)',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={portraitSrc}
        width={470}
        height={537}
        alt=""
        style={{ position: 'absolute', right: 70, bottom: 0 }}
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 660,
          padding: '72px 0 56px 72px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#f0b08a',
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 20,
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 0.95,
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 30,
              fontSize: 36,
              lineHeight: 1.25,
              color: OG_COLORS.muted,
            }}
          >
            <span>{motto}</span>
            {accent ? (
              <span style={{ color: '#ffd0b1', fontStyle: 'italic' }}>{accent}</span>
            ) : null}
          </div>
        </div>
        <OgSignature name={name} host={getSiteUrl().host} />
      </div>
    </div>,
    { ...OG_SIZE },
  )
}
