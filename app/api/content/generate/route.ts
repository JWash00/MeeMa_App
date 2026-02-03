import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/src/qa/contentEngine'
import type { CreateResponse } from '@/src/contracts/create'

export async function POST(request: NextRequest) {
  try {
    const { intentText } = await request.json()

    if (!intentText || typeof intentText !== 'string') {
      return NextResponse.json(
        { error: 'intentText is required' },
        { status: 400 }
      )
    }

    const output = await generateContent(intentText)

    const response: CreateResponse = {
      success: true,
      domain: 'content',
      output,
      qa: {
        qaMode: true,
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
        qaMode: true,
        keyPresent: !!process.env.ANTHROPIC_API_KEY,
        anthropicCalled: false,
        fallbackUsed: false,
        error: message
      }
    }

    return NextResponse.json(response, { status: 500 })
  }
}
