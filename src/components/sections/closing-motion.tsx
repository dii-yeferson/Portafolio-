import { ArrowDown } from 'lucide-react'

import { fillOrbit, TextOrbit } from '@/components/motion/text-orbit'
import { SplitLetters } from '@/components/motion/split-letters'
import type { Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n'

/**
 * Cierre: pieza de movimiento sin nada que tocar que empuja hacia el
 * contacto. Mientras la escena queda fija (`position: sticky`, sin pin de
 * JS), las letras se arman girando en 3D al ritmo del scroll, el anillo de
 * texto gira y una banda en contorno se desliza al fondo. Todo con
 * animaciones CSS ligadas al scroll: solo `transform` y `opacity`.
 */
export function ClosingMotion({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).closing
  const lines = t.lines.reduce<{ text: string; accent: boolean; start: number }[]>((acc, line) => {
    const accent = line.startsWith('*') && line.endsWith('*')
    const text = accent ? line.slice(1, -1) : line
    const previous = acc.at(-1)
    const start = previous ? previous.start + previous.text.length + 1 : 0
    return [...acc, { text, accent, start }]
  }, [])

  return (
    <section aria-hidden="true" className="closing relative border-t border-line">
      <div className="closing-stage grid place-items-center">
        <div className="closing-band text-outline absolute top-1/2 left-0 -translate-y-1/2 text-[clamp(7rem,22vw,20rem)] leading-none font-black tracking-[-0.06em] whitespace-nowrap">
          {'DATA · DATOS · DATA · DATOS · DATA · DATOS · '}
        </div>
        <div className="closing-ring absolute aspect-square w-[min(92vw,50rem)] opacity-70">
          <TextOrbit
            id={`closing-orbit-${lang}`}
            text={fillOrbit(t.orbit, 90).toUpperCase()}
            radius={47}
            fontSize={2.3}
            textClassName="mono-caps fill-subtle"
          />
        </div>
        <div className="aurora-blob absolute size-[28rem] max-w-[80vw] rounded-full bg-[conic-gradient(from_90deg,rgb(var(--accent-rgb)/0.12),rgb(var(--accent-rgb)/0.04),rgb(var(--accent-rgb)/0.14),rgb(var(--accent-rgb)/0.12))] blur-3xl" />

        <p className="letters relative z-10 px-5 text-center">
          {lines.map((line) => (
            <span
              key={line.start}
              className={`block ${
                line.accent
                  ? 'accent-serif text-aqua -my-[0.08em] text-[clamp(3.4rem,13vw,10.5rem)] leading-[1]'
                  : 'text-[clamp(2.9rem,11vw,9rem)] leading-[0.9] font-black tracking-[-0.055em]'
              }`}
            >
              <SplitLetters
                text={line.text}
                offset={line.start}
                letterClassName={line.accent ? 'pr-[0.04em]' : ''}
              />
            </span>
          ))}
        </p>

        <ArrowDown className="breathe absolute bottom-[9svh] size-7 text-muted" strokeWidth={1.6} />
      </div>
    </section>
  )
}
