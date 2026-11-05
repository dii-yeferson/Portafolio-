import { describe, expect, it } from 'vitest'

import {
  isPdfAssetRef,
  parseIsoDate,
  validateAltText,
  validateExpiryAfterIssue,
  validateHttpsUrl,
  validateNotFutureDate,
  validatePdfFile,
  validateSocialUrl,
  validateYearRange,
} from '@/sanity/lib/validation'

describe('validateHttpsUrl', () => {
  it.each([undefined, null, ''])('acepta valores vacíos (%s)', (value) => {
    expect(validateHttpsUrl(value)).toBe(true)
  })

  it('acepta URLs HTTPS públicas', () => {
    expect(validateHttpsUrl('https://github.com/dii-yeferson')).toBe(true)
    expect(validateHttpsUrl('https://www.credly.com/badges/abc-123')).toBe(true)
  })

  it.each([
    'http://example.com',
    'ftp://example.com',
    'javascript:alert(1)',
    'example.com',
    '/proyectos/centinela',
  ])('rechaza URLs sin HTTPS: %s', (value) => {
    expect(validateHttpsUrl(value)).toMatch(/https:\/\//)
  })

  it('rechaza dominios no públicos y credenciales embebidas', () => {
    expect(validateHttpsUrl('https://localhost:3000')).toMatch(/dominio público/)
    expect(validateHttpsUrl('https://intranet')).toMatch(/dominio público/)
    expect(validateHttpsUrl('https://user:pass@example.com')).toMatch(/credenciales/)
  })
})

describe('validateSocialUrl', () => {
  it('exige mailto: válido para el ícono de correo', () => {
    expect(validateSocialUrl('mailto:hola@example.com', 'email')).toBe(true)
    expect(validateSocialUrl('https://example.com', 'email')).toMatch(/mailto:/)
    expect(validateSocialUrl('mailto:no-es-correo', 'email')).toMatch(/mailto:/)
  })

  it('exige HTTPS para el resto de plataformas', () => {
    expect(validateSocialUrl('https://www.linkedin.com/in/usuario', 'linkedin')).toBe(true)
    expect(validateSocialUrl('mailto:hola@example.com', 'github')).toMatch(/https:\/\//)
    expect(validateSocialUrl('http://youtube.com/@canal', 'youtube')).toMatch(/https:\/\//)
  })
})

describe('fechas', () => {
  it('parseIsoDate solo acepta fechas reales AAAA-MM-DD', () => {
    expect(parseIsoDate('2025-02-28')?.toISOString()).toBe('2025-02-28T00:00:00.000Z')
    expect(parseIsoDate('2025-02-30')).toBeNull()
    expect(parseIsoDate('28/02/2025')).toBeNull()
    expect(parseIsoDate(undefined)).toBeNull()
  })

  it('validateNotFutureDate rechaza emisiones futuras', () => {
    const now = new Date('2026-11-05T12:00:00Z')
    expect(validateNotFutureDate('2026-11-05', now)).toBe(true)
    expect(validateNotFutureDate('2024-01-10', now)).toBe(true)
    expect(validateNotFutureDate('2026-11-06', now)).toMatch(/futura/)
    expect(validateNotFutureDate('fecha', now)).toMatch(/inválida/)
    expect(validateNotFutureDate(undefined, now)).toBe(true)
  })

  it('validateExpiryAfterIssue: vencimiento opcional y posterior a la emisión', () => {
    expect(validateExpiryAfterIssue('2024-01-10', undefined)).toBe(true)
    expect(validateExpiryAfterIssue('2024-01-10', '2027-01-10')).toBe(true)
    expect(validateExpiryAfterIssue('2024-01-10', '2024-01-10')).toMatch(/posterior/)
    expect(validateExpiryAfterIssue('2024-01-10', '2023-12-31')).toMatch(/posterior/)
    expect(validateExpiryAfterIssue(undefined, '2027-01-10')).toBe(true)
  })

  it('validateYearRange', () => {
    expect(validateYearRange(2021, 2024)).toBe(true)
    expect(validateYearRange(2021, undefined)).toBe(true)
    expect(validateYearRange(2024, 2021)).toMatch(/posterior/)
  })
})

describe('CV en PDF', () => {
  it('reconoce referencias de archivos PDF de Sanity', () => {
    expect(isPdfAssetRef('file-3b2f9c1d4e5f60718293a4b5c6d7e8f901234567-pdf')).toBe(true)
    expect(isPdfAssetRef('file-3b2f9c1d4e5f60718293a4b5c6d7e8f901234567-docx')).toBe(false)
    expect(isPdfAssetRef('image-abc-800x600-png')).toBe(false)
    expect(isPdfAssetRef(undefined)).toBe(false)
  })

  it('validatePdfFile acepta vacío o PDF y rechaza otros formatos', () => {
    expect(validatePdfFile(undefined)).toBe(true)
    expect(validatePdfFile({ asset: { _ref: 'file-abc123-pdf' } })).toBe(true)
    expect(validatePdfFile({ asset: { _ref: 'file-abc123-docx' } })).toMatch(/PDF/)
  })
})

describe('validateAltText', () => {
  it('solo exige texto alternativo si la imagen tiene archivo', () => {
    expect(validateAltText(undefined, undefined)).toBe(true)
    expect(validateAltText(undefined, { asset: undefined })).toBe(true)
    expect(validateAltText('Retrato de Di Yeferson', { asset: { _ref: 'image-1' } })).toBe(true)
    expect(validateAltText('   ', { asset: { _ref: 'image-1' } })).toMatch(/obligatorio/)
  })
})
