import { serializeJsonLd } from '@/lib/seo'

/** Inserta datos estructurados schema.org de forma segura. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
