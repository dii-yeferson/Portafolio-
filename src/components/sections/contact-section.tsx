import type { SiteSettings } from '@/sanity/lib/data'

import { ContactForm } from '../contact-form'

/** Tarjeta de conversión final (FR-08). */
export function ContactSection({ settings }: { settings: SiteSettings }) {
  return (
    <section aria-labelledby="contacto-title" id="contacto" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="card grid gap-10 p-8 md:grid-cols-[1fr_1.4fr] md:p-12">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Contacto</p>
            <h2
              id="contacto-title"
              className="mt-3 font-display text-3xl font-extrabold sm:text-4xl"
            >
              ¿Trabajamos juntos?
            </h2>
            <p className="mt-4 text-muted">
              Cuéntame tu reto de datos: analítica, modelos predictivos, dashboards o pipelines de
              Big Data.
            </p>
            {settings?.resume?.url ? (
              <a
                href="/cv"
                rel="nofollow"
                className="mt-8 inline-block rounded-full border border-champagne/60 px-6 py-3 font-semibold text-champagne transition-colors hover:bg-champagne/10"
              >
                Descargar CV
              </a>
            ) : null}
          </div>
          <ContactForm contactEmail={settings?.contactEmail ?? null} />
        </div>
      </div>
    </section>
  )
}
