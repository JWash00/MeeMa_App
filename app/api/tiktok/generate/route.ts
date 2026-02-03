import { NextRequest, NextResponse } from 'next/server'
import { generateTikTokScript } from '@/src/qa/tiktokScriptEngine'
import type { CreateResponse, TikTokConstraints } from '@/src/contracts/create'

const QA_MODE = process.env.QA_MODE === 'true'

/**
 * Build constraint instructions to append to the prompt
 */
function buildConstraintPrompt(constraints?: TikTokConstraints): string {
  if (!constraints) return ''

  const parts: string[] = []

  if (constraints.audience === 'beginner') {
    parts.push('Write for beginners with no prior knowledge.')
  } else if (constraints.audience === 'intermediate') {
    parts.push('Write for viewers with some background knowledge.')
  }

  if (constraints.length === '15s') {
    parts.push('Keep it very short - 15 seconds total (2-3 beats max).')
  } else if (constraints.length === '45s') {
    parts.push('This can be longer - 45 seconds total (4-5 beats).')
  }

  if (constraints.tone === 'friendly') {
    parts.push('Use a warm, approachable tone.')
  } else if (constraints.tone === 'punchy') {
    parts.push('Use a direct, high-energy style.')
  }

  return parts.length > 0 ? '\n\n' + parts.join(' ') : ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userPrompt = body.userPrompt
    const constraints = body.constraints as TikTokConstraints | undefined

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'userPrompt is required' },
        { status: 400 }
      )
    }

    // Build enhanced prompt with constraints
    const enhancedPrompt = userPrompt + buildConstraintPrompt(constraints)

    let output = await generateTikTokScript(enhancedPrompt)

    // Strip SOURCE comment when not in QA mode (for cleaner user output)
    if (!QA_MODE && output.startsWith('<!-- SOURCE:anthropic -->')) {
      output = output.replace('<!-- SOURCE:anthropic -->\n', '')
    }

    const response: CreateResponse = {
      success: true,
      domain: 'social_video',
      output,
      qa: {
        qaMode: QA_MODE,
        keyPresent: true,
        anthropicCalled: true,
        fallbackUsed: false
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[API] TikTok script generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'

    const response: CreateResponse = {
      success: false,
      domain: 'social_video',
      output: '',
      qa: {
        qaMode: QA_MODE,
        keyPresent: !!process.env.ANTHROPIC_API_KEY,
        anthropicCalled: false,
        fallbackUsed: false,
        error: message
      }
    }

    return NextResponse.json(response, { status: 500 })
  }
}
