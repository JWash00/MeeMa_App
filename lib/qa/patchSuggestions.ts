// Patch Suggestions v0.1 - Auto-generate missing structural blocks
// Detects missing QA blocks and generates comprehensive patches

import { extractPlaceholders, getSchemaKeys } from './promptQa';
import { detectImageBlocks, evaluateImagePrompt, type ImageQaChecks } from './imagePromptQa';
import { detectVideoBlocks, evaluateVideoPrompt } from './videoPromptQa';
import { detectEmailBlocks, evaluateEmailPrompt, type EmailQaChecks } from './emailPromptQa';
import { inferEmailType, getTypeGroup, EMAIL_TYPE_GROUPS, type EmailType } from './emailType';
import { detectAudioBlocks, evaluateAudioPrompt, inferAudioSubtype, type AudioSubtype } from './audioPromptQa';
import type { Modality } from '@/lib/prompttest/modality';
import type { Snippet } from '@/lib/types';

export interface PatchChange {
  code: string;           // e.g., 'ADDED_OBJECTIVE', 'ADDED_INPUTS'
  title: string;          // e.g., 'Added OBJECTIVE block'
  description: string;    // Detailed explanation
}

export interface PatchResult {
  original: string;
  patched: string;
  changes: PatchChange[];
  issuesAddressed: string[];  // QA issue codes fixed
  qaScoreBefore: number;
  qaScoreAfter: number;
}

export interface PatchOptions {
  type: 'prompt' | 'workflow';
  modality?: Modality;
  inputsSchemaKeys?: string[];
  title?: string;
  category?: string;
  placeholders?: string[];
  snippet?: Snippet;  // For email type inference
}

/**
 * Detect presence of structural blocks in text
 * Reuses patterns from qaScanText() in promptQa.ts
 */
export function detectBlocks(text: string): Record<string, boolean> {
  const checks = {
    hasObjective: false,
    hasInputs: false,
    hasConstraints: false,
    hasOutputFormat: false,
    hasQc: false,
    hasUncertaintyPolicy: false,
  };

  // Check for OBJECTIVE or TASK
  if (/(^|\n)##?\s*(objective|task)[\s:]/im.test(text) || /\*\*(objective|task)\*\*/i.test(text)) {
    checks.hasObjective = true;
  }

  // Check for INPUT or INPUTS
  if (/(^|\n)##?\s*(inputs?|user inputs?)[\s:]/im.test(text) || /\*\*(inputs?|user inputs?)\*\*/i.test(text)) {
    checks.hasInputs = true;
  }

  // Check for CONSTRAINTS
  if (/(^|\n)##?\s*constraints[\s:]/im.test(text) || /\*\*constraints\*\*/i.test(text)) {
    checks.hasConstraints = true;
  }

  // Check for OUTPUT FORMAT
  if (/(^|\n)##?\s*output\s+format[\s:]/im.test(text) || /\*\*output\s+format\*\*/i.test(text)) {
    checks.hasOutputFormat = true;
  }

  // Check for QC / QUALITY CHECK
  if (
    /(^|\n)##?\s*(qc|quality\s+checks?|quality\s+assurance)[\s:]/im.test(text) ||
    /\*\*(qc|quality\s+checks?|quality\s+assurance)\*\*/i.test(text)
  ) {
    checks.hasQc = true;
  }

  // Check for UNCERTAINTY POLICY (flexible patterns)
  const uncertaintyPatterns = [
    /(^|\n)##?\s*uncertainty\s+policy[\s:]/i,
    /\*\*uncertainty\s+policy\*\*/i,
    /do not guess/i,
    /if uncertain/i,
    /when uncertain/i,
    /ask up to/i,
    /label as unverified/i,
    /mark as unverified/i,
  ];

  if (uncertaintyPatterns.some(pattern => pattern.test(text))) {
    checks.hasUncertaintyPolicy = true;
  }

  return checks;
}

/**
 * Generate ROLE block (optional, added if missing OBJECTIVE)
 */
