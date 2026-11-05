import { describe, expect, it } from 'vitest'

import { buildSearchTerm, searchParamsSchema } from '@/lib/search'

describe('buildSearchTerm', () => {
  it('genera tokens con comodín de prefijo', () => {
    expect(buildSearchTerm('Centinela Minero')).toBe('centinela* minero*')
  })

  it('elimina sintaxis de GROQ y caracteres especiales', () => {
    expect(buildSearchTerm('power*bi") || true')).toBe('power* bi* true*')
  })

  it('conserva letras con tilde y descarta tokens de 1 carácter', () => {
    expect(buildSearchTerm('minería a IA')).toBe('minería* ia*')
  })

  it('limita la cantidad de términos', () => {
    expect(buildSearchTerm('uno dos tres cuatro cinco seis siete')?.split(' ')).toHaveLength(5)
  })

  it('devuelve null si no queda ningún término', () => {
    expect(buildSearchTerm('!! ?? *')).toBeNull()
  })
})

describe('searchParamsSchema', () => {
  it('aplica el límite por defecto y lo convierte a número', () => {
    expect(searchParamsSchema.parse({ q: 'python' })).toEqual({ q: 'python', limit: 8 })
    expect(searchParamsSchema.parse({ q: 'python', limit: '3' })).toEqual({ q: 'python', limit: 3 })
  })

  it('rechaza búsquedas demasiado cortas, largas o límites fuera de rango', () => {
    expect(searchParamsSchema.safeParse({ q: 'a' }).success).toBe(false)
    expect(searchParamsSchema.safeParse({ q: 'x'.repeat(65) }).success).toBe(false)
    expect(searchParamsSchema.safeParse({ q: 'python', limit: '50' }).success).toBe(false)
    expect(searchParamsSchema.safeParse({}).success).toBe(false)
  })
})
