/**
 * Content Writer v1
 * Generates structured long-form articles following Content Output Contract v1.
 *
 * Output Format:
 * - Title
 * - Intro (context + promise)
 * - Core Explanation (2-5 sections)
 * - Practical Takeaways (3-6 bullets)
 * - Closing Summary (2-3 sentences)
 * - NO CTA unless explicitly asked
 * - NO SEO metadata, no platform mentions
 */

import { callLLM } from '@/lib/llm/client'

// Config
const QA_MODE = process.env.QA_MODE === 'true'
const DEBUG_CONCEPTS = false

// Log QA configuration on module load
console.log('[Content] QA_MODE:', QA_MODE, '| API key present:', !!process.env.ANTHROPIC_API_KEY)

// ============================================================================
// SYSTEM PROMPT FOR LLM
// ============================================================================

const CONTENT_SYSTEM_PROMPT = `You are a technical writer creating educational content.

OUTPUT FORMAT (MANDATORY):
# [Topic Title]

## Introduction
[2-3 sentences: context + what reader will learn]

## Core Explanation
### [Concept 1 Name]
[Plain explanation in 2-3 sentences]
[Why it matters in 1 sentence]

### [Concept 2 Name]
[Plain explanation in 2-3 sentences]
[Why it matters in 1 sentence]

### [Concept 3 Name]
[Plain explanation in 2-3 sentences]
[Why it matters in 1 sentence]

## Practical Takeaways
- [Verb-first actionable bullet 1]
- [Verb-first actionable bullet 2]
- [Verb-first actionable bullet 3]
- [Verb-first actionable bullet 4]

## Summary
[2-3 sentences wrapping up key points]

RULES:
- Be specific to the topic. No generic filler.
- Use plain language a non-expert can understand.
- Include concrete examples where helpful.
- NO calls to action, NO SEO metadata, NO platform mentions.
- NEVER use phrases like "fundamental concept", "interconnected components", "affects how we approach".
- Output ONLY the article. No preamble, no commentary.`

// ============================================================================
// TYPES
// ============================================================================

interface Concept {
  name: string
  plainExplanation: string
  whyItMatters: string
  example?: string
}

export interface QAStatus {
  qaMode: boolean
  keyPresent: boolean
  anthropicCalled: boolean
  fallbackUsed: boolean
  error?: string
}

export interface ContentResult {
  article: string
  qa: QAStatus
}

// ============================================================================
// BANNED PHRASES GUARDRAIL
// ============================================================================

const BANNED_PHRASES = [
  'refers to the fundamental concept',
  'the underlying mechanics involve several interconnected components',
  'it is important because it affects how we approach related problems',
  'foundational concept that rewards careful study',
  'seek feedback and iterate',
  'start by understanding the foundational concepts',
  'focus on the core principles rather than memorizing',
  'apply this knowledge incrementally',
]

function containsBannedPhrases(text: string): boolean {
  const lower = text.toLowerCase()
  return BANNED_PHRASES.some(phrase => lower.includes(phrase))
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateContentOutput(text: string): boolean {
  const hasTitle = text.startsWith('# ')
  const hasIntro = text.includes('## Introduction')
  const hasCoreExplanation = text.includes('## Core Explanation')
  const hasTakeaways = text.includes('## Practical Takeaways')
  const hasSummary = text.includes('## Summary')
  const noImagine = !text.toLowerCase().startsWith('/imagine')
  const noBannedPhrases = !containsBannedPhrases(text)

  return hasTitle && hasIntro && hasCoreExplanation &&
         hasTakeaways && hasSummary && noImagine && noBannedPhrases
}

// ============================================================================
// TOPIC EXTRACTION
// ============================================================================

function extractTopic(text: string): string {
  const prefixes = [
    'explain ', 'break down ', 'what is ', 'what are ',
    'how does ', 'how do ', 'why is ', 'why are ',
    'write about ', 'describe ', 'give me an overview of ',
    'article about ', 'guide to ', 'tutorial on '
  ]

  let topic = text.toLowerCase()
  for (const prefix of prefixes) {
    if (topic.startsWith(prefix)) {
      topic = topic.slice(prefix.length)
      break
    }
  }

  topic = topic.replace(/[.?!]+$/, '').trim()
  topic = topic.replace(/ for non-technical readers\.?$/, '')
  topic = topic.replace(/ for beginners\.?$/, '')
  topic = topic.replace(/ in simple terms\.?$/, '')

  return topic.trim()
}

// ============================================================================
// FALLBACK SCAFFOLD (used only when LLM fails and QA_MODE is false)
// ============================================================================

function generateFallbackConcepts(topic: string): Concept[] {
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1)

  return [
    {
      name: 'Core Definition',
      plainExplanation: `${capitalizedTopic} encompasses the central ideas and boundaries of this subject.`,
      whyItMatters: 'A clear definition prevents misunderstandings and sets the foundation for deeper learning.',
    },
    {
      name: 'Key Components',
      plainExplanation: `The essential parts that make up ${topic} and how they relate to each other.`,
      whyItMatters: 'Understanding the pieces helps you see how the whole system works.',
    },
    {
      name: 'Mechanism',
      plainExplanation: `The process or method by which ${topic} operates or achieves its purpose.`,
      whyItMatters: 'Knowing how something works lets you predict behavior and troubleshoot problems.',
    },
    {
      name: 'Practical Applications',
      plainExplanation: `Real-world situations where ${topic} is applied or observed.`,
      whyItMatters: 'Concrete examples make abstract concepts tangible and memorable.',
    },
  ]
}

