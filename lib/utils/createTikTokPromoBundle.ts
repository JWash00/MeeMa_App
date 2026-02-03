/**
 * TikTok Promo Bundle export utility.
 * Creates a zip file with prompts and metadata.
 */

import JSZip from 'jszip'

export interface BundleParams {
  runId: string
  platform: string
  intent: string
  promptHash: string
  prompts: {
    product_shot?: string
    thumbnail_cover?: string
  }
  selectedArtifacts: string[]
  createdAt: string
}

/**
 * Create a downloadable TikTok promo bundle as a zip file.
 */
export async function createTikTokPromoBundle(params: BundleParams): Promise<Blob> {
  const zip = new JSZip()
  const promptsFolder = zip.folder('prompts')

  if (params.prompts.product_shot) {
    promptsFolder?.file('product_shot.txt', params.prompts.product_shot)
  }
  if (params.prompts.thumbnail_cover) {
    promptsFolder?.file('thumbnail_cover.txt', params.prompts.thumbnail_cover)
  }

  zip.file('metadata.json', JSON.stringify({
    runId: params.runId,
    platform: params.platform,
    intent: params.intent,
    promptHash: params.promptHash,
    selectedArtifacts: params.selectedArtifacts,
    createdAt: params.createdAt
  }, null, 2))

  zip.file('README.txt', `MeeMa TikTok Promo Bundle
=============================
Generated: ${params.createdAt}
Run ID: ${params.runId}

Contents:
- prompts/product_shot.txt: Use with Midjourney for video frames
- prompts/thumbnail_cover.txt: Use with Midjourney for feed cover image

Instructions:
1. Copy prompt from product_shot.txt → paste in Midjourney
2. Copy prompt from thumbnail_cover.txt → paste in Midjourney
3. Use generated images in your TikTok promo

Aspect ratios are pre-configured for TikTok (9:16).
`)

  return zip.generateAsync({ type: 'blob' })
}

/**
 * Download a blob as a file.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
