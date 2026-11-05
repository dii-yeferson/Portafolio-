import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-sm text-champagne">Error 404</p>
      <h1 className="font-display text-4xl font-extrabold">Página no encontrada</h1>
      <p className="text-muted">El contenido que buscas no existe o ya no está publicado.</p>
      <Link
        href="/"
        className="rounded-full bg-accent px-6 py-3 font-semibold text-background transition-colors hover:bg-accent-strong"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
