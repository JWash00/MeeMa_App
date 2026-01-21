'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, ChevronDown, Download, Play, Upload, X, AlertCircle } from 'lucide-react';
import { Snippet } from '@/lib/types';
import ActionButton from '@/components/actions/ActionButton';
import { generateDefaultAssertions } from '@/lib/prompttest/defaultAssertions';
import { downloadTestPackJson } from '@/lib/prompttest/testPack';
import {
  LoadedTestPack,
  LoadedTestCase,
  loadTestPackFromFile,
  storeTestPack,
  clearStoredTestPack,
} from '@/lib/prompttest/testPackLoader';
import { getLastTestResult } from '@/lib/prompttest/testResultStorage';
import { getPatchOverride, togglePatchEnabled } from '@/lib/qa/patchStorage';
import { Modality } from '@/lib/prompttest/modality';
import VerificationBadge from './VerificationBadge';

interface ConfigurePaneProps {
  snippet: Snippet;
  inputValues: Record<string, string>;
  onInputValuesChange: (values: Record<string, string>) => void;
  generatedPrompt: string;
  onGeneratedPromptChange: (prompt: string) => void;
  testCaseName: string;
  onTestCaseNameChange: (name: string) => void;
  loadedTestPack: LoadedTestPack | null;
  onTestPackLoad: (pack: LoadedTestPack | null) => void;
  selectedTestCase: LoadedTestCase | null;
  onTestCaseSelect: (testCase: LoadedTestCase | null) => void;
  modality: Modality;
}

