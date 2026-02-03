/**
 * Shared CreateRequest/CreateResponse Contract
 * All generators (Content, Midjourney, TikTok, etc.) use these types.
 */

export type Domain = 'content' | 'image_prompt' | 'video' | 'audio' | 'unknown'
export type Intent = 'explain' | 'tutorial' | 'promo' | 'cover' | 'product_shot' | 'qa' | 'unknown'
export type Platform = 'tiktok' | 'youtube' | 'instagram' | 'midjourney' | 'pika' | 'none'

export interface CreateRequest {
  userPrompt: string
  domain: Domain
  intent: Intent
  platform: Platform
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
