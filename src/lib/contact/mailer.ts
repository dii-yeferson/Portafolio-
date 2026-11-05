import 'server-only'

export type MailerConfig = { apiKey: string; from: string }

type MailerEnv = Partial<Record<'RESEND_API_KEY' | 'CONTACT_FROM_EMAIL', string>>

export class MailerError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'MailerError'
  }
}

/** Devuelve la configuración del proveedor de correo o `null` si falta. */
export function getMailerConfig(
  env: MailerEnv = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  },
): MailerConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim()
  const from = env.CONTACT_FROM_EMAIL?.trim()
  return apiKey && from ? { apiKey, from } : null
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const TIMEOUT_MS = 10_000

/** Envía un correo de texto plano mediante la API REST de Resend. */
export async function sendEmail(
  config: MailerConfig,
  message: { to: string; replyTo: string; subject: string; text: string },
): Promise<void> {
  let response: Response
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        reply_to: message.replyTo,
        subject: message.subject,
        text: message.text,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    throw new MailerError(
      `No se pudo contactar al proveedor de correo: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  if (!response.ok) {
    throw new MailerError(`El proveedor de correo respondió ${response.status}.`, response.status)
  }
}