function buildFallbackArticle(topic: string, concepts: Concept[]): string {
  const titleTopic = topic.charAt(0).toUpperCase() + topic.slice(1)

  const conceptSections = concepts.map(c => {
    const exampleText = c.example ? ` ${c.example}` : ''
    return `### ${c.name}

${c.plainExplanation}${exampleText}

${c.whyItMatters}`
  }).join('\n\n')

  const takeaways = concepts.slice(0, 4).map(c => {
    const matter = c.whyItMatters.replace(/\.$/, '').toLowerCase()
    return `- Focus on ${c.name.toLowerCase()}: ${matter}`
  }).join('\n')

  return `# ${titleTopic}

## Introduction

${titleTopic} involves several distinct concepts that work together. This article breaks down each one so you understand not just the what, but the how and why.

## Core Explanation

${conceptSections}

## Practical Takeaways

${takeaways}

## Summary

${titleTopic} is built on ${concepts.length} key concepts: ${concepts.map(c => c.name.toLowerCase()).join(', ')}. Each serves a specific purpose. Understanding them individually—and how they connect—gives you a working knowledge you can apply.`
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Generate a structured article from user intent.
 * Primary path: Real Anthropic LLM call.
 * Fallback (production only): Scaffold content.
 * Returns article + QA status for diagnostics.
 */
export async function generateContent(intentText: string): Promise<ContentResult> {
  const topic = extractTopic(intentText)
  const keyPresent = !!process.env.ANTHROPIC_API_KEY

  // Initialize QA tracking
  const qa: QAStatus = {
    qaMode: QA_MODE,
    keyPresent,
    anthropicCalled: false,
    fallbackUsed: false,
  }

  if (DEBUG_CONCEPTS) {
    console.log('[Content Debug] Topic:', topic)
    console.log('[Content Debug] QA_MODE:', QA_MODE)
  }

  // No API key path
  if (!keyPresent) {
    console.warn('[Content] ANTHROPIC_API_KEY not configured')
    if (QA_MODE) {
      qa.error = 'ANTHROPIC_API_KEY not configured'
      return { article: '', qa }
    }
    // Production fallback
    qa.fallbackUsed = true
    const concepts = generateFallbackConcepts(topic)
    return { article: buildFallbackArticle(topic, concepts), qa }
  }

  try {
    // Primary path: Real LLM call
    console.log('QA: calling Anthropic for Content')
    qa.anthropicCalled = true

    const response = await callLLM({
      systemPrompt: CONTENT_SYSTEM_PROMPT,
      userPrompt: `Write an educational article explaining: ${intentText}`,
      maxTokens: 2000,
      temperature: 0.3
    })

    const article = response.text

    if (DEBUG_CONCEPTS) {
      console.log('[Content Debug] LLM response received, validating...')
    }

    // Validate output structure
    if (!validateContentOutput(article)) {
      console.warn('[Content] LLM output failed validation, retrying with stricter prompt')

      const retryResponse = await callLLM({
        systemPrompt: CONTENT_SYSTEM_PROMPT,
        userPrompt: `Write an educational article explaining: ${intentText}\n\nIMPORTANT: Follow the exact markdown structure with # Title, ## Introduction, ## Core Explanation (with ### subsections), ## Practical Takeaways (with - bullets), ## Summary.`,
        maxTokens: 2000,
        temperature: 0.2
      })

      if (!validateContentOutput(retryResponse.text)) {
        throw new Error('LLM output failed validation after retry')
      }

      return { article: retryResponse.text, qa }
    }

    return { article, qa }

  } catch (error) {
    console.error('[Content] LLM call failed:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)

    // QA Mode: no fallback, return error
    if (QA_MODE) {
      qa.error = errorMsg
      return { article: '', qa }
    }

    // Production fallback
    qa.fallbackUsed = true
    const concepts = generateFallbackConcepts(topic)
    return { article: buildFallbackArticle(topic, concepts), qa }
  }
}
