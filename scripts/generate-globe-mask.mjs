/**
 * Genera la máscara de continentes del globo del hero.
 *
 *   npm run globe:generate
 *
 * Distribuye N puntos uniformes sobre la esfera (espiral de Fibonacci) y marca
 * con un bit los que caen sobre tierra firme (Natural Earth 50m vía world-atlas).
 * El navegador reconstruye los puntos a partir del índice, así que solo se
 * envía un bitmask de ~3 KB en lugar de miles de coordenadas.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

import { feature } from 'topojson-client'

const POINT_COUNT = 22_000
const OUTPUT = new URL('../src/components/hero/globe-land-mask.ts', import.meta.url)
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const DEG = 180 / Math.PI

const require = createRequire(import.meta.url)
const topology = JSON.parse(await readFile(require.resolve('world-atlas/land-50m.json'), 'utf8'))
const land = feature(topology, topology.objects.land)
const geometries = (land.features ?? [land]).map((item) => item.geometry)

/** Polígonos con su caja envolvente para descartar rápidamente. */
const polygons = geometries.flatMap((geometry) =>
  (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates).map((rings) => {
    const [outer] = rings
    const xs = outer.map(([x]) => x)
    const ys = outer.map(([, y]) => y)
    return {
      rings,
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    }
  }),
)

/** Punto en anillo por ray casting (coordenadas lon/lat; Natural Earth corta en ±180°). */
function inRing(x, y, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function isLand(lng, lat) {
  return polygons.some(
    (polygon) =>
      lng >= polygon.minX &&
      lng <= polygon.maxX &&
      lat >= polygon.minY &&
      lat <= polygon.maxY &&
      inRing(lng, lat, polygon.rings[0]) &&
      !polygon.rings.slice(1).some((hole) => inRing(lng, lat, hole)),
  )
}

const bytes = new Uint8Array(Math.ceil(POINT_COUNT / 8))
let landCount = 0

for (let i = 0; i < POINT_COUNT; i += 1) {
  // Misma fórmula que fibonacciPoint() en src/components/hero/data-globe.tsx.
  const y = 1 - ((i + 0.5) / POINT_COUNT) * 2
  const radius = Math.sqrt(1 - y * y)
  const theta = i * GOLDEN_ANGLE
  const x = Math.cos(theta) * radius
  const z = Math.sin(theta) * radius
  if (isLand(Math.atan2(x, z) * DEG, Math.asin(y) * DEG)) {
    bytes[i >> 3] |= 1 << (i & 7)
    landCount += 1
  }
}

const source = `// Archivo generado por scripts/generate-globe-mask.mjs — no editar a mano.
// Datos: Natural Earth (dominio público) vía world-atlas.

/** Puntos totales de la espiral de Fibonacci. */
export const GLOBE_POINT_COUNT = ${POINT_COUNT}

/** Bit i = 1 si el punto i de la espiral cae sobre tierra firme (${landCount} puntos). */
export const GLOBE_LAND_MASK =
  '${Buffer.from(bytes).toString('base64')}'
`

await writeFile(OUTPUT, source)
console.log(`Máscara generada: ${landCount} de ${POINT_COUNT} puntos sobre tierra.`)
