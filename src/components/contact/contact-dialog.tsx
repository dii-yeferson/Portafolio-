'use client'

import { ArrowRight, X } from 'lucide-react'
import { useRef } from 'react'

import { ContactForm } from './contact-form'

/** Botón «Contáctame» que abre el formulario en una ventana de vidrio (FR-08). */
export function ContactDialog({ contactEmail }: { contactEmail: string | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className="btn btn-primary h-14 w-full px-8 text-[1.05rem] sm:w-auto sm:min-w-[13rem]"
      >
        Contáctame
        <ArrowRight className="size-[1.15rem]" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="contact-dialog-title"
        className="glass m-auto w-[min(42rem,calc(100vw-2rem))] rounded-3xl p-0 text-foreground backdrop:bg-background/80 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-7 sm:p-9">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar formulario"
            className="glass absolute top-5 right-5 grid size-9 place-items-center rounded-full text-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <p className="eyebrow">Contacto</p>
          <h2
            id="contact-dialog-title"
            className="mt-3 text-3xl font-extrabold tracking-[-0.025em]"
          >
            ¿Trabajamos juntos?
          </h2>
          <p className="mt-2 mb-7 text-muted">
            Cuéntame tu reto de datos y te responderé lo antes posible.
          </p>
          <ContactForm contactEmail={contactEmail} />
        </div>
      </dialog>
    </>
  )
}
