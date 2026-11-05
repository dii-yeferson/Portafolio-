import { useId } from 'react'

/**
 * Portada ilustrada para proyectos sin imagen: una composición SVG distinta
 * según la categoría (dashboard, regresión, aplicación web, red de datos,
 * terreno minero o tesis). Es determinista por `seed`, así que servidor y
 * cliente generan exactamente el mismo dibujo.
 */

type CoverProps = { seed: string; categories: string[]; title: string; className?: string }

function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Generador pseudoaleatorio con semilla (mulberry32). */
function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Variant = 'dashboard' | 'scatter' | 'web' | 'network' | 'terrain' | 'thesis'

function pickVariant(title: string, categories: string[]): Variant {
  const [first] = categories
  if (first === 'power-bi') return 'dashboard'
  if (/miner|mina|mining/i.test(title)) return 'terrain'
  if (first === 'machine-learning') return 'scatter'
  if (first === 'web-apps') return 'web'
  if (first === 'big-data') return 'network'
  if (first === 'thesis') return 'thesis'
  return 'dashboard'
}

const W = 480
const H = 300

export function ProjectCover({ seed, categories, title, className }: CoverProps) {
  const uid = useId().replace(/:/g, '')
  const seedNumber = hashString(seed)
  const variant = pickVariant(title, categories)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Ilustración del proyecto ${title}`}
      className={className}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#0f241c" />
          <stop offset="1" stopColor="#050b08" />
        </linearGradient>
        <linearGradient id={`${uid}-bar`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#6fe0aa" />
          <stop offset="1" stopColor="#1f6e50" />
        </linearGradient>
        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#4fb586" stopOpacity="0.55" />
          <stop offset="1" stopColor="#4fb586" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="0.75" cy="0.15" r="0.8">
          <stop stopColor="#3b9470" stopOpacity="0.35" />
          <stop offset="1" stopColor="#3b9470" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${uid}-bg)`} />
      <rect width={W} height={H} fill={`url(#${uid}-glow)`} />
      {variant === 'dashboard' && <Dashboard seed={seedNumber} uid={uid} />}
      {variant === 'scatter' && <Scatter seed={seedNumber} />}
      {variant === 'web' && <WebApp seed={seedNumber} uid={uid} />}
      {variant === 'network' && <Network seed={seedNumber} />}
      {variant === 'terrain' && <Terrain seed={seedNumber} uid={uid} />}
      {variant === 'thesis' && <Thesis seed={seedNumber} uid={uid} />}
    </svg>
  )
}

/** Cada variante crea su propio generador: el render es puro (Strict Mode, hidratación). */
type Part = { seed: number; uid?: string }

const panel = { fill: '#0b1a14', stroke: '#1d4636', strokeWidth: 1 }

function areaPath(values: number[], x0: number, y0: number, w: number, h: number) {
  const step = w / (values.length - 1)
  const points = values.map((v, i) => `${x0 + i * step},${y0 + h - v * h}`)
  return {
    line: `M${points.join(' L')}`,
    area: `M${x0},${y0 + h} L${points.join(' L')} L${x0 + w},${y0 + h} Z`,
  }
}

function Dashboard({ seed, uid }: Part) {
  const rand = random(seed)
  const bars = Array.from({ length: 9 }, () => 0.25 + rand() * 0.75)
  const trend = Array.from({ length: 12 }, (_, i) => 0.2 + (i / 11) * 0.55 + rand() * 0.18)
  const { line, area } = areaPath(trend, 250, 170, 200, 90)
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={30 + i * 145} y={24} width={130} height={52} rx={8} {...panel} />
          <rect x={44 + i * 145} y={38} width={44} height={6} rx={3} fill="#2c5c48" />
          <rect
            x={44 + i * 145}
            y={52}
            width={70 + rand() * 30}
            height={12}
            rx={4}
            fill="#9ff2cc"
            opacity={0.85}
          />
        </g>
      ))}
      <rect x={30} y={92} width={200} height={184} rx={10} {...panel} />
      {bars.map((v, i) => (
        <rect
          key={i}
          x={46 + i * 20}
          y={260 - v * 140}
          width={12}
          height={v * 140}
          rx={3}
          fill={`url(#${uid}-bar)`}
        />
      ))}
      <rect x={244} y={92} width={206} height={184} rx={10} {...panel} />
      <circle cx={300} cy={130} r={22} fill="none" stroke="#1d4636" strokeWidth={8} />
      <circle
        cx={300}
        cy={130}
        r={22}
        fill="none"
        stroke="#f2c811"
        strokeWidth={8}
        strokeDasharray="60 200"
        transform="rotate(-90 300 130)"
      />
      <circle
        cx={300}
        cy={130}
        r={22}
        fill="none"
        stroke="#6fe0aa"
        strokeWidth={8}
        strokeDasharray="45 200"
        strokeDashoffset={-62}
        transform="rotate(-90 300 130)"
      />
      <rect x={340} y={116} width={90} height={6} rx={3} fill="#2c5c48" />
      <rect x={340} y={132} width={64} height={6} rx={3} fill="#2c5c48" />
      <path d={area} fill={`url(#${uid}-area)`} />
      <path d={line} fill="none" stroke="#6fe0aa" strokeWidth={2.2} />
    </g>
  )
}

