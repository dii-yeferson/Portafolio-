'use client'

import { ArrowRight, X } from 'lucide-react'
import { useRef, useState, useSyncExternalStore } from 'react'
import { Drawer } from 'vaul'

import { useI18n } from '@/i18n/client'

import { ContactForm } from './contact-form'

const DESKTOP_QUERY = '(min-width: 640px)'

function subscribe(callback: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

/**
 * Botón «Escríbeme» que abre el formulario (FR-08).
 * - Computadora: ventana centrada (`<dialog>` nativo, aparece desde 0.96).
 * - Celular: hoja inferior que se arrastra para cerrar (Vaul, curva de iOS).
 */
export function ContactDialog({ contactEmail }: { contactEmail: string | null }) {
  const { t } = useI18n()
  const isDesktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  )
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const trigger = (
    <button
      type="button"
      onClick={() => (isDesktop ? dialogRef.current?.showModal() : setDrawerOpen(true))}
      aria-haspopup="dialog"
      className="btn btn-primary h-14 w-full px-8 text-[1rem] sm:w-auto"
    >
      {t.contact.button}
      <ArrowRight className="size-[1.1rem]" aria-hidden="true" />
    </button>
  )

  if (!isDesktop) {
    return (
      <>
        {trigger}
        <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-[80] bg-scrim backdrop-blur-[2px]" />
            <Drawer.Content
              data-lenis-prevent
              aria-describedby={undefined}
              className="glass fixed inset-x-0 bottom-0 z-[90] flex max-h-[92dvh] flex-col rounded-t-[1.75rem] bg-sheet text-foreground outline-none"
            >
              <Drawer.Handle className="mt-3 mb-1 !h-1.5 !w-11 !bg-ink/20" />
              <div className="overflow-y-auto px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <p className="label">{t.contact.label}</p>
                <Drawer.Title className="mt-3 text-[2rem] leading-tight font-black tracking-[-0.04em]">
                  {t.contact.dialogTitle}
                </Drawer.Title>
                <p className="mt-2 mb-8 text-muted">{t.contact.dialogDescription}</p>
                <ContactForm contactEmail={contactEmail} />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </>
    )
  }

  return (
    <>
      {trigger}
      <dialog
        ref={dialogRef}
        aria-labelledby="contact-dialog-title"
        data-lenis-prevent
        className="glass m-auto w-[min(42rem,calc(100vw-2rem))] rounded-[1.75rem] bg-sheet p-0 text-foreground backdrop:bg-scrim backdrop:backdrop-blur-sm"
      >
        <div className="relative p-7 sm:p-10">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={t.contact.closeForm}
            className="absolute top-5 right-5 grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:bg-ink/[0.08] hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <p className="label">{t.contact.label}</p>
          <h2
            id="contact-dialog-title"
            className="mt-3 text-[2rem] leading-tight font-black tracking-[-0.04em]"
          >
            {t.contact.dialogTitle}
          </h2>
          <p className="mt-2 mb-8 text-muted">{t.contact.dialogDescription}</p>
          <ContactForm contactEmail={contactEmail} />
        </div>
      </dialog>
    </>
  )
}
