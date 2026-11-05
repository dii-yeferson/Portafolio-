import { Globe, Mail } from 'lucide-react'
import { useId } from 'react'

import { GITHUB_PATH, INSTAGRAM_PATH, TIKTOK_PATH, X_PATH } from './simple-icons'

type IconProps = { className?: string }

/** «in» de LinkedIn trazado a mano (el logotipo no está en Simple Icons). */
const LINKEDIN_GLYPH =
  'M7.1 9.6h2.9V18H7.1zM8.55 5.4a1.68 1.68 0 1 1 0 3.36 1.68 1.68 0 0 1 0-3.36zM11.7 9.6h2.78v1.15h.04c.39-.73 1.33-1.5 2.74-1.5 2.93 0 3.47 1.93 3.47 4.43V18h-2.9v-3.86c0-.92-.02-2.1-1.28-2.1-1.28 0-1.48 1-1.48 2.03V18H11.7z'

/** Íconos de marca a todo color para las tarjetas de redes (FR-04). */
export function BrandIcon({ platform, className }: { platform: string } & IconProps) {
  const id = useId()
  switch (platform) {
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <rect width="24" height="24" rx="5" fill="#0A66C2" />
          <path d={LINKEDIN_GLYPH} fill="#fff" transform="translate(-1.6 -0.4)" />
        </svg>
      )
    case 'github':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d={GITHUB_PATH} fill="#f5f7f6" />
        </svg>
      )
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <defs>
            <radialGradient id={`${id}-ig`} cx="0.3" cy="1.05" r="1.25">
              <stop offset="0" stopColor="#FEDA75" />
              <stop offset="0.25" stopColor="#FA7E1E" />
              <stop offset="0.5" stopColor="#D62976" />
              <stop offset="0.75" stopColor="#962FBF" />
              <stop offset="1" stopColor="#4F5BD5" />
            </radialGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill={`url(#${id}-ig)`} />
          <path d={INSTAGRAM_PATH} fill="#fff" transform="translate(4.2 4.2) scale(0.65)" />
        </svg>
      )
    case 'x':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d={X_PATH} fill="#f5f7f6" transform="translate(1.5 1.5) scale(0.875)" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <g transform="translate(1.5 1.5) scale(0.875)">
            <path d={TIKTOK_PATH} fill="#25F4EE" transform="translate(-0.7 -0.5)" />
            <path d={TIKTOK_PATH} fill="#FE2C55" transform="translate(0.7 0.5)" />
            <path d={TIKTOK_PATH} fill="#fff" />
          </g>
        </svg>
      )
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <rect x="0.5" y="3.5" width="23" height="17" rx="5" fill="#FF0033" />
          <path d="M9.75 8.4v7.2L16 12z" fill="#fff" />
        </svg>
      )
    case 'email':
      return (
        <span
          aria-hidden="true"
          className={`grid place-items-center rounded-[22%] bg-linear-to-b from-[#3d8bfd] to-[#1d5fd6] ${className ?? ''}`}
        >
          <Mail className="size-[62%] text-white" strokeWidth={2} />
        </span>
      )
    default:
      return (
        <span
          aria-hidden="true"
          className={`grid place-items-center rounded-[22%] bg-surface-3 ${className ?? ''}`}
        >
          <Globe className="size-[62%] text-aqua" strokeWidth={2} />
        </span>
      )
  }
}

/** Versión monocromática para el pie de página. */
export function BrandGlyph({ platform, className }: { platform: string } & IconProps) {
  switch (platform) {
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            d={LINKEDIN_GLYPH}
            fill="currentColor"
            transform="translate(-4.2 -2.6) scale(1.2)"
          />
        </svg>
      )
    case 'github':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d={GITHUB_PATH} fill="currentColor" />
        </svg>
      )
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d={INSTAGRAM_PATH} fill="currentColor" />
        </svg>
      )
    case 'x':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d={X_PATH} fill="currentColor" transform="translate(1.5 1.5) scale(0.875)" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d={TIKTOK_PATH} fill="currentColor" />
        </svg>
      )
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M5.5 3.5h13a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5h-13a5 5 0 0 1-5-5v-7a5 5 0 0 1 5-5zm4.25 4.9v7.2L16 12z"
          />
        </svg>
      )
    case 'email':
      return <Mail className={className} strokeWidth={2} aria-hidden="true" />
    default:
      return <Globe className={className} strokeWidth={2} aria-hidden="true" />
  }
}
