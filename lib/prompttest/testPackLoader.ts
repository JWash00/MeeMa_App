// Test pack loader and validator for PromptTest v0.1.1
// Loads test pack JSON files, validates structure, and manages localStorage persistence

import { Modality } from './modality';

export interface LoadedTestPack {
  version: string;
  prompt_id: string;
  prompt_version: string;
  modality?: Modality; // NEW: Optional for backward compatibility
  description: string;
  test_cases: LoadedTestCase[];
}

export interface LoadedTestCase {
  id: string;
  description: string;
  inputs: Record<string, string>;
  assertions: LoadedAssertion[];
}

export interface LoadedAssertion {
  kind: 'contains' | 'not_contains' | 'regex_match' | 'max_words';
  value: string | number;
  description?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const ALLOWED_ASSERTION_KINDS = ['contains', 'not_contains', 'regex_match', 'max_words'];

/**
 * Load and parse test pack from uploaded file
 */
export async function loadTestPackFromFile(
  file: File
): Promise<{ pack?: LoadedTestPack; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        // Validate structure
        const validation = validateTestPack(data);
        if (!validation.ok) {
          resolve({
            error: `Invalid test pack: ${validation.errors.join(', ')}`,
          });
          return;
        }

        // Convert assertion "type" to "kind" if needed (handle both formats)
        const pack: LoadedTestPack = {
          ...data,
          test_cases: data.test_cases.map((tc: any) => ({
            ...tc,
            assertions: tc.assertions.map((a: any) => ({
              kind: a.kind || a.type, // Accept both "kind" and "type" fields
              value: a.value,
              description: a.description,
            })),
          })),
        };

        resolve({ pack });
      } catch (error) {
        resolve({
          error: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    };

    reader.onerror = () => {
      resolve({ error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
}

/**
 * Validate test pack structure
 */
export function validateTestPack(data: any): ValidationResult {
  const errors: string[] = [];

  // Check top-level required fields
  if (!data || typeof data !== 'object') {
    return { ok: false, errors: ['Test pack must be a valid JSON object'] };
  }

  if (!data.version || typeof data.version !== 'string') {
    errors.push('Missing or invalid "version" field');
  }

  if (!data.prompt_id || typeof data.prompt_id !== 'string') {
    errors.push('Missing or invalid "prompt_id" field');
  }

  if (!Array.isArray(data.test_cases)) {
    errors.push('Missing or invalid "test_cases" field (must be an array)');
    return { ok: false, errors }; // Can't validate further without array
  }

  if (data.test_cases.length === 0) {
    errors.push('Test pack must contain at least one test case');
  }

  // Validate each test case
  data.test_cases.forEach((testCase: any, index: number) => {
    const prefix = `Test case ${index + 1}`;

    if (!testCase.id || typeof testCase.id !== 'string') {
      errors.push(`${prefix}: Missing or invalid "id" field`);
    }

    if (!testCase.inputs || typeof testCase.inputs !== 'object') {
      errors.push(`${prefix}: Missing or invalid "inputs" field (must be an object)`);
    }

    if (!Array.isArray(testCase.assertions)) {
      errors.push(`${prefix}: Missing or invalid "assertions" field (must be an array)`);
    } else {
      // Validate each assertion
      testCase.assertions.forEach((assertion: any, aIndex: number) => {
        const aPrefix = `${prefix}, assertion ${aIndex + 1}`;

        // Accept both "kind" and "type" fields
        const assertionKind = assertion.kind || assertion.type;

        if (!assertionKind || typeof assertionKind !== 'string') {
          errors.push(`${aPrefix}: Missing or invalid "kind" or "type" field`);
        } else if (!ALLOWED_ASSERTION_KINDS.includes(assertionKind)) {
          errors.push(
            `${aPrefix}: Invalid assertion kind "${assertionKind}" (must be one of: ${ALLOWED_ASSERTION_KINDS.join(', ')})`
          );
        }

        if (assertion.value === undefined || assertion.value === null) {
          errors.push(`${aPrefix}: Missing "value" field`);
        }

        // Validate value type based on assertion kind
        if (assertionKind === 'max_words') {
          if (typeof assertion.value !== 'number') {
            errors.push(`${aPrefix}: "max_words" assertion requires numeric value`);
          }
        } else {
          if (typeof assertion.value !== 'string' && typeof assertion.value !== 'number') {
            errors.push(`${aPrefix}: Invalid value type (must be string or number)`);
          }
        }
      });
    }
  });

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * Get stored test pack from localStorage
 */
export function getStoredTestPack(snippetId: string): LoadedTestPack | null {
  try {
    const key = `ptk_testpack_${snippetId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const pack = JSON.parse(stored);
    return pack;
  } catch (error) {
    console.error('Failed to load stored test pack:', error);
    return null;
  }
}

/**
 * Store test pack in localStorage
 */
export function storeTestPack(snippetId: string, pack: LoadedTestPack): void {
  try {
    const key = `ptk_testpack_${snippetId}`;
    localStorage.setItem(key, JSON.stringify(pack));
  } catch (error) {
    console.error('Failed to store test pack:', error);
  }
}

/**
 * Clear stored test pack from localStorage
 */
export function clearStoredTestPack(snippetId: string): void {
  try {
    const key = `ptk_testpack_${snippetId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear stored test pack:', error);
  }
}
