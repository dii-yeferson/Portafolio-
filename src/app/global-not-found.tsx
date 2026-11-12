import './globals.css'

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 · Diego Yeferson',
  robots: { index: false, follow: false },
}

/** 404 para URLs que no coinciden con ninguna ruta (fuera del sitio bilingüe). */
export default function GlobalNotFound() {
  return (
    <html lang="es" data-theme="dark">
      <body className="grid min-h-dvh place-items-center px-6 text-center">
        <main className="flex max-w-xl flex-col items-center gap-4">
          <p className="label">Error 404</p>
          <h1 className="text-4xl font-black tracking-[-0.04em]">Esta página no existe</h1>
          <Link href="/" className="btn btn-primary mt-2 h-12 px-6">
            Volver al inicio
          </Link>
        </main>
      </body>
    </html>
  )
}
