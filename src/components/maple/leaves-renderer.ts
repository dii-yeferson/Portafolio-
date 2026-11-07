/**
 * Hojas de arce que caen de forma continua, mecidas por la brisa: oscilan
 * a los lados, giran y se voltean un poco (escala horizontal). Al salir por
 * abajo vuelven a nacer arriba con un fundido: el ciclo no tiene cortes.
 * Sin dependencias: lo usan el sitio (React) y la vista previa estática.
 */
import { rafSchedule, type Schedule } from './canopy-renderer'

const COLORS = ['#ff2a12', '#ff4d1a', '#e8141f', '#ff7a1f', '#ffa23a', '#c90f1c']

type Leaf = {
  x: number
  y: number
  speed: number
  size: number
  rotation: number
  spin: number
  swayAmp: number
  swayFreq: number
  phase: number
  flipFreq: number
  sprite: number
  alpha: number
  maxAlpha: number
}

/** Hoja de arce japonés: siete lóbulos en punta y un tallo. */
function leafPath(): Path2D {
  const path = new Path2D()
  const lobes = 7
  const tips = [0.52, 0.78, 0.94, 1, 0.94, 0.78, 0.52]
  const spread = 33
  const points: [number, number][] = []
  for (let k = 0; k < lobes; k += 1) {
    const angle = ((-90 + (k - 3) * spread) * Math.PI) / 180
    const next = ((-90 + (k - 2) * spread) * Math.PI) / 180
    points.push([Math.cos(angle) * tips[k]!, Math.sin(angle) * tips[k]! + 0.18])
    if (k < lobes - 1) {
      const valley = (angle + next) / 2
      points.push([Math.cos(valley) * 0.3, Math.sin(valley) * 0.3 + 0.18])
    }
  }
  path.moveTo(0, 0.3)
  for (const [x, y] of points) path.lineTo(x, y)
  path.closePath()
  path.moveTo(0, 0.25)
  path.lineTo(0.03, 0.62)
  return path
}

function makeSprites(): HTMLCanvasElement[] {
  const shape = leafPath()
  return COLORS.map((color) => {
    const size = 64
    const sprite = document.createElement('canvas')
    sprite.width = size
    sprite.height = size
    const ctx = sprite.getContext('2d')!
    ctx.translate(size / 2, size / 2)
    ctx.scale(size * 0.44, size * 0.44)
    const gradient = ctx.createRadialGradient(0, 0.1, 0.05, 0, 0.1, 1)
    gradient.addColorStop(0, '#ffd27a')
    gradient.addColorStop(0.35, color)
    gradient.addColorStop(1, color)
    ctx.fillStyle = gradient
    ctx.strokeStyle = color
    ctx.lineWidth = 0.05
    ctx.fill(shape)
    ctx.stroke(shape)
    return sprite
  })
}

export function mountLeaves(
  canvas: HTMLCanvasElement,
  {
    layer = 'back',
    schedule = rafSchedule,
  }: { layer?: 'back' | 'front'; schedule?: Schedule } = {},
): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const context = canvas.getContext('2d')
  if (!context) return () => {}
  const ctx: CanvasRenderingContext2D = context

  const sprites = makeSprites()
  const front = layer === 'front'
  let width = 0
  let height = 0
  let dpr = 1
  let last = 0
  let leaves: Leaf[] = []

  const random = (min: number, max: number) => min + Math.random() * (max - min)

  function spawn(leaf: Partial<Leaf> = {}, fromTop = true): Leaf {
    // La mayoría nace bajo la copa (derecha y arriba), algunas en cualquier parte.
    const underTree = Math.random() < 0.65
    return {
      x: underTree ? random(width * 0.3, width * 1.02) : random(-20, width),
      y: fromTop ? random(-80, -20) : random(-40, height),
      speed: front ? random(42, 70) : random(26, 58),
      size: front ? random(7, 12) : random(10, 22),
      rotation: random(0, Math.PI * 2),
      spin: random(-0.9, 0.9),
      swayAmp: random(18, 46),
      swayFreq: random(0.5, 1.1),
      phase: random(0, Math.PI * 2),
      flipFreq: random(0.6, 1.6),
      sprite: Math.floor(random(0, sprites.length)),
      alpha: fromTop ? 0 : random(0.4, 1),
      maxAlpha: front ? random(0.55, 0.8) : random(0.7, 1),
      ...leaf,
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const narrow = width < 640
    const target = front ? (narrow ? 2 : 5) : narrow ? 12 : 26
    if (leaves.length === 0) leaves = Array.from({ length: target }, () => spawn({}, false))
    else if (leaves.length > target) leaves.length = target
    else while (leaves.length < target) leaves.push(spawn())
  }

  let hidden = document.hidden
  const onVisibility = () => {
    hidden = document.hidden
    last = 0
  }

  function tick(timestamp: number) {
    if (hidden) return
    const delta = last ? Math.min(0.05, (timestamp - last) / 1000) : 0
    last = timestamp
    const time = timestamp / 1000
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < leaves.length; i += 1) {
      let leaf = leaves[i]!
      leaf.y += leaf.speed * delta
      leaf.rotation += leaf.spin * delta
      leaf.alpha = Math.min(leaf.maxAlpha, leaf.alpha + delta * 0.6)
      if (leaf.y > height + 40) {
        leaf = spawn()
        leaves[i] = leaf
      }
      const sway = Math.sin(time * leaf.swayFreq + leaf.phase) * leaf.swayAmp
      const flip = Math.cos(time * leaf.flipFreq + leaf.phase)
      const x = leaf.x + sway
      const size = leaf.size * dpr
      ctx.setTransform(1, 0, 0, 1, x * dpr, leaf.y * dpr)
      ctx.rotate(leaf.rotation + sway * 0.004)
      ctx.scale(0.35 + 0.65 * Math.abs(flip), 1)
      ctx.globalAlpha = leaf.alpha * (0.75 + 0.25 * Math.abs(flip))
      ctx.drawImage(sprites[leaf.sprite]!, -size / 2, -size / 2, size, size)
    }
    ctx.globalAlpha = 1
  }

  resize()
  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', onVisibility)
  const stop = schedule(() => tick(performance.now()))
  return () => {
    stop()
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
