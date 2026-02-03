export type Platform = 'midjourney' | 'pika'

export interface CanonicalPrompt {
  id: string
  title: string
  use_case: string
  variables: string[]
  template: string
  created_at?: string
}

export interface SavedPrompt {
  id: string
  user_id: string
  prompt_id: string
  platform: Platform
  created_at: string
  // Joined data
  prompt?: CanonicalPrompt
}

export const PLATFORMS: { id: Platform; label: string; outputType: string }[] = [
  { id: 'midjourney', label: 'Midjourney', outputType: 'Image' },
  { id: 'pika', label: 'Pika', outputType: 'Image → Video' },
]
