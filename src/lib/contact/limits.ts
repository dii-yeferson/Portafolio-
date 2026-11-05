/** Límites del formulario de contacto, compartidos por cliente y servidor (sin dependencias). */
export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  subject: { max: 120 },
  message: { min: 10, max: 2000 },
  /** Tamaño máximo del cuerpo de la petición en bytes. */
  bodyBytes: 10_000,
} as const
