import { GLOBE_LAND_MASK, GLOBE_POINT_COUNT } from './globe-land-mask'

/**
 * Globo terráqueo de nodos de datos (FR-02) dibujado en Canvas 2D.
 *
 * - Continentes como puntos (máscara de Fibonacci de ~4 KB, sin texturas).
 * - Arcos de datos con pulsos, nodos brillantes, meridianos y anillos orbitales.
 * - Gira suave, se puede arrastrar, se pausa fuera del viewport y respeta
 *   `prefers-reduced-motion` (queda estático salvo que el usuario lo arrastre).
 */

type Vec3 = [number, number, number]

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const DEG = Math.PI / 180
const TAU = Math.PI * 2

/** Rotación automática (radianes por segundo) e inclinación del eje. */
const AUTO_SPEED = 0.12
const TILT = 0.32
/** Longitud que mira al frente al cargar: América. */
const INITIAL_SPIN = 72 * DEG

/** Nodo central (Lima) y ciudades conectadas por arcos de datos. */
const HUB: [number, number] = [-12.05, -77.04]
const CITIES: [number, number][] = [
  [4.71, -74.07], // Bogotá
  [19.43, -99.13], // Ciudad de México
  [-33.45, -70.67], // Santiago
  [-23.55, -46.63], // São Paulo
  [-34.6, -58.38], // Buenos Aires
  [40.71, -74.0], // Nueva York
  [37.77, -122.42], // San Francisco
  [40.42, -3.7], // Madrid
  [51.5, -0.12], // Londres
]

type Palette = {
  dot: string
  dotEdge: string
  dotBack: string
  graticule: string
  arcFrom: readonly [number, number, number]
  arcTo: readonly [number, number, number]
  node: string
  pulse: string
  glow: string
  ring: string
  atmosphere: readonly [string, string, string]
  body: readonly [string, string, string]
  rim: readonly [string, string, string]
}

/** Paletas aurora: oscura (grafito) y clara (porcelana). Se eligen según `data-theme`. */
const PALETTES: Record<'dark' | 'light', Palette> = {
  dark: {
    dot: '#7fe6f0',
    dotEdge: '#8b9cff',
    dotBack: '#3d5a86',
    graticule: 'rgba(139, 156, 255, 0.085)',
    arcFrom: [149, 251, 223],
    arcTo: [139, 156, 255],
    node: '#e9fffa',
    pulse: '107, 222, 238',
    glow: 'rgba(236, 255, 250, 0.95)',
    ring: '139, 156, 255',
    atmosphere: ['rgba(98, 210, 248, 0.22)', 'rgba(139, 156, 255, 0.08)', 'rgba(139, 156, 255, 0)'],
    body: ['rgba(34, 52, 78, 0.6)', 'rgba(12, 16, 26, 0.86)', 'rgba(7, 8, 12, 0.94)'],
    rim: ['rgba(149, 251, 223, 0.42)', 'rgba(98, 210, 248, 0.08)', 'rgba(139, 156, 255, 0.32)'],
  },
  light: {
    dot: '#0b8ea3',
    dotEdge: '#5a6cf0',
    dotBack: '#9fb0c8',
    graticule: 'rgba(70, 90, 200, 0.1)',
    arcFrom: [16, 170, 140],
    arcTo: [90, 108, 240],
    node: '#0b6f80',
    pulse: '11, 142, 163',
    glow: 'rgba(11, 142, 163, 0.9)',
    ring: '90, 108, 240',
    atmosphere: ['rgba(27, 143, 214, 0.16)', 'rgba(90, 108, 240, 0.06)', 'rgba(90, 108, 240, 0)'],
    body: ['rgba(255, 255, 255, 0.85)', 'rgba(238, 242, 248, 0.92)', 'rgba(224, 230, 240, 0.96)'],
    rim: ['rgba(16, 170, 140, 0.5)', 'rgba(27, 143, 214, 0.12)', 'rgba(90, 108, 240, 0.4)'],
  },
}

function currentPalette(): Palette {
  return document.documentElement.dataset.theme === 'light' ? PALETTES.light : PALETTES.dark
}

let COLORS: Palette = PALETTES.dark

function arcColor(t: number, alpha: number) {
  const [r0, g0, b0] = COLORS.arcFrom
  const [r1, g1, b1] = COLORS.arcTo
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t)
  return `rgba(${mix(r0, r1)}, ${mix(g0, g1)}, ${mix(b0, b1)}, ${alpha})`
}

/** Punto i de la espiral de Fibonacci (misma fórmula que scripts/generate-globe-mask.mjs). */
function fibonacciPoint(index: number, count: number): Vec3 {
  const y = 1 - ((index + 0.5) / count) * 2
  const radius = Math.sqrt(1 - y * y)
  const theta = index * GOLDEN_ANGLE
  return [Math.cos(theta) * radius, y, Math.sin(theta) * radius]
}

