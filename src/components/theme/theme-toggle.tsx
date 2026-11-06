'use client'

import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'

import { useI18n } from '@/i18n/client'

import { THEME_STORAGE_KEY } from './theme-script'

type Theme = 'dark' | 'light'

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

const getTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Navegación privada: el tema vale solo para esta visita.
  }
}

/**
 * Sol / luna. El tema nuevo se revela en un círculo que nace del botón
 * (View Transitions), algo que se usa pocas veces y por eso puede lucirse.
 * Sin soporte o con «reducir movimiento», cambia al instante.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { t } = useI18n()
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'dark' as Theme)
  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof document.startViewTransition !== 'function') {
      applyTheme(next)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const transition = document.startViewTransition(() => applyTheme(next))
    void transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 560,
          easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? t.header.toLight : t.header.toDark}
      title={theme === 'dark' ? t.header.toLight : t.header.toDark}
      className={`relative grid size-8 place-items-center rounded-full text-muted transition-[color,background-color,transform] duration-200 hover:bg-ink/[0.08] hover:text-foreground active:scale-[0.94] ${className}`}
    >
      <Sun
        aria-hidden="true"
        className={`absolute size-[1.05rem] transition-[opacity,transform] duration-300 ease-[cubic-bezier(.23,1,.32,1)] ${
          theme === 'light' ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0'
        }`}
      />
      <Moon
        aria-hidden="true"
        className={`absolute size-[1.05rem] transition-[opacity,transform] duration-300 ease-[cubic-bezier(.23,1,.32,1)] ${
          theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-90 opacity-0'
        }`}
      />
    </button>
  )
}
