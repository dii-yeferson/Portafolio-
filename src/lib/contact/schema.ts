import { z } from 'zod'

import { CONTACT_LIMITS } from './limits'

export { CONTACT_LIMITS }

/** Validación compartida por el formulario (cliente) y `/api/contact` (servidor). */
export const contactSchema = z.object({
  name: z
    .string({ error: 'El nombre es obligatorio.' })
    .trim()
    .min(CONTACT_LIMITS.name.min, 'El nombre debe tener al menos 2 caracteres.')
    .max(CONTACT_LIMITS.name.max, 'El nombre admite como máximo 80 caracteres.'),
  email: z
    .string({ error: 'El correo es obligatorio.' })
    .trim()
    .max(CONTACT_LIMITS.email.max, 'El correo es demasiado largo.')
    .pipe(z.email('Ingresa un correo válido.')),
  subject: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.subject.max, 'El asunto admite como máximo 120 caracteres.')
    .optional(),
  message: z
    .string({ error: 'El mensaje es obligatorio.' })
    .trim()
    .min(CONTACT_LIMITS.message.min, 'El mensaje debe tener al menos 10 caracteres.')
    .max(CONTACT_LIMITS.message.max, 'El mensaje admite como máximo 2000 caracteres.'),
  /** Honeypot anti-bots: los humanos nunca lo ven ni lo completan. */
  website: z.string().max(200).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string[]>>

/** Elimina saltos de línea y caracteres de control (evita inyección de cabeceras). */
export function toSingleLine(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Construye el correo en texto plano que recibe el propietario. */
export function buildContactEmail(input: ContactInput, siteName: string) {
  const name = toSingleLine(input.name)
  const subject = toSingleLine(input.subject ?? '') || 'Nuevo mensaje de contacto'
  return {
    subject: `[${toSingleLine(siteName)}] ${subject} — ${name}`.slice(0, 200),
    text: [
      `Nombre: ${name}`,
      `Correo: ${toSingleLine(input.email)}`,
      `Asunto: ${subject}`,
      '',
      input.message,
      '',
      '—',
      'Enviado desde el formulario de contacto del portafolio.',
    ].join('\n'),
  }
}
