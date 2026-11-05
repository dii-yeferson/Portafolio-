/**
 * Reglas de validación puras usadas por los esquemas de Sanity.
 *
 * Devuelven `true` si el valor es válido o un mensaje de error en español.
 * Al no depender de Sanity se pueden probar de forma aislada (Vitest).
 */

export type ValidationResult = true | string

function parseUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

/** Valida una URL absoluta con esquema HTTPS y dominio público. Vacío = válido. */
export function validateHttpsUrl(value: string | null | undefined): ValidationResult {
  if (!value) return true
  const url = parseUrl(value)
  if (!url || url.protocol !== 'https:') {
    return 'Debe ser una URL completa que empiece con https://'
  }
  if (!url.hostname.includes('.') || url.hostname === 'localhost') {
    return 'La URL debe apuntar a un dominio público.'
  }
  if (url.username || url.password) {
    return 'La URL no debe incluir credenciales.'
  }
  return true
}

/** Valida un enlace social: `mailto:` para correo y HTTPS para el resto. */
export function validateSocialUrl(
  value: string | null | undefined,
  iconKey: string | null | undefined,
): ValidationResult {
  if (!value) return true
  if (iconKey === 'email') {
    const url = parseUrl(value)
    const address = url?.protocol === 'mailto:' ? decodeURIComponent(url.pathname) : ''
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
      ? true
      : 'Para «Correo» usa el formato mailto:nombre@dominio.com'
  }
  return validateHttpsUrl(value)
}

/** Convierte `AAAA-MM-DD` en una fecha UTC; `null` si el formato no es válido. */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date
}

/** La fecha de emisión no puede estar en el futuro. */
export function validateNotFutureDate(
  value: string | null | undefined,
  now: Date = new Date(),
): ValidationResult {
  if (!value) return true
  const date = parseIsoDate(value)
  if (!date) return 'Fecha inválida (formato esperado: AAAA-MM-DD).'
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return date.getTime() <= today.getTime() ? true : 'La fecha de emisión no puede ser futura.'
}

/** La fecha de vencimiento (opcional) debe ser posterior a la de emisión. */
export function validateExpiryAfterIssue(
  issueDate: string | null | undefined,
  expiresAt: string | null | undefined,
): ValidationResult {
  if (!expiresAt) return true
  const expiry = parseIsoDate(expiresAt)
  if (!expiry) return 'Fecha inválida (formato esperado: AAAA-MM-DD).'
  const issue = parseIsoDate(issueDate)
  if (issue && expiry.getTime() <= issue.getTime()) {
    return 'El vencimiento debe ser posterior a la fecha de emisión.'
  }
  return true
}

/** Año de fin ≥ año de inicio (formación académica). */
export function validateYearRange(
  startYear: number | null | undefined,
  endYear: number | null | undefined,
): ValidationResult {
  if (endYear == null || startYear == null) return true
  return endYear >= startYear ? true : 'El año de fin debe ser igual o posterior al de inicio.'
}

/**
 * Los IDs de archivos de Sanity tienen la forma `file-<hash>-<extensión>`,
 * así que la extensión se puede comprobar sin consultar la API.
 */
export function isPdfAssetRef(ref: string | null | undefined): boolean {
  return typeof ref === 'string' && /^file-[a-zA-Z0-9]+-pdf$/.test(ref)
}

export function validatePdfFile(
  value: { asset?: { _ref?: string } | null } | null | undefined,
): ValidationResult {
  const ref = value?.asset?._ref
  if (!ref) return true
  return isPdfAssetRef(ref) ? true : 'El CV debe ser un archivo PDF.'
}

/** Texto alternativo obligatorio solo cuando la imagen tiene un archivo cargado. */
export function validateAltText(
  alt: string | null | undefined,
  parent: { asset?: unknown } | null | undefined,
): ValidationResult {
  if (!parent?.asset) return true
  return alt && alt.trim().length > 0
    ? true
    : 'El texto alternativo es obligatorio (accesibilidad y SEO).'
}
