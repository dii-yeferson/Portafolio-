import { describe, expect, it, vi } from 'vitest'

import {
  buildPersonJsonLd,
  buildProjectMetadata,
  buildRootMetadata,
  normalizeTwitterHandle,
  serializeJsonLd,
} from '@/lib/seo'
import { es } from '@/i18n/dictionaries/es'
import { getSiteUrl, SITE_DEFAULTS } from '@/lib/site'
import type { ProjectDetail, SiteSettings } from '@/sanity/lib/data'

vi.mock('@/sanity/env', () => ({
  projectId: 'test123',
  dataset: 'production',
  apiVersion: '2026-10-01',
  studioBasePath: '/studio',
  isSanityConfigured: true,
}))

const image = (id: string) => ({
  asset: { _ref: `image-${id}-2400x1260-jpg`, _type: 'reference' as const },
  crop: null,
  hotspot: null,
  alt: 'Texto alternativo',
  lqip: null,
})

describe('getSiteUrl', () => {
  it('prioriza NEXT_PUBLIC_SITE_URL y normaliza al origen', () => {
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://diyeferson.dev/ruta/' }).toString()).toBe(
      'https://diyeferson.dev/',
    )
  })

  it('usa el dominio de producción de Vercel como respaldo', () => {
    expect(getSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'portafolio.vercel.app' }).origin).toBe(
      'https://portafolio.vercel.app',
    )
  })

  it('recurre a localhost ante valores ausentes o inválidos', () => {
    expect(getSiteUrl({}).origin).toBe('http://localhost:3000')
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'no es url' }).origin).toBe('http://localhost:3000')
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: 'ftp://example.com' }).origin).toBe(
      'http://localhost:3000',
    )
  })
})

describe('serializeJsonLd', () => {
  it('escapa caracteres que podrían cerrar el <script> (XSS)', () => {
    const output = serializeJsonLd({ name: '</script><script>alert(1)</script>&' })
    expect(output).not.toContain('<')
    expect(output).not.toContain('>')
    expect(output).not.toContain('&')
    expect(JSON.parse(output)).toEqual({ name: '</script><script>alert(1)</script>&' })
  })

  it('escapa los separadores de línea U+2028 y U+2029', () => {
    const output = serializeJsonLd({
      text: `a${String.fromCharCode(0x2028)}b${String.fromCharCode(0x2029)}c`,
    })
    expect(output).not.toMatch(/\p{Zl}|\p{Zp}/u)
    expect(JSON.parse(output).text).toHaveLength(5)
  })
})

describe('normalizeTwitterHandle', () => {
  it('normaliza y valida el usuario de X', () => {
    expect(normalizeTwitterHandle('diyeferson')).toBe('@diyeferson')
    expect(normalizeTwitterHandle('@di_yeferson')).toBe('@di_yeferson')
    expect(normalizeTwitterHandle('con espacios')).toBeUndefined()
    expect(normalizeTwitterHandle(null)).toBeUndefined()
  })
})

describe('buildRootMetadata', () => {
  it('usa los textos de marca del PRD si el CMS está vacío', () => {
    const metadata = buildRootMetadata(null)
    expect(metadata.title).toEqual({
      default: `${SITE_DEFAULTS.displayName} · ${SITE_DEFAULTS.tagline}`,
      template: `%s | ${SITE_DEFAULTS.displayName}`,
    })
    expect(metadata.description).toBe(es.meta.description)
    // Sin imagen en el CMS se usa la generada (1200 × 630) para compartir.
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: ['/api/og?lang=es'],
    })
    expect(metadata.alternates).toMatchObject({
      canonical: '/',
      languages: { es: '/', en: '/en', 'x-default': '/' },
    })
  })

  it('genera Open Graph 1200×630 y Twitter Card grande desde el CMS', () => {
    const settings = {
      displayName: 'Di Yeferson',
      tagline: 'Big Data · Ciencia de Datos · IA Aplicada',
      summary: 'Resumen profesional '.repeat(20),
      heroPortrait: image('portrait'),
      seoMeta: {
        metaTitle: 'Di Yeferson — Data & IA',
        metaDescription: 'Descripción SEO',
        keywords: ['Big Data'],
        twitterHandle: 'diyeferson',
        ogImage: image('og'),
      },
    } as unknown as SiteSettings

    const metadata = buildRootMetadata(settings)
    const og = metadata.openGraph as { images: { url: string; width: number; height: number }[] }
    expect(og.images[0]).toMatchObject({ width: 1200, height: 630 })
    expect(og.images[0]?.url).toContain('/images/test123/production/og-2400x1260.jpg')
    expect(og.images[0]?.url).toContain('w=1200')
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      creator: '@diyeferson',
    })
    expect(metadata.description).toBe('Descripción SEO')
  })
})

describe('buildProjectMetadata', () => {
  it('define canonical, Open Graph tipo artículo e imagen de portada', () => {
    const project = {
      _id: 'p1',
      _updatedAt: '2026-10-01T10:00:00Z',
      title: 'Centinela Minero',
      slug: 'centinela-minero',
      shortDescription: 'Monitoreo y predicción para minería.',
      technologies: ['Python', 'Spark'],
      coverImage: image('cover'),
    } as unknown as ProjectDetail

    const metadata = buildProjectMetadata(project, null)
    expect(metadata.title).toBe('Centinela Minero')
    expect(metadata.alternates).toEqual({
      canonical: '/proyectos/centinela-minero',
      languages: {
        es: '/proyectos/centinela-minero',
        en: '/en/proyectos/centinela-minero',
        'x-default': '/proyectos/centinela-minero',
      },
    })
    expect(buildProjectMetadata(project, null, 'en').openGraph).toMatchObject({
      url: '/en/proyectos/centinela-minero',
      locale: 'en_US',
      images: [{ url: '/api/og/project/centinela-minero?lang=en', width: 1200, height: 630 }],
    })
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      url: '/proyectos/centinela-minero',
      modifiedTime: '2026-10-01T10:00:00Z',
    })
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' })
  })
})

describe('buildPersonJsonLd', () => {
  it('describe a la persona con formación, habilidades y perfiles', () => {
    const settings = {
      displayName: 'Di Yeferson',
      tagline: 'Big Data · Ciencia de Datos · IA Aplicada',
      education: [
        { _key: 'a', institution: 'Tecsup', program: 'Big Data' },
        { _key: 'b', institution: 'Tecsup', program: 'Otro' },
      ],
      skillGroups: [{ _key: 'c', title: 'Big Data', skills: ['Spark', 'Kafka', 'Spark'] }],
    } as unknown as SiteSettings

    const jsonLd = buildPersonJsonLd(settings, [
      {
        _id: '1',
        platformName: 'GitHub',
        url: 'https://github.com/dii-yeferson',
        iconKey: 'github',
        label: null,
      },
      {
        _id: '2',
        platformName: 'Correo',
        url: 'mailto:hola@example.com',
        iconKey: 'email',
        label: null,
      },
    ])

    expect(jsonLd).toMatchObject({
      '@type': 'Person',
      name: 'Di Yeferson',
      alumniOf: [{ '@type': 'EducationalOrganization', name: 'Tecsup' }],
      knowsAbout: ['Spark', 'Kafka'],
      sameAs: ['https://github.com/dii-yeferson'],
    })
  })
})
