import { createClient } from './server'
import { EventType } from '../types'

/**
 * Track a snippet event (view or copy)
 * Server-side only - called from API routes or Server Actions
 */
export async function trackSnippetEvent(
  snippetId: string,
  eventType: EventType,
  userId?: string | null
): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('snippet_events')
      .insert({
        snippet_id: snippetId,
        event_type: eventType,
        user_id: userId || null,
      })

    if (error) {
      console.error(`Error tracking ${eventType} event for snippet ${snippetId}:`, error)
      // Don't throw - analytics failures shouldn't break the app
    }
  } catch (error) {
    console.error(`Failed to track ${eventType} event:`, error)
    // Silently fail - analytics is not critical
  }
}

/**
 * Get event counts for a snippet
 * Server-side only
 */
export async function getSnippetEventCounts(snippetId: string): Promise<{
  views: number
  copies: number
}> {
  try {
    const supabase = await createClient()

    const [viewsResult, copiesResult] = await Promise.all([
      supabase
        .from('snippet_events')
        .select('*', { count: 'exact', head: true })
        .eq('snippet_id', snippetId)
        .eq('event_type', 'view'),
      supabase
        .from('snippet_events')
        .select('*', { count: 'exact', head: true })
        .eq('snippet_id', snippetId)
        .eq('event_type', 'copy'),
    ])

    return {
      views: viewsResult.count || 0,
      copies: copiesResult.count || 0,
    }
  } catch (error) {
    console.error('Error fetching event counts:', error)
    return { views: 0, copies: 0 }
  }
}
