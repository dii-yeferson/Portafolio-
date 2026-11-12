import { describe, expect, it } from 'vitest'

import { buildContactEmail, contactSchema, toSingleLine } from '@/lib/contact/schema'

const valid = {
  name: 'Ana Torres',
  email: 'ana@example.com',
  subject: 'Proyecto de analítica',
  message: 'Hola, me interesa un dashboard en Power BI para minería.',
}

describe('contactSchema', () => {
  it('acepta un mensaje válido y recorta espacios', () => {
    const result = contactSchema.safeParse({ ...valid, name: '  Ana Torres  ' })
    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Ana Torres')
  })

  it('el asunto es opcional', () => {
    const { name, email, message } = valid
    expect(contactSchema.safeParse({ name, email, message }).success).toBe(true)
  })

  it.each([
    ['name', { name: 'A' }],
    ['email', { email: 'no-es-un-correo' }],
    ['message', { message: 'corto' }],
    ['message', { message: 'x'.repeat(2001) }],
    ['subject', { subject: 'x'.repeat(121) }],
  ])('rechaza %s inválido', (field, override) => {
    const result = contactSchema.safeParse({ ...valid, ...override })
    expect(result.success).toBe(false)
    expect(result.error?.issues.some((issue) => issue.path[0] === field)).toBe(true)
  })

  it('rechaza campos con tipos incorrectos', () => {
    expect(contactSchema.safeParse({ ...valid, email: 123 }).success).toBe(false)
    expect(contactSchema.safeParse(null).success).toBe(false)
  })
})

describe('buildContactEmail', () => {
  it('neutraliza saltos de línea en cabeceras (inyección de cabeceras)', () => {
    const email = buildContactEmail(
      { ...valid, subject: 'Hola\r\nBcc: victima@example.com', name: 'Ana\nTorres' },
      'Diego Yeferson',
    )
    expect(email.subject).not.toMatch(/[\r\n]/)
    expect(email.subject).toBe('[Diego Yeferson] Hola Bcc: victima@example.com — Ana Torres')
  })

  it('usa un asunto por defecto e incluye los datos del remitente', () => {
    const email = buildContactEmail({ ...valid, subject: undefined }, 'Diego Yeferson')
    expect(email.subject).toContain('Nuevo mensaje de contacto')
    expect(email.text).toContain('Correo: ana@example.com')
    expect(email.text).toContain(valid.message)
  })

  it('toSingleLine elimina caracteres de control', () => {
    expect(toSingleLine('a\tb\u0000c\n d')).toBe('a b c d')
  })
})
