import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { LogoMark } from '@/components/brand/logo'

export default function NotFound() {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-6 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_40%,rgba(42,120,90,0.25),transparent_70%)]"
      />
      <div className="flex max-w-xl flex-col items-center gap-6">
        <LogoMark className="h-10 w-auto" />
        <p className="eyebrow">Error 404</p>
        <h1 className="text-[clamp(2.4rem,6vw,3.6rem)] leading-tight font-black tracking-[-0.04em]">
          Página no encontrada
        </h1>
        <p className="text-lg text-muted">
          El contenido que buscas no existe o ya no está publicado.
        </p>
        <Link href="/" className="btn btn-primary h-12 px-6">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
