/**
 * Normaliza las frases del panel. Formato actual: cada frase completa, con el
 * acento entre asteriscos. Formato anterior (compatibilidad): [lema, acento].
 */
export function normalizeMottos(raw: string[] | null | undefined, fallback: string): string[] {
  const phrases = (raw ?? []).map((phrase) => phrase.trim()).filter(Boolean)
  if (phrases.length === 0) return [fallback]
  const legacy = phrases.length === 2 && !phrases.some((phrase) => phrase.includes('*'))
  return legacy ? [`${phrases[0]} *${phrases[1]}*`] : phrases
}
