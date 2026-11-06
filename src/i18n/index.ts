import type { Locale } from './config'
import { en } from './dictionaries/en'
import { type Dictionary, es } from './dictionaries/es'

export type { Dictionary }

const dictionaries: Record<Locale, Dictionary> = { es, en }

/** Diccionario de la interfaz para un idioma (servidor y cliente). */
export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang]
}