function generateRoleBlock(opts: PatchOptions): string {
  const category = opts.category || 'prompt engineering';
  return `# ROLE\nYou are an AI assistant specialized in ${category}.`;
}

/**
 * Generate OBJECTIVE/TASK block
 */
function generateObjectiveBlock(opts: PatchOptions): string {
  const title = opts.title || 'Complete the task as specified';
  return `# OBJECTIVE\n${title}`;
}

/**
 * Generate INPUTS block based on placeholders and schema keys
 */
function generateInputsBlock(opts: PatchOptions): string {
  const placeholders = opts.placeholders || [];
  const schemaKeys = opts.inputsSchemaKeys || [];

  // Combine unique keys
  const allKeys = Array.from(new Set([...placeholders, ...schemaKeys]));

  if (allKeys.length === 0) {
    return `# INPUTS\nThe following inputs will be provided:\n- (No structured inputs detected)`;
  }

  const inputsList = allKeys.map(key => `- {{${key}}}: Description of ${key}`).join('\n');
  return `# INPUTS\nThe following inputs will be provided:\n${inputsList}`;
}

/**
 * Generate CONSTRAINTS block with universal rules
 */
function generateConstraintsBlock(): string {
  return `# CONSTRAINTS
- Follow the OUTPUT FORMAT exactly as specified
- Do not invent facts or make assumptions beyond the inputs provided
- If key information is missing, refer to the UNCERTAINTY POLICY
- Keep tone consistent and appropriate for the audience
- Be specific and actionable; avoid filler or vague statements
- Maintain clarity and structure throughout`;
}

/**
 * Generate OUTPUT FORMAT block
 * Provides sectioned template for creator workflows or generic structure
 */
function generateOutputFormatBlock(opts: PatchOptions): string {
  const category = (opts.category || '').toLowerCase();
  const isCreatorWorkflow = category.includes('youtube') || category.includes('content') || category.includes('video') || category.includes('script');

  if (isCreatorWorkflow && opts.type === 'workflow') {
    return `# OUTPUT FORMAT
Return your response with these sections:
1. TITLE/HOOK: [Opening statement or title]
2. MAIN CONTENT: [Core content structured for the platform]
3. CALL TO ACTION: [Closing statement or engagement prompt]`;
  }

  return `# OUTPUT FORMAT
Structure your output with:
1. Summary: [Brief overview of the response]
2. Steps/Details: [Main content with specific steps or details]
3. Examples: [Concrete examples if applicable]
4. Final Output: [The final deliverable or conclusion]`;
}

/**
 * Generate QC/QUALITY CHECK block
 */
function generateQcBlock(): string {
  return `# QUALITY CHECK
Before finalizing, verify:
- Output format matches the specified structure
- All constraints have been followed
- Response is complete and addresses all inputs
- No facts or details have been invented
- Tone and style are appropriate`;
}

/**
 * Generate UNCERTAINTY POLICY block
 */
function generateUncertaintyPolicyBlock(): string {
  return `# UNCERTAINTY POLICY
If key information is missing or unclear:
- Ask up to 3 clarifying questions before proceeding
- If questions go unanswered, proceed with clearly labeled assumptions
- Include an "Assumptions" section listing any assumptions made
- Do not present assumptions as facts`;
}

/**
 * Generate patch for image prompts - scaffolds missing image blocks
 */
