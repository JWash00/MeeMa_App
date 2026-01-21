// Test result persistence for PromptTest v0.1.1
// Stores last test execution results in localStorage per snippet

export interface TestResult {
  pass: boolean;
  passed: number;
  total: number;
  at: string; // ISO date string
  testName?: string;
}

/**
 * Get last test result from localStorage
 */
export function getLastTestResult(snippetId: string): TestResult | null {
  try {
    const key = `ptk_last_test_result_${snippetId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const result = JSON.parse(stored);
    return result;
  } catch (error) {
    console.error('Failed to load last test result:', error);
    return null;
  }
}

/**
 * Store test result in localStorage
 */
export function setLastTestResult(snippetId: string, result: TestResult): void {
  try {
    const key = `ptk_last_test_result_${snippetId}`;
    localStorage.setItem(key, JSON.stringify(result));
  } catch (error) {
    console.error('Failed to store test result:', error);
  }
}

/**
 * Clear stored test result from localStorage
 */
export function clearLastTestResult(snippetId: string): void {
  try {
    const key = `ptk_last_test_result_${snippetId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear test result:', error);
  }
}
