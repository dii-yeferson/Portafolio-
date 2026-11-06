import { expect, test } from '@playwright/test'
import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

import { E2E_REVALIDATE_SECRET, randomTestIp } from './constants'

const VALID_CONTACT = {
  name: 'Prueba E2E',
  email: 'e2e@example.com',
  message: 'Mensaje automático de la suite E2E del portafolio.',
}

test('GET /api/health responde ok sin caché', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toBe('no-store')
  expect(await response.json()).toMatchObject({ status: 'ok' })
})

test.describe('POST /api/revalidate', () => {
  test('rechaza peticiones sin firma', async ({ request }) => {
    const response = await request.post('/api/revalidate', { data: { _type: 'project' } })
    expect(response.status()).toBe(401)
  })

  test('rechaza firmas inválidas', async ({ request }) => {
    const response = await request.post('/api/revalidate', {
      data: { _type: 'project' },
      headers: { [SIGNATURE_HEADER_NAME]: `t=${Date.now()},v1=firma-falsa` },
    })
    expect(response.status()).toBe(401)
  })

  test('revalida la etiqueta del documento con una firma válida', async ({ request }) => {
    const body = JSON.stringify({ _type: 'project', _id: 'e2e-project' })
    const signature = await encodeSignatureHeader(body, Date.now(), E2E_REVALIDATE_SECRET)
    const response = await request.post('/api/revalidate', {
      data: body,
      headers: { 'content-type': 'application/json', [SIGNATURE_HEADER_NAME]: signature },
    })
    expect(response.status()).toBe(200)
    expect(await response.json()).toMatchObject({ revalidated: true, tags: ['project'] })
  })
})

test.describe('POST /api/contact', () => {
  test('sin proveedor de correo responde 503 (la UI ofrece mailto)', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: VALID_CONTACT,
      headers: { 'x-forwarded-for': randomTestIp() },
    })
    expect(response.status()).toBe(503)
    expect(await response.json()).toMatchObject({ error: 'contact_unavailable' })
  })

  test('valida los campos (422)', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { ...VALID_CONTACT, email: 'no-es-correo' },
      headers: { 'x-forwarded-for': randomTestIp() },
    })
    expect(response.status()).toBe(422)
    expect((await response.json()).fieldErrors).toHaveProperty('email')
  })

  test('exige JSON (415) y rechaza otros orígenes (403)', async ({ request }) => {
    const textResponse = await request.post('/api/contact', {
      data: 'hola',
      headers: { 'content-type': 'text/plain' },
    })
    expect(textResponse.status()).toBe(415)

    const crossOrigin = await request.post('/api/contact', {
      data: VALID_CONTACT,
      headers: { origin: 'https://evil.example' },
    })
    expect(crossOrigin.status()).toBe(403)
  })
})

test.describe('GET /api/search', () => {
  test('devuelve resultados en JSON', async ({ request }) => {
    const response = await request.get('/api/search?q=python')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.query).toBe('python')
    expect(Array.isArray(body.results)).toBe(true)
  })

  test('rechaza consultas demasiado cortas', async ({ request }) => {
    expect((await request.get('/api/search?q=a')).status()).toBe(400)
  })
})

test('GET /cv sin CV: los navegadores vuelven a la sección de contacto', async ({ request }) => {
  const response = await request.get('/cv', { maxRedirects: 0, headers: { accept: 'text/html' } })
  expect(response.status()).toBe(307)
  expect(response.headers()['location']).toMatch(/\/(cdn\.sanity\.io\/.+\.pdf|#contacto)/)
})

test('GET /cv descarga el PDF de Sanity o responde 404 si no hay CV', async ({ request }) => {
  const response = await request.get('/cv', { maxRedirects: 0 })
  if (response.status() === 307) {
    const location = new URL(response.headers()['location'] ?? '')
    expect(location.hostname).toBe('cdn.sanity.io')
    expect(location.searchParams.get('dl')).toMatch(/\.pdf$/)
  } else {
    expect(response.status()).toBe(404)
  }
})

test('robots.txt bloquea el Studio y la API, y enlaza el sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text()
  expect(body).toContain('Disallow: /studio')
  expect(body).toContain('Disallow: /api/')
  expect(body).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/)
})

test('sitemap.xml incluye la página principal', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('<loc>')
})

test('cabeceras de seguridad y Studio no indexable', async ({ request }) => {
  const home = await request.get('/')
  expect(home.headers()['x-content-type-options']).toBe('nosniff')
  expect(home.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(home.headers()['x-powered-by']).toBeUndefined()

  const studio = await request.get('/studio')
  expect(studio.status()).toBe(200)
  expect(studio.headers()['x-robots-tag']).toContain('noindex')
})

test.describe('API de me gusta', () => {
  test('sin token de escritura responde desactivado (el corazón funciona localmente)', async ({
    request,
  }) => {
    const response = await request.get('/api/likes?slugs=qurri,mikuy')
    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ enabled: false })
  })

  test('valida los slugs', async ({ request }) => {
    expect((await request.get('/api/likes?slugs=../x')).status()).toBe(400)
  })
})

test('API de recomendaciones exige sesión de LinkedIn', async ({ request }) => {
  const response = await request.post('/api/recommendations', { data: { message: 'hola' } })
  expect(response.status()).toBe(401)
})

test('el inicio de sesión con LinkedIn sin configurar vuelve a /recomendar', async ({
  request,
}) => {
  const response = await request.get('/api/auth/linkedin?lang=en', { maxRedirects: 0 })
  expect(response.status()).toBe(307)
  expect(response.headers().location).toMatch(/\/en\/recomendar\?error=config$/)
})