function generateImagePatch(text: string, opts: PatchOptions): PatchResult {
  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      original: text,
      patched: text,
      changes: [],
      issuesAddressed: [],
      qaScoreBefore: 0,
      qaScoreAfter: 0,
    };
  }

  // Detect existing blocks
  const blocks = detectImageBlocks(text);
  const changes: PatchChange[] = [];
  const issuesAddressed: string[] = [];

  // If all blocks present, no patch needed
  if (Object.values(blocks).every(v => v)) {
    return {
      original: text,
      patched: text,
      changes: [],
      issuesAddressed: [],
      qaScoreBefore: 100,
      qaScoreAfter: 100,
    };
  }

  let patched = text.trim();

  // Add missing SUBJECT block
  if (!blocks.hasSubject) {
    const subjectBlock = `

## SUBJECT
[Describe the main subject or focal point of the image]
`;
    patched += subjectBlock;
    changes.push({
      code: 'ADDED_SUBJECT',
      title: 'Added SUBJECT block',
      description: 'Defines what the image should generate'
    });
    issuesAddressed.push('MISSING_SUBJECT');
  }

  // Add missing STYLE block
  if (!blocks.hasStyle) {
    const styleBlock = `

## STYLE
[Specify visual style: photorealistic, cinematic, watercolor, 3D render, etc.]
`;
    patched += styleBlock;
    changes.push({
      code: 'ADDED_STYLE',
      title: 'Added STYLE block',
      description: 'Locks the visual medium and aesthetic'
    });
    issuesAddressed.push('MISSING_STYLE');
  }

  // Add missing COMPOSITION block
  if (!blocks.hasComposition) {
    const compositionBlock = `

## COMPOSITION
[Describe framing, camera angle, perspective: close-up, wide shot, top-down, etc.]
`;
    patched += compositionBlock;
    changes.push({
      code: 'ADDED_COMPOSITION',
      title: 'Added COMPOSITION block',
      description: 'Controls layout and framing'
    });
    issuesAddressed.push('MISSING_COMPOSITION');
  }

  // Add missing DETAILS block
  if (!blocks.hasDetails) {
    const detailsBlock = `

## DETAILS
[Specific elements, textures, lighting: soft light, rim light, golden hour, etc.]
`;
    patched += detailsBlock;
    changes.push({
      code: 'ADDED_DETAILS',
      title: 'Added DETAILS block',
      description: 'Refines specific visual elements'
    });
    issuesAddressed.push('MISSING_DETAILS');
  }

  // Add missing CONSTRAINTS block
  if (!blocks.hasConstraints) {
    const constraintsBlock = `

## CONSTRAINTS
- No watermarks
- No text overlays
- Avoid [specify unwanted elements]
`;
    patched += constraintsBlock;
    changes.push({
      code: 'ADDED_CONSTRAINTS',
      title: 'Added CONSTRAINTS block',
      description: 'Specifies what to avoid in generation'
    });
    issuesAddressed.push('MISSING_CONSTRAINTS');
  }

  // Add missing OUTPUT SETTINGS block
  if (!blocks.hasOutputSettings) {
    const settingsBlock = `

## OUTPUT SETTINGS
- Aspect ratio: --ar 16:9
- Resolution: 1024x1024
- [Add other technical parameters]
`;
    patched += settingsBlock;
    changes.push({
      code: 'ADDED_OUTPUT_SETTINGS',
      title: 'Added OUTPUT SETTINGS block',
      description: 'Defines technical generation parameters'
    });
    issuesAddressed.push('MISSING_OUTPUT_SETTINGS');
  }

  // Calculate QA scores using image QA evaluator
  const qaScoreBefore = evaluateImagePrompt({ text }).score;
  const qaScoreAfter = evaluateImagePrompt({ text: patched }).score;

  return {
    original: text,
    patched,
    changes,
    issuesAddressed,
    qaScoreBefore,
    qaScoreAfter,
  };
}

/**
 * Generate patch for video prompts - scaffolds missing video blocks
 */
