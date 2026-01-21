// Modality v0.1 - Type system and inference for multi-modal PromptTest

import { Snippet } from '@/lib/types'

// Core Types
export type Modality = 'text' | 'image' | 'video' | 'email' | 'audio' | 'manual'
export type ProviderExecution = 'sync' | 'async' | 'manual'
export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'midjourney'
  | 'runway'
  | 'pika'
  | 'generic'

/**
 * Infer modality from snippet metadata (tags and category)
 * Uses deterministic rules to avoid DB changes
 */
export function inferModality(snippet: Snippet): Modality {
  const tags = snippet.tags?.map(t => t.toLowerCase()) || []
  const category = snippet.category?.toLowerCase() || ''

  // Image modality
  if (tags.some(t => ['midjourney', 'image', 'sdxl', 'stable-diffusion', 'dall-e', 'imagen'].includes(t))) {
    return 'image'
  }

  // Video modality
  if (tags.some(t => ['video', 'image-to-video', 'runway', 'pika', 'gen-2'].includes(t))) {
    return 'video'
  }

  // Email modality
  if (category.includes('email') || tags.includes('email')) {
    return 'email'
  }

  // Audio modality
  const audioTags = ['audio', 'voice', 'music', 'tts', 'narration', 'voiceover',
                     'podcast', 'jingle', 'suno', 'elevenlabs', 'soundtrack', 'beat', 'loop']
  if (tags.some(t => audioTags.includes(t)) || category.includes('audio')) {
    return 'audio'
  }

  // Default to text
  return 'text'
}

/**
 * Get human-readable modality label
 */
export function modalityLabel(modality: Modality): string {
  const labels: Record<Modality, string> = {
    text: 'Text',
    image: 'Image',
    video: 'Video',
    email: 'Email',
    audio: 'Audio',
    manual: 'Manual'
  }
  return labels[modality]
}

/**
 * Get Lucide icon name for modality (for UI rendering)
 */
export function modalityIcon(modality: Modality): string {
  const icons: Record<Modality, string> = {
    text: 'FileText',
    image: 'Image',
    video: 'Video',
    email: 'Mail',
    audio: 'Volume2',
    manual: 'Hand'
  }
  return icons[modality]
}
