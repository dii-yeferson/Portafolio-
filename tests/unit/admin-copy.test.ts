import { describe, expect, it } from 'vitest'

import { resolveCopy, splitHighlight } from '@/lib/copy'
import { isStudioAdmin, parseAdminEmails } from '@/sanity/lib/admin-access'

describe('acceso al panel', () => {
  it('normaliza la lista de correos autorizados', () => {
    expect(parseAdminEmails(' Yo@Example.com, otro@example.com ,, ')).toEqual([
      'yo@example.com',
      'otro@example.com',
    ])
    expect(parseAdminEmails(undefined)).toEqual([])
  })

  it('solo deja entrar a los correos de la lista (sin distinguir mayúsculas)', () => {
    const allowed = parseAdminEmails('admin@example.com')
    expect(isStudioAdmin('Admin@Example.com', allowed)).toBe(true)
    expect(isStudioAdmin('intruso@example.com', allowed)).toBe(false)
    expect(isStudioAdmin(undefined, allowed)).toBe(false)
  })

  it('sin lista, decide la membresía del proyecto en Sanity', () => {
    expect(isStudioAdmin('cualquiera@example.com', [])).toBe(true)
  })
})

describe('textos editables', () => {
  const defaults = {
    label: 'Contacto',
    title: '¿Trabajamos juntos?',
    description: 'Texto por defecto',
  }

  it('usa el texto del panel y recurre al de por defecto si está vacío', () => {
    expect(resolveCopy({ title: 'Hablemos', label: '  ', description: null }, defaults)).toEqual({
      label: 'Contacto',
      title: 'Hablemos',
      description: 'Texto por defecto',
    })
    expect(resolveCopy(null, defaults)).toEqual(defaults)
  })

  it('resalta la última palabra del título', () => {
    expect(splitHighlight('¿Trabajamos juntos?')).toEqual(['¿Trabajamos ', 'juntos', '?'])
    expect(splitHighlight('Hablemos')).toEqual(['', 'Hablemos', ''])
    expect(splitHighlight('Creemos algo grande!')).toEqual(['Creemos algo ', 'grande', '!'])
  })
})
