import { BrainCircuit, ChartLine, Cloud, Database, Server } from 'lucide-react'
import { useId } from 'react'

import { PYTHON_PATH } from './simple-icons'

/** Ícono tecnológico de cada certificación (FR-07). */
export function TechIcon({
  icon,
  className,
}: {
  icon: string | null | undefined
  className?: string
}) {
  const id = useId()
  switch (icon) {
    case 'python':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <defs>
            <linearGradient id={`${id}-py`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0.45" stopColor="#4B8BBE" />
              <stop offset="0.55" stopColor="#FFD43B" />
            </linearGradient>
          </defs>
          <path d={PYTHON_PATH} fill={`url(#${id}-py)`} />
        </svg>
      )
    case 'power-bi':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <defs>
            <linearGradient id={`${id}-pbi`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#F2C811" />
              <stop offset="1" stopColor="#D9A400" />
            </linearGradient>
          </defs>
          <rect
            x="3"
            y="12"
            width="4.6"
            height="9"
            rx="1.4"
            fill={`url(#${id}-pbi)`}
            opacity="0.7"
          />
          <rect
            x="9.7"
            y="7.5"
            width="4.6"
            height="13.5"
            rx="1.4"
            fill={`url(#${id}-pbi)`}
            opacity="0.85"
          />
          <rect x="16.4" y="3" width="4.6" height="18" rx="1.4" fill={`url(#${id}-pbi)`} />
        </svg>
      )
    case 'excel':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <rect x="6" y="2.5" width="16" height="19" rx="2.2" fill="#21A366" />
          <rect x="14" y="2.5" width="8" height="19" rx="2.2" fill="#33C481" opacity="0.75" />
          <rect x="2" y="6" width="12" height="12" rx="2" fill="#107C41" />
          <path
            d="m5.1 9 2.1 3-2.1 3h1.7l1.25-1.9L9.3 15H11l-2.1-3L11 9H9.3L8.05 10.9 6.8 9z"
            fill="#fff"
          />
        </svg>
      )
    case 'sql':
      return (
        <span aria-hidden="true" className={`grid place-items-center ${className ?? ''}`}>
          <Database className="size-full text-[#4f9dff]" strokeWidth={2} />
        </span>
      )
    case 'machine-learning':
      return (
        <span aria-hidden="true" className={`grid place-items-center ${className ?? ''}`}>
          <BrainCircuit className="size-full text-[#5fd6c6]" strokeWidth={1.8} />
        </span>
      )
    case 'big-data':
      return (
        <span aria-hidden="true" className={`grid place-items-center ${className ?? ''}`}>
          <Server className="size-full text-[#8ab4ff]" strokeWidth={1.8} />
        </span>
      )
    case 'cloud':
      return (
        <span aria-hidden="true" className={`grid place-items-center ${className ?? ''}`}>
          <Cloud className="size-full text-[#7cc7ff]" strokeWidth={1.8} />
        </span>
      )
    default:
      return (
        <span aria-hidden="true" className={`grid place-items-center ${className ?? ''}`}>
          <ChartLine className="size-full text-accent-bright" strokeWidth={1.8} />
        </span>
      )
  }
}

/** Sello mate champán de credencial verificada. */
export function Medal({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 32 40" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#e3cfa4" />
          <stop offset="0.55" stopColor="#b59a6c" />
          <stop offset="1" stopColor="#7d6644" />
        </linearGradient>
      </defs>
      <path d="M9 22 6 38l6-3.2 4 3.4V24z" fill="#6f5a3b" />
      <path d="m23 22 3 16-6-3.2-4 3.4V24z" fill="#5e4b31" />
      <circle cx="16" cy="15" r="12" fill={`url(#${id}-m)`} />
      <circle cx="16" cy="15" r="8.6" fill="none" stroke="#fff4d9" strokeOpacity="0.45" />
      <path
        d="m16 9.6 1.62 3.3 3.63.52-2.63 2.56.62 3.62L16 17.9l-3.24 1.7.62-3.62-2.63-2.56 3.63-.52z"
        fill="#fff4d9"
        fillOpacity="0.9"
      />
    </svg>
  )
}
