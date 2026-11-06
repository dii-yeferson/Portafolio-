/**
 * Divide un texto en letras para animarlas una a una (girando en 3D).
 * Las palabras no se cortan entre líneas y los espacios no colapsan.
 * El texto completo queda para lectores de pantalla; las letras se ocultan.
 */
export function SplitLetters({
  text,
  offset = 0,
  letterClassName = '',
}: {
  text: string
  /** Índice inicial (para encadenar varias líneas en una misma secuencia). */
  offset?: number
  letterClassName?: string
}) {
  let index = offset
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {[...word].map((char) => {
              const i = index++
              return (
                <span
                  key={i}
                  className={`letter ${letterClassName}`}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {char}
                </span>
              )
            })}
            {wordIndex < words.length - 1 ? (
              <span className="letter" style={{ '--i': index++ } as React.CSSProperties}>
                {' '}
              </span>
            ) : null}
          </span>
        ))}
      </span>
    </>
  )
}
