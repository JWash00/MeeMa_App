import { trackSnippetEvent } from '@/lib/supabase/analytics'
import { NextResponse } from 'next/server'
import { EventType } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { snippetId, eventType } = body

    if (!snippetId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (eventType !== 'view' && eventType !== 'copy') {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    await trackSnippetEvent(snippetId, eventType as EventType)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking event:', error)
    // Return success anyway - don't break the client experience
    return NextResponse.json({ success: true })
  }
}
