import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

import { dataset, projectId } from '../env'

const builder = createImageUrlBuilder({ projectId, dataset })

type ImageWithAsset = { asset?: { _ref?: string } | null } | null | undefined

/** Indica si una imagen de Sanity tiene un archivo asociado. */
export function hasImageAsset<T extends ImageWithAsset>(
  image: T,
): image is NonNullable<T> & { asset: { _ref: string } } {
  return Boolean(image?.asset?._ref)
}

/** Constructor de URLs del CDN de imágenes de Sanity (respeta crop y hotspot). */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto('format')
}

/** URL lista para Open Graph (1200×630) o `undefined` si no hay imagen. */
export function getOpenGraphImageUrl(image: ImageWithAsset): string | undefined {
  if (!hasImageAsset(image)) return undefined
  return urlForImage(image).width(1200).height(630).fit('crop').url()
}
