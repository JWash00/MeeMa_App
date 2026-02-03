import { NextRequest, NextResponse } from 'next/server'
import { createYouTubeShorts } from '@/src/prompts/youtube_shorts'
import type { CreateResponse } from '@/src/contracts/create'

const QA_MODE = process.env.QA_MODE === 'true'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userPrompt = body.userPrompt
    const constraints = body.constraints as Record<string, unknown> | undefined

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'userPrompt is required' },
        { status: 400 }
      )
    }

    const result = await createYouTubeShorts(
      {
        userPrompt,
        domain: 'social_video',
        intent: 'youtube_shorts',
        platform: 'youtube',
        constraints,
      },
      { qaMode: QA_MODE }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] YouTube Shorts generation error:', error)
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
        error: message,
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}
