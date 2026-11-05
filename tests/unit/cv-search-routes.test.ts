import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const data = vi.hoisted(() => ({ getSiteSettings: vi.fn(), searchContent: vi.fn() }))
vi.mock('@/sanity/lib/data', () => data)

const { GET: getCv } = await import('@/app/api/cv/route')
const { GET: search } = await import('@/app/api/search/route')

describe('GET /api/cv', () => {
  it('redirige al PDF de Sanity forzando la descarga', async () => {
    data.getSiteSettings.mockResolvedValue({
      displayName: 'Di Yeferson',
      resume: { url: 'https://cdn.sanity.io/files/p1/production/abc.pdf' },
    })
    const response = await getCv()
    expect(response.status).toBe(307)
    const location = new URL(response.headers.get('location') ?? '')
    expect(location.hostname).toBe('cdn.sanity.io')
    expect(location.searchParams.get('dl')).toBe('CV-Di-Yeferson.pdf')
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('responde 404 si no hay CV cargado', async () => {
    data.getSiteSettings.mockResolvedValue({ displayName: 'Di Yeferson', resume: null })
    const response = await getCv()
    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toMatchObject({ error: 'resume_not_found' })
  })

  it('no redirige a dominios ajenos aunque el CMS los contenga', async () => {
    data.getSiteSettings.mockResolvedValue({ resume: { url: 'https://evil.example/files/cv.pdf' } })
    expect((await getCv()).status).toBe(404)
  })
})

describe('GET /api/search', () => {
  beforeEach(() => {
    data.searchContent.mockResolvedValue([
      {
        _id: 'p1',
        _type: 'project',
        _score: 4,
        title: 'Centinela Minero',
        slug: 'centinela-minero',
        shortDescription: 'Monitoreo y predicción para minería.',
        category: ['machine-learning'],
      },
      {
        _id: 'c1',
        _type: 'certification',
        _score: 2,
        title: 'Data Analyst',
        issuer: 'Google',
        category: 'data-science',
        issueDate: '2025-01-10',
        verificationUrl: 'javascript:alert(1)',
      },
    ])
  })

  it('devuelve resultados normalizados con enlaces seguros', async () => {
    const response = await search(
      new NextRequest('http://localhost/api/search?q=Centinela%20mine&limit=5', {
        headers: { 'x-forwarded-for': '192.0.2.10' },
      }),
    )
    expect(response.status).toBe(200)
    expect(data.searchContent).toHaveBeenCalledWith('centinela* mine*', 5)
    const body = await response.json()
    expect(body.results).toEqual([
      {
        type: 'project',
        id: 'p1',
        title: 'Centinela Minero',
        description: 'Monitoreo y predicción para minería.',
        href: '/proyectos/centinela-minero',
      },
      {
        type: 'certification',
        id: 'c1',
        title: 'Data Analyst',
        description: 'Google',
        href: '/#certificaciones',
      },
    ])
    expect(response.headers.get('cache-control')).toContain('s-maxage=60')
  })

  it.each(['', 'q=a', 'q=%21%21%21', 'q=python&limit=999'])(
    'rechaza consultas inválidas (400): %s',
    async (query) => {
      const response = await search(
        new NextRequest(`http://localhost/api/search?${query}`, {
          headers: { 'x-forwarded-for': '192.0.2.11' },
        }),
      )
      expect(response.status).toBe(400)
      expect(data.searchContent).not.toHaveBeenCalled()
    },
  )
})
