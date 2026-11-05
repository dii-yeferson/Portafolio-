import type { SanityImageSource } from '@sanity/image-url'
import { Image } from 'next-sanity/image'

import { hasImageAsset, urlForImage } from '@/sanity/lib/image'

type SanityImageValue = {
  asset?: { _ref?: string } | null
  alt?: string | null
  lqip?: string | null
} | null

type SanityImageProps = {
  image: SanityImageValue | undefined
  width: number
  height: number
  sizes?: string
  /** Precarga la imagen (usar solo en la imagen LCP). */
  preload?: boolean
  className?: string
  /** Sobrescribe el texto alternativo del CMS (p. ej. `""` si es decorativa). */
  alt?: string
}

/** Imagen del CDN de Sanity con recorte (crop/hotspot), formatos modernos y blur LQIP. */
export function SanityImage({
  image,
  width,
  height,
  sizes,
  preload,
  className,
  alt,
}: SanityImageProps) {
  if (!hasImageAsset(image)) return null

  const src = urlForImage(image as SanityImageSource)
    .width(width)
    .height(height)
    .fit('crop')
    .url()

  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt ?? image.alt ?? ''}
      sizes={sizes}
      preload={preload}
      className={className}
      placeholder={image.lqip ? 'blur' : 'empty'}
      blurDataURL={image.lqip ?? undefined}
    />
  )
}
