'use client'

import { createContext, use } from 'react'

import { DEFAULT_LOCALE, type Locale } from './config'
import { getDictionary } from './index'

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

/** Comparte el idioma activo con los componentes de cliente (solo el código, no funciones). */
export function I18nProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  return <LocaleContext value={lang}>{children}</LocaleContext>
}

/** Idioma activo y su diccionario en un componente de cliente. */
export function useI18n() {
  const lang = use(LocaleContext)
  return { lang, t: getDictionary(lang) }
}
