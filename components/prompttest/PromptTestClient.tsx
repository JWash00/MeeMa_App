'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Snippet } from '@/lib/types';
import { ChecksSummary, Assertion, getAssertionTarget } from '@/lib/prompttest/assertions';
import { LoadedTestPack, LoadedTestCase, getStoredTestPack } from '@/lib/prompttest/testPackLoader';
import { inferModality, modalityLabel, Modality } from '@/lib/prompttest/modality';
import SnippetSelector from './SnippetSelector';
import ConfigurePane from './ConfigurePane';
import OutputChecksPane from './OutputChecksPane';
import { PROMPT_TEST } from '@/lib/voice/voice';

interface PromptTestClientProps {
  initialSnippets: Snippet[];
}

export default function PromptTestClient({ initialSnippets }: PromptTestClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get selected snippet from URL or default to first
  const snippetIdFromUrl = searchParams.get('snippet');
  const initialSnippet = snippetIdFromUrl
    ? initialSnippets.find((s) => s.id === snippetIdFromUrl) || initialSnippets[0]
    : initialSnippets[0];

  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(initialSnippet || null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [checksResults, setChecksResults] = useState<ChecksSummary | null>(null);
  const [testCaseName, setTestCaseName] = useState<string>('happy_path_basic');
  const [loadedTestPack, setLoadedTestPack] = useState<LoadedTestPack | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<LoadedTestCase | null>(null);
  const [activeAssertions, setActiveAssertions] = useState<Assertion[] | null>(null);

  // Update URL when snippet changes
  useEffect(() => {
    if (selectedSnippet) {
      router.push(`/prompttest?snippet=${selectedSnippet.id}`);
    }
  }, [selectedSnippet, router]);

  // Load stored test pack when snippet changes
  useEffect(() => {
    if (!selectedSnippet) return;

    const storedPack = getStoredTestPack(selectedSnippet.id);
    setLoadedTestPack(storedPack);

    // Auto-select first test case if pack matches
    if (storedPack && storedPack.prompt_id === selectedSnippet.id && storedPack.test_cases.length > 0) {
      handleTestCaseSelect(storedPack.test_cases[0]);
    } else {
      setSelectedTestCase(null);
      setActiveAssertions(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSnippet]);

  // Load persisted state from localStorage
  useEffect(() => {
    if (!selectedSnippet) return;

    const storageKey = `prompttest_state_${selectedSnippet.id}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const state = JSON.parse(saved);
        setOutputText(state.outputText || '');
        setTestCaseName(state.testCaseName || 'happy_path_basic');
        if (state.inputValues) {
          setInputValues(state.inputValues);
        }
      }
    } catch (error) {
      console.error('Failed to load saved state:', error);
    }
  }, [selectedSnippet]);

  // Save state to localStorage
  useEffect(() => {
    if (!selectedSnippet) return;

    const storageKey = `prompttest_state_${selectedSnippet.id}`;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          outputText,
          testCaseName,
          inputValues,
        })
      );
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, [selectedSnippet, outputText, testCaseName, inputValues]);

  // Handle test case selection
  const handleTestCaseSelect = (testCase: LoadedTestCase | null) => {
    setSelectedTestCase(testCase);

    if (testCase) {
      // Auto-fill inputs
      setInputValues(testCase.inputs);

      // Convert assertions from "kind" to "type" for compatibility
      const assertions: Assertion[] = testCase.assertions.map((a) => ({
        type: a.kind,
        value: a.value,
        description: a.description,
      }));
      setActiveAssertions(assertions);

      // Auto-fill test case name
      setTestCaseName(testCase.id);
    } else {
      setActiveAssertions(null);
    }
  };

  const handleSnippetSelect = (snippet: Snippet) => {
    setSelectedSnippet(snippet);
    setInputValues({});
    setGeneratedPrompt('');
    setOutputText('');
    setChecksResults(null);
    setTestCaseName('happy_path_basic');
    setLoadedTestPack(null);
    setSelectedTestCase(null);
    setActiveAssertions(null);
  };

  // Determine modality and assertion target
  const modality: Modality = selectedSnippet ? inferModality(selectedSnippet) : 'text';
  const assertionTarget = getAssertionTarget(modality);

  return (
    <div className="min-h-screen bg-spotify-black dark:bg-spotify-black">
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white dark:text-white">{PROMPT_TEST.pageTitle}</h1>
            {selectedSnippet && (
              <span className="px-3 py-1 bg-spotify-gray dark:bg-spotify-gray rounded-full text-spotify-lightgray dark:text-spotify-lightgray text-sm">
                {PROMPT_TEST.modality(modalityLabel(modality))}
              </span>
            )}
          </div>
          <p className="text-spotify-lightgray dark:text-spotify-lightgray">
            {PROMPT_TEST.pageSubtitle}
          </p>
        </div>

        {/* 3-Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Pane: Snippet Selector */}
          <div className="lg:col-span-1">
            <SnippetSelector
              snippets={initialSnippets}
              selectedSnippet={selectedSnippet}
              onSelect={handleSnippetSelect}
            />
          </div>

          {/* Center Pane: Configure & Generate */}
          <div className="lg:col-span-1">
            {selectedSnippet ? (
              <ConfigurePane
                snippet={selectedSnippet}
                inputValues={inputValues}
                onInputValuesChange={setInputValues}
                generatedPrompt={generatedPrompt}
                onGeneratedPromptChange={setGeneratedPrompt}
                testCaseName={testCaseName}
                onTestCaseNameChange={setTestCaseName}
                loadedTestPack={loadedTestPack}
                onTestPackLoad={setLoadedTestPack}
                selectedTestCase={selectedTestCase}
                onTestCaseSelect={handleTestCaseSelect}
                modality={modality}
              />
            ) : (
              <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg p-8 text-center">
                <p className="text-spotify-lightgray dark:text-spotify-lightgray">
                  Select a snippet to get started
                </p>
              </div>
            )}
          </div>

          {/* Right Pane: Output & Checks */}
          <div className="lg:col-span-1">
            {selectedSnippet ? (
              <OutputChecksPane
                snippet={selectedSnippet}
                inputValues={inputValues}
                outputText={outputText}
                onOutputTextChange={setOutputText}
                generatedPrompt={generatedPrompt}
                checksResults={checksResults}
                onChecksResultsChange={setChecksResults}
                activeAssertions={activeAssertions}
                testCaseName={testCaseName}
                modality={modality}
                assertionTarget={assertionTarget}
              />
            ) : (
              <div className="bg-spotify-darkgray dark:bg-spotify-darkgray rounded-lg p-8 text-center">
                <p className="text-spotify-lightgray dark:text-spotify-lightgray">
                  Output validation will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
