// MeeMa Voice v0.1
// Single source of truth for all user-facing copy

/**
 * VOICE RULES:
 * 1. Short sentences, fragments, line breaks
 * 2. "You" language, friendly + direct
 * 3. No over-explaining
 * 4. Creator verbs: make, post, clip, remix, try, copy, run it
 * 5. Forbidden jargon: leverage, optimize, pipeline, architecture, robust,
 *    advanced, enterprise, infrastructure, modality, validation checks, schema
 * 6. Calm + encouraging + slightly playful
 * 7. Action verbs in UI microcopy
 * 8. Plain errors with next step
 */

// ============================================================
// BRAND
// ============================================================
export const BRAND = {
  name: 'MeeMa',
  tagline: 'Better prompts. Made fun.',
  taglineLong: 'A creator-friendly prompt library to save, remix, and reuse what works.',
  footer: 'Made for creators',
} as const

// ============================================================
// GLOBAL UI (buttons, status, common actions)
// ============================================================
export const UI = {
  buttons: {
    copy: 'Copy',
    copyPrompt: 'Copy prompt',
    runIt: 'Run it',
    fixIt: 'Fix it',
    remix: 'Remix',
    tryAgain: 'Try again',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    clearFilters: 'Clear filters',
  },
  status: {
    allSet: 'All set.',
    done: 'Done.',
    saved: 'Saved.',
    copied: 'Copied.',
    loading: 'Loading...',
  },
  empty: {
    startSimple: 'Start with something simple.',
    pickPrompt: 'Pick a prompt to begin.',
    quickSearch: 'Try a quick search.',
  },
} as const

// ============================================================
// NAV & LAYOUT
// ============================================================
export const NAV = {
  logo: BRAND.name,
  workspaces: {
    section: 'Workspaces',
    library: 'Library',
    promptTest: 'PromptTest',
  },
  capabilities: {
    section: 'Capabilities',
  },
  myLibrary: {
    section: 'My Library',
  },
  collections: {
    section: 'Collections',
  },
  footer: {
    newSnippet: 'New Snippet',
    signInPrompt: 'Sign in to create snippets',
  },
} as const

// ============================================================
// LANDING PAGE
// ============================================================
export const LANDING = {
  hero: {
    title: 'Better prompts.',
    titleAccent: 'Made fun.',
    subtitle: 'MeeMa is a creator-friendly prompt library to save, remix, and reuse what works.',
    ctaPrimary: 'Explore prompts',
    ctaSecondary: 'See how it works',
  },
} as const

// ============================================================
// LIBRARY (search, filters, empty states)
// ============================================================
export const LIBRARY = {
  pageTitle: 'Prompt Library',
  pageSubtitle: 'Save, remix, and reuse what works.',

  search: {
    placeholder: 'Search by title, description, or tag...',
    noResults: {
      title: 'No prompts found.',
      hint: 'Try a different search term.',
    },
  },

  filters: {
    language: 'Language',
    provider: 'Provider',
    tags: 'Tags',
    clearAll: 'Clear filters',
  },

  resultsCount: (count: number) =>
    count === 1 ? '1 prompt' : `${count} prompts`,

  empty: {
    title: 'No prompts yet.',
    subtitle: UI.empty.startSimple,
  },
} as const

// ============================================================
// PROMPT TEST
// ============================================================
export const PROMPT_TEST = {
  pageTitle: 'PromptTest',
  pageSubtitle: 'Run prompts and check results.',

  snippetSelector: {
    search: 'Search snippets...',
    empty: UI.empty.pickPrompt,
  },

  configure: {
    title: 'Configure',
    generate: 'Generate prompt',
    testCase: 'Test case name',
    testCasePlaceholder: 'e.g., happy_path_basic',
    loadTestPack: 'Load test pack',
  },

  output: {
    title: 'Output & Checks',
    paste: 'Paste the model output here...',
    runChecks: 'Run checks',
    empty: 'Output validation will appear here',
  },

  modality: (label: string) => `Type: ${label}`,
} as const

