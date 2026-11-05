'use client'

import { Download, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { LogoMark } from '@/components/brand/logo'
import { NAV_ITEMS, type NavSection, navSectionForPath, SECTION_TO_NAV } from '@/lib/navigation'

import { SearchDialog } from './search-dialog'

function subscribeToScroll(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true })
  return () => window.removeEventListener('scroll', callback)
}

const isScrolled = () => window.scrollY > 24

/** Barra flotante de vidrio (como el dock de Qurri) con la sección activa animada. */
export function HeaderBar({ name }: { name: string }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const scrolled = useSyncExternalStore(subscribeToScroll, isScrolled, () => false)
  const [observed, setObserved] = useState<NavSection | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isHome) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id in SECTION_TO_NAV) {
            setObserved(SECTION_TO_NAV[entry.target.id] ?? null)
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    for (const id of Object.keys(SECTION_TO_NAV)) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [isHome])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const active = isHome ? observed : navSectionForPath(pathname)

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        className={`glass pointer-events-auto flex w-full items-center justify-between gap-3 rounded-full py-1.5 pr-1.5 pl-4 transition-[max-width,background-color,box-shadow] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          scrolled ? 'max-w-[820px] bg-[rgb(18_18_22/0.82)]' : 'max-w-[1000px]'
        }`}
      >
        <Link href="/" aria-label={`${name}, inicio`} className="flex items-center gap-2.5 py-1.5">
          <LogoMark className="h-[1.15rem] w-auto" />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id} className="relative">
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    />
                  ) : null}
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative block rounded-full px-4 py-2 text-[0.9rem] font-bold transition-colors ${
                      isActive ? 'text-foreground' : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <SearchDialog />
          <a href="/cv" rel="nofollow" className="btn btn-primary h-10 px-4 text-[0.88rem]">
            <Download className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Descargar CV</span>
            <span className="sr-only sm:hidden">Descargar CV</span>
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="grid size-10 place-items-center rounded-full text-foreground transition-[background-color,transform] hover:bg-white/[0.08] active:scale-95 md:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto fixed inset-0 z-[60] flex h-dvh flex-col bg-background/90 backdrop-blur-2xl md:hidden"
          >
            <div className="flex items-center justify-between px-6 pt-6">
              <LogoMark className="h-5 w-auto" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="glass grid size-11 place-items-center rounded-full"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Móvil" className="flex flex-1 flex-col justify-center px-6">
              <ul className="space-y-1">
                {[{ id: 'inicio', label: 'Inicio', href: '/#inicio' }, ...NAV_ITEMS].map(
                  (item, index) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.04 * index,
                        type: 'spring',
                        stiffness: 320,
                        damping: 30,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`block py-2.5 text-[2.6rem] leading-tight font-black tracking-[-0.04em] ${
                          active === item.id ? 'text-aurora' : 'text-foreground'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ),
                )}
              </ul>
            </nav>
            <div className="px-6 pb-10">
              <a
                href="/cv"
                rel="nofollow"
                onClick={() => setMenuOpen(false)}
                className="btn btn-primary h-14 w-full text-base"
              >
                <Download className="size-4" aria-hidden="true" />
                Descargar CV
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
