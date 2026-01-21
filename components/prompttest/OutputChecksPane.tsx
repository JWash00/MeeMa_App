'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Check, X, FileCheck, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Snippet } from '@/lib/types';
import ActionButton from '@/components/actions/ActionButton';
import { ChecksSummary, runAssertions, Assertion, AssertionTarget } from '@/lib/prompttest/assertions';
import { generateDefaultAssertions } from '@/lib/prompttest/defaultAssertions';
import { setLastTestResult } from '@/lib/prompttest/testResultStorage';
import { Modality } from '@/lib/prompttest/modality';
import { evaluateImagePrompt } from '@/lib/qa/imagePromptQa';
import { evaluateAudioPrompt, audioSubtypeLabel } from '@/lib/qa/audioPromptQa';
import { qaEvaluate } from '@/lib/qa/qaRouter';
import { videoSubtypeLabel } from '@/lib/prompttest/videoSubtype';
import ManualResultPanel from './ManualResultPanel';
import { TrustBadge } from '../trust/TrustBadge';
import { computeTrustStatus, formatScoreDisplay } from '@/lib/trust/trustUtils';
import { buildWhyThisWorks } from '@/lib/trust/whyThisWorks';
import { TRUST_STATUS_MICROCOPY, SECTION_HEADINGS } from '@/lib/trust/trustCopy';
import PatchButton from './PatchButton';
import { buildPatchRequirements } from '@/lib/prompttest/patch';

interface OutputChecksPaneProps {
  snippet: Snippet;
  inputValues: Record<string, string>;
  outputText: string;
  onOutputTextChange: (text: string) => void;
  generatedPrompt: string;
  checksResults: ChecksSummary | null;
  onChecksResultsChange: (results: ChecksSummary | null) => void;
  activeAssertions: Assertion[] | null;
  testCaseName?: string;
  modality: Modality;
  assertionTarget: AssertionTarget;
}

