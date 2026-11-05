/** Secreto ficticio que el servidor de pruebas usa para firmar webhooks. */
export const E2E_REVALIDATE_SECRET = 'e2e-revalidate-secret'

/** IP aleatoria de documentación (RFC 5737) para aislar el rate limit por prueba. */
export function randomTestIp(): string {
  return `203.0.113.${Math.floor(Math.random() * 254) + 1}`
}
