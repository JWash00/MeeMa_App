// Video Subtype Inference v0.1
// Deterministic video subtype detection (text-to-video vs image-to-video)

import type { Snippet } from '@/lib/types'

export type VideoSubtype = 'text_to_video' | 'image_to_video' | 'generic'

// Keywords for I2V detection
const I2V_KEYWORDS = [
  'image-to-video',
  'img2vid',
  'i2v',
  'reference image',
  'input image',
  'animate image',
  'source image'
]

// Keywords for T2V detection
const T2V_KEYWORDS = [
  'text-to-video',
  't2v',
  'generate video',
  'create video',
  'video generation'
]

/**
 * Infer video subtype from snippet metadata and content
 * Priority: I2V detection → T2V detection → generic
 */
export function inferVideoSubtype(snippet: Snippet): VideoSubtype {
  const tags = snippet.tags?.map(t => t.toLowerCase()) || []
  const category = snippet.category?.toLowerCase() || ''
  const title = snippet.title?.toLowerCase() || ''
  const text = (snippet.template || snippet.code || '').toLowerCase()

  // Check for I2V signals (highest priority)
  // 1) Tags include I2V keywords
  if (tags.some(tag => I2V_KEYWORDS.some(kw => tag.includes(kw)))) {
    return 'image_to_video'
  }

  // 2) Title or category includes I2V keywords
  const titleCategoryText = `${title} ${category}`
  if (I2V_KEYWORDS.some(kw => titleCategoryText.includes(kw))) {
    return 'image_to_video'
  }

  // 3) Content-based detection: look for SOURCE IMAGE / REFERENCE IMAGE / INPUT IMAGE headings
  const i2vHeadingPatterns = [
    /##?\s*source\s+image[\s:]/i,
    /##?\s*reference\s+image[\s:]/i,
    /##?\s*input\s+image[\s:]/i,
    /\n\s*source\s+image\s*[:]/i,
    /\n\s*reference\s+image\s*[:]/i,
    /\n\s*input\s+image\s*[:]/i
  ]

  if (i2vHeadingPatterns.some(pattern => pattern.test(snippet.template || snippet.code || ''))) {
    return 'image_to_video'
  }

  // Check for T2V signals (lower priority)
  // 1) Tags include T2V keywords
  if (tags.some(tag => T2V_KEYWORDS.some(kw => tag.includes(kw)))) {
    return 'text_to_video'
  }

  // 2) Title or category includes T2V keywords
  if (T2V_KEYWORDS.some(kw => titleCategoryText.includes(kw))) {
    return 'text_to_video'
  }

  // Default to generic if no clear subtype
  return 'generic'
}

/**
 * Get human-readable label for video subtype
 */
export function videoSubtypeLabel(subtype: VideoSubtype): string {
  const labels: Record<VideoSubtype, string> = {
    text_to_video: 'Text-to-Video',
    image_to_video: 'Image-to-Video',
    generic: 'Video'
  }
  return labels[subtype]
}
