'use client'

import { motion } from 'motion/react'
import { useId } from 'react'

type Option<V extends string> = { value: V; label: string }

/** Control segmentado estilo iOS con indicador que se desliza (Motion). */
export function SegmentedControl<V extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Option<V>[]
  value: V
  onChange: (value: V) => void
}) {
  const id = useId()
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      <div
        role="group"
        aria-label={label}
        className="inline-flex rounded-full border border-line bg-surface-2 p-1"
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`relative h-9 rounded-full px-4 text-[0.86rem] font-bold whitespace-nowrap transition-colors active:scale-[0.97] ${
                active ? 'text-foreground' : 'text-muted hover:text-foreground'
              }`}
            >
              {active ? (
                <motion.span
                  layoutId={`${id}-pill`}
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                  className="absolute inset-0 rounded-full bg-[var(--seg-active)] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_6px_16px_-8px_rgb(var(--shadow-rgb)/0.6)]"
                />
              ) : null}
              <span className="relative">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
