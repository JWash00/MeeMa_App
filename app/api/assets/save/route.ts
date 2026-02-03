import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserTier, canSaveAssets } from '@/lib/entitlements'

export type SaveAssetChannel = 'content' | 'tiktok' | 'youtube_shorts'

interface SaveAssetRequest {
  channel: SaveAssetChannel
  payload: unknown
  title?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Please sign in to save.' },
        { status: 401 }
      )
    }

    // Get user profile to check tier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    const tier = getUserTier(profile)

    // Enforce entitlement
    if (!canSaveAssets(tier)) {
      return NextResponse.json(
        { code: 'NOT_ENTITLED', message: 'Upgrade to PRO to save.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body: SaveAssetRequest = await request.json()
    const { channel, payload, title } = body

    // Validate channel
    const validChannels: SaveAssetChannel[] = ['content', 'tiktok', 'youtube_shorts']
    if (!validChannels.includes(channel)) {
      return NextResponse.json(
        { code: 'INVALID_CHANNEL', message: 'Invalid channel.' },
        { status: 400 }
      )
    }

    // Insert saved asset
    const { data: asset, error: insertError } = await supabase
      .from('saved_assets')
      .insert({
        user_id: user.id,
        channel,
        title: title || null,
        payload_json: payload,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[API] Save asset error:', insertError)
      return NextResponse.json(
        { code: 'SAVE_FAILED', message: 'Failed to save asset.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: asset.id })
  } catch (error) {
    console.error('[API] Save asset error:', error)
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
