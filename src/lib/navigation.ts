/** Secciones de la portada enlazadas desde la navegación (FR-01). */
export const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', href: '/#inicio' },
  { id: 'sobre-mi', label: 'Sobre mí', href: '/#sobre-mi' },
  { id: 'proyectos', label: 'Proyectos', href: '/#proyectos' },
  { id: 'certificaciones', label: 'Certificaciones', href: '/#certificaciones' },
  { id: 'contacto', label: 'Contacto', href: '/#contacto' },
] as const

export type NavSection = (typeof NAV_ITEMS)[number]['id']

/** Secciones observadas por el scroll-spy y el ítem del menú que activan. */
export const SECTION_TO_NAV: Record<string, NavSection> = {
  inicio: 'inicio',
  'sobre-mi': 'sobre-mi',
  redes: 'sobre-mi',
  proyectos: 'proyectos',
  certificaciones: 'certificaciones',
  contacto: 'contacto',
}

/** Ítem activo según la ruta en páginas internas. */
export function navSectionForPath(pathname: string): NavSection | null {
  if (pathname.startsWith('/proyectos')) return 'proyectos'
  if (pathname.startsWith('/certificaciones')) return 'certificaciones'
  if (pathname.startsWith('/sobre-mi')) return 'sobre-mi'
  return null
}
