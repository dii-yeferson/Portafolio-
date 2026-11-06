import { describe, expect, it } from 'vitest'

import { plainText, splitAccent } from '@/i18n/accent'
import { isLocale, localePath, splitLocale, switchLocalePath } from '@/i18n/config'
import { en } from '@/i18n/dictionaries/en'
import { es } from '@/i18n/dictionaries/es'

type Tree = { [key: string]: unknown }

function shape(value: unknown): unknown {
  if (typeof value === 'function') return 'fn'
  if (Array.isArray(value)) return 'array'
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Tree).map(([k, v]) => [k, shape(v)]))
  }
  return typeof value
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value as Tree).flatMap(strings)
  return []
}

describe('rutas por idioma', () => {
  it('el español va sin prefijo y el inglés bajo /en', () => {
    expect(localePath('es', '/')).toBe('/')
    expect(localePath('es', '/proyectos')).toBe('/proyectos')
    expect(localePath('es', '/#contacto')).toBe('/#contacto')
    expect(localePath('en', '/')).toBe('/en')
    expect(localePath('en', '/proyectos/qurri')).toBe('/en/proyectos/qurri')
    expect(localePath('en', '/#contacto')).toBe('/en#contacto')
  })

  it('cambia de idioma conservando la página', () => {
    expect(splitLocale('/en/proyectos')).toEqual({ lang: 'en', path: '/proyectos' })
    expect(splitLocale('/proyectos')).toEqual({ lang: 'es', path: '/proyectos' })
    expect(splitLocale('/english')).toEqual({ lang: 'es', path: '/english' })
    expect(switchLocalePath('/proyectos/qurri', 'en')).toBe('/en/proyectos/qurri')
    expect(switchLocalePath('/en/sobre-mi', 'es')).toBe('/sobre-mi')
    expect(switchLocalePath('/en', 'es')).toBe('/')
    expect(isLocale('en')).toBe(true)
    expect(isLocale('fr')).toBe(false)
  })
})

describe('diccionarios', () => {
  it('inglés y español tienen exactamente las mismas claves', () => {
    expect(shape(en)).toEqual(shape(es))
  })

  it('respetan la voz de la marca: sin rayas largas ni comillas angulares', () => {
    for (const text of [...strings(es), ...strings(en)]) {
      expect(text).not.toMatch(/[—«»]/)
    }
  })
})

describe('acentos en serif itálica', () => {
  it('separa lo que va entre asteriscos', () => {
    expect(splitAccent('Proyectos que *resuelven algo.*')).toEqual([
      { text: 'Proyectos que ', accent: false },
      { text: 'resuelven algo.', accent: true },
    ])
    expect(plainText('¿Tienes datos? *Hablemos.*')).toBe('¿Tienes datos? Hablemos.')
  })
})
