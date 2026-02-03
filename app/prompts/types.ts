export type IntentPattern =
  | 'thumbnail'
  | 'portrait'
  | 'product'
  | 'landscape'
  | 'poster'
  | 'abstract'
  | 'food'
  | 'architecture'
  | 'fashion'
  | 'animation'

export type PlatformId = 'midjourney' | 'pika'

// Output channels
export type Channel = 'image' | 'content'

// Artifact types for multi-output patterns (e.g., TikTok promo)
export type ArtifactType = 'product_shot' | 'thumbnail_cover'

export interface ArtifactDefinition {
  id: ArtifactType
  label: string
  caption: string
}

export const ARTIFACTS: Record<ArtifactType, ArtifactDefinition> = {
  product_shot: {
    id: 'product_shot',
    label: 'Video Visual (Product Shot)',
    caption: 'Optimized for video frames',
  },
  thumbnail_cover: {
    id: 'thumbnail_cover',
    label: 'Feed Cover (Thumbnail / First Frame)',
    caption: 'Optimized for feed CTR',
  },
}

export interface InputField {
  key: string
  label: string
  kind: 'text' | 'select'
  required: boolean
  placeholder?: string
  options?: string[]
}

export interface PatternDefinition {
  label: string
  keywords: string[]
  inputs: InputField[]
  canonicalTemplate: string
  artifacts?: ArtifactType[]
}

export type RouteResult =
  | {
      status: 'routed'
      channel: 'image'
      pattern: IntentPattern
      confidence: number
      extracted: Record<string, string>
    }
  | {
      status: 'routed'
      channel: 'content'
      contentType: 'article'
      confidence: number
      extracted: Record<string, string>
    }

export interface SavedGeneration {
  id: string
  createdAt: string
  intentText: string
  pattern: IntentPattern
  platform: PlatformId
  inputs: Record<string, string>
  outputPrompt: string
}
