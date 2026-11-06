'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { useI18n } from '@/i18n/client'

import { playLikeSound } from './like-sound'
import { getSnapshot, requestCount, SERVER_SNAPSHOT, subscribe, toggleLike } from './likes-store'

const PARTICLES = Array.from({ length: 9 }, (_, index) => ({
  angle: index * 40,
  distance: 18 + (index % 3) * 5,
  color: ['#95fbdf', '#6bdeee', '#8b9cff', '#ff5d7a'][index % 4]!,
}))

/**
 * Corazón de «me gusta» (FR proyectos): late, suelta partículas aurora, deja
 * una onda y suena suave. Se usa pocas veces por visita, así que puede
 * permitirse ese gesto; la pulsación responde en 160 ms.
 */
export function LikeButton({
  slug,
  title,
  size = 'md',
  className = '',
}: {
  slug: string
  title: string
  size?: 'md' | 'lg'
  className?: string
}) {
  const { t } = useI18n()
  const state = useSyncExternalStore(
    subscribe,
    () => getSnapshot(slug),
    () => SERVER_SNAPSHOT,
  )
  const [burst, setBurst] = useState(0)

  useEffect(() => requestCount(slug), [slug])

  async function onClick(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    const willLike = !state.liked
    playLikeSound(willLike)
    if (willLike) setBurst((value) => value + 1)
    await toggleLike(slug)
  }

  const large = size === 'lg'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={state.liked}
      aria-label={state.liked ? t.likes.unlike(title) : t.likes.like(title)}
      className={`group/like z-10 inline-flex ${className.includes('absolute') ? '' : 'relative'} items-center gap-1.5 rounded-full transition-[transform,background-color,border-color] duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.94] ${
        large
          ? 'glass liquid h-12 px-4 text-[0.95rem] font-extrabold'
          : 'glass h-9 px-2.5 text-[0.8rem] font-extrabold'
      } ${className}`}
    >
      <span className="relative grid place-items-center">
        <Heart
          key={burst}
          data-pop={burst > 0 && state.liked ? 'true' : 'false'}
          aria-hidden="true"
          className={`like-heart ${large ? 'size-5' : 'size-4'} transition-colors duration-200 ${
            state.liked ? 'fill-heart text-heart' : 'text-muted group-hover/like:text-foreground'
          }`}
        />
        {burst > 0 && state.liked ? (
          <span key={`burst-${burst}`} aria-hidden="true">
            <span className="like-ring" />
            {PARTICLES.map((particle) => (
              <span
                key={particle.angle}
                className="like-particle"
                style={
                  {
                    '--a': `${particle.angle}deg`,
                    '--d': `${large ? particle.distance + 6 : particle.distance}px`,
                    '--c': particle.color,
                  } as React.CSSProperties
                }
              />
            ))}
          </span>
        ) : null}
      </span>
      {typeof state.count === 'number' ? (
        <span className="tabular-nums" aria-label={t.likes.count(state.count)}>
          {state.count}
        </span>
      ) : null}
    </button>
  )
}
