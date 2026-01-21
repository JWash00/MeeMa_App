// Email Type Inference v0.1
// Deterministic email type detection based on keywords

import type { Snippet } from '@/lib/types';

export type EmailType =
  | 'welcome'
  | 'onboarding'
  | 'promo'
  | 'launch'
  | 'seasonal'
  | 'newsletter'
  | 'nurture'
  | 'brand_story'
  | 'abandoned_cart'
  | 'transactional'
  | 'review_request'
  | 'loyalty'
  | 'winback'
  | 'event'
  | 'content_announcement'
  | 'generic';

export interface EmailTypeGroups {
  promotional: EmailType[];
  transactional: EmailType[];
  sequence: EmailType[];
  content: EmailType[];
  event: EmailType[];
  winback: EmailType[];
  generic: EmailType[];
}

export const EMAIL_TYPE_GROUPS: EmailTypeGroups = {
  promotional: ['promo', 'launch', 'seasonal'],
  transactional: ['transactional', 'abandoned_cart', 'review_request', 'loyalty'],
  sequence: ['welcome', 'onboarding', 'nurture'],
  content: ['newsletter', 'content_announcement', 'brand_story'],
  event: ['event'],
  winback: ['winback'],
  generic: ['generic']
};

/**
 * Priority order for email type inference
 * Higher priority types are checked first
 */
const TYPE_PRIORITY_ORDER: Array<{
  type: EmailType;
  keywords: string[];
}> = [
  // Transactional (highest priority - most specific business function)
  {
    type: 'transactional',
    keywords: ['order', 'shipping', 'receipt', 'confirmation', 'invoice', 'payment', 'transaction']
  },

  // Event (time-sensitive)
  {
    type: 'event',
    keywords: ['event', 'webinar', 'invite', 'rsvp', 'registration']
  },

  // Lifecycle emails
  {
    type: 'abandoned_cart',
    keywords: ['abandoned', 'cart', 'left behind', 'forgot']
  },
  {
    type: 'loyalty',
    keywords: ['loyalty', 'reward', 'vip', 'points', 'member']
  },
  {
    type: 'review_request',
    keywords: ['review', 'feedback', 'survey', 'rating', 'testimonial']
  },

  // Winback
  {
    type: 'winback',
    keywords: ['win-back', 're-engagement', 'inactive', 'miss you', 'come back']
  },

  // Promotional/Sales
  {
    type: 'promo',
    keywords: ['promo', 'sale', 'discount', 'offer', 'deal', '% off', 'coupon']
  },
  {
    type: 'seasonal',
    keywords: ['black friday', 'holiday', 'seasonal', 'cyber monday', 'christmas', 'valentine']
  },
  {
    type: 'launch',
    keywords: ['launch', 'new product', 'introducing', 'just dropped', 'announce']
  },

  // Sequences
  {
    type: 'welcome',
    keywords: ['welcome', 'hello', 'thanks for joining', 'glad you']
  },
  {
    type: 'onboarding',
    keywords: ['onboarding', 'getting started', 'next steps', 'setup']
  },
  {
    type: 'nurture',
    keywords: ['drip', 'nurture', 'series']
  },

  // Content
  {
    type: 'newsletter',
    keywords: ['newsletter', 'weekly', 'monthly', 'digest', 'roundup']
  },
  {
    type: 'content_announcement',
    keywords: ['new post', 'guide', 'video', 'content', 'article', 'blog']
  },
  {
    type: 'brand_story',
    keywords: ['mission', 'values', 'story', 'about us', 'our story']
  }
];

/**
 * Infer email type from snippet metadata
 * Searches category, title, and tags for matching keywords
 * Returns first match in priority order, or 'generic' as fallback
 */
export function inferEmailType(snippet: Snippet): EmailType {
  // Extract searchable text
  const category = (snippet.category || '').toLowerCase();
  const title = (snippet.title || '').toLowerCase();
  const tags = (snippet.tags || []).map(t => t.toLowerCase()).join(' ');

  const searchText = `${category} ${title} ${tags}`;

  // Handle empty metadata
  if (!searchText.trim()) {
    return 'generic';
  }

  // Check keywords in priority order
  for (const { type, keywords } of TYPE_PRIORITY_ORDER) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return type;
    }
  }

  // Fallback to generic
  return 'generic';
}

/**
 * Get required conditional blocks for an email type
 * Returns array of block names and severity level (error or warning)
 */
export function getRequiredBlocks(emailType: EmailType): {
  blocks: string[];
  level: 'error' | 'warning';
} {
  const group = getTypeGroup(emailType);

  switch (group) {
    case 'promotional':
      return {
        blocks: ['OFFER', 'URGENCY'],
        level: 'error'
      };

    case 'transactional':
      return {
        blocks: ['TRANSACTION CONTEXT', 'NEXT STEPS'],
        level: 'error'
      };

    case 'sequence':
      return {
        blocks: ['SEQUENCE CONTEXT'],
        level: 'error'
      };

    case 'content':
      return {
        blocks: ['VALUE PROMISE'],
        level: 'warning'
      };

    default:
      return {
        blocks: [],
        level: 'error'
      };
  }
}

/**
 * Get the type group for an email type
 * Used for conditional validation logic
 */
export function getTypeGroup(emailType: EmailType): keyof EmailTypeGroups {
  for (const [groupName, types] of Object.entries(EMAIL_TYPE_GROUPS)) {
    if (types.includes(emailType)) {
      return groupName as keyof EmailTypeGroups;
    }
  }
  return 'generic';
}

/**
 * Get human-readable label for email type (for UI display)
 */
export function emailTypeLabel(type: EmailType): string {
  const labels: Record<EmailType, string> = {
    welcome: 'Welcome',
    onboarding: 'Onboarding',
    promo: 'Promo',
    launch: 'Launch',
    seasonal: 'Seasonal',
    newsletter: 'Newsletter',
    nurture: 'Nurture',
    brand_story: 'Brand Story',
    abandoned_cart: 'Abandoned Cart',
    transactional: 'Transactional',
    review_request: 'Review Request',
    loyalty: 'Loyalty',
    winback: 'Win-back',
    event: 'Event',
    content_announcement: 'Content',
    generic: 'Email'
  };
  return labels[type] || 'Email';
}
