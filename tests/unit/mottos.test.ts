import { describe, expect, it } from 'vitest'

import { normalizeMottos } from '@/lib/mottos'

describe('normalizeMottos', () => {
  it('usa cada frase completa con su acento entre asteriscos', () => {
    expect(normalizeMottos(['Uno. *Dos.*', 'Tres. *Cuatro.*'], 'x')).toEqual([
      'Uno. *Dos.*',
      'Tres. *Cuatro.*',
    ])
  })

  it('convierte el formato anterior [lema, acento] en una sola frase', () => {
    expect(normalizeMottos(['Detrás de cada dato.', 'Me gusta.'], 'x')).toEqual([
      'Detrás de cada dato. *Me gusta.*',
    ])
  })

  it('usa el lema por defecto si el panel está vacío', () => {
    expect(normalizeMottos(null, 'Por defecto')).toEqual(['Por defecto'])
    expect(normalizeMottos(['  '], 'Por defecto')).toEqual(['Por defecto'])
  })
})
