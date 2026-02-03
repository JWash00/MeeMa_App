/**
 * Shared CreateRequest/CreateResponse Contract
 * All generators (Content, Midjourney, TikTok, etc.) use these types.
 */

export type Domain = 'content' | 'image_prompt' | 'video' | 'audio' | 'social_video' | 'unknown'
export type Intent = 'explain' | 'tutorial' | 'promo' | 'cover' | 'product_shot' | 'qa' | 'tiktok_script' | 'youtube_shorts' | 'unknown'
export type Platform = 'tiktok' | 'youtube' | 'instagram' | 'midjourney' | 'pika' | 'none'

// Shared constraint types
export type Audience = 'general' | 'beginner' | 'intermediate'
export type Tone = 'neutral' | 'friendly' | 'punchy' | 'direct' | 'energetic' | 'calm'

// Content-specific constraints
export type ContentLength = 'short' | 'medium' | 'long'
export type Length = ContentLength // Backwards compatibility alias

export interface ContentConstraints {
  audience?: Audience
  length?: ContentLength
  tone?: Tone
}

// TikTok-specific constraints
export type TikTokLength = '15s' | '30s' | '45s'

export interface TikTokConstraints {
  audience?: Audience
  length?: TikTokLength
  tone?: Tone
}

// Union type for all constraints
export type Constraints = ContentConstraints | TikTokConstraints

export interface CreateRequest {
  userPrompt: string
  domain: Domain
  intent: Intent
  platform: Platform
  constraints?: Constraints
}

export interface QAStatus {
  qaMode: boolean
  keyPresent: boolean
  anthropicCalled: boolean
  fallbackUsed: boolean
  error?: string
}

export interface CreateResponse {
  success: boolean
  domain: Domain
  output: string
  qa: QAStatus
}
