import { createClient } from './client'
import { CanonicalPrompt, SavedPrompt, Platform } from '@/lib/types/prompts'

export async function getPrompts(): Promise<CanonicalPrompt[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('canonical_prompts')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching prompts:', error)
    return []
  }

  return data || []
}

export async function getPromptById(id: string): Promise<CanonicalPrompt | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('canonical_prompts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function getSavedPrompts(userId: string): Promise<SavedPrompt[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('saved_prompts')
    .select(`
      *,
      prompt:canonical_prompts(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved prompts:', error)
    return []
  }

  return data || []
}

export async function savePrompt(
  userId: string,
  promptId: string,
  platform: Platform
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('saved_prompts')
    .insert({
      user_id: userId,
      prompt_id: promptId,
      platform,
    })

  if (error) {
    console.error('Error saving prompt:', error)
    return false
  }

  return true
}

export async function unsavePrompt(
  userId: string,
  promptId: string,
  platform: Platform
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('saved_prompts')
    .delete()
    .eq('user_id', userId)
    .eq('prompt_id', promptId)
    .eq('platform', platform)

  if (error) {
    console.error('Error unsaving prompt:', error)
    return false
  }

  return true
}

export async function isPromptSaved(
  userId: string,
  promptId: string,
  platform: Platform
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('saved_prompts')
    .select('id')
    .eq('user_id', userId)
    .eq('prompt_id', promptId)
    .eq('platform', platform)
    .single()

  if (error) {
    return false
  }

  return !!data
}

export async function getUserSavedPromptIds(userId: string): Promise<Set<string>> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('saved_prompts')
    .select('prompt_id, platform')
    .eq('user_id', userId)

  if (error || !data) {
    return new Set()
  }

  // Create composite keys: "promptId-platform"
  return new Set(data.map(d => `${d.prompt_id}-${d.platform}`))
}
