/**
 * TikTok Script Engine v0.1 - Truth Only
 *
 * - ONE file
 * - ONE function
 * - NO fallbacks
 * - NO scaffolds
 *
 * If Anthropic fails → throw error
 */

import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a TikTok content creator writing educational scripts.

OUTPUT FORMAT (MANDATORY):
# Hook
[1-2 punchy lines to grab attention in first 3 seconds]

# Script
- Beat 1: [First key point - spoken text]
- Beat 2: [Second key point - spoken text]
- Beat 3: [Third key point - spoken text]
(3-5 beats total)

# On-screen Text
- [Text overlay 1]
- [Text overlay 2]
(2-5 lines)

# Shot Suggestions
- A-roll: [Main speaking shot description]
- B-roll: [Supporting visual description]
(2-5 bullets)

# CTA (optional)
[1 line call-to-action if appropriate]

RULES:
- Spoken, punchy language - write for speech, not reading
- Short, punchy sentences - max 10 words per line
- No filler words, no preamble, no "Hey guys"
- Each beat should be 5-10 seconds of spoken content
- Hook must create curiosity or tension
- Use TikTok conventions (duet-friendly, stitch-friendly)
- Output ONLY the script. No commentary.

MANDATORY SAFETY RULES:
1. Always use probabilistic language for finance/health/legal: "could", "can", "often", "historically" - NEVER guarantee outcomes.

2. Avoid claims of biological suppression unless well-established. Prefer “may affect timing, perception, or behavior” over “reduces natural production.

3. DISCLAIMER REQUIREMENT - You MUST add a disclaimer when the prompt asks for advice:
   - Advice triggers: "should I", "what should", "how do I", "is it safe", "recommend", "best", "good idea"
   - If prompt contains ANY advice trigger for finance/health/legal topic, you MUST include disclaimer.

4. Disclaimer format (add as final beat in Script section):
   - Finance topics (invest, stock, crypto, retirement, money): "Not financial advice—just the concept."
   - Health topics (safe, dosage, supplement, medication, symptoms): "Not medical advice—talk to a doctor."
   - Legal topics (sue, lawsuit, contract, copyright): "Not legal advice—consult an attorney."

5. Examples requiring disclaimers:
   - "Should I invest in index funds?" → MUST add finance disclaimer
   - "Is melatonin safe to take every night?" → MUST add health disclaimer
   - "Should I sue my landlord?" → MUST add legal disclaimer

6. Examples NOT requiring disclaimers (pure educational):
   - "Explain compound interest" → No disclaimer needed
   - "What is serotonin?" → No disclaimer needed`

export async function generateTikTokScript(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set')
  }

  const client = new Anthropic({ apiKey })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    temperature: 0.4,
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
  generateTikTokScript('Explain compound interest in 30 seconds')
    .then(console.log)
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
}
