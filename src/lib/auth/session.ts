import 'server-only'

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Sesión firmada y efímera para quien recomienda (sin base de datos).
 * Cookie `httpOnly` con `base64url(payload).firma`, firmada con HMAC-SHA256
 * usando `AUTH_SECRET`. Solo guarda lo público de LinkedIn.
 */
export type RecommenderSession = {
  sub: string
  name: string
  picture: string | null
  exp: number
}

export const SESSION_COOKIE = 'rec_session'
export const STATE_COOKIE = 'li_state'
export const SESSION_TTL_SECONDS = 30 * 60

export function getAuthSecret(env: string | undefined = process.env.AUTH_SECRET): string | null {
  const secret = env?.trim()
  return secret && secret.length >= 32 ? secret : null
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

export function encodeSession(session: RecommenderSession, secret: string): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  return `${payload}.${sign(payload, secret)}`
}

export function decodeSession(
  token: string | undefined,
  secret: string | null,
  now: number = Date.now(),
): RecommenderSession | null {
  if (!token || !secret) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload, secret))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null
  try {
    const data = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as RecommenderSession
    if (typeof data.sub !== 'string' || typeof data.name !== 'string') return null
    if (typeof data.exp !== 'number' || data.exp * 1000 < now) return null
    return { sub: data.sub, name: data.name, picture: data.picture ?? null, exp: data.exp }
  } catch {
    return null
  }
}

/** Huella anónima y estable de una persona: no revela su ID de LinkedIn. */
export function authorKey(sub: string, secret: string): string {
  return createHmac('sha256', secret).update(`recommender:${sub}`).digest('hex').slice(0, 24)
}

export function randomState(): string {
  return randomBytes(24).toString('base64url')
}

export const COOKIE_BASE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}
