'use client'

import { ArrowRight, X } from 'lucide-react'
import { useRef } from 'react'

import { ContactForm } from './contact-form'

/** Botón «Contáctame» que abre el formulario en una hoja de vidrio (FR-08). */
export function ContactDialog({ contactEmail }: { contactEmail: string | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className="btn btn-primary h-14 w-full px-8 text-[1rem] sm:w-auto"
      >
        Contáctame
        <ArrowRight className="size-[1.1rem]" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="contact-dialog-title"
        className="glass m-auto w-[min(42rem,calc(100vw-2rem))] rounded-[1.75rem] bg-[rgb(18_18_22/0.94)] p-0 text-foreground backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-7 sm:p-10">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar formulario"
            className="absolute top-5 right-5 grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:bg-white/[0.08] hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <p className="label">Contacto</p>
          <h2
            id="contact-dialog-title"
            className="mt-3 text-[2rem] leading-tight font-black tracking-[-0.04em]"
          >
            ¿Trabajamos juntos?
          </h2>
          <p className="mt-2 mb-8 text-muted">
            Cuéntame tu reto de datos y te responderé lo antes posible.
          </p>
          <ContactForm contactEmail={contactEmail} />
        </div>
      </dialog>
    </>
  )
}
