/**
 * Anillo de texto que gira (SVG `textPath`). El texto se ajusta exactamente
 * a la circunferencia con `textLength`, así da una vuelta completa sin
 * cortes en cualquier idioma. Solo se anima `transform` (CSS).
 */
export function TextOrbit({
  id,
  text,
  radius,
  className = '',
  textClassName = '',
  fontSize = 3.1,
}: {
  id: string
  text: string
  /** Radio en un lienzo de 100 × 100. */
  radius: number
  className?: string
  textClassName?: string
  fontSize?: number
}) {
  const circumference = 2 * Math.PI * radius
  const path = `M 50 ${50 - radius} a ${radius} ${radius} 0 1 1 0 ${radius * 2} a ${radius} ${radius} 0 1 1 0 ${-radius * 2}`
  return (
    <div aria-hidden="true" className={`orbit ${className}`}>
      <svg viewBox="0 0 100 100">
        <defs>
          <path id={id} d={path} />
        </defs>
        <text fontSize={fontSize} className={textClassName}>
          <textPath href={`#${id}`} textLength={circumference - 0.5} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  )
}

/** Repite una frase hasta cubrir aproximadamente `minChars` caracteres. */
export function fillOrbit(phrase: string, minChars: number): string {
  const clean = phrase.trim().endsWith('·') ? `${phrase.trim()} ` : `${phrase.trim()} · `
  return clean.repeat(Math.max(1, Math.ceil(minChars / clean.length)))
}
