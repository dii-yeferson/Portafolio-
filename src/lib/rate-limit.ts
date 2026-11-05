export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  /** Segundos hasta que se libere un cupo (0 si está permitido). */
  retryAfterSeconds: number
}

export type RateLimiter = {
  check(key: string, now?: number): RateLimitResult
  reset(): void
}

/**
 * Limitador de ventana deslizante en memoria.
 *
 * Es por instancia: en entornos serverless cada instancia lleva su propio
 * conteo, suficiente como primera barrera contra abuso. Para un límite
 * global usa un almacén compartido (p. ej. Upstash Redis) con la misma interfaz.
 */
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
}: {
  limit: number
  windowMs: number
  maxKeys?: number
}): RateLimiter {
  const hits = new Map<string, number[]>()

  function prune(windowStart: number) {
    for (const [key, timestamps] of hits) {
      const recent = timestamps.filter((t) => t > windowStart)
      if (recent.length === 0) hits.delete(key)
      else hits.set(key, recent)
    }
  }

  return {
    check(key, now = Date.now()) {
      const windowStart = now - windowMs
      const recent = (hits.get(key) ?? []).filter((t) => t > windowStart)

      if (recent.length >= limit) {
        hits.set(key, recent)
        const oldest = recent[0] ?? now
        return {
          allowed: false,
          limit,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
        }
      }

      recent.push(now)
      hits.set(key, recent)
      if (hits.size > maxKeys) prune(windowStart)
      if (hits.size > maxKeys) hits.clear()

      return { allowed: true, limit, remaining: limit - recent.length, retryAfterSeconds: 0 }
    },
    reset() {
      hits.clear()
    },
  }
}

/** IP del cliente según los encabezados del proxy (Vercel los sobrescribe). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip')?.trim() || 'unknown'
}
