import { describe, expect, it } from 'vitest'

import { formatMonthYear, isExpired, truncate } from '@/lib/format'
import { buildResumeDownloadUrl, buildResumeFilename } from '@/lib/resume'
import { isSafeExternalUrl, toFileSlug } from '@/lib/url'

const ASSET = 'https://cdn.sanity.io/files/abc123/production/0123456789abcdef.pdf'

describe('buildResumeDownloadUrl', () => {
  it('añade ?dl= con un nombre de archivo limpio', () => {
    const url = new URL(buildResumeDownloadUrl(ASSET, 'Diego Yeferson') ?? '')
    expect(url.origin).toBe('https://cdn.sanity.io')
    expect(url.searchParams.get('dl')).toBe('CV-Diego-Yeferson.pdf')
  })

  it('rechaza hosts ajenos al CDN de Sanity (evita redirecciones abiertas)', () => {
    expect(buildResumeDownloadUrl('https://evil.example/files/cv.pdf', 'x')).toBeNull()
    expect(buildResumeDownloadUrl('http://cdn.sanity.io/files/a/b/c.pdf', 'x')).toBeNull()
    expect(buildResumeDownloadUrl('https://cdn.sanity.io/images/a/b/c.png', 'x')).toBeNull()
    expect(buildResumeDownloadUrl('no-es-url', 'x')).toBeNull()
    expect(buildResumeDownloadUrl(null, 'x')).toBeNull()
  })

  it('buildResumeFilename normaliza tildes y símbolos', () => {
    expect(buildResumeFilename('José Ñuñez / Data')).toBe('CV-Jose-Nunez-Data.pdf')
    expect(buildResumeFilename('')).toBe('CV.pdf')
  })
})

describe('url', () => {
  it('isSafeExternalUrl solo permite https: y mailto:', () => {
    expect(isSafeExternalUrl('https://example.com')).toBe(true)
    expect(isSafeExternalUrl('mailto:hola@example.com')).toBe(true)
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeExternalUrl('http://example.com')).toBe(false)
    expect(isSafeExternalUrl('/ruta-relativa')).toBe(false)
    expect(isSafeExternalUrl(null)).toBe(false)
  })

  it('toFileSlug', () => {
    expect(toFileSlug('  Árbol de decisión  ')).toBe('Arbol-de-decision')
  })
})

describe('format', () => {
  it('formatMonthYear en español (sin desfase de zona horaria)', () => {
    expect(formatMonthYear('2025-03-01')).toBe('marzo de 2025')
    expect(formatMonthYear('invalida')).toBe('')
  })

  it('isExpired', () => {
    const now = new Date('2026-11-05T00:00:00Z')
    expect(isExpired('2026-11-04', now)).toBe(true)
    expect(isExpired('2026-11-05', now)).toBe(false)
    expect(isExpired(null, now)).toBe(false)
  })

  it('truncate corta en límite de palabra', () => {
    expect(truncate('Monitoreo y predicción para operaciones mineras', 30)).toBe(
      'Monitoreo y predicción para…',
    )
    expect(truncate('Texto corto', 30)).toBe('Texto corto')
  })
})