export default function OutputChecksPane({
  snippet,
  inputValues,
  outputText,
  onOutputTextChange,
  generatedPrompt,
  checksResults,
  onChecksResultsChange,
  activeAssertions,
  testCaseName,
  modality,
  assertionTarget,
}: OutputChecksPaneProps) {
  const handleRunChecks = (targetText: string) => {
    const assertions = activeAssertions || generateDefaultAssertions(snippet);
    const results = runAssertions(targetText, assertions, assertionTarget);
    onChecksResultsChange(results);

    // Persist test result
    setLastTestResult(snippet.id, {
      pass: results.failed === 0,
      passed: results.passed,
      total: results.total,
      at: new Date().toISOString(),
      testName: testCaseName,
    });
  };

  const handlePatchComplete = (patchText: string) => {
    if (!patchText.trim()) return;

    // Append patch to existing output
    const separator = '\n\n---\n\n';
    const newOutput = outputText + separator + patchText.trim() + '\n';

    // Update output
    onOutputTextChange(newOutput);

    // Auto re-run checks
    const assertions = activeAssertions || generateDefaultAssertions(snippet);
    const results = runAssertions(newOutput, assertions, assertionTarget);
    onChecksResultsChange(results);

    // Persist test result
    setLastTestResult(snippet.id, {
      pass: results.failed === 0,
      passed: results.passed,
      total: results.total,
      at: new Date().toISOString(),
      testName: testCaseName,
    });
  };

  const hasOutput = outputText.trim().length > 0;
  const hasResults = checksResults !== null;

  // Determine if we have patchable failures (for text/email modality)
  const patchRequirements = useMemo(() => {
    if (!checksResults) return [];
    if (modality !== 'text' && modality !== 'email') return [];
    return buildPatchRequirements(checksResults.results);
  }, [checksResults, modality]);

  const hasPatchableFailures = patchRequirements.length > 0;

  // Evaluate image/video/audio QA (must be at top level, not conditional)
  const qaResult = useMemo(() => {
    const hasPrompt = generatedPrompt.trim().length > 0;
    if (!hasPrompt) return null;

    if (modality === 'image') {
      return evaluateImagePrompt({
        text: generatedPrompt,
        inputs: inputValues,
        snippetMeta: snippet
      });
    }

    if (modality === 'video') {
      // Use unified QA router for video (handles T2V vs I2V subtype routing)
      return qaEvaluate(snippet, { inputValues });
    }

    if (modality === 'audio') {
      return evaluateAudioPrompt({
        text: generatedPrompt,
        inputs: inputValues,
        snippetMeta: snippet
      });
    }

    return null;
  }, [generatedPrompt, modality, inputValues, snippet]);

  // Compute trust status
  const trustStatus = useMemo(() => {
    if (!qaResult) return null;
    return computeTrustStatus(qaResult, { isPatchedView: false });
  }, [qaResult]);

  // Build "Why this works" bullets
  const whyBullets = useMemo(() => {
    if (!qaResult) return [];
    return buildWhyThisWorks(qaResult, {
      modality,
      subtype: 'subtype' in qaResult ? (qaResult as any).subtype : undefined,
      emailType: 'emailType' in qaResult ? (qaResult as any).emailType : undefined,
      audioSubtype: 'audioSubtype' in qaResult ? (qaResult as any).audioSubtype : undefined
    });
  }, [qaResult, modality]);

  // State for "Why this works" accordion
  const [whyExpanded, setWhyExpanded] = useState(false);

  // Get assertion type badge color
  const getAssertionBadgeColor = (type: string) => {
    switch (type) {
      case 'contains':
        return 'bg-status-success/10 text-status-success border-status-success/30';
      case 'not_contains':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'regex_match':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'max_words':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-spotify-gray text-spotify-lightgray border-spotify-gray';
    }
  };

  // Branch rendering based on modality
  if (modality === 'image' || modality === 'video' || modality === 'audio') {
    // IMAGE/VIDEO/AUDIO MODALITY: Manual result capture + QA summary + structure checks
    const hasPrompt = generatedPrompt.trim().length > 0;

    return (
      <div className="space-y-4 h-[calc(100vh-16rem)] flex flex-col">
        {/* Manual Result Capture */}
        <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden p-4">
          <ManualResultPanel
            modality={modality}
            snippetId={snippet.id}
            testName={testCaseName}
          />
        </div>

        {/* Trust Status & QA Summary Panel (for image, video, or audio) */}
        {qaResult && trustStatus && (
          <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden p-4">
            {/* Trust Badge + Score */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <TrustBadge status={trustStatus} size="md" />
                <div>
                  <p className="text-sm text-spotify-lightgray">
                    {formatScoreDisplay(
                      qaResult.score,
                      modality,
                      {
                        subtype: 'subtype' in qaResult ? (qaResult as any).subtype : undefined,
                        emailType: 'emailType' in qaResult ? (qaResult as any).emailType : undefined,
                        audioSubtype: 'audioSubtype' in qaResult ? (qaResult as any).audioSubtype : undefined
                      }
                    )}
                  </p>
                  {modality === 'video' && 'subtype' in qaResult && (
                    <p className="text-xs text-spotify-lightgray/70 mt-0.5">
                      {videoSubtypeLabel(qaResult.subtype as any)}
                    </p>
                  )}
                  {modality === 'audio' && 'subtype' in qaResult && (
                    <p className="text-xs text-spotify-lightgray/70 mt-0.5">
                      {audioSubtypeLabel(qaResult.subtype as any)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Microcopy */}
            <p className="text-xs text-spotify-lightgray mb-4">
              {TRUST_STATUS_MICROCOPY[trustStatus]}
            </p>

            {/* Why This Prompt Works */}
            {whyBullets.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setWhyExpanded(!whyExpanded)}
                  className="w-full flex items-center justify-between text-left p-2 hover:bg-white/5 rounded transition-colors"
                >
                  <span className="text-sm font-medium text-white">{SECTION_HEADINGS.whyThisWorks}</span>
                  {whyExpanded ? (
                    <ChevronUp size={18} className="text-spotify-lightgray" />
                  ) : (
                    <ChevronDown size={18} className="text-spotify-lightgray" />
                  )}
                </button>
                {whyExpanded && (
                  <ul className="space-y-2 mt-2 pl-2">
                    {whyBullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-spotify-lightgray">
                        {bullet.icon === 'check' ? (
                          <Check size={14} className="text-status-success mt-0.5 flex-shrink-0" />
                        ) : (
                          <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{bullet.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Issues Summary */}
            {qaResult.issues.length > 0 && (
              <div className="space-y-2">
                {qaResult.issues.map((issue, idx) => (
                  <div key={idx} className={`p-2 rounded text-xs ${
                    issue.level === 'error'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {issue.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Structure Checks Section */}
        <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-spotify-gray dark:border-spotify-gray">
            <h3 className="text-md font-semibold text-white dark:text-white">Prompt Structure Checks</h3>
            <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
              These checks validate the generated prompt text (not the output)
            </p>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            <ActionButton
              onClick={() => handleRunChecks(generatedPrompt)}
              disabled={!hasPrompt}
              variant="run"
              className="w-full rounded-full text-sm disabled:bg-surface-2 disabled:text-muted"
            >
              Run Structure Checks
            </ActionButton>
          </div>
        </div>

        {/* Results Display (reused) */}
        {hasResults && (
          <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-spotify-gray dark:border-spotify-gray">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-white dark:text-white">Structure Check Results</h3>
                <div className="flex items-center gap-2">
                  {checksResults.failed === 0 ? (
                    <div className="flex items-center gap-1.5 text-status-success">
                      <CheckCircle size={18} />
                      <span className="font-semibold text-sm">All Passed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-500">
                      <XCircle size={18} />
                      <span className="font-semibold text-sm">{checksResults.failed} Failed</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
                {checksResults.passed}/{checksResults.total} checks passed
              </p>
            </div>

            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {checksResults.results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.passed
                      ? 'bg-status-success/10 border-status-success/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {result.passed ? (
                        <Check size={16} className="text-status-success" />
                      ) : (
                        <X size={16} className="text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${result.passed ? 'text-status-success' : 'text-red-500'}`}>
                        {result.message}
                      </div>
                      {result.assertion.description && (
                        <div className="text-xs text-spotify-lightgray mt-1">
                          {result.assertion.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // TEXT/EMAIL MODALITY: Existing behavior
  return (
    <div className="space-y-4 h-[calc(100vh-16rem)] flex flex-col">
      {/* Active Assertions Display */}
      {activeAssertions && activeAssertions.length > 0 && (
        <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-spotify-gray dark:border-spotify-gray">
            <div className="flex items-center gap-2">
              <FileCheck size={18} className="text-spotify-green" />
              <h3 className="text-md font-semibold text-white dark:text-white">
                Active Assertions ({activeAssertions.length})
              </h3>
            </div>
            <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
              Loaded from test pack
            </p>
          </div>
          <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
            {activeAssertions.map((assertion, index) => (
              <div
                key={index}
                className={`p-2 rounded border ${getAssertionBadgeColor(assertion.type)}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase">{assertion.type}</span>
                  <span className="text-xs">→</span>
                  <span className="text-xs font-mono">{String(assertion.value)}</span>
                </div>
                {assertion.description && (
                  <div className="text-xs opacity-80 mt-1">{assertion.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output Input */}
      <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-spotify-gray dark:border-spotify-gray">
          <h3 className="text-md font-semibold text-white dark:text-white">Model Output</h3>
          <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
            Paste the AI model output here to validate
          </p>
        </div>
        <div className="flex-1 p-4">
          <textarea
            value={outputText}
            onChange={(e) => onOutputTextChange(e.target.value)}
            placeholder="Paste the AI model output here..."
            className="w-full h-full bg-spotify-gray dark:bg-spotify-gray text-white dark:text-white rounded-md p-3 text-sm placeholder:text-spotify-lightgray/60 dark:placeholder:text-spotify-lightgray/60 focus:outline-none focus:ring-2 focus:ring-spotify-green dark:focus:ring-spotify-green resize-none"
          />
        </div>
      </div>

      {/* Email Preview (if email modality) */}
      {modality === 'email' && outputText && (
        <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-spotify-gray dark:border-spotify-gray">
            <h3 className="text-md font-semibold text-white dark:text-white">Email Preview</h3>
          </div>
          <div className="p-4 bg-spotify-gray/50 rounded-lg m-4">
            {outputText.toLowerCase().includes('<html') || outputText.toLowerCase().includes('<!doctype') ? (
              <pre className="text-xs text-spotify-lightgray whitespace-pre-wrap overflow-auto max-h-64">
                {outputText}
              </pre>
            ) : (
              <p className="text-sm text-white whitespace-pre-wrap">
                {outputText}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Run Checks Button */}
      <ActionButton
        onClick={() => handleRunChecks(outputText)}
        disabled={!hasOutput}
        variant="run"
        className="w-full rounded-full text-sm disabled:bg-surface-2 disabled:text-muted"
      >
        Run Checks on Output
      </ActionButton>

      {/* Patch Missing Sections Button - only show if there are patchable failures */}
      {hasPatchableFailures && hasOutput && (
        <PatchButton
          requirements={patchRequirements}
          disabled={!hasOutput}
          onPatchComplete={handlePatchComplete}
          snippetId={snippet.id}
          inputValues={inputValues}
          originalOutput={outputText}
          snippetContext={{
            title: snippet.title,
            description: snippet.description,
            category: snippet.category || undefined
          }}
        />
      )}

      {/* Results Display */}
      {hasResults && (
        <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden">
          {/* Summary Header */}
          <div className="px-4 py-3 border-b border-spotify-gray dark:border-spotify-gray">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-white dark:text-white">Validation Results</h3>
              <div className="flex items-center gap-2">
                {checksResults.failed === 0 ? (
                  <div className="flex items-center gap-1.5 text-status-success">
                    <CheckCircle size={18} />
                    <span className="font-semibold text-sm">All Passed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-500">
                    <XCircle size={18} />
                    <span className="font-semibold text-sm">
                      {checksResults.failed} Failed
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
              {checksResults.passed}/{checksResults.total} checks passed
            </p>
          </div>

          {/* Results List */}
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {checksResults.results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.passed
                    ? 'bg-status-success/10 border-status-success/30 dark:bg-status-success/10 dark:border-status-success/30'
                    : 'bg-red-500/10 border-red-500/30 dark:bg-red-500/10 dark:border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {result.passed ? (
                      <Check size={16} className="text-status-success" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        result.passed ? 'text-status-success' : 'text-red-500'
                      }`}
                    >
                      {result.message}
                    </div>
                    {result.assertion.description && (
                      <div className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
                        {result.assertion.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasResults && !hasOutput && (
        <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg p-8 text-center">
          <AlertCircle size={32} className="mx-auto text-spotify-lightgray dark:text-spotify-lightgray mb-3" />
          <p className="text-spotify-lightgray dark:text-spotify-lightgray text-sm">
            Paste model output above and click &quot;Run Checks&quot; to validate
          </p>
        </div>
      )}
    </div>
  );
}
