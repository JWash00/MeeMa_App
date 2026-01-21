/**
 * Library UI Tokens - Strict Pixel Spec
 * Single source of truth for all Library component dimensions
 * DO NOT use magic numbers in components - import from here
 */

// =============================================================================
// LAYOUT DIMENSIONS
// =============================================================================

export const LAYOUT = {
  MAX_CONTENT_WIDTH: 1200,
  SIDEBAR_WIDTH: 260,
  SIDEBAR_PADDING: 16,

  // Page padding by viewport
  PAGE_PADDING_DESKTOP: 32,  // >= 1024px
  PAGE_PADDING_TABLET: 24,   // >= 768px
  PAGE_PADDING_MOBILE: 16,   // < 768px
} as const

// =============================================================================
// GRID SYSTEM
// =============================================================================

export const GRID = {
  GAP: 20,

  // Strict column breakpoints
  BREAKPOINT_3_COL: 1280,  // >= 1280px: 3 columns
  BREAKPOINT_2_COL: 900,   // 900-1279px: 2 columns
  // < 900px: 1 column

  COLUMNS_DESKTOP: 3,
  COLUMNS_TABLET: 2,
  COLUMNS_MOBILE: 1,
} as const

// Tailwind classes for grid (use these directly)
export const GRID_CLASSES = {
  container: 'grid gap-[20px]',
  responsive: 'grid-cols-1 min-[900px]:grid-cols-2 min-[1280px]:grid-cols-3',
} as const

// =============================================================================
// CARD DIMENSIONS (PromptCard)
// =============================================================================

export const CARD = {
  HEIGHT: 156,        // Fixed height - min=max=156px
  PADDING: 16,
  BORDER_RADIUS: 16,

  // Internal dimensions
  FOOTER_HEIGHT: 36,
  METADATA_ROW_HEIGHT: 22,

  // Content constraints
  TITLE_MAX_LINES: 1,
  DESC_MAX_LINES: 2,
  MAX_TAGS_ON_HOVER: 2,
} as const

// Card Tailwind classes
export const CARD_CLASSES = {
  base: 'h-[156px] min-h-[156px] max-h-[156px] p-[16px] rounded-[16px]',
  border: 'border border-white/[0.08]',
  borderHover: 'hover:border-white/[0.14]',
} as const

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const TYPOGRAPHY = {
  // Page title
  TITLE_SIZE: 28,
  TITLE_WEIGHT: 700,

  // Card title
  CARD_TITLE_SIZE: 16,
  CARD_TITLE_WEIGHT: 600,

  // Card description
  CARD_DESC_SIZE: 13,
  CARD_DESC_OPACITY: 0.72,

  // Controls
  TABS_FONT_SIZE: 13,
  FILTER_FONT_SIZE: 13,
  BADGE_FONT_SIZE: 12,
} as const

// Typography Tailwind classes
export const TYPO_CLASSES = {
  pageTitle: 'text-[28px] font-bold',
  cardTitle: 'text-[16px] font-semibold line-clamp-1',
  cardDesc: 'text-[13px] opacity-[0.72] line-clamp-2',
} as const

// =============================================================================
// CONTROLS
// =============================================================================

export const CONTROLS = {
  // Search bar
  SEARCH_HEIGHT: 40,
  SEARCH_RADIUS: 12,
  SEARCH_PADDING: 12,

  // Tabs
  TABS_HEIGHT: 32,
  TABS_PADDING: 12,
  TABS_RADIUS: 999,  // pill shape

  // Filter button
  FILTER_BTN_HEIGHT: 32,
  FILTER_BTN_RADIUS: 10,
} as const

// Control Tailwind classes
export const CONTROL_CLASSES = {
  search: 'h-[40px] rounded-[12px] px-[12px]',
  tabs: 'h-[32px] px-[12px] rounded-full text-[13px]',
  filterBtn: 'h-[32px] rounded-[10px] text-[13px]',
} as const

// =============================================================================
// TRUST BADGE
// =============================================================================

export const TRUST_BADGE = {
  HEIGHT: 20,
  PADDING_X: 8,
  BORDER_RADIUS: 999,  // pill
  FONT_SIZE: 12,
  FONT_WEIGHT: 500,

  // Tooltip
  TOOLTIP_WIDTH: 240,
  TOOLTIP_DELAY_MS: 250,
  TOOLTIP_MAX_LINES: 3,
} as const

// Badge Tailwind classes
export const BADGE_CLASSES = {
  base: 'h-[20px] px-[8px] rounded-full text-[12px] font-medium',
  tooltip: 'w-[240px] text-[12px]',
} as const

// =============================================================================
// FILTER DRAWER
// =============================================================================

export const DRAWER = {
  WIDTH: 360,
  PADDING: 16,
  OVERLAY_OPACITY: 0.50,
  FOOTER_HEIGHT: 56,
} as const

// Drawer Tailwind classes
export const DRAWER_CLASSES = {
  panel: 'w-[360px] p-[16px]',
  overlay: 'bg-black/50',
  footer: 'h-[56px]',
} as const

// =============================================================================
// MOTION
// =============================================================================

export const MOTION = {
  // Hover animation
  HOVER_DURATION_MS: 150,
  HOVER_TRANSLATE_Y: -2,
  HOVER_EASING: 'ease-out',

  // Hover shadow
  HOVER_SHADOW: '0 6px 20px rgba(0,0,0,0.25)',

  // Locked state
  LOCK_OVERLAY_OPACITY: 0.48,
  LOCK_BLUR: 4,  // max 4px
} as const

// Motion Tailwind classes
export const MOTION_CLASSES = {
  hoverLift: 'hover:translate-y-[-2px] duration-150 ease-out',
  hoverShadow: 'hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]',
  lockOverlay: 'bg-black/[0.48]',
} as const

// =============================================================================
// COLORS (references to existing theme)
// =============================================================================

export const COLORS = {
  BORDER_DEFAULT: 'rgba(255,255,255,0.08)',
  BORDER_HOVER: 'rgba(255,255,255,0.14)',
  SURFACE: '#181818',
  SURFACE_HOVER: '#1c1c1c',
  ACCENT: '#1cd760',
  ACCENT_HOVER: '#2ae174',
  ACCENT_ACTIVE: '#17b95a',
} as const

// =============================================================================
// MOBILE OVERRIDES
// =============================================================================

export const MOBILE = {
  // No hover metadata reveal on mobile
  SHOW_HOVER_METADATA: false,

  // Hide favorite on mobile by default
  SHOW_FAVORITE: false,

  // Full-width primary action
  FULL_WIDTH_ACTION: true,

  // Card height stays 156px
  CARD_HEIGHT: 156,
} as const

// =============================================================================
// TEST IDS (for automated testing)
// =============================================================================

export const TEST_IDS = {
  LIBRARY_GRID: 'library-grid',
  PROMPT_CARD: 'prompt-card',
  TRUST_BADGE: 'trust-badge',
  FILTER_DRAWER: 'filter-drawer',
  LIBRARY_TABS: 'library-tabs',
} as const
