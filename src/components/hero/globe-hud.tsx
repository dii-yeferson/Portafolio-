/**
 * Capa tecnológica alrededor del globo (detrás del retrato): anillos finos,
 * puntos de luz en órbita, conexiones curvas y tres gráficos pequeños
 * (barras, línea y dona). Todo es SVG decorativo animado con CSS que solo
 * mueve `transform` y `opacity`; con «reducir movimiento» queda quieto.
 * Azul y celeste dominan; ámbar y rojo arce aparecen como acentos.
 */
const BARS = [0.42, 0.7, 0.5, 0.86, 0.62, 1, 0.74]
const LINE = [0.62, 0.48, 0.58, 0.34, 0.44, 0.22, 0.3, 0.12]

function linePath(values: number[], width: number, height: number) {
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = value * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export function GlobeHud() {
  const lineD = linePath(LINE, 120, 46)

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Anillos finos y puntos que orbitan en sentidos opuestos. */}
      <svg
        viewBox="0 0 100 100"
        className="hud-spin-slow absolute inset-0 size-full overflow-visible"
      >
        <circle cx="50" cy="50" r="46.5" className="hud-ring" strokeDasharray="0.6 1.6" />
        <circle cx="50" cy="3.5" r="0.9" className="hud-dot" />
        <circle cx="96.5" cy="50" r="0.55" className="hud-dot hud-dot-amber" />
      </svg>
      <svg
        viewBox="0 0 100 100"
        className="hud-spin-reverse absolute inset-0 size-full overflow-visible"
      >
        <circle cx="50" cy="50" r="41" className="hud-ring hud-ring-faint" />
        <circle cx="9" cy="50" r="0.7" className="hud-dot" />
        <circle cx="50" cy="91" r="0.5" className="hud-dot hud-dot-red" />
      </svg>

      {/* Conexiones curvas hacia los gráficos. */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
        <path d="M70 26 C 80 14, 86 12, 92 14" className="hud-link" />
        <path d="M76 58 C 86 60, 90 66, 96 70" className="hud-link hud-link-delay" />
        <path d="M30 30 C 20 26, 14 22, 10 18" className="hud-link hud-link-delay-2" />
        <circle cx="92" cy="14" r="0.8" className="hud-node" />
        <circle cx="96" cy="70" r="0.8" className="hud-node hud-node-delay" />
        <circle cx="10" cy="18" r="0.8" className="hud-node hud-node-delay-2" />
      </svg>

      {/* Gráfica de barras. */}
      <div className="hud-card hud-float absolute top-[2%] right-[-4%] w-[27%]">
        <svg viewBox="0 0 120 64" className="w-full">
          <line x1="0" y1="63" x2="120" y2="63" className="hud-axis" />
          {BARS.map((value, index) => (
            <rect
              key={index}
              x={4 + index * 16.5}
              y={62 - value * 56}
              width="9"
              height={value * 56}
              rx="2.5"
              className={`hud-bar ${index === 5 ? 'hud-bar-amber' : ''}`}
              style={{ animationDelay: `${index * 0.35}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Línea con puntos que sube y baja. */}
      <div className="hud-card hud-float hud-float-delay absolute top-[60%] right-[-6%] w-[30%]">
        <svg viewBox="-4 -6 128 60" className="w-full overflow-visible">
          <path d={`${lineD} L120 46 L0 46 Z`} className="hud-area" />
          <path d={lineD} className="hud-line" />
          {LINE.map((value, index) => (
            <circle
              key={index}
              cx={(index / (LINE.length - 1)) * 120}
              cy={value * 46}
              r={index === LINE.length - 1 ? 3 : 2}
              className={`hud-point ${index === LINE.length - 1 ? 'hud-point-red' : ''}`}
              style={{ animationDelay: `${index * 0.28}s` }}
            />
          ))}
          <rect x="0" y="-6" width="2" height="58" className="hud-scan" />
        </svg>
      </div>

      {/* Dona. */}
      <div className="hud-card hud-float hud-float-delay-2 absolute top-[6%] left-[-3%] w-[19%]">
        <svg viewBox="0 0 60 60" className="w-full">
          <g className="hud-donut">
            <circle cx="30" cy="30" r="21" className="hud-donut-track" />
            <circle cx="30" cy="30" r="21" className="hud-donut-seg" strokeDasharray="62 132" />
            <circle
              cx="30"
              cy="30"
              r="21"
              className="hud-donut-seg hud-donut-blue"
              strokeDasharray="38 132"
              strokeDashoffset="-66"
            />
            <circle
              cx="30"
              cy="30"
              r="21"
              className="hud-donut-seg hud-donut-amber"
              strokeDasharray="14 132"
              strokeDashoffset="-108"
            />
            <circle
              cx="30"
              cy="30"
              r="21"
              className="hud-donut-seg hud-donut-red"
              strokeDasharray="6 132"
              strokeDashoffset="-125"
            />
          </g>
          <circle cx="30" cy="30" r="3" className="hud-dot hud-blink" />
        </svg>
      </div>
    </div>
  )
}
