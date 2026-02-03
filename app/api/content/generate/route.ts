import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/src/qa/contentEngine'
import type { CreateResponse, CreateRequest, ContentConstraints } from '@/src/contracts/create'

const QA_MODE = process.env.QA_MODE === 'true'

/**
 * Build constraint instructions to append to the prompt
 */
function buildConstraintPrompt(constraints?: ContentConstraints): string {
  if (!constraints) return ''

  const parts: string[] = []

  if (constraints.audience === 'beginner') {
    parts.push('Write for beginners with no prior knowledge.')
  } else if (constraints.audience === 'intermediate') {
    parts.push('Write for readers with some technical background.')
  }

  if (constraints.length === 'short') {
    parts.push('Keep it concise (300-500 words).')
  } else if (constraints.length === 'long') {
    parts.push('Write a comprehensive article (1000+ words).')
  }

  if (constraints.tone === 'friendly') {
    parts.push('Use a warm, conversational tone.')
  } else if (constraints.tone === 'punchy') {
    parts.push('Use a direct, punchy style with short sentences.')
  }

  return parts.length > 0 ? '\n\n' + parts.join(' ') : ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Support both old format (intentText) and new format (CreateRequest)
    const userPrompt = body.userPrompt || body.intentText
    const constraints = body.constraints as ContentConstraints | undefined

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'userPrompt is required' },
        { status: 400 }
      )
    }

    // Build enhanced prompt with constraints
    const enhancedPrompt = userPrompt + buildConstraintPrompt(constraints)

    let output = await generateContent(enhancedPrompt)

    // Strip SOURCE comment when not in QA mode (for cleaner user output)
    if (!QA_MODE && output.startsWith('<!-- SOURCE:anthropic -->')) {
      output = output.replace('<!-- SOURCE:anthropic -->\n', '')
    }

    const response: CreateResponse = {
      success: true,
      domain: 'content',
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
    console.error('[API] Content generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'

    const response: CreateResponse = {
      success: false,
      domain: 'content',
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
