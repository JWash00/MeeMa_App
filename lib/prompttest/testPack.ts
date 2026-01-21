// Test pack builder and downloader for PromptTest Surface v0.1
// Creates and downloads test pack JSON files matching docs/qa/prompt-test-pack.v0.1.md format

import { Snippet } from '@/lib/types';
import { Assertion } from './assertions';
import { Modality } from './modality';

interface TestCase {
  id: string;
  description: string;
  inputs: Record<string, string>;
  assertions: Assertion[];
}

interface TestPack {
  version: string;
  prompt_id: string;
  prompt_version: string;
  modality?: Modality; // NEW: Optional for backward compatibility
  description: string;
  test_cases: TestCase[];
}

/**
 * Build a test pack JSON structure
 */
export function buildTestPack(
  snippet: Snippet,
  testCaseName: string,
  inputs: Record<string, string>,
  assertions: Assertion[],
  modality?: Modality // NEW: Optional modality param
): TestPack {
  const testCase: TestCase = {
    id: testCaseName || 'test_01',
    description: `Test case for ${snippet.title}`,
    inputs,
    assertions,
  };

  return {
    version: '0.1',
    prompt_id: snippet.id,
    prompt_version: snippet.version || '1.0',
    modality, // NEW: Include modality in test pack
    description: `Test pack for ${snippet.title} - ${snippet.description || 'No description'}`,
    test_cases: [testCase],
  };
}

/**
 * Download test pack as JSON file
 */
export function downloadTestPackJson(
  snippet: Snippet,
  testCaseName: string,
  inputs: Record<string, string>,
  assertions: Assertion[],
  modality?: Modality // NEW: Optional modality param
): void {
  const testPack = buildTestPack(snippet, testCaseName, inputs, assertions, modality);
  const jsonString = JSON.stringify(testPack, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const timestamp = Date.now();
  const filename = `test_${snippet.id}_${timestamp}.json`;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
