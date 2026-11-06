import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { authorKey, decodeSession, encodeSession, getAuthSecret } =
  await import('@/lib/auth/session')
const { isLinkedInPicture } = await import('@/lib/auth/linkedin')
const { recommendationSchema } = await import('@/lib/recommendations')
const { likeBodySchema, likeDocumentId, parseSlugList } = await import('@/lib/likes')
const { resolveGithubUsername, selectRepos } = await import('@/lib/github')
const { toHashtags } = await import('@/components/share/share-buttons')

const SECRET = 'x'.repeat(40)

describe('sesión firmada de quien recomienda', () => {
  const session = { sub: 'abc', name: 'Julio Pérez', picture: null, exp: 2_000_000_000 }

  it('acepta solo cookies firmadas con el secreto y vigentes', () => {
    const token = encodeSession(session, SECRET)
    expect(decodeSession(token, SECRET, 0)).toEqual(session)
    expect(decodeSession(token, 'y'.repeat(40), 0)).toBeNull()
    expect(decodeSession(`${token}x`, SECRET, 0)).toBeNull()
    expect(decodeSession(token, SECRET, 2_000_000_001 * 1000)).toBeNull()
    expect(decodeSession(undefined, SECRET)).toBeNull()
  })

  it('no permite cambiar el nombre sin invalidar la firma', () => {
    const [, signature] = encodeSession(session, SECRET).split('.')
    const forged = Buffer.from(JSON.stringify({ ...session, name: 'Otro' })).toString('base64url')
    expect(decodeSession(`${forged}.${signature}`, SECRET, 0)).toBeNull()
  })

  it('exige un secreto largo y genera una huella estable y anónima', () => {
    expect(getAuthSecret('corto')).toBeNull()
    expect(getAuthSecret(SECRET)).toBe(SECRET)
    expect(authorKey('abc', SECRET)).toBe(authorKey('abc', SECRET))
    expect(authorKey('abc', SECRET)).not.toContain('abc')
  })

  it('solo acepta fotos servidas por LinkedIn', () => {
    expect(isLinkedInPicture('https://media.licdn.com/dms/image/x.jpg')).toBe(true)
    expect(isLinkedInPicture('https://evil.example.com/x.jpg')).toBe(false)
    expect(isLinkedInPicture('http://media.licdn.com/x.jpg')).toBe(false)
  })
})

describe('recomendaciones', () => {
  const valid = {
    relationship: 'teacher',
    role: 'Docente de Big Data',
    organization: 'Tecsup',
    profileUrl: 'https://www.linkedin.com/in/julio-perez',
    message: 'Un estudiante constante, curioso y muy claro al explicar sus análisis de datos.',
    consent: true,
    lang: 'es',
  }

  it('valida relación, perfil de LinkedIn, longitud y consentimiento', () => {
    expect(recommendationSchema.safeParse(valid).success).toBe(true)
    expect(recommendationSchema.safeParse({ ...valid, profileUrl: '' }).success).toBe(true)
    expect(
      recommendationSchema.safeParse({ ...valid, profileUrl: 'https://example.com/in/x' }).success,
    ).toBe(false)
    expect(recommendationSchema.safeParse({ ...valid, message: 'Muy bien.' }).success).toBe(false)
    expect(recommendationSchema.safeParse({ ...valid, consent: false }).success).toBe(false)
    expect(recommendationSchema.safeParse({ ...valid, relationship: 'amigo' }).success).toBe(false)
  })
})

describe('me gusta', () => {
  it('valida slugs y usa IDs públicos (sin puntos)', () => {
    expect(parseSlugList('qurri,mikuy,qurri')).toEqual(['qurri', 'mikuy'])
    expect(parseSlugList('qurri,../x')).toBeNull()
    expect(parseSlugList('')).toBeNull()
    expect(likeDocumentId('qurri')).toBe('likes-qurri')
    expect(likeBodySchema.safeParse({ slug: 'qurri', action: 'like' }).success).toBe(true)
    expect(likeBodySchema.safeParse({ slug: 'qurri', action: 'spam' }).success).toBe(false)
  })
})

describe('GitHub', () => {
  const repo = (name: string, extra: Record<string, unknown> = {}) => ({
    name,
    description: null,
    html_url: `https://github.com/dii-yeferson/${name}`,
    homepage: null,
    language: 'Python',
    stargazers_count: 0,
    pushed_at: '2026-11-01T00:00:00Z',
    fork: false,
    archived: false,
    private: false,
    ...extra,
  })

  it('excluye forks, archivados y el repo de perfil; ordena por estrellas y actividad', () => {
    const result = selectRepos(
      [
        repo('viejo', { pushed_at: '2025-01-01T00:00:00Z' }),
        repo('popular', { stargazers_count: 5 }),
        repo('copia', { fork: true }),
        repo('guardado', { archived: true }),
        repo('dii-yeferson'),
        repo('nuevo', { pushed_at: '2026-11-05T00:00:00Z', homepage: 'http://inseguro.com' }),
      ],
      'dii-yeferson',
    )
    expect(result.map((item) => item.name)).toEqual(['popular', 'nuevo', 'viejo'])
    expect(result[1]?.homepage).toBeNull()
    expect(selectRepos({ message: 'rate limited' }, 'x')).toEqual([])
  })

  it('toma el usuario del panel o, si falta, del enlace de GitHub', () => {
    expect(resolveGithubUsername('dii-yeferson', [])).toBe('dii-yeferson')
    expect(resolveGithubUsername(null, ['https://github.com/dii-yeferson'])).toBe('dii-yeferson')
    expect(resolveGithubUsername('mal usuario', ['https://linkedin.com/in/x'])).toBeNull()
  })
})

describe('compartir en LinkedIn', () => {
  it('convierte tecnologías en hashtags limpios', () => {
    expect(toHashtags(['Power BI', 'Machine Learning', 'Análisis'])).toBe(
      '#PowerBI #MachineLearning #Analisis',
    )
  })
})
