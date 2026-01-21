'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Check, Copy, X, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Snippet } from '@/lib/types';
import { QaResult } from '@/lib/qa/promptQa';
import { generatePatch, PatchResult, detectBlocks } from '@/lib/qa/patchSuggestions';
import { getPatchOverride, setPatchOverride, clearPatchOverride, StoredPatch } from '@/lib/qa/patchStorage';
import { getContentText, extractPlaceholders, getSchemaKeys, normalizeType } from '@/lib/qa/promptQa';

interface PatchSuggestionsPanelProps {
  snippet: Snippet;
  qaResult: QaResult;
  onPatchApplied?: (patchResult: PatchResult) => void;
}

export default function PatchSuggestionsPanel({
  snippet,
  qaResult,
  onPatchApplied,
}: PatchSuggestionsPanelProps) {
  const [patchResult, setPatchResult] = useState<PatchResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storedPatch, setStoredPatch] = useState<StoredPatch | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedChanges, setExpandedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stored patch on mount
  useEffect(() => {
    const stored = getPatchOverride(snippet.id);
    setStoredPatch(stored);
  }, [snippet.id]);

  // Detect missing blocks
  const contentText = getContentText(snippet);
  const blocks = detectBlocks(contentText);
  const missingBlocks = Object.entries(blocks)
    .filter(([_, present]) => !present)
    .map(([key]) => key.replace('has', ''));
  const hasMissingBlocks = missingBlocks.length > 0;

  // Handle generate patch
  const handleGeneratePatch = () => {
    setIsGenerating(true);
    setError(null);

    try {
      const type = normalizeType(snippet);
      const placeholders = extractPlaceholders(contentText);
      const schemaKeys = snippet.inputs_schema ? getSchemaKeys(snippet.inputs_schema) : [];

      const result = generatePatch(contentText, {
        type,
        inputsSchemaKeys: schemaKeys,
        title: snippet.title,
        category: snippet.category || undefined,
        placeholders,
      });

      setPatchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate patch');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle apply locally
  const handleApplyLocally = () => {
    if (!patchResult) return;

    try {
      setPatchOverride(snippet.id, {
        original: patchResult.original,
        patched: patchResult.patched,
        enabled: true,
        changes: patchResult.changes,
      });

      const stored = getPatchOverride(snippet.id);
      setStoredPatch(stored);
      onPatchApplied?.(patchResult);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply patch');
    }
  };

  // Handle copy patched text
  const handleCopyPatched = async () => {
    if (!patchResult) return;

    try {
      await navigator.clipboard.writeText(patchResult.patched);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Handle discard patch
  const handleDiscardPatch = () => {
    setPatchResult(null);
    setError(null);
  };

  // Handle revert to original
  const handleRevertToOriginal = () => {
    clearPatchOverride(snippet.id);
    setStoredPatch(null);
    setPatchResult(null);
    setError(null);
  };

  // If no missing blocks, show success state
  if (!hasMissingBlocks) {
    return (
      <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle size={18} className="text-status-success" />
          <h3 className="text-md font-semibold text-white dark:text-white">Patch Suggestions</h3>
          <span className="ml-auto text-xs bg-status-success/10 text-status-success px-2 py-1 rounded">
            No patches needed
          </span>
        </div>
        <p className="text-sm text-spotify-lightgray dark:text-spotify-lightgray mt-2">
          This prompt already includes all recommended structural blocks.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-spotify-green" />
        <h3 className="text-md font-semibold text-white dark:text-white">Patch Suggestions</h3>
        {hasMissingBlocks && !storedPatch && (
          <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
            {missingBlocks.length} blocks missing
          </span>
        )}
        {storedPatch?.enabled && (
          <span className="ml-auto text-xs bg-status-success/10 text-status-success px-2 py-1 rounded flex items-center gap-1">
            <Check size={12} />
            Patched (local)
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 dark:bg-red-500/10 dark:border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-400">{error}</div>
        </div>
      )}

      {/* Active Patch Indicator */}
      {storedPatch?.enabled && !patchResult && (
        <div className="p-3 bg-status-success/10 border border-status-success/30 dark:bg-status-success/10 dark:border-status-success/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-status-success">Using patched version</span>
            <button
              onClick={handleRevertToOriginal}
              className="text-xs px-3 py-1 bg-spotify-gray dark:bg-spotify-gray hover:bg-spotify-lightgray/20 text-white rounded transition-colors"
            >
              Revert to Original
            </button>
          </div>
          <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray">
            This snippet is using a locally patched version with {storedPatch.changes.length} structural blocks added.
          </p>
        </div>
      )}

      {/* Generate Section */}
      {!patchResult && !storedPatch?.enabled && (
        <div>
          <p className="text-sm text-spotify-lightgray dark:text-spotify-lightgray mb-3">
            This prompt is missing {missingBlocks.length} structural blocks that could improve quality and consistency.
          </p>

          {/* Missing blocks chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {missingBlocks.map((block) => (
              <span
                key={block}
                className="text-xs px-2 py-1 bg-spotify-gray dark:bg-spotify-gray text-spotify-lightgray rounded"
              >
                {block}
              </span>
            ))}
          </div>

          <button
            onClick={handleGeneratePatch}
            disabled={isGenerating}
            className={`w-full px-4 py-2 rounded-full font-semibold transition-colors text-sm flex items-center justify-center gap-2 ${
              isGenerating
                ? 'bg-spotify-gray/50 text-spotify-lightgray cursor-not-allowed'
                : 'bg-spotify-green text-black hover:bg-spotify-greenhover'
            }`}
          >
            <Sparkles size={16} />
            {isGenerating ? 'Generating...' : 'Generate Patch Suggestions'}
          </button>
        </div>
      )}

      {/* Preview Section */}
      {patchResult && (
        <div className="space-y-4">
          {/* Score comparison */}
          <div className="flex items-center gap-4 p-3 bg-spotify-black dark:bg-spotify-black rounded">
            <div className="flex-1">
              <div className="text-xs text-spotify-lightgray dark:text-spotify-lightgray">Original Score</div>
              <div className="text-lg font-bold text-white dark:text-white">
                {patchResult.qaScoreBefore}/100
              </div>
            </div>
            <div className="text-spotify-green text-xl">→</div>
            <div className="flex-1">
              <div className="text-xs text-spotify-lightgray dark:text-spotify-lightgray">Patched Score</div>
              <div className="text-lg font-bold text-status-success">{patchResult.qaScoreAfter}/100</div>
            </div>
          </div>

          {/* Changes list */}
          <div>
            <button
              onClick={() => setExpandedChanges(!expandedChanges)}
              className="flex items-center gap-2 text-sm font-medium text-white dark:text-white hover:text-spotify-green transition-colors"
            >
              {expandedChanges ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {patchResult.changes.length} Changes
            </button>

            {expandedChanges && (
              <div className="mt-2 space-y-2">
                {patchResult.changes.map((change, index) => (
                  <div
                    key={index}
                    className="p-2 bg-spotify-black dark:bg-spotify-black rounded text-xs"
                  >
                    <div className="font-medium text-white dark:text-white">{change.title}</div>
                    <div className="text-spotify-lightgray dark:text-spotify-lightgray mt-1">
                      {change.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-side diff */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original */}
            <div className="flex flex-col">
              <div className="text-xs font-medium text-spotify-lightgray dark:text-spotify-lightgray mb-2">
                Original
              </div>
              <textarea
                readOnly
                value={patchResult.original}
                className="flex-1 w-full bg-spotify-black dark:bg-spotify-black text-white dark:text-white rounded p-3 text-xs font-mono resize-none focus:outline-none min-h-[300px] max-h-[500px]"
              />
            </div>

            {/* Patched */}
            <div className="flex flex-col">
              <div className="text-xs font-medium text-status-success mb-2 flex items-center gap-2">
                Patched
                <span className="px-2 py-0.5 bg-status-success/10 text-status-success rounded text-[10px]">
                  +{patchResult.changes.length} blocks
                </span>
              </div>
              <textarea
                readOnly
                value={patchResult.patched}
                className="flex-1 w-full bg-spotify-black dark:bg-spotify-black text-status-success dark:text-status-success rounded p-3 text-xs font-mono resize-none focus:outline-none min-h-[300px] max-h-[500px]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleApplyLocally}
              className="flex-1 px-4 py-2 bg-spotify-green text-black rounded-full font-semibold hover:bg-spotify-greenhover transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Apply Locally
            </button>

            <button
              onClick={handleCopyPatched}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy Patched Text
                </>
              )}
            </button>

            <button
              onClick={handleDiscardPatch}
              className="px-4 py-2 bg-spotify-gray dark:bg-spotify-gray hover:bg-spotify-lightgray/20 text-white rounded-full font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              <X size={16} />
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
