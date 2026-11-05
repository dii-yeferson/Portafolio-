import { z } from 'zod'

export const SEARCH_LIMIT_DEFAULT = 8
export const SEARCH_LIMIT_MAX = 20
const MAX_TOKENS = 5
const MIN_TOKEN_LENGTH = 2

export const searchParamsSchema = z.object({
  q: z
    .string({ error: 'Falta el parámetro q.' })
    .trim()
    .min(2, 'La búsqueda debe tener al menos 2 caracteres.')
    .max(64, 'La búsqueda admite como máximo 64 caracteres.'),
  limit: z.coerce.number().int().min(1).max(SEARCH_LIMIT_MAX).default(SEARCH_LIMIT_DEFAULT),
})

/**
 * Convierte la entrada del usuario en un patrón para el operador `match` de
 * GROQ: solo letras y números, máximo 5 términos, cada uno con comodín de
 * prefijo (`"centinela mine"` → `"centinela* mine*"`).
 *
 * Devuelve `null` si no queda ningún término útil.
 */
export function buildSearchTerm(input: string): string | null {
  const tokens = input
    .normalize('NFC')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH)
    .slice(0, MAX_TOKENS)

  return tokens.length > 0 ? tokens.map((token) => `${token}*`).join(' ') : null
}
