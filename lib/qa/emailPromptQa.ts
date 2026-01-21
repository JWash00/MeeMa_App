// Email Prompt QA v0.1
// Deterministic structural QA + scoring for email prompts/workflows

import type { Snippet } from '@/lib/types';
import {
  inferEmailType,
  getRequiredBlocks,
  getTypeGroup,
  EMAIL_TYPE_GROUPS,
  type EmailType
} from './emailType';

export interface EmailQaIssue {
  level: 'error' | 'warning';
  code: string;
  message: string;
}

export interface EmailQaResult {
  level: 'draft' | 'verified';
  score: number;
  issues: EmailQaIssue[];
  checks: Record<string, boolean>;
  modality: 'email';
  emailType: EmailType;
}

export interface EmailQaChecks {
  // Universal blocks
  hasGoal: boolean;
  hasAudience: boolean;
  hasTone: boolean;
  hasContent: boolean;
  hasCta: boolean;
  hasOutputFormat: boolean;

  // Conditional blocks (may be undefined if not applicable)
  hasOffer?: boolean;
  hasUrgency?: boolean;
  hasTransactionContext?: boolean;
  hasNextSteps?: boolean;
  hasSequenceContext?: boolean;
  hasValuePromise?: boolean;
}

// Keyword constants for validation
const CTA_KEYWORDS = [
  'buy', 'shop', 'order', 'subscribe', 'read more', 'learn more',
  'book', 'register', 'download', 'get started', 'sign up', 'claim'
];

const PROMO_KEYWORDS = [
  'sale', 'discount', 'limited time', '% off', 'deal', 'offer',
  'save', 'clearance', 'exclusive', 'special price'
];

const GOAL_INTENT_KEYWORDS = [
  'inform', 'request', 'offer', 'announce', 'remind', 'invite', 'confirm'
];

/**
 * Detect all email blocks (universal + conditional)
 * Returns boolean map of block presence
 */
