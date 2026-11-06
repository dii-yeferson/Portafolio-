/**
 * Pinta un texto con acentos: lo que va entre asteriscos (`*así*`) se muestra
 * en serif itálica, la mezcla tipográfica de la marca. Sin asteriscos, el
 * texto sale tal cual. Sirve igual para textos del CMS y del diccionario.
 */
export function splitAccent(text: string): { text: string; accent: boolean }[] {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.length > 2 && part.startsWith('*') && part.endsWith('*')
        ? { text: part.slice(1, -1), accent: true }
        : { text: part, accent: false },
    )
}

/** Quita los asteriscos de acento (para `<title>`, `aria-label` y metadatos). */
export function plainText(text: string): string {
  return text.replace(/\*([^*]+)\*/g, '$1')
}

export function Accent({ text, className = 'accent-serif' }: { text: string; className?: string }) {
  return (
    <>
      {splitAccent(text).map((part, index) =>
        part.accent ? (
          <em key={index} className={className}>
            {part.text}
          </em>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  )
}