// ============================================================
// REMIX
// ============================================================
export const REMIX = {
  modalTitle: (promptTitle: string) => `Remix: ${promptTitle}`,
  subtitle: 'Try a remix. Keep what works.',

  sections: {
    original: 'Original',
    quickEdits: 'Quick edits',
    makeYours: 'Make it yours',
  },

  chips: {
    shorter: 'Shorter',
    punchier: 'Punchier',
    casual: 'Casual',
    pro: 'Pro',
    reset: 'Reset',
  },

  actions: {
    generate: 'Generate remix',
    save: 'Save remix',
    cancel: UI.buttons.cancel,
  },

  placeholder: 'Edit the prompt...',
} as const

// ============================================================
// PRICING
// ============================================================
export const PRICING = {
  pageTitle: 'Pricing that scales with how seriously you ship AI.',
  pageSubtitle: 'Start with production-ready patterns. Upgrade as you standardize, automate, and test.',

  tiers: {
    toolkit: {
      name: 'MeeMa',
      price: '$10/mo',
      positioning: 'Production-ready prompt library with retries, error handling, rate limits, and streaming.',
      cta: 'Start MeeMa',
    },
    pro: {
      name: 'MeeMa Pro',
      price: '$25/mo',
      positioning: 'Internal SDK generation + private collections + standardize AI calls across your codebase.',
      cta: 'Upgrade to Pro',
    },
    test: {
      name: 'MeeMa Test',
      price: '$50/mo',
      positioning: 'Side-by-side prompt testing across providers + prompt regression testing.',
      cta: 'Upgrade to Test',
    },
  },

  comparison: {
    sectionTitle: 'Built for shipping, not just experimenting.',
    faqTitle: 'Frequently Asked Questions',
  },
} as const

// ============================================================
// ERRORS & LOADING
// ============================================================
export const ERRORS = {
  generic: {
    title: "Something didn't load.",
    action: UI.buttons.tryAgain,
  },
  notFound: {
    title: 'Page not found.',
    subtitle: "The page you're looking for doesn't exist.",
    action: 'Go home',
  },
  network: {
    title: 'Connection lost.',
    subtitle: 'Check your internet connection.',
    action: UI.buttons.tryAgain,
  },
} as const

// ============================================================
// TOASTS & NOTIFICATIONS
// ============================================================
export const TOASTS = {
  copied: UI.status.copied,
  saved: UI.status.saved,
  error: (message: string) => message,
} as const

// ============================================================
// AUTH (placeholders)
// ============================================================
export const AUTH = {
  signIn: 'Sign in',
  signOut: 'Sign out',
  signUp: 'Sign up',
  email: 'Email',
  password: 'Password',
  forgotPassword: 'Forgot password?',
} as const

// ============================================================
// TRUST & QA (migrated from trustCopy.ts)
// ============================================================
export const TRUST = {
  status: {
    verified: 'Verified',
    patched: 'Patched Pass',
    draft: 'Draft',
  },

  statusMicro: {
    verified: 'This prompt passed MeeMa QA checks for reliability.',
    patched: 'This prompt meets reliability standards after applying suggested structure fixes locally.',
    draft: 'This prompt is missing required structure. Use Patch Suggestions to make it reliable.',
  },

  terms: {
    reliable: 'Reliable prompt',
    reuse: 'Built for repeat use',
    customize: 'Safe to customize',
  },

  flagship: {
    heading: 'Featured workflow',
    subheading: 'A reliable workflow designed for repeat use.',
    ctaPrimary: 'Use this workflow',
    ctaSecondary: 'See why it works',
  },

  sections: {
    whyWorks: 'Why this prompt works',
    qualityChecks: 'Quality checks',
    trustStatus: 'Trust Status',
  },

  cta: {
    fixPatches: 'Fix with Patch Suggestions',
    viewQuality: 'View quality checks',
    applyPatch: 'Apply Locally',
  },
} as const

// ============================================================
// TYPE SAFETY
// ============================================================
export const VOICE_COPY = {
  BRAND,
  UI,
  NAV,
  LANDING,
  LIBRARY,
  PROMPT_TEST,
  REMIX,
  PRICING,
  ERRORS,
  TOASTS,
  AUTH,
  TRUST,
} as const
