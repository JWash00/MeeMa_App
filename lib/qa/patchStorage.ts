// Patch Storage v0.1 - LocalStorage persistence for patch overrides
// Stores patched text per snippet with enable/disable flag

import { PatchChange } from './patchSuggestions';

export interface StoredPatch {
  snippetId: string;
  original: string;
  patched: string;
  enabled: boolean;
  createdAt: string;
  changes: PatchChange[];
}

/**
 * Get patch override from localStorage
 */
export function getPatchOverride(snippetId: string): StoredPatch | null {
  try {
    const key = `ptk_patch_${snippetId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const patch = JSON.parse(stored);
    return patch;
  } catch (error) {
    console.error('Failed to load patch override:', error);
    return null;
  }
}

/**
 * Store patch override in localStorage
 */
export function setPatchOverride(snippetId: string, patch: Omit<StoredPatch, 'snippetId' | 'createdAt'>): void {
  try {
    const key = `ptk_patch_${snippetId}`;
    const storedPatch: StoredPatch = {
      ...patch,
      snippetId,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(storedPatch));
  } catch (error) {
    console.error('Failed to store patch override:', error);
    throw new Error('Failed to save patch. LocalStorage may be full.');
  }
}

/**
 * Clear patch override from localStorage
 */
export function clearPatchOverride(snippetId: string): void {
  try {
    const key = `ptk_patch_${snippetId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear patch override:', error);
  }
}

/**
 * Check if patch is enabled for snippet
 */
export function isPatchEnabled(snippetId: string): boolean {
  const patch = getPatchOverride(snippetId);
  return patch?.enabled || false;
}

/**
 * Toggle patch enabled flag without changing other data
 */
export function togglePatchEnabled(snippetId: string, enabled: boolean): void {
  try {
    const patch = getPatchOverride(snippetId);
    if (!patch) return;

    const key = `ptk_patch_${snippetId}`;
    const updated: StoredPatch = {
      ...patch,
      enabled,
    };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to toggle patch enabled:', error);
  }
}