function generateVideoPatch(text: string, opts: PatchOptions): PatchResult {
  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      original: text,
      patched: text,
      changes: [],
      issuesAddressed: [],
      qaScoreBefore: 0,
      qaScoreAfter: 0,
    };
  }

  // Detect existing blocks
  const blocks = detectVideoBlocks(text);
  const changes: PatchChange[] = [];
  const issuesAddressed: string[] = [];

  // If all blocks present, no patch needed
  if (Object.values(blocks).every(v => v)) {
    return {
      original: text,
      patched: text,
      changes: [],
      issuesAddressed: [],
      qaScoreBefore: 100,
      qaScoreAfter: 100,
    };
  }

  let patched = text.trim();

  // Add missing SCENE block
  if (!blocks.hasScene) {
    const sceneBlock = `

## SCENE
[Describe what happens in the video - setting, action, narrative]
`;
    patched += sceneBlock;
    changes.push({
      code: 'ADDED_SCENE',
      title: 'Added SCENE block',
      description: 'Defines the video content and narrative'
    });
    issuesAddressed.push('MISSING_SCENE');
  }

  // Add missing SUBJECT block
  if (!blocks.hasSubject) {
    const subjectBlock = `

## SUBJECT
[Main subject or character - appearance, role, actions]
`;
    patched += subjectBlock;
    changes.push({
      code: 'ADDED_SUBJECT',
      title: 'Added SUBJECT block',
      description: 'Defines the main subject/character'
    });
    issuesAddressed.push('MISSING_SUBJECT');
  }

  // Add missing MOTION block
  if (!blocks.hasMotion) {
    const motionBlock = `

## MOTION
[Camera movement: pan/tilt/dolly/zoom/tracking/static]
[Subject movement: walking/running/turning/gesturing]
`;
    patched += motionBlock;
    changes.push({
      code: 'ADDED_MOTION',
      title: 'Added MOTION block',
      description: 'Specifies camera and subject movement'
    });
    issuesAddressed.push('MISSING_MOTION');
  }

  // Add missing TIMING block
  if (!blocks.hasTiming) {
    const timingBlock = `

## TIMING
[Duration: 5 seconds, 10s, etc.]
[Pacing: slow, smooth, real-time, fast]
[Beats: intro/middle/outro, 3-beat structure]
`;
    patched += timingBlock;
    changes.push({
      code: 'ADDED_TIMING',
      title: 'Added TIMING block',
      description: 'Defines duration and pacing'
    });
    issuesAddressed.push('MISSING_TIMING');
  }

  // Add missing STYLE block
  if (!blocks.hasStyle) {
    const styleBlock = `

## STYLE
[Visual aesthetic: cinematic, documentary, handheld realism, time-lapse, etc.]
`;
    patched += styleBlock;
    changes.push({
      code: 'ADDED_STYLE',
      title: 'Added STYLE block',
      description: 'Defines visual aesthetic and mood'
    });
    issuesAddressed.push('MISSING_STYLE');
  }

  // Add missing CONSTRAINTS block
  if (!blocks.hasConstraints) {
    const constraintsBlock = `

## CONSTRAINTS
- No jump cuts
- Avoid shaky footage
- No artificial transitions
- [Specify other unwanted elements]
`;
    patched += constraintsBlock;
    changes.push({
      code: 'ADDED_CONSTRAINTS',
      title: 'Added CONSTRAINTS block',
      description: 'Specifies what to avoid in generation'
    });
    issuesAddressed.push('MISSING_CONSTRAINTS');
  }

  // Add missing OUTPUT SETTINGS block
  if (!blocks.hasOutputSettings) {
    const settingsBlock = `

## OUTPUT SETTINGS
- Aspect ratio: 16:9
- Resolution: 1080p or 4K
- FPS: 24fps or 30fps
- Duration: [specify in seconds]
`;
    patched += settingsBlock;
    changes.push({
      code: 'ADDED_OUTPUT_SETTINGS',
      title: 'Added OUTPUT SETTINGS block',
      description: 'Defines technical generation parameters'
    });
    issuesAddressed.push('MISSING_OUTPUT_SETTINGS');
  }

  // Calculate QA scores using video QA evaluator
  const qaScoreBefore = evaluateVideoPrompt({ text }).score;
  const qaScoreAfter = evaluateVideoPrompt({ text: patched }).score;

  return {
    original: text,
    patched,
    changes,
    issuesAddressed,
    qaScoreBefore,
    qaScoreAfter,
  };
}

/**
 * Generate patch for email prompts - scaffolds missing email blocks
 */