function Scatter({ seed }: Part) {
  const rand = random(seed)
  const points = Array.from({ length: 90 }, () => {
    const x = rand()
    const y = Math.min(0.98, Math.max(0.02, x * 0.8 + 0.1 + (rand() - 0.5) * 0.32))
    return [56 + x * 380, 262 - y * 210] as const
  })
  return (
    <g>
      <rect x={30} y={22} width={420} height={256} rx={12} {...panel} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`h${i}`}
          x1={56}
          x2={436}
          y1={52 + i * 52}
          y2={52 + i * 52}
          stroke="#163a2d"
          strokeDasharray="3 5"
        />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line
          key={`v${i}`}
          y1={52}
          y2={262}
          x1={56 + i * 63}
          x2={56 + i * 63}
          stroke="#12301f"
          strokeDasharray="3 5"
        />
      ))}
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={2.6 + (i % 3)}
          fill={i % 4 === 0 ? '#5fd6c6' : '#3d8bfd'}
          opacity={0.75}
        />
      ))}
      <line x1={56} y1={241} x2={436} y2={73} stroke="#9ff2cc" strokeWidth={2.4} />
      <rect x={52} y={34} width={70} height={7} rx={3} fill="#2c5c48" />
    </g>
  )
}

function WebApp({ seed, uid }: Part) {
  const rand = random(seed)
  const trend = Array.from({ length: 10 }, () => 0.25 + rand() * 0.6)
  const { line, area } = areaPath(trend, 170, 110, 260, 80)
  return (
    <g>
      <rect x={24} y={18} width={432} height={266} rx={12} fill="#0a1611" stroke="#1d4636" />
      <rect x={24} y={18} width={432} height={26} rx={12} fill="#10241b" />
      {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
        <circle key={c} cx={42 + i * 14} cy={31} r={4.2} fill={c} opacity={0.85} />
      ))}
      <rect x={120} y={26} width={240} height={10} rx={5} fill="#0a1611" />
      <rect x={24} y={44} width={120} height={240} fill="#0d1d16" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={40}
          y={64 + i * 30}
          width={i === 1 ? 92 : 70}
          height={10}
          rx={5}
          fill={i === 1 ? '#3b9470' : '#1f3f32'}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={160 + i * 96} y={56} width={84} height={42} rx={8} {...panel} />
          <rect x={170 + i * 96} y={66} width={30} height={5} rx={2.5} fill="#2c5c48" />
          <rect
            x={170 + i * 96}
            y={78}
            width={50}
            height={10}
            rx={4}
            fill="#9ff2cc"
            opacity={0.85}
          />
        </g>
      ))}
      <rect x={160} y={106} width={280} height={96} rx={8} {...panel} />
      <path d={area} fill={`url(#${uid}-area)`} />
      <path d={line} fill="none" stroke="#6fe0aa" strokeWidth={2} />
      {[0, 1, 2].map((i) => (
        <g key={`r${i}`}>
          <rect
            x={160}
            y={214 + i * 22}
            width={280}
            height={16}
            rx={5}
            fill={i % 2 ? '#0d1d16' : '#10241b'}
          />
          <rect x={172} y={219 + i * 22} width={90} height={6} rx={3} fill="#2c5c48" />
          <rect
            x={360}
            y={219 + i * 22}
            width={60}
            height={6}
            rx={3}
            fill="#3b9470"
            opacity={0.7}
          />
        </g>
      ))}
    </g>
  )
}

