import type { Meta, StoryObj } from '@storybook/react'
import { PromptCard } from '../PromptCard'
import { makePrompt, FIXTURES } from './fixtures'

const meta = {
  title: 'Library/PromptCard',
  component: PromptCard,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'library',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[400px]">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof PromptCard>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default card with basic trust level and no special states.
 * This is the most common card state in the library.
 */
export const Default: Story = {
  args: {
    data: FIXTURES.default,
  },
}

/**
 * Card with verified trust badge indicating it passed QA checks.
 */
export const Verified: Story = {
  args: {
    data: FIXTURES.verified,
  },
}

/**
 * Card with gold trust badge for production-ready prompts.
 */
export const Gold: Story = {
  args: {
    data: FIXTURES.gold,
  },
}

/**
 * Card that has been favorited by the user.
 * Shows filled heart icon in red.
 */
export const Favorited: Story = {
  args: {
    data: FIXTURES.favorited,
  },
}

/**
 * Locked premium card with upgrade CTA overlay.
 * Demonstrates the lock state with opacity and upgrade button.
 */
export const Locked: Story = {
  args: {
    data: FIXTURES.locked,
  },
}

/**
 * Card in hover state showing metadata row.
 * Uses forceHover prop to simulate hover for screenshot testing.
 * Shows provider, language, and tags (max 2 tags displayed).
 */
export const HoverReveal: Story = {
  args: {
    data: FIXTURES.withMetadata,
    forceHover: true,
  },
}

/**
 * Card with extremely long title to test line-clamp-1 truncation.
 * Title should be truncated with ellipsis.
 */
export const LongTitleClamp: Story = {
  args: {
    data: FIXTURES.longTitle,
  },
}

/**
 * Card with very long description to test line-clamp-2 truncation.
 * Description should be clamped to exactly 2 lines with ellipsis.
 */
export const LongDescriptionClamp: Story = {
  args: {
    data: FIXTURES.longDescription,
  },
}

/**
 * Card with full metadata: provider, language, and tags.
 * Metadata row is only visible on hover (use HoverReveal story to see it).
 */
export const WithProviderLanguageTags: Story = {
  args: {
    data: FIXTURES.withMetadata,
  },
}

/**
 * Card with many tags to test overflow handling.
 * Only first 2 tags should be displayed per spec.
 */
export const WithManyTags: Story = {
  args: {
    data: FIXTURES.withManyTags,
    forceHover: true,
  },
}

/**
 * Card with trending featured badge.
 */
export const Trending: Story = {
  args: {
    data: FIXTURES.trending,
  },
}

/**
 * Card with recommended featured badge.
 */
export const Recommended: Story = {
  args: {
    data: FIXTURES.recommended,
  },
}

/**
 * Card with new featured badge.
 */
export const New: Story = {
  args: {
    data: FIXTURES.newPrompt,
  },
}

/**
 * Card with run action button.
 */
export const RunAction: Story = {
  args: {
    data: FIXTURES.runAction,
  },
}

/**
 * Card with remix action button.
 */
export const RemixAction: Story = {
  args: {
    data: FIXTURES.remixAction,
  },
}

/**
 * Mobile viewport (390x844) story.
 * - Primary action button is full width
 * - Favorite button is hidden
 * - Hover metadata row is hidden
 */
export const Mobile: Story = {
  args: {
    data: makePrompt({
      title: 'Mobile Optimized Card',
      description: 'This card is displayed in mobile viewport with full-width action button.',
      trust: 'verified',
    }),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
}

/**
 * All states combined in a grid for visual comparison.
 * Useful for seeing all variations at once.
 */
export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <PromptCard data={FIXTURES.default} />
      <PromptCard data={FIXTURES.verified} />
      <PromptCard data={FIXTURES.gold} />
      <PromptCard data={FIXTURES.favorited} />
      <PromptCard data={FIXTURES.locked} />
      <PromptCard data={FIXTURES.withMetadata} forceHover />
      <PromptCard data={FIXTURES.longTitle} />
      <PromptCard data={FIXTURES.longDescription} />
      <PromptCard data={FIXTURES.trending} />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}
