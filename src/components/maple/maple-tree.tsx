import { MapleCanopy } from './maple-canopy'

/**
 * El arce que acompaña toda la página por el lateral derecho:
 * - Arriba, la copa (con viento) cubre la parte superior y sus ramas llegan
 *   cerca del nombre; parte del tronco queda fuera del borde.
 * - En medio, el tronco sigue bajando junto a las secciones.
 * - Al final aparecen la base, las raíces y el suelo con hojas caídas.
 * Todas las piezas salen de la misma imagen y comparten escala (`--tree-w`)
 * y posición (`--tree-x`), así encajan en cualquier pantalla.
 */
export function MapleTree() {
  return (
    <div aria-hidden="true" className="maple-tree">
      <div className="maple-trunk" />
      <MapleCanopy />
      <div className="maple-roots" />
    </div>
  )
}