export function detectEmailBlocks(text: string): EmailQaChecks {
  const checks: EmailQaChecks = {
    // Universal blocks
    hasGoal: false,
    hasAudience: false,
    hasTone: false,
    hasContent: false,
    hasCta: false,
    hasOutputFormat: false,

    // Conditional blocks
    hasOffer: false,
    hasUrgency: false,
    hasTransactionContext: false,
    hasNextSteps: false,
    hasSequenceContext: false,
    hasValuePromise: false
  };

  if (!text) return checks;

  // GOAL detection (aliases: PURPOSE)
  checks.hasGoal =
    /##?\s*(goal|purpose)[\s:]/i.test(text) ||
    /\n\s*(goal|purpose)\s*[:]/i.test(text);

  // AUDIENCE detection (aliases: RECIPIENT, WHO IT'S FOR)
  checks.hasAudience =
    /##?\s*(audience|recipient|who\s+it'?s\s+for)[\s:]/i.test(text) ||
    /\n\s*(audience|recipient)\s*[:]/i.test(text);

  // TONE detection (aliases: VOICE)
  checks.hasTone =
    /##?\s*(tone|voice)[\s:]/i.test(text) ||
    /\n\s*(tone|voice)\s*[:]/i.test(text);

  // CONTENT detection (aliases: MESSAGE, BODY)
  checks.hasContent =
    /##?\s*(content|message|body)[\s:]/i.test(text) ||
    /\n\s*(content|message|body)\s*[:]/i.test(text);

  // CTA detection (aliases: CALL TO ACTION, NEXT STEP)
  checks.hasCta =
    /##?\s*(cta|call\s+to\s+action|next\s+step)[\s:]/i.test(text) ||
    /\n\s*(cta|call\s+to\s+action)\s*[:]/i.test(text);

  // OUTPUT FORMAT detection (aliases: FORMAT, DELIVERABLE)
  checks.hasOutputFormat =
    /##?\s*(output\s+format|format|deliverable)[\s:]/i.test(text) ||
    /\n\s*(output\s+format|format)\s*[:]/i.test(text);

  // OFFER detection (aliases: DEAL, PROMOTION)
  checks.hasOffer =
    /##?\s*(offer|deal|promotion)[\s:]/i.test(text) ||
    /\n\s*(offer|deal|promotion)\s*[:]/i.test(text);

  // URGENCY detection (aliases: TIMING, DEADLINE, DATES, LIMITED TIME)
  checks.hasUrgency =
    /##?\s*(urgency|timing|deadline|dates|limited\s+time)[\s:]/i.test(text) ||
    /\n\s*(urgency|deadline)\s*[:]/i.test(text) ||
    /limited\s+time/i.test(text);

  // TRANSACTION CONTEXT detection (aliases: ORDER DETAILS, CART DETAILS, PURCHASE CONTEXT)
  checks.hasTransactionContext =
    /##?\s*(transaction\s+context|order\s+details|cart\s+details|purchase\s+context)[\s:]/i.test(text) ||
    /\n\s*(transaction\s+context|order\s+details)\s*[:]/i.test(text);

  // NEXT STEPS detection (aliases: WHAT HAPPENS NEXT, ACTION STEPS)
  checks.hasNextSteps =
    /##?\s*(next\s+steps|what\s+happens\s+next|action\s+steps)[\s:]/i.test(text) ||
    /\n\s*(next\s+steps|action\s+steps)\s*[:]/i.test(text);

  // SEQUENCE CONTEXT detection (aliases: EMAIL #, STEP, SERIES CONTEXT)
  checks.hasSequenceContext =
    /##?\s*(sequence\s+context|email\s+#|step|series\s+context)[\s:]/i.test(text) ||
    /\n\s*(sequence\s+context|email\s+#)\s*[:]/i.test(text);

  // VALUE PROMISE detection (aliases: WHAT YOU'LL GET, WHY READ)
  checks.hasValuePromise =
    /##?\s*(value\s+promise|what\s+you'?ll\s+get|why\s+read)[\s:]/i.test(text) ||
    /\n\s*(value\s+promise)\s*[:]/i.test(text);

  return checks;
}

/**
 * Extract block content between header and next header
 * Used for detailed validation of block content
 */
export function extractBlock(text: string, blockNames: string[]): string | null {
  if (!text) return null;

  const blockPattern = blockNames.map(name => name.replace(/\s+/g, '\\s+')).join('|');
  const headerRegex = new RegExp(`##?\\s*(${blockPattern})\\s*[:]*`, 'i');

  const match = text.match(headerRegex);
  if (!match) return null;

  const startIndex = match.index! + match[0].length;
  const remainingText = text.substring(startIndex);
  const nextHeaderMatch = remainingText.match(/\n##?\s+[A-Z]/i);

  const endIndex = nextHeaderMatch
    ? startIndex + nextHeaderMatch.index!
    : text.length;

  return text.substring(startIndex, endIndex).trim();
}

/**
 * Check CTA consistency
 * Validates CTA block presence and checks for multiple conflicting CTAs
 */
export function ctaConsistencyCheck(text: string, checks: EmailQaChecks): EmailQaIssue[] {
  const issues: EmailQaIssue[] = [];

  if (!checks.hasCta) {
    issues.push({
      level: 'error',
      code: 'MISSING_CTA',
      message: 'Missing CTA block: Define a clear call-to-action for the recipient'
    });
    return issues;
  }

  // Check if CTA explicitly says "No CTA"
  const ctaBlock = extractBlock(text, ['CTA', 'CALL TO ACTION', 'NEXT STEP']);
  if (ctaBlock && /no\s+cta/i.test(ctaBlock)) {
    return issues; // Explicitly no CTA is acceptable
  }

  // Count distinct CTA intents
  const lowerText = text.toLowerCase();
  const foundCtas = CTA_KEYWORDS.filter(kw => lowerText.includes(kw));

  if (foundCtas.length >= 3) {
    issues.push({
      level: 'warning',
      code: 'MULTIPLE_CONFLICTING_CTAS',
      message: `Multiple conflicting CTAs detected: "${foundCtas.slice(0, 3).join('", "')}" - Consider focusing on a single primary action`
    });
  }

  return issues;
}

/**
 * Check for tone conflicts
 * Detects contradictory tone specifications
 */
export function toneConflictCheck(text: string): EmailQaIssue[] {
  const issues: EmailQaIssue[] = [];
  const lowerText = text.toLowerCase();

  // Check for urgent + relaxed
  if (lowerText.includes('urgent') && lowerText.includes('relaxed')) {
    issues.push({
      level: 'warning',
      code: 'TONE_CONFLICT',
      message: 'Tone conflict detected: "urgent" and "relaxed" are contradictory'
    });
  }

  // Check for formal + casual
  if (lowerText.includes('formal') && (lowerText.includes('casual') || lowerText.includes('slang'))) {
    issues.push({
      level: 'warning',
      code: 'TONE_CONFLICT',
      message: 'Tone conflict detected: "formal" and "casual/slang" are contradictory'
    });
  }

  return issues;
}

/**
 * Check for audience alignment issues
 * Detects mismatched audience signals
 */
export function audienceAlignmentCheck(text: string): EmailQaIssue[] {
  const issues: EmailQaIssue[] = [];
  const lowerText = text.toLowerCase();

  // Check for new subscriber + purchase language
  if (lowerText.includes('new subscriber') && lowerText.includes('purchase')) {
    issues.push({
      level: 'warning',
      code: 'AUDIENCE_MISMATCH',
      message: 'Audience mismatch: "new subscriber" and "purchase" signals may be contradictory'
    });
  }

  // Check for inactive + welcome
  if (lowerText.includes('inactive') && lowerText.includes('welcome')) {
    issues.push({
      level: 'warning',
      code: 'AUDIENCE_MISMATCH',
      message: 'Audience mismatch: "inactive" and "welcome" signals may be contradictory'
    });
  }

  return issues;
}

/**
 * Check for compliance scaffold
 * Validates presence of unsubscribe/preferences mentions
 */
export function complianceScaffoldCheck(text: string): EmailQaIssue[] {
  const issues: EmailQaIssue[] = [];
  const lowerText = text.toLowerCase();

  const hasUnsubscribe = /unsubscribe/.test(lowerText);
  const hasPreferences = /preferences|manage preferences/.test(lowerText);

  if (!hasUnsubscribe && !hasPreferences) {
    issues.push({
      level: 'warning',
      code: 'MISSING_COMPLIANCE_MENTION',
      message: 'Missing compliance mention: Consider including "unsubscribe" or "preferences" language'
    });
  }

  return issues;
}

/**
 * Check for promotional language in transactional emails
 * Warns if transactional email contains promotional keywords
 */
export function promoInTransactionalCheck(text: string, emailType: EmailType): EmailQaIssue[] {
  const issues: EmailQaIssue[] = [];

  // Only check transactional group
  const transactionalTypes: EmailType[] = ['transactional', 'abandoned_cart', 'review_request', 'loyalty'];
  if (!transactionalTypes.includes(emailType)) {
    return issues;
  }

  const lowerText = text.toLowerCase();
  const foundPromoKeywords = PROMO_KEYWORDS.filter(kw => lowerText.includes(kw));

  if (foundPromoKeywords.length > 0) {
    issues.push({
      level: 'warning',
      code: 'PROMO_IN_TRANSACTIONAL',
      message: `Promotional language detected in ${emailType} email: "${foundPromoKeywords.slice(0, 3).join('", "')}" - May reduce trust/deliverability`
    });
  }

  return issues;
}

/**
 * Validate conditional blocks based on email type
 * Returns errors for missing required conditional blocks
 */
export function validateConditionalBlocks(
  text: string,
  emailType: EmailType,
  checks: EmailQaChecks
): EmailQaIssue[] {
  const issues: EmailQaIssue[] = [];
  const { blocks: requiredBlocks, level } = getRequiredBlocks(emailType);

  if (requiredBlocks.length === 0) {
    return issues; // No conditional blocks required for this type
  }

  // Promotional group validation
  if (EMAIL_TYPE_GROUPS.promotional.includes(emailType)) {
    if (!checks.hasOffer) {
      issues.push({
        level,
        code: 'MISSING_OFFER',
        message: `${emailType} emails require an OFFER block (or aliases: DEAL, PROMOTION)`
      });
    }
    if (!checks.hasUrgency) {
      issues.push({
        level,
        code: 'MISSING_URGENCY',
        message: `${emailType} emails require URGENCY block (or aliases: TIMING, DEADLINE, DATES, LIMITED TIME)`
      });
    }
  }

  // Transactional group validation
  if (EMAIL_TYPE_GROUPS.transactional.includes(emailType)) {
    if (!checks.hasTransactionContext) {
      issues.push({
        level,
        code: 'MISSING_TRANSACTION_CONTEXT',
        message: `${emailType} emails require TRANSACTION CONTEXT block (or aliases: ORDER DETAILS, CART DETAILS, PURCHASE CONTEXT)`
      });
    }
    if (!checks.hasNextSteps) {
      issues.push({
        level,
        code: 'MISSING_NEXT_STEPS',
        message: `${emailType} emails require NEXT STEPS block (or aliases: WHAT HAPPENS NEXT, ACTION STEPS)`
      });
    }
  }

  // Sequence group validation
  if (EMAIL_TYPE_GROUPS.sequence.includes(emailType)) {
    if (!checks.hasSequenceContext) {
      issues.push({
        level,
        code: 'MISSING_SEQUENCE_CONTEXT',
        message: `${emailType} emails require SEQUENCE CONTEXT block (or aliases: EMAIL #, STEP, SERIES CONTEXT)`
      });
    }
  }

  // Content group validation (warning level)
  if (EMAIL_TYPE_GROUPS.content.includes(emailType)) {
    if (!checks.hasValuePromise) {
      issues.push({
        level: 'warning',
        code: 'MISSING_VALUE_PROMISE',
        message: `${emailType} emails should include VALUE PROMISE block (or aliases: WHAT YOU'LL GET, WHY READ)`
      });
    }
  }

  return issues;
}

/**
 * Score email prompt based on structure, clarity, alignment, and compliance
 * Returns score 0-100 and breakdown
 */
export function scoreEmailPrompt(
  text: string,
  emailType: EmailType,
  checks: EmailQaChecks,
  issues: EmailQaIssue[]
): { score: number; breakdown: Record<string, number> } {
  let score = 0;
  const breakdown: Record<string, number> = {};

  // 1. Structural Completeness: 40 points
  // Universal blocks: 24 pts (4 pts each)
  let structural = 0;
  if (checks.hasGoal) structural += 4;
  if (checks.hasAudience) structural += 4;
  if (checks.hasTone) structural += 4;
  if (checks.hasContent) structural += 4;
  if (checks.hasCta) structural += 4;
  if (checks.hasOutputFormat) structural += 4;

  // Conditional blocks: 16 pts (type-specific)
  const typeGroup = getTypeGroup(emailType);
  if (typeGroup === 'promotional') {
    if (checks.hasOffer) structural += 8;
    if (checks.hasUrgency) structural += 8;
  } else if (typeGroup === 'transactional') {
    if (checks.hasTransactionContext) structural += 8;
    if (checks.hasNextSteps) structural += 8;
  } else if (typeGroup === 'sequence') {
    if (checks.hasSequenceContext) structural += 16;
  } else if (typeGroup === 'content') {
    if (checks.hasValuePromise) structural += 10;
    structural += 6; // Partial credit for content types
  } else {
    structural += 16; // Full credit if no conditional blocks required
  }

  breakdown.structural = structural;
  score += structural;

  // 2. Goal & CTA Clarity: 25 points
  let goalCta = 0;
  const lowerText = text.toLowerCase();

  // Clear goal statement with intent keywords: 12 pts
  const hasGoalIntent = GOAL_INTENT_KEYWORDS.some(kw => lowerText.includes(kw));
  if (checks.hasGoal && hasGoalIntent) {
    goalCta += 12;
  } else if (checks.hasGoal) {
    goalCta += 6; // Partial credit for goal block without intent keywords
  }

  // Single clear CTA with action verb: 13 pts
  const ctaMatches = CTA_KEYWORDS.filter(kw => lowerText.includes(kw));
  if (checks.hasCta && ctaMatches.length > 0) {
    goalCta += 13;
    // Deduct for conflicting CTAs
    if (ctaMatches.length >= 3) {
      goalCta -= 5; // Max -10 for multiple conflicts
    }
  }

  breakdown.goalCta = goalCta;
  score += goalCta;

  // 3. Tone Consistency: 15 points
  let tone = 0;
  if (checks.hasTone) tone += 8; // Explicit tone definition

  // Check for no tone conflicts
  const toneConflicts = toneConflictCheck(text);
  if (toneConflicts.length === 0) {
    tone += 7;
  } else {
    tone -= 7; // Deduct for tone conflict
  }

  breakdown.tone = Math.max(0, tone);
  score += Math.max(0, tone);

  // 4. Audience Alignment: 10 points
  let audience = 0;
  if (checks.hasAudience) audience += 5; // Explicit audience definition

  // Check for no audience mismatch
  const audienceMismatches = audienceAlignmentCheck(text);
  if (audienceMismatches.length === 0) {
    audience += 5;
  } else {
    audience -= 5; // Deduct for audience mismatch
  }

  breakdown.audience = Math.max(0, audience);
  score += Math.max(0, audience);

  // 5. Compliance Readiness: 10 points
  let compliance = 0;
  const complianceIssues = complianceScaffoldCheck(text);
  if (complianceIssues.length === 0) {
    compliance = 10;
  }

  breakdown.compliance = compliance;
  score += compliance;

  // 6. Deductions
  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');

  const errorPenalty = Math.min(30, errors.length * 10);
  const warningPenalty = Math.min(15, warnings.length * 5);

  breakdown.errorPenalty = -errorPenalty;
  breakdown.warningPenalty = -warningPenalty;

  score -= errorPenalty;
  score -= warningPenalty;

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  return { score, breakdown };
}

/**
 * Main email QA evaluation entry point
 * Evaluates email prompt and returns unified result
 */
export function evaluateEmailPrompt(options: {
  text: string;
  inputs?: Record<string, string>;
  snippetMeta?: Snippet;
}): EmailQaResult {
  const { text, inputs, snippetMeta } = options;

  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      level: 'draft',
      score: 0,
      issues: [
        {
          level: 'warning',
          code: 'EMPTY_PROMPT',
          message: 'Email prompt text is empty'
        }
      ],
      checks: {
        hasGoal: false,
        hasAudience: false,
        hasTone: false,
        hasContent: false,
        hasCta: false,
        hasOutputFormat: false
      },
      modality: 'email',
      emailType: 'generic'
    };
  }

  // Infer email type
  const emailType = snippetMeta ? inferEmailType(snippetMeta) : 'generic';

  // Detect blocks
  const checks = detectEmailBlocks(text);

  // Collect issues
  const issues: EmailQaIssue[] = [];

  // Validate universal blocks (missing → warning)
  if (!checks.hasGoal) {
    issues.push({
      level: 'warning',
      code: 'MISSING_GOAL',
      message: 'Missing GOAL block: Define what this email aims to achieve'
    });
  }
  if (!checks.hasAudience) {
    issues.push({
      level: 'warning',
      code: 'MISSING_AUDIENCE',
      message: 'Missing AUDIENCE block: Define the target recipient'
    });
  }
  if (!checks.hasTone) {
    issues.push({
      level: 'warning',
      code: 'MISSING_TONE',
      message: 'Missing TONE block: Define the communication style'
    });
  }
  if (!checks.hasContent) {
    issues.push({
      level: 'warning',
      code: 'MISSING_CONTENT',
      message: 'Missing CONTENT block: Define the main message structure'
    });
  }
  if (!checks.hasOutputFormat) {
    issues.push({
      level: 'warning',
      code: 'MISSING_OUTPUT_FORMAT',
      message: 'Missing OUTPUT FORMAT block: Define the expected email structure'
    });
  }

  // Validate conditional blocks
  const conditionalIssues = validateConditionalBlocks(text, emailType, checks);
  issues.push(...conditionalIssues);

  // CTA consistency check
  const ctaIssues = ctaConsistencyCheck(text, checks);
  issues.push(...ctaIssues);

  // Tone conflict check
  const toneIssues = toneConflictCheck(text);
  issues.push(...toneIssues);

  // Audience alignment check
  const audienceIssues = audienceAlignmentCheck(text);
  issues.push(...audienceIssues);

  // Compliance scaffold check
  const complianceIssues = complianceScaffoldCheck(text);
  issues.push(...complianceIssues);

  // Promo-in-transactional check
  const promoIssues = promoInTransactionalCheck(text, emailType);
  issues.push(...promoIssues);

  // Placeholder completeness check (workflow only)
  if (snippetMeta?.type === 'workflow' && inputs) {
    const placeholders = text.match(/\{\{([^}]+)\}\}/g) || [];
    const placeholderKeys = placeholders.map(p => p.replace(/[{}]/g, '').trim());

    for (const key of placeholderKeys) {
      const value = inputs[key];
      if (!value || value.trim() === '') {
        issues.push({
          level: 'error',
          code: `MISSING_REQUIRED_INPUT:${key}`,
          message: `Placeholder {{${key}}} is not filled`
        });
      }
    }
  }

  // Compute score
  const { score } = scoreEmailPrompt(text, emailType, checks, issues);

  // Determine level: verified if score ≥ 85 AND no errors
  const errorCount = issues.filter(i => i.level === 'error').length;
  const level: 'draft' | 'verified' = score >= 85 && errorCount === 0 ? 'verified' : 'draft';

  // Convert checks to Record<string, boolean> for unified interface
  const checksRecord: Record<string, boolean> = {
    hasGoal: checks.hasGoal,
    hasAudience: checks.hasAudience,
    hasTone: checks.hasTone,
    hasContent: checks.hasContent,
    hasCta: checks.hasCta,
    hasOutputFormat: checks.hasOutputFormat,
    ...(checks.hasOffer !== undefined && { hasOffer: checks.hasOffer }),
    ...(checks.hasUrgency !== undefined && { hasUrgency: checks.hasUrgency }),
    ...(checks.hasTransactionContext !== undefined && { hasTransactionContext: checks.hasTransactionContext }),
    ...(checks.hasNextSteps !== undefined && { hasNextSteps: checks.hasNextSteps }),
    ...(checks.hasSequenceContext !== undefined && { hasSequenceContext: checks.hasSequenceContext }),
    ...(checks.hasValuePromise !== undefined && { hasValuePromise: checks.hasValuePromise }),
  };

  return {
    level,
    score,
    issues,
    checks: checksRecord,
    modality: 'email',
    emailType
  };
}
