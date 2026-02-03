import { CanonicalPrompt, Platform } from '@/lib/types/prompts'
import { midjourneyAdapter } from './midjourney'
import { pikaAdapter } from './pika'

export function transformPrompt(
  prompt: CanonicalPrompt,
  platform: Platform,
  variables: Record<string, string> = {}
): string {
  switch (platform) {
    case 'midjourney':
      return midjourneyAdapter(prompt, variables)
    case 'pika':
      return pikaAdapter(prompt, variables)
    default:
      return prompt.template
  }
}

export { midjourneyAdapter, pikaAdapter }
