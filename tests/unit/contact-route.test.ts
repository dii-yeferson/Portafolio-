import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSiteSettings } = vi.hoisted(() => ({ getSiteSettings: vi.fn() }))
vi.mock('@/sanity/lib/data', () => ({ getSiteSettings }))

const { POST } = await import('@/app/api/contact/route')

const VALID = {
  name: 'Ana Torres',
  email: 'ana@example.com',
  subject: 'Dashboard',
  message: 'Necesito un tablero de Power BI para producción minera.',
}

let ipCounter = 0

function contactRequest(
  body: unknown,
  { headers = {}, ip }: { headers?: Record<string, string>; ip?: string } = {},
) {
  ipCounter += 1
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip ?? `198.51.100.${ipCounter}`,
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    getSiteSettings.mockResolvedValue({
      displayName: 'Di Yeferson',
      contactEmail: 'owner@example.com',
    })
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
    vi.stubEnv('CONTACT_FROM_EMAIL', 'Portafolio <hola@example.com>')
    vi.stubEnv('CONTACT_TO_EMAIL', '')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('envía el correo vía Resend con reply_to del visitante (200)', async () => {
    const fetchMock = vi.fn(async () => new Response('{"id":"1"}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(contactRequest(VALID))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.resend.com/emails')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer re_test_key' })
    expect(JSON.parse(String(init.body))).toMatchObject({
      from: 'Portafolio <hola@example.com>',
      to: ['owner@example.com'],
      reply_to: 'ana@example.com',
      subject: '[Di Yeferson] Dashboard — Ana Torres',
    })
  })

  it('CONTACT_TO_EMAIL tiene prioridad sobre el correo del CMS', async () => {
    vi.stubEnv('CONTACT_TO_EMAIL', 'inbox@example.com')
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await POST(contactRequest(VALID))

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(String(init.body)).to).toEqual(['inbox@example.com'])
  })

  it('valida los campos y devuelve errores por campo (422)', async () => {
    const response = await POST(contactRequest({ ...VALID, email: 'mal', message: 'corto' }))
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error).toBe('validation_error')
    expect(Object.keys(body.fieldErrors)).toEqual(expect.arrayContaining(['email', 'message']))
  })

  it('rechaza JSON mal formado (400) y otros content-type (415)', async () => {
    expect((await POST(contactRequest('{nope'))).status).toBe(400)
    const textRequest = contactRequest('hola', { headers: { 'content-type': 'text/plain' } })
    expect((await POST(textRequest)).status).toBe(415)
  })

  it('rechaza orígenes cruzados (403)', async () => {
    const response = await POST(
      contactRequest(VALID, { headers: { origin: 'https://evil.example' } }),
    )
    expect(response.status).toBe(403)
  })

  it('acepta el mismo origen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 200 })),
    )
    const response = await POST(contactRequest(VALID, { headers: { origin: 'http://localhost' } }))
    expect(response.status).toBe(200)
  })

  it('rechaza cuerpos demasiado grandes (413)', async () => {
    const response = await POST(contactRequest({ ...VALID, message: 'x'.repeat(20_000) }))
    expect(response.status).toBe(413)
  })

  it('descarta en silencio los envíos con honeypot (200 sin enviar)', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await POST(contactRequest({ ...VALID, website: 'https://spam.example' }))
    expect(response.status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sin proveedor configurado responde 503 con alternativa mailto', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const response = await POST(contactRequest(VALID))
    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      error: 'contact_unavailable',
      fallback: 'mailto:owner@example.com',
    })
  })

  it('si el proveedor falla responde 502', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('error', { status: 500 })),
    )
    const response = await POST(contactRequest(VALID))
    expect(response.status).toBe(502)
  })

  it('limita a 5 mensajes por IP cada 10 minutos (429 + Retry-After)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 200 })),
    )
    const ip = '203.0.113.250'
    for (let i = 0; i < 5; i += 1) {
      expect((await POST(contactRequest(VALID, { ip }))).status).toBe(200)
    }
    const blocked = await POST(contactRequest(VALID, { ip }))
    expect(blocked.status).toBe(429)
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0)
  })
})