export default function ConfigurePane({
  snippet,
  inputValues,
  onInputValuesChange,
  generatedPrompt,
  onGeneratedPromptChange,
  testCaseName,
  onTestCaseNameChange,
  loadedTestPack,
  onTestPackLoad,
  selectedTestCase,
  onTestCaseSelect,
  modality,
}: ConfigurePaneProps) {
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isWorkflow = snippet.type === 'workflow';
  const packMatchesSnippet = loadedTestPack?.prompt_id === snippet.id;
  const lastTestResult = getLastTestResult(snippet.id);

  // Patch override support
  const patchOverride = getPatchOverride(snippet.id);
  const isPatchActive = patchOverride?.enabled || false;

  // Initialize input values from defaults
  useEffect(() => {
    if (isWorkflow && snippet.inputs_schema) {
      const defaults: Record<string, string> = {};
      Object.entries(snippet.inputs_schema).forEach(([key, field]) => {
        defaults[key] = inputValues[key] || field.default || '';
      });
      onInputValuesChange(defaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippet.id]); // Only run when snippet changes

  // Generate prompt for workflows (with patch override support)
  const handleGeneratePrompt = () => {
    // Use patched text if active, otherwise original
    const baseText = isPatchActive && patchOverride
      ? patchOverride.patched
      : (snippet.template || snippet.code || '');

    let result = baseText;
    Object.entries(inputValues).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      result = result.replaceAll(placeholder, value);
    });
    onGeneratedPromptChange(result);
  };

  // Copy prompt to clipboard (with patch override support)
  const handleCopy = async () => {
    let textToCopy: string;
    if (isWorkflow) {
      textToCopy = generatedPrompt;
    } else {
      // For non-workflows, use patched text if active
      textToCopy = isPatchActive && patchOverride
        ? patchOverride.patched
        : (snippet.code || '');
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle patch toggle
  const handlePatchToggle = (enabled: boolean) => {
    togglePatchEnabled(snippet.id, enabled);
    // Force re-render by updating a state (window will refresh on next interaction)
  };

  // Download test pack
  const handleDownloadTestPack = () => {
    const assertions = generateDefaultAssertions(snippet);
    downloadTestPackJson(snippet, testCaseName, inputValues, assertions);
  };

  // Handle test pack upload
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const result = await loadTestPackFromFile(file);

    if (result.error) {
      setUploadError(result.error);
      return;
    }

    if (result.pack) {
      onTestPackLoad(result.pack);
      storeTestPack(snippet.id, result.pack);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle clearing test pack
  const handleClearTestPack = () => {
    onTestPackLoad(null);
    onTestCaseSelect(null);
    clearStoredTestPack(snippet.id);
    setUploadError(null);
  };

  // Handle test case selection
  const handleTestCaseChange = (testCaseId: string) => {
    if (!loadedTestPack) return;

    if (!testCaseId) {
      onTestCaseSelect(null);
      return;
    }

    const testCase = loadedTestPack.test_cases.find((tc) => tc.id === testCaseId);
    if (testCase) {
      onTestCaseSelect(testCase);
    }
  };

  const inputClass =
    'w-full px-3 py-2 bg-spotify-gray dark:bg-spotify-gray text-white dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-spotify-green dark:focus:ring-spotify-green placeholder:text-spotify-lightgray/60 dark:placeholder:text-spotify-lightgray/60 text-sm';

  return (
    <div className="space-y-4 h-[calc(100vh-16rem)] overflow-y-auto pr-2">
      {/* Metadata Header */}
      <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-bold text-white dark:text-white">{snippet.title}</h2>
          <div className="flex items-center gap-2">
            <VerificationBadge snippet={snippet} lastTestResult={lastTestResult} />
            {snippet.version && (
              <span className="text-xs text-spotify-lightgray dark:text-spotify-lightgray">
                v{snippet.version}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {snippet.category && (
            <span className="text-xs px-2 py-1 bg-spotify-gray dark:bg-spotify-gray text-spotify-lightgray dark:text-spotify-lightgray rounded">
              {snippet.category}
            </span>
          )}
          <span
            className={`text-xs px-2 py-1 rounded ${
              isWorkflow
                ? 'bg-purple-500/20 text-purple-400 dark:bg-purple-500/20 dark:text-purple-400'
                : 'bg-blue-500/20 text-blue-400 dark:bg-blue-500/20 dark:text-blue-400'
            }`}
          >
            {snippet.type || 'prompt'}
          </span>
        </div>

        <p className="text-sm text-spotify-lightgray dark:text-spotify-lightgray">
          Generate a prompt and validate outputs against expected contract.
        </p>

        {/* Patch Override Toggle */}
        {patchOverride && (
          <div className="mt-3 pt-3 border-t border-spotify-gray dark:border-spotify-gray">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPatchActive}
                onChange={(e) => handlePatchToggle(e.target.checked)}
                className="w-4 h-4 rounded border-spotify-gray bg-spotify-gray text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
              />
              <span className="text-sm text-white dark:text-white">Use patched prompt (local)</span>
              {isPatchActive && (
                <span className="text-xs bg-status-success/10 text-status-success px-2 py-1 rounded flex items-center gap-1 border border-status-success/30">
                  <Check size={12} />
                  Patched
                </span>
              )}
            </label>
            <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1 ml-6">
              {patchOverride.changes.length} structural blocks added locally
            </p>
          </div>
        )}
      </div>

      {/* Input Form (Workflows Only) */}
      {isWorkflow && snippet.inputs_schema ? (
        <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg p-4">
          <h3 className="text-md font-semibold text-white dark:text-white mb-3">Configure Inputs</h3>
          <div className="space-y-3">
            {Object.entries(snippet.inputs_schema).map(([key, field]) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-spotify-lightgray dark:text-spotify-lightgray mb-1">
                  {field.label}
                </label>

                {field.type === 'text' && (
                  <input
                    id={key}
                    type="text"
                    value={inputValues[key] || ''}
                    onChange={(e) =>
                      onInputValuesChange({ ...inputValues, [key]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    id={key}
                    value={inputValues[key] || ''}
                    onChange={(e) =>
                      onInputValuesChange({ ...inputValues, [key]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                )}

                {field.type === 'select' && field.options && (
                  <div className="relative">
                    <select
                      id={key}
                      value={inputValues[key] || ''}
                      onChange={(e) =>
                        onInputValuesChange({ ...inputValues, [key]: e.target.value })
                      }
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option: string) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-lightgray dark:text-spotify-lightgray pointer-events-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Generate Button */}
          <div className="mt-4 flex gap-2">
            <ActionButton
              onClick={handleGeneratePrompt}
              variant="run"
              className="flex-1 rounded-full text-sm"
            >
              Generate Prompt
            </ActionButton>

            {/* Coming Soon Button */}
            <button
              disabled
              title="Provider execution will be added in a future version"
              className="px-4 py-2 bg-spotify-gray/50 dark:bg-spotify-gray/50 text-spotify-lightgray dark:text-spotify-lightgray rounded-full font-semibold cursor-not-allowed text-sm flex items-center gap-2"
            >
              <Play size={16} />
              Run (coming soon)
            </button>
          </div>
        </div>
      ) : null}

      {/* Modality-Specific Guidance */}
      {generatedPrompt && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
          <p className="text-sm text-blue-300 dark:text-blue-300">
            {modality === 'text'
              ? 'Generate your prompt, copy it, run it with your AI provider, then paste the output in the right panel.'
              : modality === 'image'
              ? 'Generate your prompt, copy it, run it in your image provider (e.g., Midjourney), then capture results in the right panel.'
              : modality === 'video'
              ? 'Generate your prompt, copy it, run it in your video provider (e.g., Runway), then capture results in the right panel.'
              : modality === 'email'
              ? 'Generate your email prompt, copy it, run it with your AI provider, then paste the output in the right panel.'
              : 'Generate your prompt, copy it, run it manually, then paste or capture the output in the right panel.'}
          </p>
        </div>
      )}

      {/* Generated Prompt Preview (Workflows) */}
      {isWorkflow && generatedPrompt && (
        <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-spotify-gray dark:border-spotify-gray">
            <h3 className="text-md font-semibold text-white dark:text-white">Generated Prompt</h3>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-surface-2 text-text rounded-full font-semibold hover:bg-surface-3 transition-colors flex items-center gap-2 text-sm border border-border"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-4">
            <pre className="bg-spotify-black dark:bg-spotify-black p-3 rounded text-spotify-lightgray dark:text-spotify-lightgray whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-64 overflow-y-auto">
              {generatedPrompt}
            </pre>
          </div>
        </div>
      )}

      {/* Prompt Display (Non-Workflows) */}
      {!isWorkflow && snippet.code && (
        <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-spotify-gray dark:border-spotify-gray">
            <h3 className="text-md font-semibold text-white dark:text-white">Prompt</h3>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-spotify-green text-black rounded-full font-semibold hover:bg-spotify-greenhover transition-colors flex items-center gap-2 text-sm"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-4">
            <pre className="bg-spotify-black dark:bg-spotify-black p-3 rounded text-spotify-lightgray dark:text-spotify-lightgray whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-64 overflow-y-auto">
              {snippet.code}
            </pre>
          </div>
        </div>
      )}

      {/* Test Pack Upload */}
      <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg p-4">
        <h3 className="text-md font-semibold text-white dark:text-white mb-3">Load Test Pack</h3>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!loadedTestPack ? (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              Load Test Pack JSON
            </button>
            <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-2">
              Upload a test pack JSON file to auto-fill inputs and assertions.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-status-success" />
                <span className="text-sm text-white dark:text-white">Test Pack Loaded</span>
              </div>
              <button
                onClick={handleClearTestPack}
                className="p-1 hover:bg-spotify-gray dark:hover:bg-spotify-gray rounded transition-colors"
                title="Clear test pack"
              >
                <X size={16} className="text-spotify-lightgray dark:text-spotify-lightgray" />
              </button>
            </div>
            <div className="bg-spotify-black dark:bg-spotify-black rounded p-2 text-xs">
              <div className="text-spotify-lightgray dark:text-spotify-lightgray">
                <div><span className="font-semibold">ID:</span> {loadedTestPack.prompt_id}</div>
                <div><span className="font-semibold">Version:</span> {loadedTestPack.version}</div>
                <div><span className="font-semibold">Test Cases:</span> {loadedTestPack.test_cases.length}</div>
              </div>
            </div>
          </>
        )}

        {uploadError && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 dark:bg-red-500/10 dark:border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-400">{uploadError}</div>
          </div>
        )}

        {/* Mismatch Warning */}
        {loadedTestPack && !packMatchesSnippet && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 dark:bg-yellow-500/10 dark:border-yellow-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-400">
              This test pack is for snippet &quot;{loadedTestPack.prompt_id}&quot;. Select that snippet to use it.
            </div>
          </div>
        )}

        {/* Test Case Selector */}
        {loadedTestPack && packMatchesSnippet && (
          <div className="mt-3">
            <label htmlFor="testCaseSelect" className="block text-sm font-medium text-spotify-lightgray dark:text-spotify-lightgray mb-1">
              Select Test Case
            </label>
            <div className="relative">
              <select
                id="testCaseSelect"
                value={selectedTestCase?.id || ''}
                onChange={(e) => handleTestCaseChange(e.target.value)}
                className={inputClass + ' appearance-none cursor-pointer'}
              >
                <option value="">Choose a test case...</option>
                {loadedTestPack.test_cases.map((tc) => (
                  <option key={tc.id} value={tc.id}>
                    {tc.id} {tc.description ? `- ${tc.description}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-lightgray dark:text-spotify-lightgray pointer-events-none"
              />
            </div>
            {selectedTestCase && selectedTestCase.description && (
              <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
                {selectedTestCase.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Test Case Builder */}
      <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg p-4">
        <h3 className="text-md font-semibold text-white dark:text-white mb-3">Create Test Pack</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="testCaseName" className="block text-sm font-medium text-spotify-lightgray dark:text-spotify-lightgray mb-1">
              Test Case Name
            </label>
            <input
              id="testCaseName"
              type="text"
              value={testCaseName}
              onChange={(e) => onTestCaseNameChange(e.target.value)}
              placeholder="e.g., happy_path_basic"
              className={inputClass}
            />
          </div>

          <button
            onClick={handleDownloadTestPack}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Download Test Pack JSON
          </button>

          <p className="text-xs text-spotify-lightgray dark:text-spotify-lightgray">
            Downloads a test pack with smart default assertions based on snippet content.
          </p>
        </div>
      </div>
    </div>
  );
}
