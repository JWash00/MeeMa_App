// Assertion engine for PromptTest Surface v0.1
// Validates model outputs against deterministic contract checks

import { Modality } from './modality'

export type AssertionType = 'contains' | 'not_contains' | 'regex_match' | 'max_words';
export type AssertionTarget = 'output' | 'generated_prompt';

export interface Assertion {
  type: AssertionType;
  value: string | number;
  description?: string;
}

export interface AssertionResult {
  assertion: Assertion;
  passed: boolean;
  message: string;
}

export interface ChecksSummary {
  total: number;
  passed: number;
  failed: number;
  results: AssertionResult[];
}

/**
 * Count words in text (splits on whitespace)
 */
export function wordCount(text: string): number {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Run a single assertion against output text
 */
export function runAssertion(outputText: string, assertion: Assertion): AssertionResult {
  const lowerOutput = outputText.toLowerCase();
  let passed = false;
  let message = '';

  try {
    switch (assertion.type) {
      case 'contains': {
        const searchValue = String(assertion.value).toLowerCase();
        passed = lowerOutput.includes(searchValue);
        message = passed
          ? `✓ Output contains "${assertion.value}"`
          : `✗ Output does not contain "${assertion.value}"`;
        break;
      }

      case 'not_contains': {
        const searchValue = String(assertion.value).toLowerCase();
        passed = !lowerOutput.includes(searchValue);
        message = passed
          ? `✓ Output does not contain "${assertion.value}"`
          : `✗ Output incorrectly contains "${assertion.value}"`;
        break;
      }

      case 'regex_match': {
        try {
          const regex = new RegExp(String(assertion.value), 'i'); // case-insensitive by default
          passed = regex.test(outputText);
          message = passed
            ? `✓ Output matches pattern /${assertion.value}/`
            : `✗ Output does not match pattern /${assertion.value}/`;
        } catch (error) {
          passed = false;
          message = `✗ Invalid regex pattern: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        break;
      }

      case 'max_words': {
        const count = wordCount(outputText);
        const maxWords = Number(assertion.value);
        passed = count <= maxWords;
        message = passed
          ? `✓ Word count (${count}) is within limit (${maxWords})`
          : `✗ Word count (${count}) exceeds limit (${maxWords})`;
        break;
      }

      default:
        passed = false;
        message = `✗ Unknown assertion type: ${assertion.type}`;
    }
  } catch (error) {
    passed = false;
    message = `✗ Error running assertion: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return {
    assertion,
    passed,
    message,
  };
}

/**
 * Run all assertions against output text
 * @param targetText - The text to validate (output or generated prompt)
 * @param assertions - Array of assertions to run
 * @param target - What is being validated (for documentation/future use)
 */
export function runAssertions(
  targetText: string,
  assertions: Assertion[],
  target: AssertionTarget = 'output' // default for backward compatibility
): ChecksSummary {
  if (!assertions || assertions.length === 0) {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      results: [],
    };
  }

  const results = assertions.map((assertion) => runAssertion(targetText, assertion));
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    results,
  };
}

/**
 * Helper to determine target based on modality
 */
export function getAssertionTarget(modality: Modality): AssertionTarget {
  switch (modality) {
    case 'text':
    case 'email':
      return 'output'
    case 'image':
    case 'video':
      return 'generated_prompt'
    case 'manual':
    default:
      return 'output'
  }
}
