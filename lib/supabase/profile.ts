import { createClient } from './client'

export interface UserProfile {
  id: string
  display_name: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    // Profile doesn't exist yet
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

export async function upsertProfile(
  userId: string,
  profile: { display_name?: string; bio?: string }
): Promise<UserProfile> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      ...profile,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const supabase = createClient()

  // First verify current password by re-authenticating
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    throw new Error('User not found')
  }

  // Try to sign in with current password to verify it
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (verifyError) {
    throw new Error('Current password is incorrect')
  }

  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }
}

export async function deleteAccount(): Promise<void> {
  const supabase = createClient()

  // Sign out the user - actual deletion requires admin API
  // For now, we'll sign out and the user profile will be orphaned
  // In production, use a server-side API route with service role key
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
