import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

import { ProjectCoverArt } from '@/components/project-cover'
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config'
import { projectCategoryLabel } from '@/i18n/labels'
import { truncate } from '@/lib/format'
import { OG_COLORS, OG_SIZE, OgBackground, OgSignature, toIntrinsic } from '@/lib/og'
import { getSiteUrl, SITE_DEFAULTS } from '@/lib/site'
import { getOpenGraphImageUrl, hasImageAsset } from '@/sanity/lib/image'
import { getProjectBySlug, getSiteSettings } from '@/sanity/lib/data'

export const revalidate = 3600

/**
 * Imagen para compartir un proyecto (LinkedIn, X, WhatsApp): título, resumen,
 * tecnologías y la portada inclinada sobre dos capas, como una pila de
 * tarjetas en perspectiva.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<'/api/og/project/[slug]'>,
) {
  const { slug } = await params
  const langParam = request.nextUrl.searchParams.get('lang')
  const lang = isLocale(langParam) ? langParam : DEFAULT_LOCALE
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug, lang),
    getSiteSettings(lang),
  ])
  if (!project) return new Response('Not found', { status: 404 })

  const name = settings?.displayName || SITE_DEFAULTS.displayName
  const coverUrl = hasImageAsset(project.coverImage)
    ? getOpenGraphImageUrl(project.coverImage)
    : null
  const coverStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.18)',
    boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
    transform: 'rotate(-4deg)',
    display: 'flex',
  } as const

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
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 640,
          padding: '64px 0 56px 72px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#6bdeee',
            }}
          >
            {project.category.map((value) => projectCategoryLabel(value, lang)).join('  ·  ')}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 22,
              fontSize: project.title.length > 28 ? 58 : 76,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -2.5,
            }}
          >
            {project.title}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 22,
              fontSize: 28,
              lineHeight: 1.35,
              color: OG_COLORS.muted,
            }}
          >
            {truncate(project.shortDescription, 120)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
            {project.technologies.slice(0, 4).map((technology) => (
              <div
                key={technology}
                style={{
                  display: 'flex',
                  padding: '8px 18px',
                  borderRadius: 999,
                  border: `1px solid ${OG_COLORS.line}`,
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: 20,
                  color: OG_COLORS.foreground,
                }}
              >
                {technology}
              </div>
            ))}
          </div>
        </div>
        <OgSignature name={name} host={getSiteUrl().host} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: -40,
          top: 92,
          display: 'flex',
          width: 560,
          height: 440,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            borderRadius: 32,
            background: 'rgba(139,156,255,0.16)',
            border: `1px solid ${OG_COLORS.line}`,
            transform: 'rotate(-14deg) translate(-36px, 26px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            borderRadius: 32,
            background: 'rgba(98,210,248,0.18)',
            border: `1px solid ${OG_COLORS.line}`,
            transform: 'rotate(-9deg) translate(-16px, 12px)',
          }}
        />
        <div style={coverStyle}>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} width={560} height={440} alt="" style={{ objectFit: 'cover' }} />
          ) : (
            toIntrinsic(
              <ProjectCoverArt
                uid="og"
                seed={project.slug}
                categories={project.category}
                title={project.title}
                width={704}
                height={440}
              />,
            )
          )}
        </div>
      </div>
    </div>,
    { ...OG_SIZE },
  )
}