function generateEmailPatch(text: string, opts: PatchOptions): PatchResult {
  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      original: text,
      patched: text,
      changes: [],
      issuesAddressed: [],
      qaScoreBefore: 0,
      qaScoreAfter: 0,
    };
  }

  // Detect existing blocks
  const blocks = detectEmailBlocks(text);
  const changes: PatchChange[] = [];
  const issuesAddressed: string[] = [];

  // Infer email type from snippet metadata or category/title
  const emailType: EmailType = opts.snippet
    ? inferEmailType(opts.snippet)
    : 'generic';
  const typeGroup = getTypeGroup(emailType);

  let patched = text.trim();

  // Add missing universal blocks
  if (!blocks.hasGoal) {
    patched += `

## GOAL
[Define the primary purpose of this email - what action or response do you want from the recipient?]
`;
    changes.push({
      code: 'ADDED_GOAL',
      title: 'Added GOAL block',
      description: 'Defines what this email aims to achieve'
    });
    issuesAddressed.push('MISSING_GOAL');
  }

  if (!blocks.hasAudience) {
    patched += `

## AUDIENCE
[Define the target recipient - their relationship to the brand, interests, and stage in customer journey]
`;
    changes.push({
      code: 'ADDED_AUDIENCE',
      title: 'Added AUDIENCE block',
      description: 'Defines the target recipient'
    });
    issuesAddressed.push('MISSING_AUDIENCE');
  }

  if (!blocks.hasTone) {
    patched += `

## TONE
[Specify the communication style - e.g., friendly, professional, urgent, casual, inspirational]
`;
    changes.push({
      code: 'ADDED_TONE',
      title: 'Added TONE block',
      description: 'Defines the communication style'
    });
    issuesAddressed.push('MISSING_TONE');
  }

  if (!blocks.hasContent) {
    patched += `

## CONTENT
[Outline the main message structure - key points, value proposition, supporting details]
`;
    changes.push({
      code: 'ADDED_CONTENT',
      title: 'Added CONTENT block',
      description: 'Defines the main message structure'
    });
    issuesAddressed.push('MISSING_CONTENT');
  }

  if (!blocks.hasCta) {
    patched += `

## CTA
[Define the primary call-to-action - one clear action you want the recipient to take]
`;
    changes.push({
      code: 'ADDED_CTA',
      title: 'Added CTA block',
      description: 'Defines the call-to-action'
    });
    issuesAddressed.push('MISSING_CTA');
  }

  if (!blocks.hasOutputFormat) {
    patched += `

## OUTPUT FORMAT
[Specify the expected email structure - subject line, preheader, body sections, footer elements]
`;
    changes.push({
      code: 'ADDED_OUTPUT_FORMAT',
      title: 'Added OUTPUT FORMAT block',
      description: 'Defines the expected email structure'
    });
    issuesAddressed.push('MISSING_OUTPUT_FORMAT');
  }

  // Add conditional blocks based on email type group
  if (typeGroup === 'promotional') {
    if (!blocks.hasOffer) {
      patched += `

## OFFER
[Describe the promotion or deal - discount amount, product details, bundle offer]
`;
      changes.push({
        code: 'ADDED_OFFER',
        title: 'Added OFFER block',
        description: 'Required for promotional emails - defines the deal'
      });
      issuesAddressed.push('MISSING_OFFER');
    }

    if (!blocks.hasUrgency) {
      patched += `

## URGENCY
[Specify timing and scarcity - deadline, limited quantities, expiration date]
`;
      changes.push({
        code: 'ADDED_URGENCY',
        title: 'Added URGENCY block',
        description: 'Required for promotional emails - creates time pressure'
      });
      issuesAddressed.push('MISSING_URGENCY');
    }
  }

  if (typeGroup === 'transactional') {
    if (!blocks.hasTransactionContext) {
      patched += `

## TRANSACTION CONTEXT
[Provide order/transaction details - order number, items, amounts, shipping info]
`;
      changes.push({
        code: 'ADDED_TRANSACTION_CONTEXT',
        title: 'Added TRANSACTION CONTEXT block',
        description: 'Required for transactional emails - provides order details'
      });
      issuesAddressed.push('MISSING_TRANSACTION_CONTEXT');
    }

    if (!blocks.hasNextSteps) {
      patched += `

## NEXT STEPS
[Explain what happens next - delivery timeline, tracking info, action required]
`;
      changes.push({
        code: 'ADDED_NEXT_STEPS',
        title: 'Added NEXT STEPS block',
        description: 'Required for transactional emails - guides recipient actions'
      });
      issuesAddressed.push('MISSING_NEXT_STEPS');
    }
  }

  if (typeGroup === 'sequence') {
    if (!blocks.hasSequenceContext) {
      patched += `

## SEQUENCE CONTEXT
[Specify email position in series - Email # of #, what was covered before, what comes next]
`;
      changes.push({
        code: 'ADDED_SEQUENCE_CONTEXT',
        title: 'Added SEQUENCE CONTEXT block',
        description: 'Required for sequence emails - provides series context'
      });
      issuesAddressed.push('MISSING_SEQUENCE_CONTEXT');
    }
  }

  if (typeGroup === 'content') {
    if (!blocks.hasValuePromise) {
      patched += `

## VALUE PROMISE
[Explain why the recipient should read - what they'll learn, gain, or discover]
`;
      changes.push({
        code: 'ADDED_VALUE_PROMISE',
        title: 'Added VALUE PROMISE block',
        description: 'Recommended for content emails - explains the benefit'
      });
      issuesAddressed.push('MISSING_VALUE_PROMISE');
    }
  }

  // Calculate QA scores using email QA evaluator
  const qaScoreBefore = evaluateEmailPrompt({ text, snippetMeta: opts.snippet }).score;
  const qaScoreAfter = evaluateEmailPrompt({ text: patched, snippetMeta: opts.snippet }).score;

  return {
    original: text,
    patched,
    changes,
    issuesAddressed,
    qaScoreBefore,
    qaScoreAfter,
  };
}

