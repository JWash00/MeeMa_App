/**
 * Library Dev Warnings - Development-only spec violation detection
 * These warnings help catch visual regressions early
 * Disabled in production builds
 */

import { useEffect, useRef } from 'react'
import { CARD, GRID } from './uiTokens'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Warn if card height deviates from spec (156px)
 */
export function useCardHeightWarning(cardRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!isDev || !cardRef.current) return

    const element = cardRef.current
    const height = element.getBoundingClientRect().height

    if (Math.abs(height - CARD.HEIGHT) > 1) {
      console.warn(
        `[Library UI Spec] Card height violation: Expected ${CARD.HEIGHT}px, got ${height}px.`,
        '\nElement:', element,
        '\nFix: Ensure card uses h-[156px] min-h-[156px] max-h-[156px]'
      )
    }
  }, [cardRef])
}

/**
 * Warn if title or description is being truncated unexpectedly
 */
export function useContentClampWarning(
  titleRef: React.RefObject<HTMLElement | null>,
  descRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!isDev) return

    // Check title (should be line-clamp-1)
    if (titleRef.current) {
      const title = titleRef.current
      if (title.scrollHeight > title.clientHeight + 2) {
        console.warn(
          `[Library UI Spec] Title overflow detected. Content may need shorter title.`,
          '\nElement:', title,
          '\nText:', title.textContent?.slice(0, 50)
        )
      }
    }

    // Check description (should be line-clamp-2)
    if (descRef.current) {
      const desc = descRef.current
      if (desc.scrollHeight > desc.clientHeight + 4) {
        // This is expected for long descriptions, just info
        // console.info('[Library UI Spec] Description truncated (expected behavior)')
      }
    }
  }, [titleRef, descRef])
}

/**
 * Warn if more than 2 tags are rendered on hover
 */
export function warnIfTooManyTags(tags: string[] | undefined) {
  if (!isDev) return

  if (tags && tags.length > CARD.MAX_TAGS_ON_HOVER) {
    console.warn(
      `[Library UI Spec] Tag count violation: Displaying ${tags.length} tags, max is ${CARD.MAX_TAGS_ON_HOVER}.`,
      '\nFix: Use tags.slice(0, 2) before rendering'
    )
  }
}

/**
 * Warn if grid has unexpected column count
 */
export function useGridColumnWarning(gridRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!isDev || !gridRef.current) return

    const checkColumns = () => {
      const grid = gridRef.current
      if (!grid) return

      const style = window.getComputedStyle(grid)
      const columns = style.gridTemplateColumns.split(' ').length
      const width = window.innerWidth

      let expectedCols: number
      if (width >= GRID.BREAKPOINT_3_COL) {
        expectedCols = 3
      } else if (width >= GRID.BREAKPOINT_2_COL) {
        expectedCols = 2
      } else {
        expectedCols = 1
      }

      if (columns !== expectedCols) {
        console.warn(
          `[Library UI Spec] Grid column violation at ${width}px: Expected ${expectedCols} columns, got ${columns}.`,
          '\nFix: Use grid-cols-1 min-[900px]:grid-cols-2 min-[1280px]:grid-cols-3'
        )
      }
    }

    // Check on mount and resize
    checkColumns()
    window.addEventListener('resize', checkColumns)
    return () => window.removeEventListener('resize', checkColumns)
  }, [gridRef])
}

/**
 * Warn if drawer width is incorrect
 */
export function useDrawerWidthWarning(drawerRef: React.RefObject<HTMLDivElement | null>, isOpen: boolean) {
  useEffect(() => {
    if (!isDev || !drawerRef.current || !isOpen) return

    const drawer = drawerRef.current
    const width = drawer.getBoundingClientRect().width

    // Allow some tolerance for border
    if (Math.abs(width - 360) > 2) {
      console.warn(
        `[Library UI Spec] Drawer width violation: Expected 360px, got ${width}px.`,
        '\nFix: Use w-[360px] on drawer panel'
      )
    }
  }, [drawerRef, isOpen])
}

/**
 * One-time spec check log (runs once on mount)
 */
export function logSpecCheck() {
  if (!isDev) return

  console.info(
    '%c[Library UI Spec] Development mode active - watching for violations',
    'color: #1cd760; font-weight: bold'
  )
  console.info(
    'Expected specs:',
    '\n  Card: 156px height',
    '\n  Grid: 3/2/1 cols at 1280/900/0px',
    '\n  Drawer: 360px width',
    '\n  Hover: -2px translateY, 150ms'
  )
}
