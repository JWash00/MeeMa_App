import { test, expect } from '@playwright/test'

/**
 * Visual regression tests for PromptCard component.
 *
 * These tests snapshot each Storybook story to ensure visual consistency.
 * Run with: npm run test:visual
 * Update snapshots: npm run test:visual:update
 *
 * Requirements:
 * - Storybook must be running on http://localhost:6006
 * - Run: npm run storybook (in separate terminal)
 */

// Base URL for Storybook iframe
const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006'

// Helper to get story iframe URL
function getStoryUrl(storyId: string): string {
  return `${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`
}

// Helper to prepare page for stable screenshots
async function prepareForScreenshot(page: any) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle')

  // Disable animations (extra guard on top of Storybook config)
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        caret-color: transparent !important;
      }
    `,
  })

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready)

  // Small delay to ensure everything is stable
  await page.waitForTimeout(200)
}

test.describe('PromptCard Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Force dark color scheme for consistency
    await page.emulateMedia({ colorScheme: 'dark' })
  })

  test('Default state', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--default'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('default.png')
  })

  test('Verified trust badge', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--verified'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('verified.png')
  })

  test('Gold trust badge', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--gold'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('gold.png')
  })

  test('Favorited state', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--favorited'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('favorited.png')
  })

  test('Locked state with upgrade CTA', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--locked'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('locked.png')
  })

  test('Hover reveal with metadata', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--hover-reveal'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()

    // Verify metadata row is visible (forceHover prop)
    const metadataRow = card.locator('.sm\\:flex').filter({ hasText: 'Anthropic' })
    await expect(metadataRow).toBeVisible()

    await expect(card).toHaveScreenshot('hover-reveal.png')
  })

  test('Long title clamp', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--long-title-clamp'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('long-title.png')
  })

  test('Long description clamp', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--long-description-clamp'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('long-description.png')
  })

  test('With provider, language, and tags', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--with-provider-language-tags'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('with-metadata.png')
  })

  test('With many tags (overflow)', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--with-many-tags'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('many-tags.png')
  })

  test('Trending badge', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--trending'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('trending.png')
  })

  test('Recommended badge', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--recommended'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('recommended.png')
  })

  test('New badge', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--new'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('new.png')
  })

  test('Run action button', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--run-action'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('run-action.png')
  })

  test('Remix action button', async ({ page }) => {
    await page.goto(getStoryUrl('library-promptcard--remix-action'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('remix-action.png')
  })

  test('Mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 })

    await page.goto(getStoryUrl('library-promptcard--mobile'))
    await prepareForScreenshot(page)

    const card = page.locator('[data-testid="prompt-card"]')
    await expect(card).toBeVisible()

    // Verify full-width action button on mobile
    const actionButton = card.locator('button').filter({ hasText: 'View' })
    await expect(actionButton).toHaveClass(/w-full/)

    await expect(card).toHaveScreenshot('mobile.png')
  })
})
