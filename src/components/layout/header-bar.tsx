'use client'

import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { LogoMark } from '@/components/brand/logo'
import { useI18n } from '@/i18n/client'
import { localePath, splitLocale } from '@/i18n/config'
import { NAV_ITEMS, type NavSection, navSectionForPath, SECTION_TO_NAV } from '@/lib/navigation'

import { PreferencesPill } from './preferences-pill'
import { SearchDialog } from './search-dialog'

function subscribeToScroll(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true })
  return () => window.removeEventListener('scroll', callback)
}

const isScrolled = () => window.scrollY > 24

/** Barra flotante de vidrio líquido con la sección activa, idioma y tema. */
export function HeaderBar({ name }: { name: string }) {
  const { lang, t } = useI18n()
  const pathname = usePathname() ?? '/'
  const path = splitLocale(pathname).path
  const isHome = path === '/'
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

  const active = isHome ? observed : navSectionForPath(path)
  const items = NAV_ITEMS.map((item) => ({
    ...item,
    label: t.nav.items[item.id],
    href: localePath(lang, item.href),
  }))

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-4 sm:pt-[calc(1rem+env(safe-area-inset-top))]">
      <div
        className={`glass liquid pointer-events-auto relative flex w-full items-center justify-between gap-2 rounded-full py-1.5 pr-1.5 pl-4 transition-[max-width,background-color] duration-500 ease-[cubic-bezier(.23,1,.32,1)] ${
          scrolled ? 'max-w-[900px] bg-[var(--glass-bg-strong)]' : 'max-w-[1060px]'
        }`}
      >
        <Link
          href={localePath(lang, '/')}
          aria-label={t.nav.homeAria(name)}
          className="flex items-center gap-2.5 py-1.5 text-foreground"
        >
          <LogoMark className="h-[1.15rem] w-auto" />
        </Link>

        <nav aria-label={t.nav.main} className="hidden lg:block">
          <ul className="flex items-center">
            {items.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id} className="relative">
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: 'spring', duration: 0.45, bounce: 0.18 }}
                      className="absolute inset-0 rounded-full bg-ink/[0.09] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
                    />
                  ) : null}
                  <Link
                    href={item.href}
                    data-nav={item.id}
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

        <div className="flex items-center gap-1 sm:gap-1.5">
          <PreferencesPill />
          <SearchDialog />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="grid size-10 place-items-center rounded-full text-foreground transition-[background-color,transform] duration-150 hover:bg-ink/[0.08] active:scale-[0.96] lg:hidden"
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
            aria-label={t.nav.menu}
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="pointer-events-auto fixed inset-0 z-[60] flex h-dvh flex-col bg-background/90 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden"
          >
            <div className="flex items-center justify-between px-6 pt-6">
              <LogoMark className="h-5 w-auto text-foreground" />
              <div className="flex items-center gap-2">
                <PreferencesPill />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={t.nav.closeMenu}
                  className="glass grid size-11 place-items-center rounded-full"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <nav aria-label={t.nav.mobile} className="flex flex-1 flex-col justify-center px-6">
              <ul className="space-y-1">
                {[
                  { id: 'inicio', label: t.common.home, href: localePath(lang, '/#inicio') },
                  ...items,
                ].map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.04 * index,
                      type: 'spring',
                      duration: 0.5,
                      bounce: 0.15,
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
                ))}
              </ul>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
