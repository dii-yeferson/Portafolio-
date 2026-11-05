'use client'

import { Download, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { LogoMark } from '@/components/brand/logo'
import { BrandGlyph } from '@/components/icons/brand-icons'
import { NAV_ITEMS, type NavSection, navSectionForPath, SECTION_TO_NAV } from '@/lib/navigation'
import { EXTERNAL_LINK_PROPS } from '@/lib/url'

import { SearchDialog } from './search-dialog'

type HeaderSocial = { _id: string; platformName: string; iconKey: string; url: string }

function subscribeToScroll(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true })
  return () => window.removeEventListener('scroll', callback)
}

const isScrolled = () => window.scrollY > 16

export function HeaderBar({ name, socialLinks }: { name: string; socialLinks: HeaderSocial[] }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const scrolled = useSyncExternalStore(subscribeToScroll, isScrolled, () => false)
  const [observed, setObserved] = useState<NavSection>('inicio')
  const [menuOpen, setMenuOpen] = useState(false)

  // Scroll-spy: resalta la sección visible en la portada.
  useEffect(() => {
    if (!isHome) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const section = SECTION_TO_NAV[entry.target.id]
          if (entry.isIntersecting && section) setObserved(section)
        }
      },
      { rootMargin: '-38% 0px -58% 0px' },
    )
    for (const id of Object.keys(SECTION_TO_NAV)) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [isHome])

  // Menú móvil: bloquea el scroll del fondo y se cierra con Escape.
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
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-500 ${
        scrolled
          ? 'border-white/[0.08] bg-background/70 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-white/[0.05] bg-background/40 backdrop-blur-md'
      }`}
    >
      <div
        className={`container-page flex items-center justify-between gap-6 transition-[height] duration-500 ${
          scrolled ? 'h-16' : 'h-[4.5rem]'
        }`}
      >
        <Link href="/#inicio" className="flex items-center gap-3" aria-label={`${name}, inicio`}>
          <LogoMark className="h-7 w-auto" />
          <span className="text-[1.15rem] font-extrabold tracking-[-0.02em]">{name}</span>
        </Link>

        <nav aria-label="Principal" className="hidden h-full lg:block">
          <ul className="flex h-full items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id} className="relative flex h-full items-center">
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3.5 py-2 text-[0.92rem] font-bold transition-colors ${
                      isActive ? 'text-accent-bright' : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                  {isActive ? (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-accent-bright shadow-[0_0_12px_rgba(111,224,170,0.7)]"
                    />
                  ) : null}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <SearchDialog />
          <a
            href="/cv"
            rel="nofollow"
            className="btn btn-primary h-10 rounded-full px-3.5 text-sm sm:px-5"
          >
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
            className="glass grid size-10 place-items-center rounded-full text-foreground transition-transform active:scale-95 lg:hidden"
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
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex h-dvh flex-col bg-background/96 backdrop-blur-2xl lg:hidden"
          >
            <div className="container-page flex h-[4.5rem] items-center justify-between">
              <span className="flex items-center gap-3">
                <LogoMark className="h-7 w-auto" />
                <span className="text-lg font-extrabold">{name}</span>
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="glass grid size-10 place-items-center rounded-full"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Móvil" className="container-page mt-6 flex-1">
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.05 * index,
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between border-b border-white/[0.06] py-4 text-3xl font-black tracking-[-0.03em] ${
                        active === item.id ? 'text-accent-bright' : 'text-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <a
                href="/cv"
                rel="nofollow"
                onClick={() => setMenuOpen(false)}
                className="btn btn-primary mt-8 h-12 w-full rounded-xl text-base"
              >
                <Download className="size-4" aria-hidden="true" />
                Descargar CV
              </a>
            </nav>
            {socialLinks.length > 0 ? (
              <ul className="container-page flex flex-wrap gap-3 pb-10">
                {socialLinks.map((link) => (
                  <li key={link._id}>
                    <a
                      href={link.url}
                      {...(link.iconKey === 'email' ? {} : EXTERNAL_LINK_PROPS)}
                      aria-label={link.platformName}
                      className="glass grid size-11 place-items-center rounded-full text-muted transition-colors hover:text-foreground"
                    >
                      <BrandGlyph platform={link.iconKey} className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
