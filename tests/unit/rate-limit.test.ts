import { describe, expect, it } from 'vitest'

import { createRateLimiter, getClientIp } from '@/lib/rate-limit'

describe('createRateLimiter', () => {
  it('permite hasta el límite y luego bloquea con Retry-After', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 })
    const t0 = 1_000_000
    expect(limiter.check('ip', t0)).toMatchObject({ allowed: true, remaining: 2 })
    expect(limiter.check('ip', t0 + 1)).toMatchObject({ allowed: true, remaining: 1 })
    expect(limiter.check('ip', t0 + 2)).toMatchObject({ allowed: true, remaining: 0 })
    const blocked = limiter.check('ip', t0 + 10_000)
    expect(blocked).toMatchObject({ allowed: false, remaining: 0 })
    expect(blocked.retryAfterSeconds).toBe(50)
  })

  it('libera cupos cuando la ventana se desliza', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000 })
    expect(limiter.check('ip', 0).allowed).toBe(true)
    expect(limiter.check('ip', 999).allowed).toBe(false)
    expect(limiter.check('ip', 1_001).allowed).toBe(true)
  })

  it('aísla los contadores por clave', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 })
    expect(limiter.check('a', 0).allowed).toBe(true)
    expect(limiter.check('b', 0).allowed).toBe(true)
    expect(limiter.check('a', 1).allowed).toBe(false)
  })

  it('acota la memoria cuando hay demasiadas claves', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, maxKeys: 2 })
    limiter.check('a', 0)
    limiter.check('b', 0)
    limiter.check('c', 5_000)
    // Las entradas antiguas se purgaron: «a» vuelve a tener cupo.
    expect(limiter.check('a', 5_001).allowed).toBe(true)
  })
})

describe('getClientIp', () => {
  it('usa la primera IP de x-forwarded-for', () => {
    expect(getClientIp(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe(
      '203.0.113.7',
    )
  })

  it('recurre a x-real-ip y luego a "unknown"', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2')
    expect(getClientIp(new Headers())).toBe('unknown')
  })
})
