'use client';

import { CheckCircle, FileText, TestTube } from 'lucide-react';
import { Snippet } from '@/lib/types';
import { TestResult } from '@/lib/prompttest/testResultStorage';

interface VerificationBadgeProps {
  snippet: Snippet;
  lastTestResult: TestResult | null;
}

export default function VerificationBadge({ snippet, lastTestResult }: VerificationBadgeProps) {
  // For now, show test verification status only
  // Future enhancement: integrate with QA module for combined status

  if (!lastTestResult) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-spotify-gray dark:bg-spotify-gray text-spotify-lightgray dark:text-spotify-lightgray">
        <FileText size={12} />
        <span>Draft</span>
      </div>
    );
  }

  if (lastTestResult.pass) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-status-success/10 text-status-success border border-status-success/30">
        <CheckCircle size={12} />
        <span>Test Verified</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
      <TestTube size={12} />
      <span>Tests Failing</span>
    </div>
  );
}
