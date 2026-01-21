import { Snippet } from '@/lib/types';

// Type definitions
export type QaLevel = 'draft' | 'verified';

export interface QaIssue {
  level: 'error' | 'warning';
  code: string;
  message: string;
}

export interface QaResult {
  level: QaLevel;
  score: number;
  issues: QaIssue[];
  checks: Record<string, boolean>;
}

// Memoization cache
const qaCache = new Map<string, QaResult>();

// Helper: Get content text from snippet
export function getContentText(snippet: Snippet): string {
  const type = normalizeType(snippet);
  if (type === 'workflow') {
    return snippet.template || snippet.code || '';
  }
  return snippet.code || snippet.template || '';
}

// Helper: Normalize type field
export function normalizeType(snippet: Snippet): 'prompt' | 'workflow' {
  return snippet.type || 'prompt';
}

// Helper: Normalize version field
export function normalizeVersion(snippet: Snippet): string {
  return snippet.version || '1.0';
}

// Helper: Extract placeholders from template
export function extractPlaceholders(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const key = match[1].trim();
    if (key && !matches.includes(key)) {
      matches.push(key);
    }
  }

  return matches;
}

// Helper: Get schema keys
export function getSchemaKeys(inputs_schema: any): string[] {
  if (!inputs_schema || typeof inputs_schema !== 'object') {
    return [];
  }
  return Object.keys(inputs_schema);
}

// Core scanner: Text analysis for block headings
export function qaScanText(text: string): {
  issues: QaIssue[];
  checks: Record<string, boolean>;
} {
  const issues: QaIssue[] = [];
  const checks: Record<string, boolean> = {
    hasObjective: false,
    hasInputs: false,
    hasConstraints: false,
    hasOutputFormat: false,
    hasQc: false,
    hasUncertaintyPolicy: false,
  };

  const lowerText = text.toLowerCase();

  // Check for OBJECTIVE or TASK
  if (/(^|\n)##?\s*(objective|task)[\s:]/im.test(text) || /\*\*(objective|task)\*\*/i.test(text)) {
    checks.hasObjective = true;
  }

  // Check for INPUT or INPUTS
  if (/(^|\n)##?\s*(inputs?|user inputs?)[\s:]/im.test(text) || /\*\*(inputs?|user inputs?)\*\*/i.test(text)) {
    checks.hasInputs = true;
  }

  // Check for CONSTRAINTS
  if (/(^|\n)##?\s*constraints[\s:]/im.test(text) || /\*\*constraints\*\*/i.test(text)) {
    checks.hasConstraints = true;
  }

  // Check for OUTPUT FORMAT
  if (/(^|\n)##?\s*output\s+format[\s:]/im.test(text) || /\*\*output\s+format\*\*/i.test(text)) {
    checks.hasOutputFormat = true;
  }

  // Check for QC / QUALITY CHECK
  if (
    /(^|\n)##?\s*(qc|quality\s+checks?|quality\s+assurance)[\s:]/im.test(text) ||
    /\*\*(qc|quality\s+checks?|quality\s+assurance)\*\*/i.test(text)
  ) {
    checks.hasQc = true;
  }

  // Check for UNCERTAINTY POLICY (flexible patterns)
  const uncertaintyPatterns = [
    /(^|\n)##?\s*uncertainty\s+policy[\s:]/i,
    /\*\*uncertainty\s+policy\*\*/i,
    /do not guess/i,
    /if uncertain/i,
    /when uncertain/i,
    /ask up to/i,
    /label as unverified/i,
    /mark as unverified/i,
  ];

  if (uncertaintyPatterns.some(pattern => pattern.test(text))) {
    checks.hasUncertaintyPolicy = true;
  }

  // JSON-only pattern checks
  if (/return\s+only\s+valid\s+json/i.test(text)) {
    // Check for "no markdown" or "no commentary"
    if (!/no\s+(markdown|commentary|extra|additional\s+text)/i.test(text)) {
      issues.push({
        level: 'warning',
        code: 'JSON_NO_MARKDOWN_WARNING',
        message: 'JSON-only responses should explicitly state "no markdown" or "no commentary"',
      });
    }

    // Check for unknown handling
    if (!/(\bnull\b|\[\]|empty\s+string|"unknown"|not\s+available)/i.test(text)) {
      issues.push({
        level: 'warning',
        code: 'JSON_UNKNOWN_HANDLING',
        message: 'JSON-only responses should specify how to handle unknown values (null, [], empty string)',
      });
    }
  }

  return { issues, checks };
}

