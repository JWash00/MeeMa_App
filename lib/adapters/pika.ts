import { CanonicalPrompt } from '@/lib/types/prompts'

export function pikaAdapter(
  prompt: CanonicalPrompt,
  variables: Record<string, string> = {}
): string {
  let output = prompt.template

  // Replace variables with provided values or keep placeholder
  for (const variable of prompt.variables) {
    const value = variables[variable] || `[${variable}]`
    output = output.replace(new RegExp(`\\{${variable}\\}`, 'g'), value)
  }

  // Clean up extra spaces
  output = output.replace(/\s+/g, ' ').trim()

  return `Animate the image: ${output}, subtle camera movement, natural motion, cinematic pacing, smooth transitions`
}