/**
 * Generate patch for audio prompts - scaffolds missing audio blocks
 */
function generateAudioPatch(text: string, opts: PatchOptions): PatchResult {
  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      original: text,
      patched: text,
      changes: [],
      issuesAddressed: [],
      qaScoreBefore: 0,
      qaScoreAfter: 0,
    };
  }

  // Detect existing blocks
  const blocks = detectAudioBlocks(text);
  const subtype = inferAudioSubtype(text);
  const changes: PatchChange[] = [];
  const issuesAddressed: string[] = [];

  let patched = text.trim();

  // Add missing GOAL block
  if (!blocks.hasGoal) {
    patched += `

## GOAL
[What this audio should achieve - purpose, intended effect on listener]
`;
    changes.push({
      code: 'ADDED_GOAL',
      title: 'Added GOAL block',
      description: 'Defines the purpose of this audio'
    });
    issuesAddressed.push('MISSING_GOAL');
  }

  // Add missing STYLE block
  if (!blocks.hasStyle) {
    patched += `

## STYLE
[Mood and aesthetic - e.g., warm, bright, dark, ambient, energetic, cinematic]
`;
    changes.push({
      code: 'ADDED_STYLE',
      title: 'Added STYLE block',
      description: 'Defines the mood and aesthetic'
    });
    issuesAddressed.push('MISSING_STYLE');
  }

  // Add missing TIMING block
  if (!blocks.hasTiming) {
    patched += `

## TIMING
[Duration: e.g., 30 seconds, 2 minutes]
`;
    changes.push({
      code: 'ADDED_TIMING',
      title: 'Added TIMING block',
      description: 'Specifies explicit duration with units'
    });
    issuesAddressed.push('MISSING_TIMING');
  }

  // Add missing STRUCTURE block
  if (!blocks.hasStructure) {
    patched += `

## STRUCTURE
[Format and arrangement - e.g., intro/main/outro, verse/chorus, continuous flow]
`;
    changes.push({
      code: 'ADDED_STRUCTURE',
      title: 'Added STRUCTURE block',
      description: 'Defines format and arrangement'
    });
    issuesAddressed.push('MISSING_STRUCTURE');
  }

  // Add missing CONSTRAINTS block
  if (!blocks.hasConstraints) {
    patched += `

## CONSTRAINTS
- Avoid [specify unwanted elements]
- No [specify restrictions]
`;
    changes.push({
      code: 'ADDED_CONSTRAINTS',
      title: 'Added CONSTRAINTS block',
      description: 'Specifies what to avoid'
    });
    issuesAddressed.push('MISSING_CONSTRAINTS');
  }

  // Add missing OUTPUT SETTINGS block
  if (!blocks.hasOutputSettings) {
    patched += `

## OUTPUT SETTINGS
[Format: MP3, WAV, etc.]
[Quality: bit rate, sample rate]
`;
    changes.push({
      code: 'ADDED_OUTPUT_SETTINGS',
      title: 'Added OUTPUT SETTINGS block',
      description: 'Defines technical output specs'
    });
    issuesAddressed.push('MISSING_OUTPUT_SETTINGS');
  }

  // Add subtype-specific blocks for voice
  if (subtype === 'voice') {
    if (!blocks.hasVoiceSpec) {
      patched += `

## VOICE SPEC
[Voice characteristics - gender, age, accent, tone quality]
`;
      changes.push({
        code: 'ADDED_VOICE_SPEC',
        title: 'Added VOICE SPEC block',
        description: 'Defines voice characteristics for voice audio'
      });
      issuesAddressed.push('MISSING_VOICE_SPEC');
    }

    if (!blocks.hasScript) {
      patched += `

## SCRIPT
[Dialogue or narration text to be spoken]
`;
      changes.push({
        code: 'ADDED_SCRIPT',
        title: 'Added SCRIPT block',
        description: 'Provides the text to be spoken'
      });
      issuesAddressed.push('MISSING_SCRIPT');
    }
  }

  // Add subtype-specific blocks for music
  if (subtype === 'music') {
    if (!blocks.hasInstrumentation) {
      patched += `

## INSTRUMENTATION
[Instruments and sounds - piano, guitar, synth, drums, etc.]
`;
      changes.push({
        code: 'ADDED_INSTRUMENTATION',
        title: 'Added INSTRUMENTATION block',
        description: 'Defines instruments and sounds for music'
      });
      issuesAddressed.push('MISSING_INSTRUMENTATION');
    }

    if (!blocks.hasTempo) {
      patched += `

## TEMPO
[BPM and rhythm - e.g., 120 BPM, upbeat, slow]
`;
      changes.push({
        code: 'ADDED_TEMPO',
        title: 'Added TEMPO block',
        description: 'Specifies tempo and rhythm for music'
      });
      issuesAddressed.push('MISSING_TEMPO');
    }
  }

  // Calculate QA scores using audio QA evaluator
  const qaScoreBefore = evaluateAudioPrompt({ text }).score;
  const qaScoreAfter = evaluateAudioPrompt({ text: patched }).score;

  return {
    original: text,
    patched,
    changes,
    issuesAddressed,
    qaScoreBefore,
    qaScoreAfter,
  };
}

