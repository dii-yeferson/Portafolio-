import 'server-only'

import { z } from 'zod'

import { absoluteUrl } from '@/lib/site'

/**
 * «Sign In with LinkedIn using OpenID Connect».
 * Producto a activar en la app de LinkedIn Developers; scopes `openid profile`.
 */
const AUTHORIZE_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const USERINFO_URL = 'https://api.linkedin.com/v2/userinfo'

export type LinkedInConfig = { clientId: string; clientSecret: string; redirectUri: string }

export function getLinkedInConfig(): LinkedInConfig | null {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim()
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) return null
  return { clientId, clientSecret, redirectUri: absoluteUrl('/api/auth/linkedin/callback') }
}

export function buildAuthorizeUrl(config: LinkedInConfig, state: string): string {
  const url = new URL(AUTHORIZE_URL)
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    scope: 'openid profile',
  }).toString()
  return url.toString()
}

const userInfoSchema = z.object({
  sub: z.string().min(1),
  name: z.string().min(1).max(120),
  picture: z.string().url().optional(),
})

export type LinkedInProfile = { sub: string; name: string; picture: string | null }

/** Canjea el código por un token y lee el perfil público (nombre y foto). */
export async function fetchLinkedInProfile(
  config: LinkedInConfig,
  code: string,
): Promise<LinkedInProfile> {
  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })
  if (!tokenResponse.ok) throw new Error(`token ${tokenResponse.status}`)
  const { access_token: accessToken } = (await tokenResponse.json()) as { access_token?: string }
  if (!accessToken) throw new Error('token vacío')

  const userResponse = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })
  if (!userResponse.ok) throw new Error(`userinfo ${userResponse.status}`)
  const profile = userInfoSchema.parse(await userResponse.json())
  return { sub: profile.sub, name: profile.name.trim(), picture: profile.picture ?? null }
}

/** Solo se aceptan fotos servidas por LinkedIn. */
export function isLinkedInPicture(url: string | null): url is string {
  if (!url) return false
  try {
    const { protocol, hostname } = new URL(url)
    return (
      protocol === 'https:' && (hostname === 'media.licdn.com' || hostname.endsWith('.licdn.com'))
    )
  } catch {
    return false
  }
}
