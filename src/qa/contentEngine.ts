/**
 * Content Engine v1 - Truth Only
 *
 * - ONE file
 * - ONE function
 * - NO fallbacks
 * - NO scaffolds
 * - NO modes
 *
 * If Anthropic fails → throw error
 */

import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a technical writer creating educational content.

OUTPUT FORMAT (MANDATORY):
# [Topic Title]

## Introduction
[2-3 sentences: context + what reader will learn]

## Core Explanation
### [Concept 1]
[Plain explanation in 2-3 sentences]

### [Concept 2]
[Plain explanation in 2-3 sentences]

### [Concept 3]
[Plain explanation in 2-3 sentences]

## Practical Takeaways
- [Actionable bullet 1]
- [Actionable bullet 2]
- [Actionable bullet 3]
- [Actionable bullet 4]

## Summary
[2-3 sentences wrapping up key points]

RULES:
- Be specific to the topic. No generic filler.
- Use plain language a non-expert can understand.
- Include concrete examples where helpful.
- NO calls to action, NO SEO metadata, NO platform mentions.
- Output ONLY the article. No preamble, no commentary.
- If a Practical Takeaway bullet does not start with a verb, rewrite it.
- Include at least one concrete, real-world example to illustrate a concept in the Core Explanation.`

export async function generateContent(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set')
  }

  const client = new Anthropic({ apiKey })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  })

  const block = message.content[0]
  if (block.type === 'text') {
    return `<!-- SOURCE:anthropic -->\n${block.text}`
  }
  throw new Error('Unexpected response type')
}

// Runnable harness (exit code set on error)
const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  generateContent('Explain how retrieval-augmented generation works for non-technical readers.')
    .then(console.log)
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
}

