/**
 * User Tier & Entitlements
 */

export type UserTier = 'free' | 'pro'

export function getUserTier(profile: { tier?: string } | null): UserTier {
  return profile?.tier === 'pro' ? 'pro' : 'free'
}

export function canSaveAssets(tier: UserTier): boolean {
  return tier === 'pro'
}
