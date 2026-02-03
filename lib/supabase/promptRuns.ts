/**
 * Prompt run logging for analytics.
 * Tracks generation events with privacy-light approach (prompt hash, not raw text).
 */

import { createClient } from './client'

export interface PromptRunParams {
  userId?: string | null
  anonSessionId: string
  platform: string
  intent: string
  promptHash: string
  selectedArtifacts: string[]
  success: boolean
  errorCode?: string | null
  durationMs?: number | null
}

/**
 * Log a prompt generation run.
 * Non-blocking: errors are logged but don't break the generate flow.
 * @returns The run ID if successful, null otherwise
 */
export async function logPromptRun(params: PromptRunParams): Promise<string | null> {
  try {
    const supabase = createClient()
    const runId = crypto.randomUUID()

    // Find parent run (re-run detection: same actor + hash within 24h)
    let parentRunId: string | null = null
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      // Build query for recent runs by this actor
      let query = supabase
        .from('prompt_runs')
        .select('id')
        .eq('prompt_hash', params.promptHash)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1)

      // Filter by user_id OR anon_session_id
      if (params.userId) {
        query = query.eq('user_id', params.userId)
      } else {
        query = query.eq('anon_session_id', params.anonSessionId)
      }

      const { data: recentRun } = await query.single()
      if (recentRun) {
        parentRunId = recentRun.id
      }
    } catch {
      // No parent found or query failed - continue without parent
    }

    const { error } = await supabase.from('prompt_runs').insert({
      id: runId,
      user_id: params.userId || null,
      anon_session_id: params.anonSessionId,
      platform: params.platform,
      intent: params.intent,
      prompt_hash: params.promptHash,
      selected_artifacts: params.selectedArtifacts,
      parent_run_id: parentRunId,
      success: params.success,
      error_code: params.errorCode || null,
      duration_ms: params.durationMs || null,
    })

    if (error) {
      console.warn('Failed to log prompt run:', error)
      return null
    }

    return runId
  } catch (err) {
    console.warn('Failed to log prompt run:', err)
    return null
  }
}

/**
 * Get recent runs for the current actor.
 * Useful for showing re-run history.
 */
export async function getRecentRuns(
  userId: string | null,
  anonSessionId: string,
  limit = 10
) {
  try {
    const supabase = createClient()

    let query = supabase
      .from('prompt_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.eq('anon_session_id', anonSessionId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Failed to get recent runs:', err)
    return []
  }
}