// Main evaluator: Comprehensive QA evaluation
export function qaEvaluateSnippet(snippet: Snippet): QaResult {
  const issues: QaIssue[] = [];
  const contentText = getContentText(snippet);
  const type = normalizeType(snippet);
  const version = normalizeVersion(snippet);
  const isOfficial = snippet.scope === 'official';

  // A) Metadata checks (stricter for official scope)
  if (isOfficial) {
    if (!snippet.title || snippet.title.trim() === '') {
      issues.push({
        level: 'error',
        code: 'MISSING_TITLE',
        message: 'Title is required for official content',
      });
    }

    if (!snippet.description || snippet.description.trim() === '') {
      issues.push({
        level: 'error',
        code: 'MISSING_DESCRIPTION',
        message: 'Description is required for official content',
      });
    }

    if (!snippet.category || snippet.category.trim() === '') {
      issues.push({
        level: 'error',
        code: 'MISSING_CATEGORY',
        message: 'Category is required for official content',
      });
    }
  }

  // Version format check (warning)
  if (!/^\d+\.\d+$/.test(version)) {
    issues.push({
      level: 'warning',
      code: 'VERSION_FORMAT',
      message: `Version should follow MAJOR.MINOR format (e.g., "1.0"), got "${version}"`,
    });
  }

  // Audience check (warning)
  if (!snippet.audience) {
    issues.push({
      level: 'warning',
      code: 'MISSING_AUDIENCE',
      message: 'Audience field (creator/developer/both) is recommended',
    });
  }

  // B) Text checks via qaScanText
  const scanResult = qaScanText(contentText);
  issues.push(...scanResult.issues);
  const checks = scanResult.checks;

  // C) Workflow-specific checks
  if (type === 'workflow') {
    if (!snippet.template || snippet.template.trim() === '') {
      issues.push({
        level: 'error',
        code: 'WORKFLOW_MISSING_TEMPLATE',
        message: 'Workflows must have a template',
      });
    }

    const schemaKeys = getSchemaKeys(snippet.inputs_schema);
    if (schemaKeys.length === 0) {
      issues.push({
        level: 'error',
        code: 'WORKFLOW_MISSING_SCHEMA',
        message: 'Workflows must have inputs_schema with at least one input',
      });
    }

    // Placeholder-schema alignment
    if (snippet.template) {
      const placeholders = extractPlaceholders(snippet.template);
      const missingInSchema = placeholders.filter(p => !schemaKeys.includes(p));
      const unusedInTemplate = schemaKeys.filter(k => !placeholders.includes(k));

      if (missingInSchema.length > 0) {
        issues.push({
          level: 'error',
          code: 'PLACEHOLDER_SCHEMA_MISMATCH',
          message: `Placeholders not in schema: ${missingInSchema.join(', ')}`,
        });
      }

      if (unusedInTemplate.length > 0) {
        issues.push({
          level: 'warning',
          code: 'UNUSED_SCHEMA_KEYS',
          message: `Schema keys not used in template: ${unusedInTemplate.join(', ')}`,
        });
      }
    }

    // QC required for workflows
    if (!checks.hasQc) {
      issues.push({
        level: 'error',
        code: 'WORKFLOW_MISSING_QC',
        message: 'Workflows must include a QC (Quality Check) section',
      });
    }
  }

  // D) Prompt-specific checks
  if (!contentText || contentText.trim() === '') {
    issues.push({
      level: 'error',
      code: 'MISSING_CONTENT',
      message: 'Content (code or template) is required',
    });
  }

  if (!checks.hasOutputFormat) {
    issues.push({
      level: 'warning',
      code: 'MISSING_OUTPUT_FORMAT',
      message: 'OUTPUT FORMAT section is recommended for clear results',
    });
  }

  // Scoring rubric (0-100)
  let score = 0;

  // Structure blocks: 50 points total
  if (checks.hasObjective) score += 10;
  if (checks.hasInputs) score += 10;
  if (checks.hasConstraints) score += 10;
  if (checks.hasOutputFormat) score += 20;

  // Uncertainty policy: 15 points
  if (checks.hasUncertaintyPolicy) score += 15;

  // QC: 15 points (required for workflows, partial for prompts)
  if (checks.hasQc) {
    score += 15;
  } else if (type === 'prompt') {
    // Prompts get partial credit if missing QC
    score += 5;
  }

  // Workflow schema/template integrity: 20 points (workflows only)
  if (type === 'workflow') {
    const hasTemplate = snippet.template && snippet.template.trim() !== '';
    const hasSchema = getSchemaKeys(snippet.inputs_schema).length > 0;
    const placeholders = snippet.template ? extractPlaceholders(snippet.template) : [];
    const schemaKeys = getSchemaKeys(snippet.inputs_schema);
    const hasAlignment = placeholders.every(p => schemaKeys.includes(p));

    if (hasTemplate) score += 7;
    if (hasSchema) score += 7;
    if (hasAlignment) score += 6;
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Determine level
  const hasErrors = issues.some(i => i.level === 'error');
  const level: QaLevel = score >= 85 && !hasErrors ? 'verified' : 'draft';

  return {
    level,
    score,
    issues,
    checks,
  };
}

// Memoized evaluator
export function memoizedQaEvaluate(snippet: Snippet): QaResult {
  const cacheKey = `${snippet.id}-${snippet.updated_at}-${normalizeVersion(snippet)}`;

  if (qaCache.has(cacheKey)) {
    return qaCache.get(cacheKey)!;
  }

  const result = qaEvaluateSnippet(snippet);
  qaCache.set(cacheKey, result);

  // Limit cache size to prevent memory issues
  if (qaCache.size > 100) {
    const firstKey = qaCache.keys().next().value;
    if (firstKey) {
      qaCache.delete(firstKey);
    }
  }

  return result;
}