function latLngToVector(lat: number, lng: number, altitude = 1): Vec3 {
  const phi = lat * DEG
  const lambda = lng * DEG
  return [
    Math.cos(phi) * Math.sin(lambda) * altitude,
    Math.sin(phi) * altitude,
    Math.cos(phi) * Math.cos(lambda) * altitude,
  ]
}

function decodeLandPoints(): Float32Array {
  const bytes = atob(GLOBE_LAND_MASK)
  const coords: number[] = []
  for (let i = 0; i < GLOBE_POINT_COUNT; i += 1) {
    if (bytes.charCodeAt(i >> 3) & (1 << (i & 7)))
      coords.push(...fibonacciPoint(i, GLOBE_POINT_COUNT))
  }
  return Float32Array.from(coords)
}

/** Arco de círculo máximo entre dos puntos, elevado sobre la superficie. */
function buildArc(from: [number, number], to: [number, number], samples = 56): Float32Array {
  const a = latLngToVector(...from)
  const b = latLngToVector(...to)
  const omega = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])))
  const lift = 0.06 + 0.22 * (omega / Math.PI)
  const out = new Float32Array((samples + 1) * 3)
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    const sin = Math.sin(omega) || 1
    const wa = Math.sin((1 - t) * omega) / sin
    const wb = Math.sin(t * omega) / sin
    const altitude = 1 + lift * Math.sin(Math.PI * t)
    out[i * 3] = (a[0] * wa + b[0] * wb) * altitude
    out[i * 3 + 1] = (a[1] * wa + b[1] * wb) * altitude
    out[i * 3 + 2] = (a[2] * wa + b[2] * wb) * altitude
  }
  return out
}

function buildGraticule(): Float32Array[] {
  const lines: Float32Array[] = []
  for (let lat = -60; lat <= 60; lat += 30) {
    const line: number[] = []
    for (let lng = -180; lng <= 180; lng += 4) line.push(...latLngToVector(lat, lng))
    lines.push(Float32Array.from(line))
  }
  for (let lng = -180; lng < 180; lng += 30) {
    const line: number[] = []
    for (let lat = -88; lat <= 88; lat += 4) line.push(...latLngToVector(lat, lng))
    lines.push(Float32Array.from(line))
  }
  return lines
}

/** Anillo orbital inclinado (fijo, no gira con la Tierra). */
function buildRing(radius: number, tiltX: number, tiltZ: number, samples = 160): Float32Array {
  const out = new Float32Array(samples * 3)
  const cx = Math.cos(tiltX)
  const sx = Math.sin(tiltX)
  const cz = Math.cos(tiltZ)
  const sz = Math.sin(tiltZ)
  for (let i = 0; i < samples; i += 1) {
    const angle = (i / samples) * TAU
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    // Inclinación alrededor de X y luego de Z.
    const y1 = -z * sx
    const z1 = z * cx
    out[i * 3] = x * cz - y1 * sz
    out[i * 3 + 1] = x * sz + y1 * cz
    out[i * 3 + 2] = z1
  }
  return out
}

/**
 * Monta el globo sobre un `<canvas>` y devuelve la función que lo desmonta.
 * No depende de React: lo usan el componente del sitio y la vista previa estática.
 */
