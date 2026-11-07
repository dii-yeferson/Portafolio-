'use client'

import { Music2, Volume2, VolumeX, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useI18n } from '@/i18n/client'

/**
 * Música ambiental del sitio (se configura en el panel: YouTube o un audio).
 *
 * - Intenta sonar sola, con el volumen subiendo despacio. Si el navegador
 *   lo bloquea, aparece un aviso discreto «Activar sonido» y la música
 *   arranca con el primer toque o clic del visitante.
 * - El botón de la barra pausa o reanuda; si alguien la pausa, se recuerda
 *   y no vuelve a sonar sola en sus próximas visitas.
 */
export type AmbientConfig = { youtubeId: string | null; audioUrl: string | null; volume: number }

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'blocked' | 'error'

type Engine = {
  play: () => Promise<boolean>
  pause: () => void
  setVolume: (value: number) => void
  isPlaying: () => boolean
  destroy: () => void
}

const PREF_KEY = 'ambient'
const PROMPT_KEY = 'ambient-prompt-hidden'

type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  mute: () => void
  unMute: () => void
  setVolume: (value: number) => void
  getPlayerState: () => number
  destroy: () => void
}

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      host?: string
      videoId: string
      width?: number
      height?: number
      playerVars?: Record<string, number | string>
      events?: Record<string, (event: { target: YTPlayer; data?: number }) => void>
    },
  ) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YTNamespace> | null = null
function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  apiPromise ??= new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT) resolve(window.YT)
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => reject(new Error('youtube'))
    document.head.append(script)
    setTimeout(() => reject(new Error('timeout')), 12_000)
  })
  return apiPromise
}

function readPref(): 'on' | 'off' | null {
  try {
    const value = localStorage.getItem(PREF_KEY)
    return value === 'on' || value === 'off' ? value : null
  } catch {
    return null
  }
}

function writePref(value: 'on' | 'off') {
  try {
    localStorage.setItem(PREF_KEY, value)
  } catch {
    // Navegación privada.
  }
}

async function createAudioEngine(url: string): Promise<Engine> {
  const audio = new Audio(url)
  audio.loop = true
  audio.preload = 'auto'
  audio.volume = 0
  return {
    play: () =>
      audio.play().then(
        () => true,
        () => false,
      ),
    pause: () => audio.pause(),
    setVolume: (value) => {
      audio.volume = Math.min(1, Math.max(0, value / 100))
    },
    isPlaying: () => !audio.paused,
    destroy: () => {
      audio.pause()
      audio.src = ''
    },
  }
}

async function createYouTubeEngine(videoId: string, host: HTMLElement): Promise<Engine> {
  const YT = await loadYouTubeApi()
  const mount = document.createElement('div')
  host.append(mount)
  const player = await new Promise<YTPlayer>((resolve, reject) => {
    const instance = new YT.Player(mount, {
      host: 'https://www.youtube-nocookie.com',
      videoId,
      width: 200,
      height: 120,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        loop: 1,
        playlist: videoId,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => resolve(instance),
        onError: () => reject(new Error('player')),
      },
    })
  })
  const waitForPlaying = () =>
    new Promise<boolean>((resolve) => {
      const started = Date.now()
      const check = () => {
        if (player.getPlayerState() === 1) resolve(true)
        else if (Date.now() - started > 2500) resolve(false)
        else setTimeout(check, 150)
      }
      check()
    })
  return {
    play: async () => {
      player.unMute()
      player.playVideo()
      const ok = await waitForPlaying()
      if (!ok) {
        // Bloqueado con sonido: queda listo en silencio para sonar al primer toque.
        player.mute()
        player.playVideo()
      }
      return ok
    },
    pause: () => player.pauseVideo(),
    setVolume: (value) => player.setVolume(value),
    isPlaying: () => player.getPlayerState() === 1,
    destroy: () => player.destroy(),
  }
}

type SoundContext = {
  available: boolean
  status: Status
  toggle: () => void
  start: () => void
}

const Context = createContext<SoundContext>({
  available: false,
  status: 'idle',
  toggle: () => {},
  start: () => {},
})

export const useAmbientSound = () => use(Context)

