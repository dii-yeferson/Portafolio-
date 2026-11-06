/**
 * Sonido del «me gusta» sintetizado con Web Audio (sin archivos): un «pop»
 * cristalino de dos notas que sube, muy bajo de volumen. Al quitar el me
 * gusta suena una nota corta que baja. Solo se crea el contexto de audio
 * tras un gesto del usuario, como exigen los navegadores.
 */
let context: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) return null
  context ??= new AudioCtor()
  if (context.state === 'suspended') void context.resume()
  return context
}

function tone(
  ctx: AudioContext,
  {
    type,
    from,
    to,
    start,
    duration,
    volume,
  }: {
    type: OscillatorType
    from: number
    to: number
    start: number
    duration: number
    volume: number
  },
) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const at = ctx.currentTime + start
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from, at)
  oscillator.frequency.exponentialRampToValueAtTime(to, at + duration * 0.6)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(at)
  oscillator.stop(at + duration + 0.02)
}

export function playLikeSound(liked: boolean) {
  try {
    const ctx = getContext()
    if (!ctx) return
    if (liked) {
      tone(ctx, { type: 'sine', from: 620, to: 930, start: 0, duration: 0.2, volume: 0.07 })
      tone(ctx, {
        type: 'triangle',
        from: 1240,
        to: 1560,
        start: 0.06,
        duration: 0.16,
        volume: 0.025,
      })
    } else {
      tone(ctx, { type: 'sine', from: 520, to: 360, start: 0, duration: 0.14, volume: 0.04 })
    }
  } catch {
    // Sin audio disponible: la animación basta.
  }
}
