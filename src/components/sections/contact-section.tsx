import { Download } from 'lucide-react'

import { ContactDialog } from '@/components/contact/contact-dialog'
import type { SiteSettings } from '@/sanity/lib/data'

/** Llamado a la acción final (FR-08). */
export function ContactSection({ settings }: { settings: SiteSettings }) {
  return (
    <section
      id="contacto"
      aria-labelledby="contacto-title"
      className="relative isolate overflow-hidden border-b border-white/[0.06]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_120%_at_70%_50%,rgba(42,120,90,0.2),transparent_70%)]"
      />
      <div className="container-page flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between lg:py-16">
        <div className="reveal max-w-xl">
          <h2
            id="contacto-title"
            className="text-[2.1rem] leading-tight font-extrabold tracking-[-0.025em] sm:text-[2.4rem]"
          >
            ¿Trabajamos juntos?
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
            Estoy siempre abierto a nuevas oportunidades, proyectos interesantes y conversaciones
            sobre datos, tecnología e innovación.
          </p>
        </div>
        <div className="reveal flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <ContactDialog contactEmail={settings?.contactEmail || null} />
          <a
            href="/cv"
            rel="nofollow"
            className="btn btn-outline h-14 w-full px-8 text-[1.02rem] sm:w-auto sm:min-w-[11rem]"
          >
            <Download className="size-[1.1rem]" aria-hidden="true" />
            Descargar CV
          </a>
        </div>
      </div>
    </section>
  )
}