function Network({ seed }: Part) {
  const rand = random(seed)
  const nodes = Array.from({ length: 26 }, () => [40 + rand() * 400, 30 + rand() * 240] as const)
  const edges: [number, number][] = []
  nodes.forEach((a, i) => {
    nodes.forEach((b, j) => {
      if (j <= i) return
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 110) edges.push([i, j])
    })
  })
  return (
    <g>
      {edges.map(([i, j]) => (
        <line
          key={`${i}-${j}`}
          x1={nodes[i]![0]}
          y1={nodes[i]![1]}
          x2={nodes[j]![0]}
          y2={nodes[j]![1]}
          stroke="#2f7a5d"
          strokeOpacity={0.55}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i % 5 === 0 ? 9 : 4} fill="#3b9470" opacity={0.25} />
          <circle cx={x} cy={y} r={i % 5 === 0 ? 4.5 : 2.4} fill="#9ff2cc" />
        </g>
      ))}
    </g>
  )
}

function Terrain({ seed, uid }: Part) {
  const rand = random(seed)
  const ridge = (base: number, amp: number) => {
    const points = Array.from({ length: 13 }, (_, i) => `${i * 40},${base - rand() * amp}`)
    return `M0,${H} L${points.join(' L')} L${W},${H} Z`
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#c99a6a" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#3a3326" stopOpacity="0.35" />
          <stop offset="1" stopColor="#050b08" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-rock`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#8a6a4a" />
          <stop offset="1" stopColor="#2a2118" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${uid}-sky)`} />
      <path d={ridge(120, 60)} fill="#5c4a37" opacity={0.6} />
      <path d={ridge(165, 45)} fill={`url(#${uid}-rock)`} opacity={0.9} />
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse
          key={i}
          cx={250}
          cy={236}
          rx={190 - i * 34}
          ry={44 - i * 8}
          fill="none"
          stroke="#c9a273"
          strokeOpacity={0.45 - i * 0.05}
          strokeWidth={2}
        />
      ))}
      <ellipse cx={250} cy={236} rx={40} ry={8} fill="#1d6b5a" opacity={0.85} />
      <rect x={340} y={150} width={60} height={22} rx={3} fill="#2f5d73" opacity={0.85} />
      <rect x={350} y={140} width={34} height={12} rx={2} fill="#3b7c97" opacity={0.8} />
      {[
        [120, 196],
        [318, 206],
        [212, 170],
      ].map(([x, y]) => (
        <g key={`${x}`}>
          <circle cx={x} cy={y} r={14} fill="none" stroke="#6fe0aa" strokeOpacity={0.5} />
          <circle cx={x} cy={y} r={4} fill="#9ff2cc" />
        </g>
      ))}
      <path
        d="M120 196 L212 170 L318 206"
        fill="none"
        stroke="#6fe0aa"
        strokeOpacity={0.6}
        strokeDasharray="4 5"
      />
    </g>
  )
}

function Thesis({ seed, uid }: Part) {
  const rand = random(seed)
  const bars = Array.from({ length: 6 }, () => 0.3 + rand() * 0.7)
  return (
    <g>
      <rect x={140} y={22} width={200} height={258} rx={8} fill="#0d1d16" stroke="#1d4636" />
      <rect x={160} y={44} width={120} height={10} rx={5} fill="#9ff2cc" opacity={0.85} />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={160}
          y={68 + i * 14}
          width={160 - (i % 2) * 30}
          height={6}
          rx={3}
          fill="#2c5c48"
        />
      ))}
      <rect x={160} y={134} width={160} height={84} rx={6} {...panel} />
      {bars.map((v, i) => (
        <rect
          key={i}
          x={172 + i * 24}
          y={208 - v * 62}
          width={14}
          height={v * 62}
          rx={3}
          fill={`url(#${uid}-bar)`}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <rect
          key={`t${i}`}
          x={160}
          y={232 + i * 14}
          width={150 - i * 20}
          height={6}
          rx={3}
          fill="#2c5c48"
        />
      ))}
    </g>
  )
}
