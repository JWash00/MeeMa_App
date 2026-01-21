import { PromptCardData } from '../PromptCard'

/**
 * Factory function for creating deterministic PromptCard test data
 * All values are fixed to ensure stable screenshots
 */
export function makePrompt(overrides: Partial<PromptCardData> = {}): PromptCardData {
  return {
    id: 'test-prompt-001',
    title: 'AI Code Review Assistant',
    description: 'Analyzes code for quality, security, and best practices with detailed feedback.',
    status: 'published',
    trust: 'basic',
    primaryAction: 'view',
    modality: 'text',
    uses: 1234,
    updatedAt: '2024-01-15T10:00:00Z',
    isFavorited: false,
    isLocked: false,
    ...overrides,
  }
}

/**
 * Preset prompt data for common test scenarios
 */
export const FIXTURES = {
  default: makePrompt(),

  verified: makePrompt({
    id: 'verified-001',
    trust: 'verified',
    title: 'Verified Prompt Example',
    description: 'This prompt has passed QA checks for structure and completeness.',
  }),

  gold: makePrompt({
    id: 'gold-001',
    trust: 'gold',
    title: 'Gold Standard Prompt',
    description: 'Production-ready prompt with QA validation, examples, and version control.',
  }),

  favorited: makePrompt({
    id: 'favorited-001',
    isFavorited: true,
    title: 'Favorited Prompt',
    description: 'This prompt has been marked as a favorite by the user.',
  }),

  locked: makePrompt({
    id: 'locked-001',
    isLocked: true,
    lockReason: 'Premium Feature',
    title: 'Premium Locked Prompt',
    description: 'This prompt requires a premium subscription to access.',
  }),

  longTitle: makePrompt({
    id: 'long-title-001',
    title: 'This is an extremely long title that should be truncated by the line-clamp-1 utility to ensure it fits within the card layout constraints',
    description: 'Testing title truncation.',
  }),

  longDescription: makePrompt({
    id: 'long-desc-001',
    title: 'Long Description Test',
    description: 'This is a very long description that spans multiple lines and should be clamped to exactly two lines using the line-clamp-2 utility. The description should gracefully handle overflow content and display an ellipsis when the text is too long to fit within the allocated space. This ensures consistent card heights across the grid.',
  }),

  withMetadata: makePrompt({
    id: 'metadata-001',
    title: 'Prompt with Full Metadata',
    description: 'This prompt includes provider, language, and tags.',
    provider: 'anthropic',
    language: 'ts',
    tags: ['code-review', 'quality'],
  }),

  withManyTags: makePrompt({
    id: 'many-tags-001',
    title: 'Prompt with Many Tags',
    description: 'Testing tag overflow handling.',
    provider: 'openai',
    language: 'py',
    tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'], // Only first 2 should show
  }),

  trending: makePrompt({
    id: 'trending-001',
    title: 'Trending Prompt',
    description: 'This prompt is currently trending.',
    featuredBadge: 'trending',
  }),

  recommended: makePrompt({
    id: 'recommended-001',
    title: 'Recommended Prompt',
    description: 'This prompt is recommended by the system.',
    featuredBadge: 'recommended',
  }),

  newPrompt: makePrompt({
    id: 'new-001',
    title: 'New Prompt',
    description: 'This is a newly added prompt.',
    featuredBadge: 'new',
  }),

  runAction: makePrompt({
    id: 'run-001',
    primaryAction: 'run',
    title: 'Runnable Prompt',
    description: 'This prompt can be executed directly.',
  }),

  remixAction: makePrompt({
    id: 'remix-001',
    primaryAction: 'remix',
    title: 'Remixable Prompt',
    description: 'This prompt can be forked and customized.',
  }),
}
