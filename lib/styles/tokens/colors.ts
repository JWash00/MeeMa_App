/**
 * MeeMa Color Tokens
 *
 * ROLE DEFINITIONS:
 * - brand: Identity + highlights (coral/warm accent)
 * - action: Execute controls ONLY (Play/Run/Try/Preview)
 * - status: System feedback (success/warning/error)
 * - neutral: Surfaces, text, borders
 */

export const colors = {
  // BRAND: Identity moments (coral-based warm accent)
  brand: {
    DEFAULT: '#FF6B6B',      // Coral - primary brand color
    hover: '#FF5252',         // Darker on hover
    active: '#FF3838',        // Even darker on active
    muted: '#FFB3B3',         // Lighter tint
    subtle: 'rgba(255, 107, 107, 0.1)', // Very light bg
  },

  // ACTION: Execute controls ONLY (Spotify green)
  // Use ONLY in Play/Run/Try/Preview buttons
  action: {
    DEFAULT: '#1DB954',       // Spotify green - execution only
    hover: '#1ed760',         // Brighter on hover
    active: '#1aa34a',        // Darker on active
    subtle: 'rgba(29, 185, 84, 0.1)', // Very light bg for rings/glows
  },

  // STATUS: System feedback
  status: {
    success: '#10b981',       // Emerald-500 for success states
    successBg: 'rgba(16, 185, 129, 0.1)',
    warning: '#f59e0b',
    warningBg: 'rgba(245, 158, 11, 0.1)',
    error: '#ef4444',
    errorBg: 'rgba(239, 68, 68, 0.1)',
  },

  // NEUTRAL: Surfaces + text
  neutral: {
    bg: '#0a0a0a',           // Soft black (not pure black)
    surface: '#141414',       // Elevated surface
    surface2: '#1a1a1a',      // Higher elevation
    surface3: '#242424',      // Highest elevation
    border: '#2a2a2a',
    text: '#ffffff',
    textMuted: '#a0a0a0',
    textSubtle: '#666666',
  },

  // ATMOSPHERIC: Optional subtle violet (low opacity only)
  atmosphere: {
    violet: 'rgba(139, 92, 246, 0.08)', // Very subtle violet
  },
} as const

export type ColorToken = typeof colors
