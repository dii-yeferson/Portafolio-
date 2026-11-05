import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { revalidateTag } = vi.hoisted(() => ({ revalidateTag: vi.fn() }))
vi.mock('next/cache', () => ({ revalidateTag }))

const { POST } = await import('@/app/api/revalidate/route')

const SECRET = 'test-webhook-secret'

async function signedRequest(payload: unknown, secret = SECRET) {
  const body = JSON.stringify(payload)
  const signature = await encodeSignatureHeader(body, Date.now(), secret)
  return new NextRequest('http://localhost/api/revalidate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', [SIGNATURE_HEADER_NAME]: signature },
    body,
  })
}

/**
 * `parseBody` espera 3 s la consistencia eventual del Content Lake tras
 * verificar la firma real. En las pruebas solo esa espera se acorta a 0 ms.
 */
const CONTENT_LAKE_WAIT_MS = 3_000
const realSetTimeout = globalThis.setTimeout

function post(request: NextRequest) {
  vi.spyOn(globalThis, 'setTimeout').mockImplementation(((
    handler: (...args: unknown[]) => void,
    delay?: number,
    ...args: unknown[]
  ) =>
    realSetTimeout(
      handler,
      delay === CONTENT_LAKE_WAIT_MS ? 0 : delay,
      ...args,
    )) as typeof setTimeout)
  return POST(request)
}

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.stubEnv('SANITY_REVALIDATE_SECRET', SECRET)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('responde 500 si falta el secreto', async () => {
    vi.stubEnv('SANITY_REVALIDATE_SECRET', '')
    const response = await post(await signedRequest({ _type: 'project' }))
    expect(response.status).toBe(500)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('rechaza peticiones sin firma (401)', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      body: JSON.stringify({ _type: 'project' }),
    })
    const response = await post(request)
    expect(response.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('rechaza firmas creadas con otro secreto (401)', async () => {
    const response = await post(await signedRequest({ _type: 'project' }, 'otro-secreto'))
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_signature' })
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('rechaza cabeceras de firma con formato inválido (401)', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: { [SIGNATURE_HEADER_NAME]: 'firma-mal-formada' },
      body: JSON.stringify({ _type: 'project' }),
    })
    const response = await post(request)
    expect(response.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('rechaza cuerpos que no son JSON aunque la firma sea válida (400)', async () => {
    const body = '{no-es-json'
    const signature = await encodeSignatureHeader(body, Date.now(), SECRET)
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      headers: { [SIGNATURE_HEADER_NAME]: signature },
      body,
    })
    const response = await post(request)
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_body' })
  })

  it('exige el campo _type (400)', async () => {
    const response = await post(await signedRequest({ _id: 'abc' }))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({ error: 'missing_type' })
  })

  it('ignora tipos que el sitio no consume sin provocar reintentos (200)', async () => {
    const response = await post(await signedRequest({ _type: 'sanity.imageAsset' }))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      revalidated: false,
      ignored: 'sanity.imageAsset',
    })
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it.each(['siteSettings', 'project', 'certification', 'socialLink'])(
    'expira de inmediato la etiqueta «%s» con una firma válida',
    async (type) => {
      const response = await post(await signedRequest({ _type: type, _id: 'doc-1' }))
      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toMatchObject({ revalidated: true, tags: [type] })
      expect(revalidateTag).toHaveBeenCalledExactlyOnceWith(type, { expire: 0 })
      expect(response.headers.get('cache-control')).toBe('no-store')
    },
  )
})