export function AmbientSoundProvider({
  config,
  children,
}: {
  config: AmbientConfig | null
  children: React.ReactNode
}) {
  const [status, setStatus] = useState<Status>('idle')
  const engineRef = useRef<Engine | null>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const statusRef = useRef<Status>('idle')
  useEffect(() => {
    statusRef.current = status
  }, [status])

  const fadeTo = useCallback(
    (target: number, done?: () => void) => {
      const engine = engineRef.current
      if (!engine) return
      if (fadeRef.current) clearInterval(fadeRef.current)
      let current = target > 0 ? 0 : (config?.volume ?? 20)
      const step = (config?.volume ?? 20) / 25
      engine.setVolume(current)
      fadeRef.current = setInterval(() => {
        current =
          target > current ? Math.min(target, current + step) : Math.max(target, current - step)
        engine.setVolume(current)
        if (current === target) {
          if (fadeRef.current) clearInterval(fadeRef.current)
          done?.()
        }
      }, 100)
    },
    [config?.volume],
  )

  const ensureEngine = useCallback(async () => {
    if (engineRef.current || !config) return engineRef.current
    setStatus('loading')
    try {
      engineRef.current = config.audioUrl
        ? await createAudioEngine(config.audioUrl)
        : config.youtubeId && hostRef.current
          ? await createYouTubeEngine(config.youtubeId, hostRef.current)
          : null
    } catch {
      engineRef.current = null
    }
    if (!engineRef.current) setStatus('error')
    return engineRef.current
  }, [config])

  const start = useCallback(async () => {
    const engine = await ensureEngine()
    if (!engine) return
    engine.setVolume(0)
    const ok = await engine.play()
    if (ok) {
      setStatus('playing')
      fadeTo(config?.volume ?? 20)
    } else {
      setStatus('blocked')
    }
  }, [config?.volume, ensureEngine, fadeTo])

  const toggle = useCallback(() => {
    const engine = engineRef.current
    if (statusRef.current === 'playing' && engine) {
      writePref('off')
      fadeTo(0, () => engine.pause())
      setStatus('paused')
      return
    }
    writePref('on')
    void start()
  }, [fadeTo, start])

  // Intento automático (si el visitante no la apagó antes).
  useEffect(() => {
    if (!config || readPref() === 'off') return
    void start()
  }, [config, start])

  // Con el audio bloqueado, el primer gesto del visitante la enciende.
  useEffect(() => {
    if (status !== 'blocked') return
    const onGesture = (event: Event) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('[data-sound-control]')) return
      void start()
    }
    window.addEventListener('pointerdown', onGesture, { once: true })
    window.addEventListener('keydown', onGesture, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [status, start])

  useEffect(
    () => () => {
      if (fadeRef.current) clearInterval(fadeRef.current)
      engineRef.current?.destroy()
    },
    [],
  )

  const value = useMemo(
    () => ({
      available: Boolean(config) && status !== 'error',
      status,
      toggle,
      start: () => void start(),
    }),
    [config, status, toggle, start],
  )

  return (
    <Context value={value}>
      {children}
      {/* Reproductor oculto: solo se usa su audio. */}
      <div
        ref={hostRef}
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 size-px overflow-hidden opacity-0"
      />
      <SoundPrompt />
    </Context>
  )
}

/** Botón de la barra superior: pausar / reanudar, con un ecualizador que respira. */
export function SoundToggle() {
  const { t } = useI18n()
  const { available, status, toggle } = useAmbientSound()
  if (!available) return null
  const playing = status === 'playing'
  const label = playing ? t.sound.pause : status === 'blocked' ? t.sound.enable : t.sound.play

  return (
    <button
      type="button"
      data-sound-control
      onClick={toggle}
      aria-label={label}
      aria-pressed={playing}
      title={label}
      className="relative grid size-8 place-items-center rounded-full text-muted transition-[color,background-color,transform] duration-200 hover:bg-ink/[0.08] hover:text-foreground active:scale-[0.94]"
    >
      {playing ? (
        <span aria-hidden="true" className="sound-bars">
          <span />
          <span />
          <span />
        </span>
      ) : status === 'loading' ? (
        <Volume2 className="size-[1.05rem] opacity-50" aria-hidden="true" />
      ) : (
        <VolumeX className="size-[1.05rem]" aria-hidden="true" />
      )}
    </button>
  )
}

function promptDismissed(): boolean {
  try {
    return sessionStorage.getItem(PROMPT_KEY) === '1'
  } catch {
    return false
  }
}

/** Aviso discreto cuando el navegador bloquea el sonido. */
function SoundPrompt() {
  const { t } = useI18n()
  const { status, start } = useAmbientSound()
  const [hidden, setHidden] = useState(false)
  // Solo se lee en el cliente: el aviso nunca aparece en el HTML del servidor.
  const show = status === 'blocked' && !hidden && !promptDismissed()

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          data-sound-control
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1], delay: 0.6 }}
          className="glass liquid fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[45] flex items-center gap-1 rounded-full p-1"
        >
          <button
            type="button"
            onClick={start}
            className="flex h-9 items-center gap-2 rounded-full pr-3 pl-2.5 text-[0.85rem] font-bold text-foreground transition-[background-color,transform] duration-150 hover:bg-ink/[0.08] active:scale-[0.97]"
          >
            <Music2 className="size-4 text-aqua" aria-hidden="true" />
            {t.sound.enable}
          </button>
          <button
            type="button"
            onClick={() => {
              setHidden(true)
              try {
                sessionStorage.setItem(PROMPT_KEY, '1')
              } catch {
                // Sin almacenamiento.
              }
            }}
            aria-label={t.sound.dismiss}
            className="grid size-8 place-items-center rounded-full text-subtle transition-colors hover:bg-ink/[0.08] hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