export function mountGlobe(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const land = decodeLandPoints()
  const graticule = buildGraticule()
  const arcs = CITIES.map((city) => buildArc(HUB, city))
  const nodes = [HUB, ...CITIES].map(([lat, lng]) => latLngToVector(lat, lng))
  const rings = [buildRing(1.2, 74 * DEG, -16 * DEG), buildRing(1.36, 80 * DEG, 22 * DEG)]
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  COLORS = currentPalette()
  // El tema puede cambiar sin recargar: el globo cambia de paleta en el siguiente cuadro.
  const themeObserver = new MutationObserver(() => {
    COLORS = currentPalette()
    if (reducedMotion) render(elapsed)
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  let width = 0
  let height = 0
  let dpr = 1
  let radius = 0
  let cx = 0
  let cy = 0
  let spin = INITIAL_SPIN
  let velocity = AUTO_SPEED
  let elapsed = 0
  let lastTime = 0
  let frame = 0
  let visible = true
  let dragging = false
  let dragX = 0

  const cosT = Math.cos(TILT)
  const sinT = Math.sin(TILT)
  // Proyección: giro en Y (spin) + inclinación en X. Devuelve [x, y, z] en pantalla.
  const out: Vec3 = [0, 0, 0]
  let cosS = 1
  let sinS = 0
  function project(x: number, y: number, z: number, spun = true): Vec3 {
    const x1 = spun ? x * cosS + z * sinS : x
    const z1 = spun ? -x * sinS + z * cosS : z
    out[0] = cx + x1 * radius
    out[1] = cy - (y * cosT - z1 * sinT) * radius
    out[2] = y * sinT + z1 * cosT
    return out
  }
  // Un punto elevado detrás del globo solo se ve si sobresale del disco.
  const isVisible = (sx: number, sy: number, z: number) =>
    z > 0 || (sx - cx) ** 2 + (sy - cy) ** 2 > radius * radius

  function resize() {
    const rect = canvas!.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = Math.max(1, Math.round(rect.width * dpr))
    height = Math.max(1, Math.round(rect.height * dpr))
    canvas!.width = width
    canvas!.height = height
    radius = Math.min(width, height) * 0.36
    cx = width / 2
    cy = height / 2
  }

  function drawRing(points: Float32Array, front: boolean, time: number) {
    ctx!.lineWidth = dpr
    ctx!.beginPath()
    let started = false
    for (let i = 0; i <= points.length / 3; i += 1) {
      const j = (i % (points.length / 3)) * 3
      const [sx, sy, z] = project(points[j]!, points[j + 1]!, points[j + 2]!, false)
      // Mitad trasera antes del cuerpo del globo (queda tapada) y delantera después.
      if (front ? z >= 0 : z < 0) {
        if (started) ctx!.lineTo(sx, sy)
        else ctx!.moveTo(sx, sy)
        started = true
      } else {
        started = false
      }
    }
    ctx!.strokeStyle = `rgba(${COLORS.ring}, ${front ? 0.34 : 0.1})`
    ctx!.stroke()
    if (!front) return
    // Satélites que recorren el anillo.
    const count = points.length / 3
    for (let s = 0; s < 2; s += 1) {
      const index = Math.floor(((time * 0.025 + s / 2) % 1) * count) * 3
      const [sx, sy, z] = project(points[index]!, points[index + 1]!, points[index + 2]!, false)
      if (z < 0) continue
      ctx!.fillStyle = COLORS.node
      ctx!.beginPath()
      ctx!.arc(sx, sy, 1.8 * dpr, 0, TAU)
      ctx!.fill()
    }
  }

  function render(time: number) {
    cosS = Math.cos(spin)
    sinS = Math.sin(spin)
    ctx!.clearRect(0, 0, width, height)

    // Atmósfera.
    const atmosphere = ctx!.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.42)
    atmosphere.addColorStop(0, COLORS.atmosphere[0])
    atmosphere.addColorStop(0.55, COLORS.atmosphere[1])
    atmosphere.addColorStop(1, COLORS.atmosphere[2])
    ctx!.fillStyle = atmosphere
    ctx!.beginPath()
    ctx!.arc(cx, cy, radius * 1.42, 0, TAU)
    ctx!.fill()

    for (const ring of rings) drawRing(ring, false, time)

    // Puntos del hemisferio posterior (profundidad).
    ctx!.fillStyle = COLORS.dotBack
    ctx!.globalAlpha = 0.16
    const backSize = 0.9 * dpr
    for (let i = 0; i < land.length; i += 3) {
      const [sx, sy, z] = project(land[i]!, land[i + 1]!, land[i + 2]!)
      if (z < 0) ctx!.fillRect(sx - backSize / 2, sy - backSize / 2, backSize, backSize)
    }
    ctx!.globalAlpha = 1

    // Cuerpo del globo con volumen.
    const body = ctx!.createRadialGradient(
      cx - radius * 0.35,
      cy - radius * 0.4,
      radius * 0.05,
      cx,
      cy,
      radius,
    )
    body.addColorStop(0, COLORS.body[0])
    body.addColorStop(0.65, COLORS.body[1])
    body.addColorStop(1, COLORS.body[2])
    ctx!.fillStyle = body
    ctx!.beginPath()
    ctx!.arc(cx, cy, radius, 0, TAU)
    ctx!.fill()

    // Meridianos y paralelos.
    ctx!.strokeStyle = COLORS.graticule
    ctx!.lineWidth = dpr * 0.8
    for (const line of graticule) {
      ctx!.beginPath()
      let started = false
      for (let i = 0; i < line.length; i += 3) {
        const [sx, sy, z] = project(line[i]!, line[i + 1]!, line[i + 2]!)
        if (z > 0) {
          if (started) ctx!.lineTo(sx, sy)
          else ctx!.moveTo(sx, sy)
          started = true
        } else {
          started = false
        }
      }
      ctx!.stroke()
    }

    // Continentes: aqua al frente, iris hacia el borde.
    for (let i = 0; i < land.length; i += 3) {
      const [sx, sy, z] = project(land[i]!, land[i + 1]!, land[i + 2]!)
      if (z <= 0) continue
      const size = (0.9 + 1.1 * z) * dpr
      ctx!.fillStyle = z > 0.45 ? COLORS.dot : COLORS.dotEdge
      ctx!.globalAlpha = 0.16 + 0.84 * z
      ctx!.fillRect(sx - size / 2, sy - size / 2, size, size)
    }
    ctx!.globalAlpha = 1

    // Arcos de datos con pulso viajero.
    ctx!.lineWidth = 1.2 * dpr
    arcs.forEach((arc, index) => {
      const count = arc.length / 3
      let previous: [number, number] | null = null
      for (let i = 0; i < count; i += 1) {
        const [sx, sy, z] = project(arc[i * 3]!, arc[i * 3 + 1]!, arc[i * 3 + 2]!)
        if (!isVisible(sx, sy, z)) {
          previous = null
          continue
        }
        if (previous) {
          ctx!.strokeStyle = arcColor(i / (count - 1), 0.16 + 0.46 * Math.max(0, z))
          ctx!.beginPath()
          ctx!.moveTo(previous[0], previous[1])
          ctx!.lineTo(sx, sy)
          ctx!.stroke()
        }
        previous = [sx, sy]
      }
      const progress = (time * 0.18 + index / arcs.length) % 1
      const p = Math.floor(progress * (count - 1)) * 3
      const [px, py, pz] = project(arc[p]!, arc[p + 1]!, arc[p + 2]!)
      if (isVisible(px, py, pz)) {
        const glow = ctx!.createRadialGradient(px, py, 0, px, py, 7 * dpr)
        glow.addColorStop(0, COLORS.glow)
        glow.addColorStop(0.4, arcColor(progress, 0.55))
        glow.addColorStop(1, arcColor(progress, 0))
        ctx!.fillStyle = glow
        ctx!.beginPath()
        ctx!.arc(px, py, 7 * dpr, 0, TAU)
        ctx!.fill()
      }
    })

    // Nodos con onda expansiva.
    nodes.forEach(([x, y, z], index) => {
      const [sx, sy, depth] = project(x, y, z)
      if (depth <= 0.02) return
      const pulse = (time * 0.55 + index * 0.37) % 1
      ctx!.strokeStyle = `rgba(${COLORS.pulse}, ${(1 - pulse) * 0.6 * depth})`
      ctx!.lineWidth = dpr
      ctx!.beginPath()
      ctx!.arc(sx, sy, (2 + pulse * (index === 0 ? 16 : 10)) * dpr, 0, TAU)
      ctx!.stroke()
      ctx!.fillStyle = COLORS.node
      ctx!.globalAlpha = 0.4 + 0.6 * depth
      ctx!.beginPath()
      ctx!.arc(sx, sy, (index === 0 ? 2.8 : 2) * dpr, 0, TAU)
      ctx!.fill()
      ctx!.globalAlpha = 1
    })

    // Borde iluminado.
    const rim = ctx!.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius)
    rim.addColorStop(0, COLORS.rim[0])
    rim.addColorStop(0.5, COLORS.rim[1])
    rim.addColorStop(1, COLORS.rim[2])
    ctx!.strokeStyle = rim
    ctx!.lineWidth = 1.2 * dpr
    ctx!.beginPath()
    ctx!.arc(cx, cy, radius, 0, TAU)
    ctx!.stroke()

    for (const ring of rings) drawRing(ring, true, time)
  }

  function tick(now: number) {
    const delta = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0
    lastTime = now
    elapsed += delta
    if (!dragging) {
      velocity += (AUTO_SPEED - velocity) * Math.min(1, delta * 1.6)
      spin += velocity * delta
    }
    render(elapsed)
    frame = requestAnimationFrame(tick)
  }

  function start() {
    if (reducedMotion || frame || !visible) return
    lastTime = 0
    frame = requestAnimationFrame(tick)
  }

  function stop() {
    cancelAnimationFrame(frame)
    frame = 0
  }

  function onPointerDown(event: PointerEvent) {
    dragging = true
    dragX = event.clientX
    canvas!.setPointerCapture(event.pointerId)
  }
  function onPointerMove(event: PointerEvent) {
    if (!dragging) return
    const dx = event.clientX - dragX
    dragX = event.clientX
    spin += dx * 0.006
    velocity = dx * 0.35
    if (reducedMotion) render(elapsed)
  }
  function onPointerUp(event: PointerEvent) {
    dragging = false
    if (canvas!.hasPointerCapture(event.pointerId)) canvas!.releasePointerCapture(event.pointerId)
  }

  resize()
  render(0)

  const resizeObserver = new ResizeObserver(() => {
    resize()
    render(elapsed)
  })
  resizeObserver.observe(canvas)

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false
      if (visible) start()
      else stop()
    },
    { rootMargin: '120px' },
  )
  visibilityObserver.observe(canvas)

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)
  start()

  return () => {
    stop()
    themeObserver.disconnect()
    resizeObserver.disconnect()
    visibilityObserver.disconnect()
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
  }
}
