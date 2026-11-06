'use client'

import { Check, Link2, Share2 } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { BrandGlyph } from '@/components/icons/brand-icons'
import { useI18n } from '@/i18n/client'

type Feedback = 'link' | 'text' | null

const noopSubscribe = () => () => {}

/** Convierte tecnologías en hashtags limpios: «Power BI» → #PowerBI. */
export function toHashtags(items: string[]): string {
  return items
    .map((item) =>
      item
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^A-Za-z0-9]/g, ''),
    )
    .filter(Boolean)
    .slice(0, 5)
    .map((item) => `#${item}`)
    .join(' ')
}

/**
 * Compartir un proyecto de forma profesional.
 * - LinkedIn: copia un texto listo para publicar (título, resumen, enlace y
 *   hashtags) y abre el compartidor oficial; LinkedIn muestra la imagen
 *   1200 × 630 generada para el proyecto.
 * - Copiar enlace y, en el celular, el menú nativo de compartir.
 */
export function ShareButtons({
  url,
  title,
  description,
  technologies,
}: {
  url: string
  title: string
  description: string
  technologies: string[]
}) {
  const { t } = useI18n()
  const [feedback, setFeedback] = useState<Feedback>(null)
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === 'function',
    () => false,
  )

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 2600)
    return () => window.clearTimeout(timer)
  }, [feedback])

  async function copy(text: string, kind: Feedback) {
    try {
      await navigator.clipboard.writeText(text)
      setFeedback(kind)
    } catch {
      setFeedback(null)
    }
  }

  async function shareOnLinkedIn() {
    const post = t.share.post(title, description, url, toHashtags(technologies))
    await copy(post, 'text')
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer,width=640,height=720',
    )
  }

  const button =
    'btn h-11 border border-line-strong bg-ink/[0.04] px-4 text-[0.88rem] text-foreground hover:bg-ink/[0.08]'

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={t.share.label} role="group">
      <button type="button" onClick={shareOnLinkedIn} className={button}>
        <BrandGlyph platform="linkedin" className="size-4 text-[#0A66C2]" />
        {t.share.linkedin}
      </button>
      <button type="button" onClick={() => copy(url, 'link')} className={button}>
        {feedback === 'link' ? (
          <Check className="size-4 text-success" aria-hidden="true" />
        ) : (
          <Link2 className="size-4" aria-hidden="true" />
        )}
        {feedback === 'link' ? t.share.copied : t.share.copyLink}
      </button>
      {canShare ? (
        <button
          type="button"
          onClick={() => navigator.share({ title, text: description, url }).catch(() => {})}
          aria-label={t.share.more}
          className={`${button} w-11 px-0`}
        >
          <Share2 className="size-4" aria-hidden="true" />
        </button>
      ) : null}
      <p role="status" aria-live="polite" className="w-full text-sm font-semibold text-muted">
        {feedback === 'text' ? t.share.textCopied : ''}
      </p>
    </div>
  )
}
