# Storybook + Playwright Visual Tests

This document explains how to use Storybook for component development and Playwright for visual regression testing.

## Overview

We use:
- **Storybook** to develop and document UI components in isolation
- **Playwright** to capture screenshots of Storybook stories and detect visual regressions

## Quick Start

### 1. Running Storybook

Start the Storybook development server:

```bash
npm run storybook
```

This will open Storybook at [http://localhost:6006](http://localhost:6006).

You can now:
- Browse all component stories
- Interact with controls to modify props
- View documentation
- Test different states and variations

### 2. Running Visual Tests

Visual tests capture screenshots of Storybook stories and compare them to baseline images.

**Prerequisites:** Storybook must be running before you run visual tests.

```bash
# Terminal 1: Start Storybook
npm run storybook

# Terminal 2: Run visual tests
npm run test:visual
```

### 3. Updating Snapshots

When you intentionally change component styles, you'll need to update the baseline snapshots:

```bash
npm run test:visual:update
```

⚠️ **Warning:** Always review snapshot changes carefully before committing them to ensure they're intentional.

## Project Structure

```
.storybook/
├── main.ts           # Storybook configuration
└── preview.ts        # Global decorators, styles, viewports

components/library/__stories__/
├── fixtures.ts       # Test data factory for deterministic stories
└── PromptCard.stories.tsx  # PromptCard stories

tests/visual/
└── library-promptcard.spec.ts  # Visual regression tests

playwright.config.ts  # Playwright configuration
```

## Writing Stories

### Basic Story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { PromptCard } from '../PromptCard'
import { makePrompt } from './fixtures'

const meta = {
  title: 'Library/PromptCard',
  component: PromptCard,
} satisfies Meta<typeof PromptCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: makePrompt({
      title: 'My Prompt',
      description: 'A test prompt',
    }),
  },
}
```

### Using Fixtures

Always use the `makePrompt()` factory from `fixtures.ts` to ensure deterministic data:

```typescript
import { makePrompt, FIXTURES } from './fixtures'

// Use preset fixtures
export const Verified: Story = {
  args: {
    data: FIXTURES.verified,
  },
}

// Or create custom data
export const Custom: Story = {
  args: {
    data: makePrompt({
      title: 'Custom Title',
      trust: 'gold',
    }),
  },
}
```

### Viewport Stories

Test mobile/tablet/desktop viewports:

```typescript
export const Mobile: Story = {
  args: {
    data: makePrompt(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile', // or 'tablet', 'desktop'
    },
  },
}
```

Available viewports (configured in `.storybook/preview.ts`):
- `desktop`: 1440x900
- `tablet`: 1024x768
- `mobile`: 390x844

## Writing Visual Tests

### Basic Test

```typescript
import { test, expect } from '@playwright/test'

test('My component', async ({ page }) => {
  // Navigate to story iframe URL
  await page.goto('http://localhost:6006/iframe.html?id=library-promptcard--default&viewMode=story')

  // Wait for stable state
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(200)

  // Snapshot the component
  const card = page.locator('[data-testid="prompt-card"]')
  await expect(card).toHaveScreenshot('my-component.png')
})
```

### Story IDs

Story IDs are derived from the file path and story name:
- File: `components/library/__stories__/PromptCard.stories.tsx`
- Title: `Library/PromptCard`
- Story: `Default`
- ID: `library-promptcard--default`

Pattern: `{title-kebab-case}--{story-name-kebab-case}`

## Stability Best Practices

To ensure screenshots are deterministic and don't have false positives:

### 1. Disable Animations

Already configured globally in `.storybook/preview.ts`:

```typescript
decorators: [
  (Story) => (
    <div>
      <style>{`
        * {
          transition: none !important;
          animation: none !important;
        }
      `}</style>
      <Story />
    </div>
  ),
],
```

### 2. Use Deterministic Data

❌ **Bad:** Random or time-based data

```typescript
const data = {
  id: Math.random().toString(),
  timestamp: new Date().toISOString(),
}
```

✅ **Good:** Fixed data from fixtures

```typescript
const data = makePrompt({
  id: 'test-001',
  timestamp: '2024-01-15T10:00:00Z',
})
```

### 3. Wait for Stability

The `prepareForScreenshot()` helper in tests ensures:
- Network is idle
- Fonts are loaded
- Small delay for rendering

```typescript
async function prepareForScreenshot(page: any) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(200)
}
```

### 4. Force Color Scheme

Always force dark mode for consistency:

```typescript
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
})
```

## CI Integration (Optional)

To run visual tests in CI:

1. **Install Playwright browsers in CI:**
   ```bash
   npx playwright install --with-deps chromium
   ```

2. **Start Storybook and run tests:**
   ```bash
   # Option 1: Use webServer in playwright.config.ts (uncomment)
   npm run test:visual

   # Option 2: Manual start
   npm run build-storybook
   npx http-server storybook-static -p 6006 &
   npm run test:visual
   ```

3. **Commit baseline snapshots:**
   All `.png` files in `tests/visual/library-promptcard.spec.ts-snapshots/` should be committed to git.

## Troubleshooting

### Tests are flaky

- Ensure animations are disabled globally
- Check for random/time-based data in fixtures
- Increase `waitForTimeout` in `prepareForScreenshot()`
- Use `test.only()` to isolate flaky tests

### Snapshots don't match on CI

- Ensure CI uses the same OS (Linux recommended)
- Set `CI=true` environment variable
- Use Docker for consistent environments
- Consider pixel-perfect threshold adjustments in `playwright.config.ts`

### Storybook won't start

```bash
# Clear cache
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Check for port conflicts
lsof -ti:6006 | xargs kill -9
```

### Visual test fails with "waiting for locator"

- Verify Storybook is running at http://localhost:6006
- Check story ID is correct (kebab-case)
- Ensure `data-testid` exists on component

## Adding New Component Stories

1. Create `__stories__` directory in component folder:
   ```bash
   mkdir components/my-component/__stories__
   ```

2. Create `fixtures.ts` for test data:
   ```typescript
   export function makeMyData(overrides = {}) {
     return {
       id: 'test-001',
       // ... deterministic data
       ...overrides,
     }
   }
   ```

3. Create `MyComponent.stories.tsx`:
   ```typescript
   import type { Meta, StoryObj } from '@storybook/react'
   import { MyComponent } from '../MyComponent'
   import { makeMyData } from './fixtures'

   const meta = {
     title: 'Library/MyComponent',
     component: MyComponent,
   } satisfies Meta<typeof MyComponent>

   export default meta
   type Story = StoryObj<typeof meta>

   export const Default: Story = {
     args: {
       data: makeMyData(),
     },
   }
   ```

4. Create visual test spec:
   ```bash
   tests/visual/my-component.spec.ts
   ```

5. Run Storybook to verify:
   ```bash
   npm run storybook
   ```

6. Generate baseline snapshots:
   ```bash
   npm run test:visual:update
   ```

7. Commit everything:
   ```bash
   git add .
   git commit -m "Add MyComponent stories and visual tests"
   ```

## Best Practices Summary

✅ **Do:**
- Use `makePrompt()` for deterministic data
- Test all meaningful UI states
- Keep stories simple and focused
- Wait for stability before screenshots
- Review snapshot diffs carefully
- Commit baseline snapshots to git

❌ **Don't:**
- Use random or time-based data
- Test internal implementation details
- Create snapshots of entire pages
- Ignore flaky tests
- Update snapshots without reviewing changes

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Library UI Tokens](../../components/library/uiTokens.ts)
- [PromptCard Stories](../../components/library/__stories__/PromptCard.stories.tsx)
