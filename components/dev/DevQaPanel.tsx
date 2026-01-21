'use client';

import { useMemo } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Check, X, Mail, Volume2 } from 'lucide-react';
import { Snippet } from '@/lib/types';
import { QaIssue } from '@/lib/qa/promptQa';
import { qaEvaluate, UnifiedQaResult } from '@/lib/qa/qaRouter';
import { emailTypeLabel, inferEmailType, type EmailType } from '@/lib/qa/emailType';
import { inferAudioSubtype, audioSubtypeLabel, type AudioSubtype } from '@/lib/qa/audioPromptQa';
import PatchSuggestionsPanel from '@/components/qa/PatchSuggestionsPanel';
import SectionAccordion from '@/components/ui/SectionAccordion';

interface DevQaPanelProps {
  snippet: Snippet;
  inputValues?: Record<string, string>;
}

export default function DevQaPanel({ snippet, inputValues }: DevQaPanelProps) {
  // Memoize QA result to avoid recomputation
  const qaResult: UnifiedQaResult | null = useMemo(() => {
    try {
      return qaEvaluate(snippet, { inputValues });
    } catch (error) {
      console.error('QA evaluation failed:', error);
      return null;
    }
  }, [snippet, inputValues]);

  if (!qaResult) {
    return (
      <div className="p-6">
        <div className="text-spotify-lightgray">
          Unable to evaluate QA. Please check snippet content.
        </div>
      </div>
    );
  }

  const { level, score, issues, checks } = qaResult;
  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');

  // Infer email type for email modality
  const emailType: EmailType | null = qaResult.modality === 'email' ? inferEmailType(snippet) : null;

  // Infer audio subtype for audio modality
  const audioSubtype: AudioSubtype | null = qaResult.modality === 'audio'
    ? inferAudioSubtype(snippet.template || snippet.code || '')
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header with Badge and Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {level === 'verified' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-status-success/10 border border-status-success/30 rounded-full">
              <CheckCircle size={16} className="text-status-success" />
              <span className="text-sm font-medium text-status-success">Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-sm font-medium text-yellow-500">Draft</span>
            </div>
          )}
          {/* Email type badge */}
          {emailType && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <Mail size={14} className="text-blue-400" />
              <span className="text-sm font-medium text-blue-400">{emailTypeLabel(emailType)}</span>
            </div>
          )}
          {/* Audio subtype badge */}
          {audioSubtype && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
              <Volume2 size={14} className="text-purple-400" />
              <span className="text-sm font-medium text-purple-400">{audioSubtypeLabel(audioSubtype)}</span>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-white dark:text-white">
            {score}
            <span className="text-spotify-lightgray dark:text-spotify-lightgray">/100</span>
          </div>
          <div className="text-xs text-spotify-lightgray dark:text-spotify-lightgray">
            {qaResult.modality === 'image' || qaResult.modality === 'email' || qaResult.modality === 'audio' ? 'Consistency Score' : 'Quality Score'}
          </div>
          {qaResult.modality === 'image' && (
            <div className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
              Prompt repeatability & completeness
            </div>
          )}
          {qaResult.modality === 'email' && (
            <div className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
              Structure, clarity & compliance
            </div>
          )}
          {qaResult.modality === 'audio' && (
            <div className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
              Timing, style & structure clarity
            </div>
          )}
        </div>
      </div>

      {/* Issues Section */}
      <SectionAccordion
        title="Issues"
        rightSummary={
          errors.length > 0
            ? `${errors.length} error${errors.length !== 1 ? 's' : ''}, ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`
            : warnings.length > 0
            ? `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`
            : 'No issues'
        }
        tone={errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'success'}
        icon={
          errors.length > 0 ? (
            <AlertCircle size={20} />
          ) : warnings.length > 0 ? (
            <AlertTriangle size={20} />
          ) : (
            <CheckCircle size={20} />
          )
        }
        defaultOpen={false}
      >
        {issues.length > 0 ? (
          <div className="space-y-4 pt-4">
            {/* Errors */}
            {errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-sm font-medium text-red-500">
                    {errors.length} Error{errors.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2 pl-6">
                  {errors.map((issue, index) => (
                    <IssueItem key={`error-${index}`} issue={issue} />
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-500">
                    {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2 pl-6">
                  {warnings.map((issue, index) => (
                    <IssueItem key={`warning-${index}`} issue={issue} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-status-success/10 border border-status-success/30 rounded-lg mt-4">
            <CheckCircle size={18} className="text-status-success" />
            <span className="text-sm text-status-success">All checks passed!</span>
          </div>
        )}
      </SectionAccordion>

      {/* Checks Summary */}
      <SectionAccordion
        title="Structure Checks"
        rightSummary={`${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} passed`}
        tone={Object.values(checks).every(Boolean) ? 'success' : 'warning'}
        icon={Object.values(checks).every(Boolean) ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
        defaultOpen={false}
      >
        <div className="grid grid-cols-2 gap-3 pt-4">
          {qaResult.modality === 'image' ? (
            <>
              <CheckItem label="Subject" passed={checks.hasSubject} />
              <CheckItem label="Style" passed={checks.hasStyle} />
              <CheckItem label="Composition" passed={checks.hasComposition} />
              <CheckItem label="Details" passed={checks.hasDetails} />
              <CheckItem label="Constraints" passed={checks.hasConstraints} />
              <CheckItem label="Output Settings" passed={checks.hasOutputSettings} />
            </>
          ) : qaResult.modality === 'video' ? (
            <>
              <CheckItem label="Scene" passed={checks.hasScene} />
              <CheckItem label="Subject" passed={checks.hasSubject} />
              <CheckItem label="Motion" passed={checks.hasMotion} />
              <CheckItem label="Timing" passed={checks.hasTiming} />
              <CheckItem label="Style" passed={checks.hasStyle} />
              <CheckItem label="Constraints" passed={checks.hasConstraints} />
              <CheckItem label="Output Settings" passed={checks.hasOutputSettings} />
            </>
          ) : qaResult.modality === 'email' ? (
            <>
              {/* Universal email blocks */}
              <CheckItem label="Goal" passed={checks.hasGoal} />
              <CheckItem label="Audience" passed={checks.hasAudience} />
              <CheckItem label="Tone" passed={checks.hasTone} />
              <CheckItem label="Content" passed={checks.hasContent} />
              <CheckItem label="CTA" passed={checks.hasCta} />
              <CheckItem label="Output Format" passed={checks.hasOutputFormat} />
              {/* Conditional blocks - show if relevant */}
              {checks.hasOffer !== undefined && (
                <CheckItem label="Offer" passed={checks.hasOffer} />
              )}
              {checks.hasUrgency !== undefined && (
                <CheckItem label="Urgency" passed={checks.hasUrgency} />
              )}
              {checks.hasTransactionContext !== undefined && (
                <CheckItem label="Transaction Context" passed={checks.hasTransactionContext} />
              )}
              {checks.hasNextSteps !== undefined && (
                <CheckItem label="Next Steps" passed={checks.hasNextSteps} />
              )}
              {checks.hasSequenceContext !== undefined && (
                <CheckItem label="Sequence Context" passed={checks.hasSequenceContext} />
              )}
              {checks.hasValuePromise !== undefined && (
                <CheckItem label="Value Promise" passed={checks.hasValuePromise} />
              )}
            </>
          ) : qaResult.modality === 'audio' ? (
            <>
              {/* Universal audio blocks */}
              <CheckItem label="Goal" passed={checks.hasGoal} />
              <CheckItem label="Style" passed={checks.hasStyle} />
              <CheckItem label="Timing" passed={checks.hasTiming} />
              <CheckItem label="Structure" passed={checks.hasStructure} />
              <CheckItem label="Constraints" passed={checks.hasConstraints} />
              <CheckItem label="Output Settings" passed={checks.hasOutputSettings} />
              {/* Subtype-specific blocks */}
              {checks.hasVoiceSpec !== undefined && (
                <CheckItem label="Voice Spec" passed={checks.hasVoiceSpec} />
              )}
              {checks.hasScript !== undefined && (
                <CheckItem label="Script" passed={checks.hasScript} />
              )}
              {checks.hasInstrumentation !== undefined && (
                <CheckItem label="Instrumentation" passed={checks.hasInstrumentation} />
              )}
              {checks.hasTempo !== undefined && (
                <CheckItem label="Tempo" passed={checks.hasTempo} />
              )}
            </>
          ) : (
            <>
              <CheckItem label="Objective" passed={checks.hasObjective} />
              <CheckItem label="Inputs" passed={checks.hasInputs} />
              <CheckItem label="Constraints" passed={checks.hasConstraints} />
              <CheckItem label="Output Format" passed={checks.hasOutputFormat} />
              <CheckItem label="QC" passed={checks.hasQc} />
              <CheckItem label="Uncertainty Policy" passed={checks.hasUncertaintyPolicy} />
            </>
          )}
        </div>
      </SectionAccordion>

      {/* Scoring Breakdown */}
      <div className="space-y-3 p-4 bg-spotify-gray/30 dark:bg-spotify-gray/30 rounded-lg">
        <h3 className="text-sm font-semibold text-white dark:text-white">Scoring Breakdown</h3>
        <div className="space-y-2 text-xs text-spotify-lightgray dark:text-spotify-lightgray">
          {qaResult.modality === 'image' ? (
            <>
              <div>Structural completeness (6 blocks): 40 pts</div>
              <div>Parameter explicitness (camera/lighting/color): 25 pts</div>
              <div>Style locking (medium keywords): 20 pts</div>
              <div>Constraint clarity (avoid items): 15 pts</div>
              <div className="text-red-400">Contradictions: -10 pts each (max -30)</div>
            </>
          ) : qaResult.modality === 'video' ? (
            <>
              <div>Structural completeness (7 blocks): 35 pts</div>
              <div>Motion clarity (camera/subject movement): 25 pts</div>
              <div>Timing clarity (duration/pacing/beats): 20 pts</div>
              <div>Style consistency (medium keywords): 10 pts</div>
              <div>Constraint clarity (avoid items): 10 pts</div>
              <div className="text-red-400">Contradictions: -10 pts each (max -30)</div>
              <div className="text-yellow-400">Instability warnings: -5 pts each (max -15)</div>
            </>
          ) : qaResult.modality === 'email' ? (
            <>
              <div>Structural completeness (universal + conditional): 40 pts</div>
              <div>Goal & CTA clarity: 25 pts</div>
              <div>Tone consistency: 15 pts</div>
              <div>Audience alignment: 10 pts</div>
              <div>Compliance readiness: 10 pts</div>
              <div className="text-red-400">Errors: -10 pts each (max -30)</div>
              <div className="text-yellow-400">Warnings: -5 pts each (max -15)</div>
            </>
          ) : qaResult.modality === 'audio' ? (
            <>
              <div>Structural completeness (6 universal blocks): 35 pts</div>
              <div>Timing explicitness (duration with units): 20 pts</div>
              <div>Style clarity: 20 pts</div>
              <div>Subtype blocks (voice/music specific): 15 pts</div>
              <div>Constraint clarity: 10 pts</div>
              <div className="text-red-400">Contradictions: -10 pts each (max -30)</div>
            </>
          ) : (
            <>
              <div>Structure blocks (Objective, Inputs, Constraints, Output Format): 50 pts</div>
              <div>Uncertainty policy: 15 pts</div>
              <div>Quality Check (QC): 15 pts</div>
              <div>Workflow integrity (schema/template alignment): 20 pts</div>
            </>
          )}
          <div className="pt-2 border-t border-spotify-gray dark:border-spotify-gray text-white dark:text-white">
            Verified threshold: 85/100 + no errors
          </div>
        </div>
      </div>

      {/* Patch Suggestions */}
      <div className="mt-6">
        <PatchSuggestionsPanel snippet={snippet} qaResult={qaResult} />
      </div>
    </div>
  );
}

// Issue item component
function IssueItem({ issue }: { issue: QaIssue }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-spotify-gray/20 dark:bg-spotify-gray/20 rounded border border-spotify-gray/40 dark:border-spotify-gray/40">
      <div className="flex-1">
        <div className="text-sm text-white dark:text-white">{issue.message}</div>
        <div className="text-xs text-spotify-lightgray dark:text-spotify-lightgray mt-1">
          Code: {issue.code}
        </div>
      </div>
    </div>
  );
}

// Check item component
function CheckItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border ${
        passed
          ? 'bg-status-success/10 border-status-success/30 dark:bg-status-success/10 dark:border-status-success/30'
          : 'bg-red-500/10 border-red-500/30 dark:bg-red-500/10 dark:border-red-500/30'
      }`}
    >
      {passed ? (
        <Check size={16} className="text-status-success" />
      ) : (
        <X size={16} className="text-red-500" />
      )}
      <span
        className={`text-sm ${
          passed ? 'text-status-success' : 'text-red-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
