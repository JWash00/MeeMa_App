import { CanonicalPrompt } from '@/lib/types/prompts'

export function midjourneyAdapter(
  prompt: CanonicalPrompt,
  variables: Record<string, string> = {}
): string {
  let output = prompt.template

  // Replace variables with provided values or keep placeholder
  for (const variable of prompt.variables) {
    const value = variables[variable] || `[${variable}]`
    output = output.replace(new RegExp(`\\{${variable}\\}`, 'g'), value)
  }

  // Replace motion-related terms with static equivalents
  output = output.replace(/\b(motion|movement|animate|animation)\b/gi, 'dynamic composition')

  // Remove video-only terms
  output = output.replace(/\b(video|clip|footage|sequence)\b/gi, '')

  // Clean up extra spaces
  output = output.replace(/\s+/g, ' ').trim()

  return `/imagine prompt: ${output} --v 6 --style raw`
}
