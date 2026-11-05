import { PortableText, type PortableTextComponents } from '@portabletext/react'

import { EXTERNAL_LINK_PROPS, isSafeExternalUrl } from '@/lib/url'
import type { BlockContent } from '@/sanity/types'

import { SanityImage } from './sanity-image'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[1.02rem] leading-[1.75] text-foreground/85">{children}</p>
    ),
    h3: ({ children }) => <h3 className="mt-6 font-display text-xl font-bold">{children}</h3>,
    h4: ({ children }) => <h4 className="mt-4 font-display text-lg font-bold">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-aqua/60 pl-4 text-muted italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal space-y-2 pl-6">{children}</ol>,
  },
  marks: {
    code: ({ children }) => (
      <code className="rounded-md bg-surface-3 px-1.5 py-0.5 font-mono text-sm">{children}</code>
    ),
    link: ({ value, children }) => {
      const href: unknown = value?.href
      if (typeof href !== 'string' || !isSafeExternalUrl(href)) return <>{children}</>
      return (
        <a
          href={href}
          {...EXTERNAL_LINK_PROPS}
          className="text-aqua underline decoration-aqua/40 underline-offset-4 hover:decoration-aqua"
        >
          {children}
        </a>
      )
    },
  },
  types: {
    image: ({ value }) => (
      <figure className="my-6">
        <SanityImage
          image={value}
          width={1200}
          height={675}
          sizes="(min-width: 768px) 720px, 100vw"
          className="h-auto w-full rounded-xl"
        />
        {value?.caption ? (
          <figcaption className="mt-2 text-center text-sm text-muted">{value.caption}</figcaption>
        ) : null}
      </figure>
    ),
  },
}

export function PortableTextContent({ value }: { value: BlockContent | null | undefined }) {
  if (!value || value.length === 0) return null
  return (
    <div className="space-y-4">
      <PortableText value={value} components={components} />
    </div>
  )
}
