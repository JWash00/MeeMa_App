/**
 * Capability-Based Saved Views Configuration
 *
 * Organizes Meema Library by what creators want to DO with AI capabilities,
 * not by outcome categories. This aligns with Meema's positioning as a
 * professional source of structured, production-ready prompts.
 *
 * Sections:
 * - WORKSPACES: Top-level navigation (Library, Workflows, PromptTest, Agents)
 * - CAPABILITIES: AI capability categories (Image, Video, Audio, Writing, Social, Automation)
 * - MY LIBRARY: Personal collections (Favorites, Recent, Drafts)
 * - COLLECTIONS: Curated sets (Production Ready, High Trust, Team Approved, Agent-ready)
 */

import { SavedView } from './types'
import {
  Home,
  Library,
  Workflow,
  FlaskConical,
  Bot,
  Image,
  Video,
  Mic,
  FileText,
  Share2,
  Zap,
  Heart,
  Clock,
  FileEdit,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

// ============================================================================
// WORKSPACES SECTION
// ============================================================================

export const WORKSPACE_VIEWS: SavedView[] = [
  {
    id: 'library',
    label: 'Library',
    section: 'workspaces',
    icon: Library,
    query: {}, // All prompts
  },
  {
    id: 'workflows',
    label: 'Workflows',
    section: 'workspaces',
    icon: Workflow,
    query: {
      modalities: ['workflow'],
    },
  },
  {
    id: 'prompt_test',
    label: 'Prompt Test',
    section: 'workspaces',
    icon: FlaskConical,
    query: {},
    // NOTE: This links to /prompttest route, not a filtered view
  },
  {
    id: 'agents',
    label: 'Agents',
    section: 'workspaces',
    icon: Bot,
    query: {},
    comingSoon: true,
  },
]

// ============================================================================
// CAPABILITIES SECTION
// ============================================================================

export const CAPABILITY_VIEWS: SavedView[] = [
  {
    id: 'image_visual',
    label: 'Image & Visual',
    section: 'capabilities',
    icon: Image,
    query: {
      capability: 'image_visual',
    },
  },
  {
    id: 'video_motion',
    label: 'Video & Motion',
    section: 'capabilities',
    icon: Video,
    query: {
      capability: 'video_motion',
    },
  },
  {
    id: 'audio_voice',
    label: 'Audio & Voice',
    section: 'capabilities',
    icon: Mic,
    query: {
      capability: 'audio_voice',
    },
  },
  {
    id: 'writing_text',
    label: 'Writing & Text',
    section: 'capabilities',
    icon: FileText,
    query: {
      capability: 'writing_text',
    },
  },
  {
    id: 'social_marketing',
    label: 'Social & Marketing',
    section: 'capabilities',
    icon: Share2,
    query: {
      capability: 'social_marketing',
    },
  },
  {
    id: 'automation_apps',
    label: 'Automation & Apps',
    section: 'capabilities',
    icon: Zap,
    query: {
      capability: 'automation_apps',
    },
  },
]

// ============================================================================
// MY LIBRARY SECTION
// ============================================================================

export const MY_LIBRARY_VIEWS: SavedView[] = [
  {
    id: 'favorites',
    label: 'Favorites',
    section: 'my_library',
    icon: Heart,
    query: {
      favorited: true,
    },
  },
  {
    id: 'recent',
    label: 'Recent',
    section: 'my_library',
    icon: Clock,
    query: {
      recent: true,
    },
  },
  {
    id: 'drafts',
    label: 'Drafts',
    section: 'my_library',
    icon: FileEdit,
    query: {
      drafts: true,
    },
  },
]

// ============================================================================
// COLLECTIONS SECTION
// ============================================================================

export const COLLECTION_VIEWS: SavedView[] = [
  {
    id: 'production_ready',
    label: 'Production Ready',
    section: 'collections',
    icon: ShieldCheck,
    query: {
      trust: ['verified', 'gold'],
      status: ['production'],
    },
  },
  {
    id: 'high_trust',
    label: 'High Trust',
    section: 'collections',
    icon: Sparkles,
    query: {
      trust: ['gold'],
    },
    locked: {
      plan: 'pro',
      reason: 'Upgrade to access High Trust prompts.',
    },
  },
  {
    id: 'team_approved',
    label: 'Team Approved',
    section: 'collections',
    icon: Users,
    query: {
      // Stub query - would filter by team approvals in the future
    },
    locked: {
      plan: 'team',
      reason: 'Available on Team plans.',
    },
  },
  {
    id: 'agent_ready',
    label: 'Agent-ready',
    section: 'collections',
    icon: Bot,
    query: {
      agentReady: true,
    },
    comingSoon: true,
  },
]

// ============================================================================
// ALL VIEWS (for unified lookup)
// ============================================================================

export const ALL_VIEWS = [
  ...WORKSPACE_VIEWS,
  ...CAPABILITY_VIEWS,
  ...MY_LIBRARY_VIEWS,
  ...COLLECTION_VIEWS,
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find a view by ID across all view categories
 */
export function findViewById(viewId: string): SavedView | undefined {
  return ALL_VIEWS.find((v) => v.id === viewId)
}

/**
 * Get all views in a specific section
 */
export function getViewsBySection(
  section: SavedView['section']
): SavedView[] {
  return ALL_VIEWS.filter((v) => v.section === section)
}

// ============================================================================
// SECTION LABELS (exact copy from requirements)
// ============================================================================

export const SECTION_LABELS = {
  workspaces: 'WORKSPACES',
  capabilities: 'CAPABILITIES',
  my_library: 'MY LIBRARY',
  collections: 'COLLECTIONS',
} as const

// ============================================================================
// DEPRECATED: Old outcome-based categories (archived for reference)
// ============================================================================

/*
These were replaced with capability-based categories in Meema Library Navigation v2.
Kept here for historical reference only.

const DEPRECATED_CREATOR_VIEWS = [
  {
    id: 'ideation',
    label: 'Ideation',
    audience: ['all', 'creator'],
    query: { tags: ['idea', 'angle', 'topic', 'outline', 'brainstorm'] },
  },
  {
    id: 'scripts_hooks',
    label: 'Scripts & Hooks',
    audience: ['all', 'creator'],
    query: { tags: ['hook', 'script', 'retention', 'cta', 'beats'] },
  },
  {
    id: 'repurposing',
    label: 'Repurposing',
    audience: ['all', 'creator'],
    query: { tags: ['repurpose', 'thread', 'newsletter', 'shorts', 'clips'] },
  },
  {
    id: 'growth_retention',
    label: 'Growth & Retention',
    audience: ['all', 'creator'],
    query: { tags: ['growth', 'seo', 'retention', 'community', 'distribution'] },
  },
  {
    id: 'monetization',
    label: 'Monetization',
    audience: ['all', 'creator'],
    query: { tags: ['offer', 'pricing', 'landing', 'upsell', 'sales'] },
  },
]
*/
