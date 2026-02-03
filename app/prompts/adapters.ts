import type { PatternDefinition, PlatformId } from './types'

// Aspect ratio mapping for Midjourney
const aspectMap: Record<string, string> = {
  youtube: '16:9',
  tiktok: '9:16',
  instagram: '1:1',
}


function compileTemplate(
  template: string,
  inputs: Record<string, string>
): string {
  let output = template

  for (const [key, value] of Object.entries(inputs)) {
    const placeholder = `{${key}}`
    output = output.replace(new RegExp(placeholder, 'g'), value || '')
  }

  // Clean up empty placeholders and extra spaces/commas
  output = output.replace(/\{[^}]+\}/g, '')
  output = output.replace(/,\s*,/g, ',')
  output = output.replace(/,\s*$/g, '')
  output = output.replace(/^\s*,/g, '')
  output = output.replace(/\s+/g, ' ')
  output = output.trim()

  return output
}

function midjourneyAdapter(
  compiled: string,
  extracted?: Record<string, string>
): string {
  let output = compiled

  // Replace motion-related terms with static equivalents
  output = output.replace(
    /\b(motion|movement|animate|animation|moving)\b/gi,
    'dynamic composition'
  )

  // Remove video-only terms
  output = output.replace(/\b(video|clip|footage|sequence|loop)\b/gi, '')

  // Clean up
  output = output.replace(/\s+/g, ' ').trim()

  // Debug logging (temporary)
  console.log('MJ extracted.platformUse:', extracted?.platformUse)

  // Build suffix with aspect ratio if platformUse detected
  const platformUse = extracted?.platformUse
  const ar = platformUse ? aspectMap[platformUse] : undefined

  let suffix = ''
  if (ar) suffix += ` --ar ${ar}`
  suffix += ' --v 6 --style raw'

  return `/imagine prompt: ${output}${suffix}`
}

function pikaAdapter(compiled: string): string {
  let output = compiled

  // Clean up
  output = output.replace(/\s+/g, ' ').trim()

  // Check if motion/camera terms already present
  const hasMotion = /motion|movement|animate/i.test(output)
  const hasCamera = /camera|pan|zoom|orbit|tracking/i.test(output)

  // Add defaults if missing
  const additions: string[] = []
  if (!hasMotion) {
    additions.push('natural motion')
  }
  if (!hasCamera) {
    additions.push('subtle camera movement')
  }
  additions.push('cinematic pacing', 'smooth transitions')

  return `${output}, ${additions.join(', ')}`
}

export function generatePrompt(
  pattern: PatternDefinition,
  platform: PlatformId,
  inputs: Record<string, string>,
  extracted?: Record<string, string>
): string {
  const compiled = compileTemplate(pattern.canonicalTemplate, inputs)

  if (!compiled) {
    return ''
  }

  switch (platform) {
    case 'midjourney':
      return midjourneyAdapter(compiled, extracted)
    case 'pika':
      return pikaAdapter(compiled)
    default:
      return compiled
  }
}
