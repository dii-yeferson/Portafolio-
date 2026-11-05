/** Normaliza la lista de correos autorizados («a@x.com, B@x.com» → ['a@x.com', 'b@x.com']). */
export function parseAdminEmails(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

/** `true` si el usuario puede usar el panel. Sin lista, decide la membresía de Sanity. */
export function isStudioAdmin(email: string | null | undefined, allowed: string[]): boolean {
  if (allowed.length === 0) return true
  return Boolean(email) && allowed.includes(String(email).trim().toLowerCase())
}
