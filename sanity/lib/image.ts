import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, hasSanityConfig, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = hasSanityConfig ? createImageUrlBuilder({ projectId, dataset }) : null

export const urlFor = (source: SanityImageSource) => {
  if (!builder) {
    return null as any
  }

  return builder.image(source)
}