/**
 * Main patch generator - comprehensive approach to add all missing blocks
 */
export function generatePatch(text: string, opts: PatchOptions): PatchResult {
  // Route to image patch generator if image modality
  if (opts.modality === 'image') {
    return generateImagePatch(text, opts);
  }

  // Route to video patch generator if video modality
  if (opts.modality === 'video') {
    return generateVideoPatch(text, opts);
  }

  // Route to email patch generator if email modality
  if (opts.modality === 'email') {
    return generateEmailPatch(text, opts);
  }

  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      original: text,
      patched: text,
      changes: [],
      issuesAddressed: [],
      qaScoreBefore: 0,
      qaScoreAfter: 0,
    };
  }

  // Detect existing blocks
  const blocks = detectBlocks(text);
  const changes: PatchChange[] = [];
  const issuesAddressed: string[] = [];

  // If all blocks present, no patch needed
  if (Object.values(blocks).every(v => v)) {
    return {
      original: text,
      patched: text,
      changes: [],
      issuesAddressed: [],
      qaScoreBefore: 100,
      qaScoreAfter: 100,
    };
  }

  // Extract placeholders for INPUTS block
  const placeholders = extractPlaceholders(text);
  const patchOpts = {
    ...opts,
    placeholders,
  };

  // Build header blocks (to be prepended)
  const headerBlocks: string[] = [];

  // Add ROLE if missing OBJECTIVE (optional, helps context)
  if (!blocks.hasObjective) {
    headerBlocks.push(generateRoleBlock(patchOpts));
    changes.push({
      code: 'ADDED_ROLE',
      title: 'Added ROLE block',
      description: 'Provides context about the AI assistant\'s specialization',
    });
  }

  // Add OBJECTIVE if missing
  if (!blocks.hasObjective) {
    headerBlocks.push(generateObjectiveBlock(patchOpts));
    changes.push({
      code: 'ADDED_OBJECTIVE',
      title: 'Added OBJECTIVE block',
      description: 'Defines the primary task or goal of the prompt',
    });
    issuesAddressed.push('MISSING_OBJECTIVE');
  }

  // Add INPUTS if missing
  if (!blocks.hasInputs) {
    headerBlocks.push(generateInputsBlock(patchOpts));
    changes.push({
      code: 'ADDED_INPUTS',
      title: 'Added INPUTS block',
      description: 'Lists expected input parameters and their purposes',
    });
    issuesAddressed.push('MISSING_INPUTS');
  }

  // Add CONSTRAINTS if missing
  if (!blocks.hasConstraints) {
    headerBlocks.push(generateConstraintsBlock());
    changes.push({
      code: 'ADDED_CONSTRAINTS',
      title: 'Added CONSTRAINTS block',
      description: 'Defines boundaries and rules for the AI response',
    });
    issuesAddressed.push('MISSING_CONSTRAINTS');
  }

  // Add OUTPUT FORMAT if missing
  if (!blocks.hasOutputFormat) {
    headerBlocks.push(generateOutputFormatBlock(patchOpts));
    changes.push({
      code: 'ADDED_OUTPUT_FORMAT',
      title: 'Added OUTPUT FORMAT block',
      description: 'Specifies the expected structure of the response',
    });
    issuesAddressed.push('MISSING_OUTPUT_FORMAT');
  }

  // Build footer blocks (to be appended)
  const footerBlocks: string[] = [];

  // Add QC if missing
  if (!blocks.hasQc) {
    footerBlocks.push(generateQcBlock());
    changes.push({
      code: 'ADDED_QC',
      title: 'Added QUALITY CHECK block',
      description: 'Defines validation criteria before finalizing response',
    });
    issuesAddressed.push('MISSING_QC');
  }

  // Add UNCERTAINTY POLICY if missing
  if (!blocks.hasUncertaintyPolicy) {
    footerBlocks.push(generateUncertaintyPolicyBlock());
    changes.push({
      code: 'ADDED_UNCERTAINTY_POLICY',
      title: 'Added UNCERTAINTY POLICY block',
      description: 'Guides how to handle missing or ambiguous information',
    });
    issuesAddressed.push('MISSING_UNCERTAINTY_POLICY');
  }

  // Assemble patched text
  const parts: string[] = [];

  // Add header blocks
  if (headerBlocks.length > 0) {
    parts.push(headerBlocks.join('\n\n'));
  }

  // Add original content
  parts.push(text.trim());

  // Add footer blocks
  if (footerBlocks.length > 0) {
    parts.push(footerBlocks.join('\n\n'));
  }

  const patched = parts.join('\n\n');

  // Calculate QA scores (simplified estimation)
  // Each of 6 blocks is worth points, approximate scoring
  const blocksPresent = Object.values(blocks).filter(v => v).length;
  const blocksTotal = 6;
  const qaScoreBefore = Math.round((blocksPresent / blocksTotal) * 85); // Max 85 for structure alone
  const qaScoreAfter = 85; // With all blocks, should hit threshold

  return {
    original: text,
    patched,
    changes,
    issuesAddressed,
    qaScoreBefore,
    qaScoreAfter,
  };
}
